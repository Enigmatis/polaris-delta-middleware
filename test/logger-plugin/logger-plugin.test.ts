import { LoggerPlugin } from '../../src';
import { loggerMock } from '../mocks/logger-mock';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';
import { loggerPluginMessages } from '../../src/logger-plugin/logger-plugin-messages';

describe('LoggerPlugin tests', () => {
    const loggerPlugin = new LoggerPlugin(loggerMock as any);
    const requestContext = { context: jest.fn(), request: jest.fn() };
    describe('requestDidStart tests', () => {
        test('a log is written', () => {
            // act
            loggerPlugin.requestDidStart(requestContext as unknown as GraphQLRequestContext);
            // assert
            expect(loggerMock.info).toHaveBeenCalledWith
            (loggerPluginMessages.requestReceived,
                {
                    context: requestContext.context, polarisLogProperties: {
                        request: {
                            request: requestContext.request,
                        },
                    },
                });
        });
    });
});
