import { PolarisGraphQLContext, RealitiesHolder } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    getConnectionForReality,
    In,
    Not,
    PolarisConnection,
    PolarisConnectionManager,
} from '@enigmatis/polaris-typeorm';
import { ConnectionlessConfiguration, ConnectionlessIrrelevantEntitiesCriteria } from '..';

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

    public readonly connectionLessConfiguration?: ConnectionlessConfiguration;

    public readonly connectionManager?: PolarisConnectionManager;
    public readonly realitiesHolder: RealitiesHolder;
    public readonly logger: PolarisGraphQLLogger;

    constructor(
        logger: PolarisGraphQLLogger,
        realitiesHolder: RealitiesHolder,
        connectionManager?: PolarisConnectionManager,
        connectionLessConfiguration?: ConnectionlessConfiguration,
    ) {
        this.connectionManager = connectionManager;
        this.logger = logger;
        this.realitiesHolder = realitiesHolder;
        this.connectionLessConfiguration = connectionLessConfiguration;
    }

    private static createIrrelevantWhereCriteria(result: any, context: PolarisGraphQLContext, connectionlessConfiguration?: ConnectionlessConfiguration):
        ConnectionlessIrrelevantEntitiesCriteria | any {
        if (connectionlessConfiguration) {
            const connectionLessCriteria: ConnectionlessIrrelevantEntitiesCriteria = {
                realityId: context.requestHeaders.realityId,
                notInIds: Array.isArray(result) && result.length > 0 ? result.map((x: any) => x.id) : [],
            };
            return connectionLessCriteria;
        } else {
            const irrelevantWhereCriteria: any =
                Array.isArray(result) && result.length > 0
                    ? { id: Not(In(result.map((x: any) => x.id))) }
                    : {};
            irrelevantWhereCriteria.deleted = In([true, false]);
            irrelevantWhereCriteria.realityId = context.requestHeaders.realityId;
            return irrelevantWhereCriteria;
        }
    }

    public getMiddleware() {
        return async (
            resolve: any,
            root: any,
            args: { [argName: string]: any },
            context: PolarisGraphQLContext,
            info: any,
        ) => {
            this.logger.debug('Irrelevant entities middleware started job', context);
            const result = await resolve(root, args, context, info);

            if (
                context?.requestHeaders?.dataVersion != null &&
                context?.requestHeaders?.realityId != null &&
                !isNaN(context?.requestHeaders?.dataVersion) &&
                info.returnType.ofType &&
                this.connectionManager?.connections?.length &&
                !root
            ) {
                const connection = getConnectionForReality(
                    context.requestHeaders.realityId,
                    this.realitiesHolder,
                    this.connectionManager,
                );
                const typeName = IrrelevantEntitiesMiddleware.getTypeName(info);
                const irrelevantWhereCriteria = IrrelevantEntitiesMiddleware.createIrrelevantWhereCriteria(
                    result,
                    context,
                    this.connectionLessConfiguration,
                );
                const resultIrrelevant: any = await this.getIrrelevantEntities(connection, typeName, result, info, context, irrelevantWhereCriteria);
                if (resultIrrelevant && resultIrrelevant.length > 0) {
                    IrrelevantEntitiesMiddleware.appendIrrelevantEntitiesToExtensions(
                        info,
                        resultIrrelevant,
                        context,
                    );
                }
            }

            this.logger.debug('Irrelevant entities middleware finished job', context);
            return result;
        };
    }

    private async getIrrelevantEntities(connection: PolarisConnection, typeName: string, result: any, info: any, context: PolarisGraphQLContext,
                                        irrelevantWhereCriteria: any) {
        let resultIrrelevant: any;
        if (this.connectionLessConfiguration) {
            resultIrrelevant = await this.connectionLessConfiguration.getIrrelevantEntities(typeName, irrelevantWhereCriteria);
        } else {
            if (connection.hasRepository(typeName)) {
                resultIrrelevant = await connection.manager.find(typeName, {
                    select: ['id'],
                    where: irrelevantWhereCriteria,
                });
            } else {
                this.logger.warn(
                    'Could not find repository with the graphql object name',
                    context,
                );
            }
        }

        return resultIrrelevant;
    }
}
