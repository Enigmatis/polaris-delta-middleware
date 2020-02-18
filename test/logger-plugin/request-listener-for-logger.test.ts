import { loggerPluginMessages } from '../../src/logger-plugin/logger-plugin-messages';
import { RequestListenerForLoggerPlugin } from '../../src/logger-plugin/request-listener-for-logger';
import { loggerMock } from '../mocks/logger-mock';

describe('RequestListenerForLoggerPlugin tests', () => {
    const listener = new RequestListenerForLoggerPlugin(loggerMock as any);
    const context = {
        response: {
            data: jest.fn(),
            extensions: jest.fn(),
            errors: jest.fn(),
        },
    };

    describe('willSendResponse tests', () => {
        test('a log is written with response', async () => {
            await listener.willSendResponse(context);

            expect(loggerMock.info).toHaveBeenCalledWith(loggerPluginMessages.responseSent, {
                response: {
                    data: context.response.data,
                    extensions: context.response.extensions,
                    errors: context.response.errors,
                },
            });
        });
    });
    describe('executionDidStart tests', () => {
        test('a log is written', () => {
            listener.executionDidStart();

            expect(loggerMock.debug).toHaveBeenCalledWith(loggerPluginMessages.executionBegan);
        });
    });
    describe('parsingDidStart tests', () => {
        test('a log is written', () => {
            listener.parsingDidStart();

            expect(loggerMock.debug).toHaveBeenCalledWith(loggerPluginMessages.parsingBegan);
        });
    });
    describe('validationDidStart tests', () => {
        test('a log is written', () => {
            listener.validationDidStart();

            expect(loggerMock.debug).toHaveBeenCalledWith(loggerPluginMessages.validationBegan);
        });
    });
});
