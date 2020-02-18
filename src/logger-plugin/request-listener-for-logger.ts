import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';
import { GraphQLRequestListener } from 'apollo-server-plugin-base';
import { loggerPluginMessages } from './logger-plugin-messages';

export class RequestListenerForLoggerPlugin implements GraphQLRequestListener {
    public readonly logger: PolarisGraphQLLogger;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    public willSendResponse = async (context: any) => {
        const { response } = context;
        const polarisResponse = {
            data: response.data,
            extensions: response.extensions,
            errors: response.errors,
        };

        this.logger.info(loggerPluginMessages.responseSent, {
            response: polarisResponse,
        });
        return context;
    };

    public executionDidStart(): ((err?: Error) => void) | void {
        this.logger.debug(loggerPluginMessages.executionBegan);
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.executionFinishedWithError);
            } else {
                this.logger.debug(loggerPluginMessages.executionFinished);
            }
        };
    }

    public parsingDidStart(): ((err?: Error) => void) | void {
        this.logger.debug(loggerPluginMessages.parsingBegan);
        return err => {
            if (err) {
                this.logger.debug(loggerPluginMessages.parsingFinishedWithError);
            } else {
                this.logger.debug(loggerPluginMessages.parsingFinished);
            }
        };
    }

    public validationDidStart(): ((err?: ReadonlyArray<Error>) => void) | void {
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
