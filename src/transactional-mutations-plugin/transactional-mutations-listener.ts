import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
// tslint:disable-next-line:no-duplicate-imports
import { QueryRunner } from '@enigmatis/polaris-typeorm';
import { GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { transactionalMutationsMessages } from './transactional-mutations-messages';

export class TransactionalMutationsListener implements GraphQLRequestListener<PolarisGraphQLContext> {
    private readonly logger: PolarisGraphQLLogger;
    private readonly queryRunner: QueryRunner | undefined;

    constructor(logger: PolarisGraphQLLogger, queryRunner?: QueryRunner) {
        this.logger = logger;
        this.queryRunner = queryRunner;
    }

    public async willSendResponse(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'response'>>,
    ): Promise<void> {
        if (
            (requestContext.errors && requestContext.errors?.length > 0) ||
            (requestContext.response.errors && requestContext.response.errors?.length > 0)
        ) {
            if (this.queryRunner?.isTransactionActive) {
                this.queryRunner.rollbackTransaction();
                this.logger.debug(transactionalMutationsMessages.listenerRollingBackMessage, requestContext.context);
            }
        } else if (this.queryRunner?.isTransactionActive) {
            this.queryRunner.commitTransaction();
            this.logger.debug(transactionalMutationsMessages.listenerCommittingMessage, requestContext.context);
        }
        this.logger.debug(transactionalMutationsMessages.listenerFinishedJob, requestContext.context);
    }
}
