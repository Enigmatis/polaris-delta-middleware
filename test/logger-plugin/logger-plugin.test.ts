import { LoggerPlugin } from '../../src';
import { loggerPluginMessages } from '../../src/logger-plugin/logger-plugin-messages';
import { loggerMock } from '../mocks/logger-mock';

describe('LoggerPlugin tests', () => {
    const loggerPlugin = new LoggerPlugin(loggerMock as any);
    const context = {
        request: {
            query: jest.fn(),
            operationName: jest.fn(),
            variables: jest.fn(),
        },
    };

    describe('requestDidStart tests', () => {
        test('a log is written', () => {
            loggerPlugin.requestDidStart(context as any);

            expect(loggerMock.info).toHaveBeenCalledWith(loggerPluginMessages.requestReceived, {
                request: {
                    requestQuery: {
                        query: context.request.query,
                        operationName: context.request.operationName,
                        polarisVariables: context.request.variables,
                    },
                },
            });
        });
    });
});
