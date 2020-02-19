import { PolarisGraphQLRequest } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { loggerPluginMessages } from './logger-plugin-messages';
import { RequestListenerForLoggerPlugin } from './request-listener-for-logger';

export class LoggerPlugin implements ApolloServerPlugin {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public requestDidStart = (
        requestContext: GraphQLRequestContext,
    ): GraphQLRequestListener | void => {
        const { request } = requestContext;
        const polarisRequest: PolarisGraphQLRequest = {
            query: request.query,
            operationName: request.operationName,
            polarisVariables: request.variables,
        } as any;

        this.logger.info(loggerPluginMessages.requestReceived, {
            request: {
                requestQuery: polarisRequest,
            },
        });
        return new RequestListenerForLoggerPlugin(this.logger);
    };
}
