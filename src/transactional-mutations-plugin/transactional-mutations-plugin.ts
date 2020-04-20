import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { PolarisConnection } from '@enigmatis/polaris-typeorm';
import { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { isMutation } from '../utills/query-util';
import { TransactionalMutationsListener } from './transactional-mutations-listener';
import { PLUGIN_STARTED_JOB } from './transactional-mutations-messages';

export class TransactionalMutationsPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
    private readonly logger: PolarisGraphQLLogger;
    private readonly polarisConnection: PolarisConnection;

    constructor(logger: PolarisGraphQLLogger, polarisConnection: PolarisConnection) {
        this.logger = logger;
        this.polarisConnection = polarisConnection;
    }

    public requestDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext>,
    ): GraphQLRequestListener<PolarisGraphQLContext> | void {
        if (isMutation(requestContext.request.query)) {
            this.logger.debug(PLUGIN_STARTED_JOB, requestContext.context);
            const queryRunner = this.polarisConnection.manager.queryRunner;
            try {
                if (!queryRunner?.isTransactionActive) {
                    queryRunner?.startTransaction();
                    return new TransactionalMutationsListener(this.logger, queryRunner);
                }
            } catch (err) {
                this.logger.error(err.message, requestContext.context);
                queryRunner?.rollbackTransaction();
                throw err;
            }
        }
    }
}
