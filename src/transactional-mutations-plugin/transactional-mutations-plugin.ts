import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { getPolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { TransactionalMutationsListener } from './transactional-mutations-listener';

export class TransactionalMutationsPlugin implements ApolloServerPlugin<PolarisGraphQLContext> {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public requestDidStart(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext>,
    ): GraphQLRequestListener<PolarisGraphQLContext> | void {
        if (this.isTheRequestAMutation(requestContext)) {
            this.logger.debug('Transactional mutations plugin started job', requestContext.context);
            const queryRunner = getPolarisConnectionManager().get().manager.queryRunner;
            try {
                if (!queryRunner?.isTransactionActive) {
                    queryRunner?.startTransaction();
                }
            } catch (err) {
                this.logger.error(err.message, requestContext.context);
                queryRunner?.rollbackTransaction();
                throw err;
            }
            return new TransactionalMutationsListener(this.logger);
        }
    }

    private isTheRequestAMutation(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext>,
    ): boolean {
        return !!requestContext.request.query?.startsWith('mutation');
    }
}
