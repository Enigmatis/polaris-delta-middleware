import { TransactionalMutationsPlugin } from '../../src';
import { loggerMock } from '../mocks/logger-mock';

let transactionalMutationsPlugin: TransactionalMutationsPlugin;

const setUpContext = (query: string): any => {
    return {
        request: {
            query,
            operationName: jest.fn(),
            variables: jest.fn(),
        },
        context: jest.fn(),
    };
};

describe('transactionalMutationsPlugin tests', () => {
    beforeEach(async () => {
        const realitiesHolderMock = {
            addRealities: jest.fn(),
            addReality: jest.fn(),
            updateReality: jest.fn(),
            getReality: jest.fn(),
            getRealitiesMap: jest.fn(),
            hasReality: jest.fn(),
        };
        transactionalMutationsPlugin = new TransactionalMutationsPlugin(loggerMock as any, realitiesHolderMock as any);
    });

    describe('requestDidStart tests', () => {
        it("execute a query, the logger wasn't called - the function wasn't executed", () => {
            const query = '{\n  allBooks {\n    id\n    title\n    author {\n      firstName\n      lastName\n    }\n  }\n}\n';
            const requestContext = setUpContext(query);

            transactionalMutationsPlugin.requestDidStart(requestContext);

            expect(loggerMock.debug).toHaveBeenCalledTimes(0);
        });
    });
});
