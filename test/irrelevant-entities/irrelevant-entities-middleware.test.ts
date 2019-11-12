import { irrelevantEntitiesMiddleware } from '../../src/irrelevant-entities/irrelevant-entities-middleware';

const testContext = { res: { locals: { irrelevantEntities: {} } } };
const testArgs = {};
const testInfo = { path: { key: 'yed' } };

describe('Irrelevant entities middleware', () => {
    describe('temp irrelevant entities in res', () => {
        const entitiesReoslverWithIrrelevant = async (
            root: any,
            args: any,
            context: any,
            info: any,
        ) => {
            context.res.locals.tempIrrelevant = ['1', '3'];
            return {};
        };
        it('puts the temp irrelevant entities under key in res irrelevant entities', async () => {
            await irrelevantEntitiesMiddleware(
                entitiesReoslverWithIrrelevant,
                undefined,
                testArgs,
                testContext,
                testInfo,
            );

            expect(testContext.res.locals.irrelevantEntities).toEqual({ yed: ['1', '3'] });
        });

        it('appends to irrelevant entities key for multiple queries', async () => {
            // @ts-ignore
            testContext.res.locals.irrelevantEntities.lol = ['1', '555'];
            await irrelevantEntitiesMiddleware(
                entitiesReoslverWithIrrelevant,
                undefined,
                testArgs,
                testContext,
                testInfo,
            );

            expect(testContext.res.locals.irrelevantEntities).toEqual({
                lol: ['1', '555'],
                yed: ['1', '3'],
            });
        });

        it('deletes the temp irrelevant for further queries', async () => {
            await irrelevantEntitiesMiddleware(
                entitiesReoslverWithIrrelevant,
                undefined,
                testArgs,
                testContext,
                testInfo,
            );

            // @ts-ignore
            expect(testContext.res.locals.tempIrrelevant).not.toBeDefined();
        });
    });
});
