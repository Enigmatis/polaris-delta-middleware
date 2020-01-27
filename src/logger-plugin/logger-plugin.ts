import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';

export class LoggerPlugin implements ApolloServerPlugin {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public requestDidStart = (
        requestContext: GraphQLRequestContext,
    ): GraphQLRequestListener | void => {
        this.logger.info(`Received a new request`, {
            context: requestContext.context as PolarisGraphQLContext,
            polarisLogProperties: {
                request: {
                    request: requestContext.request,
                },
            },
        });
        return new RequestListenerForLoggerPlugin(this.logger);
    };
}

export class RequestListenerForLoggerPlugin implements GraphQLRequestListener {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public willSendResponse = async (requestContext: any) => {
        const {
            context,
            response,
        }: { context: PolarisGraphQLContext; response: any } = requestContext;
        this.logger.info(`A response was sent to the client`, {
            context,
            polarisLogProperties: {
                response,
            },
        });
        return requestContext;
    };
}
