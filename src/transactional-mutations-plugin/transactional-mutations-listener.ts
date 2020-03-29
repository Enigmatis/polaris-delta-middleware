import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { getPolarisConnectionManager } from '@enigmatis/polaris-typeorm';
import { GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';

export class TransactionalMutationsListener
    implements GraphQLRequestListener<PolarisGraphQLContext> {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public async willSendResponse(
        requestContext: GraphQLRequestContext<PolarisGraphQLContext> &
            Required<Pick<GraphQLRequestContext<PolarisGraphQLContext>, 'metrics' | 'response'>>,
    ): Promise<void> {
        const queryRunner = getPolarisConnectionManager().get().manager.queryRunner;
        if (
            (requestContext.errors && requestContext.errors?.length > 0) ||
            (requestContext.response.errors && requestContext.response.errors.length > 0)
        ) {
            if (queryRunner?.isTransactionActive) {
                queryRunner?.rollbackTransaction();
            }
        } else if (queryRunner?.isTransactionActive) {
            queryRunner?.commitTransaction();
        }
    }
}
