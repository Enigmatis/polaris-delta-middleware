import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import {
    GraphQLRequestContext,
    GraphQLRequestListener,
    GraphQLResponse,
} from 'apollo-server-plugin-base';
import { loggerPluginMessages } from './logger-plugin-messages';

export class RequestListenerForLoggerPlugin implements GraphQLRequestListener {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public willSendResponse = async (requestContext: any) => {
        const { response }: { response: GraphQLResponse } = requestContext;
        const polarisResponse = {
            data: response?.data,
            errors: response?.errors,
            extensions: response?.extensions,
        };

        this.logger.info(loggerPluginMessages.responseSent, {
            response: polarisResponse,
        });
        return requestContext;
    };

    public executionDidStart(
        requestContext: GraphQLRequestContext &
            Required<
                Pick<
                    GraphQLRequestContext,
                    'metrics' | 'source' | 'document' | 'operationName' | 'operation'
                >
            >,
    ): ((err?: Error) => void) | void {
        this.logger.debug(loggerPluginMessages.executionBegan);
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.executionFinishedWithError);
            } else {
                this.logger.debug(loggerPluginMessages.executionFinished);
            }
        };
    }

    public parsingDidStart(
        requestContext: GraphQLRequestContext &
            Required<Pick<GraphQLRequestContext, 'metrics' | 'source'>>,
    ): ((err?: Error) => void) | void {
        this.logger.debug(loggerPluginMessages.parsingBegan);
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.parsingFinishedWithError);
            } else {
                this.logger.debug(loggerPluginMessages.parsingFinished);
            }
        };
    }

    public validationDidStart(
        requestContext: GraphQLRequestContext &
            Required<Pick<GraphQLRequestContext, 'metrics' | 'source' | 'document'>>,
    ): ((err?: ReadonlyArray<Error>) => void) | void {
        this.logger.debug(loggerPluginMessages.validationBegan);
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.validationFinishedWithError);
            } else {
                this.logger.debug(loggerPluginMessages.validationFinished);
            }
        };
    }
}
