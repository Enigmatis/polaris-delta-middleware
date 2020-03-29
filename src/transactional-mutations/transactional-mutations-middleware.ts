import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { getPolarisConnectionManager } from '@enigmatis/polaris-typeorm';

export class TransactionalMutationsMiddleware {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: any,
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Transactional mutations middleware started job', context);
            const queryRunner = getPolarisConnectionManager().get().manager.queryRunner;
            try {
                await queryRunner?.startTransaction();
                await resolve(root, args, context, info);
                await queryRunner?.commitTransaction();
            } catch (err) {
                this.logger.error(err.message, context);
                await queryRunner?.rollbackTransaction();
                throw err;
            } finally {
                this.logger.debug('Transactional mutations middleware finished job', context);
            }
        };
    }
}
