import { TransactionalMutationsMiddleware } from '../../src';

const logger = { debug: jest.fn() } as any;
const transactionalMutationsMiddleware = new TransactionalMutationsMiddleware(logger).getMiddleware();

// describe('transactional mutations tests', () => {
//
// });