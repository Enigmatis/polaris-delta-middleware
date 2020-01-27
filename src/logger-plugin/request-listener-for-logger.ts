import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { GraphQLRequestListener } from 'apollo-server-plugin-base';
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
