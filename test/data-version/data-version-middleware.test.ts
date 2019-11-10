import { dataVersionMiddleware } from '../../src';
import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { getContextWithRequestHeaders } from '../context-util';

describe('data version middleware', () => {
    describe('root resolver', () => {
        it('should filter out entities with' + ' data version lower/equal to context', async () => {
            const root = undefined;
            const args = {};
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ dataVersion: 2 });
            const info = {};
            const objects = [{ title: 'moshe', dataVersion: 2 }, { title: 'dani', dataVersion: 5 }];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, root, args, context, info);
            expect(result).toEqual([{ title: 'dani', dataVersion: 5 }]);
        });
        it('no data version in context, root query, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({});
            const objects = [{ title: 'moshe', dataVersion: 2 }, { title: 'dani', dataVersion: 5 }];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, undefined, {}, context, {});
            expect(result).toEqual(objects);
        });
        it('context data version is not a number, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({
                dataVersion: undefined,
            });
            const objects = [{ title: 'moshe', dataVersion: 2 }, { title: 'dani', dataVersion: 5 }];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, undefined, {}, context, {});
            expect(result).toEqual(objects);
        });
        it('entities does not have a data version property, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ dataVersion: 3 });
            const objects = [{ title: 'moshe' }, { title: 'dani' }];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, undefined, {}, context, {});
            expect(result).toEqual(objects);
        });
        it('a single entity is resolved, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ dataVersion: 3 });
            const objects = { title: 'moshe', dataVersion: 2 };
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, undefined, {}, context, {});
            expect(result).toEqual(objects);
        });
    });
    describe('not a root resolver', () => {
        it('not a root resolver, no filter should be applied', async () => {
            const context: PolarisGraphQLContext = getContextWithRequestHeaders({ dataVersion: 3 });
            const objects = [{ title: 'moshe', dataVersion: 2 }, { title: 'dani', dataVersion: 5 }];
            const resolve = async () => {
                return objects;
            };

            const result = await dataVersionMiddleware(resolve, { name: 'bla' }, {}, context, {});
            expect(result).toEqual(objects);
        });
    });
});
