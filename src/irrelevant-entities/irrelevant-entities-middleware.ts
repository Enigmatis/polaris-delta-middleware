import {
    PolarisError,
    PolarisGraphQLContext,
    RealitiesHolder,
} from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    Connection,
    getConnectionManager,
    In,
    Not,
    PolarisFindManyOptions,
} from '@enigmatis/polaris-typeorm';

export class IrrelevantEntitiesMiddleware {
    private static getTypeName(info: any): string {
        let type = info.returnType;
        while (!type.name) {
            type = type.ofType;
        }
        return type.name;
    }

    private static appendIrrelevantEntitiesToExtensions(
        info: any,
        resultIrrelevant: any,
        context: PolarisGraphQLContext,
    ) {
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

    private static createIrrelevantWhereCriteria(result: any, context: PolarisGraphQLContext) {
        const irrelevantWhereCriteria: any =
            Array.isArray(result) && result.length > 0
                ? { id: Not(In(result.map((x: any) => x.id))) }
                : {};
        irrelevantWhereCriteria.deleted = In([true, false]);
        irrelevantWhereCriteria.realityId = context.requestHeaders.realityId;
        return irrelevantWhereCriteria;
    }

    public readonly connection?: Connection;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger, realitiesHolder: RealitiesHolder, connection?: Connection) {
        this.connection = connection;
        this.logger = logger;
        this.realitiesHolder = realitiesHolder;
    }

    public getMiddleware() {
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
                context.requestHeaders.dataVersion !== undefined &&
                !isNaN(context.requestHeaders.dataVersion) &&
                info.returnType.ofType &&
                context.requestHeaders.realityId != null &&
                !root
            ) {
                const connection = this.getConnectionForReality(context.requestHeaders.realityId);
                const irrelevantWhereCriteria = IrrelevantEntitiesMiddleware.createIrrelevantWhereCriteria(
                    result,
                    context,
                );
                const typeName = IrrelevantEntitiesMiddleware.getTypeName(info);
                const resultIrrelevant: any = await connection.getRepository(typeName).find(
                    new PolarisFindManyOptions(
                        {
                            select: ['id'],
                            where: irrelevantWhereCriteria,
                        },
                        context,
                    ),
                );
                if (resultIrrelevant && resultIrrelevant.length > 0) {
                    IrrelevantEntitiesMiddleware.appendIrrelevantEntitiesToExtensions(
                        info,
                        resultIrrelevant,
                        context,
                    );
                }
            }

            this.logger.debug('Irrelevant entities middleware finished job', { context });
            return result;
        };
    }

    private getConnectionForReality(realityId: number) {
        const connectionManager = getConnectionManager();
        const reality = this.realitiesHolder.getReality(realityId);
        if (!reality || !reality.name) {
            throw new PolarisError(`Reality id: ${realityId} has no name for connection`, 500);
        }
        if (!connectionManager.has(reality.name)) {
            throw new PolarisError(`There is no connections: '${reality.name}' for reality id: ${reality.id}`, 500);
        }

        return connectionManager.get(reality.name);
    }
}
