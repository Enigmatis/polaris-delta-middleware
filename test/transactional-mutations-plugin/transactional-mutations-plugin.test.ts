import { PolarisConnection, QueryRunner } from '@enigmatis/polaris-typeorm';
import { TransactionalMutationsPlugin } from '../../src';
import { PLUGIN_STARTED_JOB } from '../../src/transactional-mutations-plugin/transactional-mutations-messages';
import { loggerMock } from '../mocks/logger-mock';

let transactionalMutationsPlugin: TransactionalMutationsPlugin;

const setUpContext = (query: string): any => {
    return {
        request: {
            query,
            operationName: jest.fn(),
            variables: jest.fn(),
        },
        context: {
            requestHeaders: jest.fn(),
        },
    };
};

const getPolarisConnection = (queryRunner: Partial<QueryRunner>) => {
    const returnValue = {
        manager: {
            queryRunner,
        },
    };
    return returnValue as PolarisConnection;
};

describe('transactionalMutationsPlugin tests', () => {
    describe('requestDidStart tests - execute queries', () => {
        it('execute a query, the logger wasn\'t called - the function wasn\'t executed', () => {
            const query = '{\n  allBooks {\n    id\n    title\n    author {\n      firstName\n      lastName\n    }\n  }\n}\n';
            const requestContext = setUpContext(query);
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(loggerMock as any, getPolarisConnection({}));

            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledTimes(0);
        });
    });

    describe('requestDidStart tests - execute mutations', () => {
        it('execute a mutation and start transaction throws an error, an error thrown and logger and rollback called', () => {
            const errorMessage = 'error';
            const queryRunner: Partial<QueryRunner> = {
                isTransactionActive: false,
                startTransaction: jest.fn().mockImplementation(() => {
                    throw new Error(errorMessage);
                }),
                rollbackTransaction: jest.fn(),
            };
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(loggerMock as any, getPolarisConnection(queryRunner));
            const mutation = 'mutation....';
            const requestContext = setUpContext(mutation);

            expect(() => transactionalMutationsPlugin.requestDidStart(requestContext)).toThrow();

            expect(loggerMock.error).toHaveBeenCalledTimes(1);
            expect(loggerMock.error).toHaveBeenCalledWith(errorMessage, requestContext.context);
            expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
        });

        it('execute a mutation and there isn\'t transaction active, start transaction was called', () => {
            const queryRunner: Partial<QueryRunner> = {
                isTransactionActive: false,
                startTransaction: jest.fn(),
            };
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(loggerMock as any, getPolarisConnection(queryRunner));
            const mutation = 'mutation....';
            const requestContext = setUpContext(mutation);

            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(queryRunner.startTransaction).toHaveBeenCalledTimes(1);
        });

        it('execute a mutation and there isn transaction active, start transaction wasn\'t called', () => {
            const queryRunner: Partial<QueryRunner> = {
                isTransactionActive: true,
                startTransaction: jest.fn(),
            };
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(loggerMock as any, getPolarisConnection(queryRunner));
            const mutation = 'mutation....';
            const requestContext = setUpContext(mutation);

            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(queryRunner.startTransaction).toHaveBeenCalledTimes(0);
        });

        it('execute a mutation, the logger was called', () => {
            const queryRunner: Partial<QueryRunner> = {
                isTransactionActive: true,
                startTransaction: jest.fn(),
            };
            transactionalMutationsPlugin = new TransactionalMutationsPlugin(loggerMock as any, getPolarisConnection(queryRunner));
            const mutation = 'mutation....';
            const requestContext = setUpContext(mutation);

            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledTimes(1);
            expect(loggerMock.debug).toHaveBeenCalledWith(PLUGIN_STARTED_JOB, requestContext.context);
        });
    });
});
