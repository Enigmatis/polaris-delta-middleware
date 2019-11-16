import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { Not, In, Connection } from '@enigmatis/polaris-typeorm';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
export class IrrelevantEntitiesMiddleware {
    readonly connection: Connection;
    readonly logger: PolarisGraphQLLogger;

    constructor(connection: Connection, logger: PolarisGraphQLLogger) {
        this.connection = connection;
        this.logger = logger;
    }

    getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: { [argName: string]: any },
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Irrelevant entities middleware started job', { context });
            const result = await resolve(root, args, context, info);
            if (
                context &&
                context.requestHeaders &&
                context.requestHeaders.dataVersion !== undefined
            ) {
                const irrelevantWhereCriteria: any =
                    Array.isArray(result) && result.length > 0
                        ? { id: Not(In(result.map((x: any) => x.id))) }
                        : {};
                irrelevantWhereCriteria.deleted = [true, false];
                const type = info.returnType.ofType.name;
                const repo = this.connection.getRepository(type);
                const resultIrrelevant: any = await repo.find({
                    select: ['id'],
                    where: irrelevantWhereCriteria,
                });
                if (resultIrrelevant) {
                    const irrelevantEntities: any = {};
                    irrelevantEntities[info.path.key] = resultIrrelevant.map((x: any) => x.id);
                    if (!context.returnedExtensions) {
                        context.returnedExtensions = {} as any;
                    }
                    context.returnedExtensions = {
                        ...context.returnedExtensions,
                        irrelevantEntities: {
                            ...context.returnedExtensions.irrelevantEntities,
                            ...irrelevantEntities,
                        },
                    } as any;
                }
            }
            this.logger.debug('Irrelevant entities middleware finished job', { context });
            return result;
        };
    }
}
