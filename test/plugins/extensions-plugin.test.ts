import { ExtensionsListener } from '../../src';

describe('data-version extensions plugin test', () => {
    describe('data version repository supplied', () => {
        describe('data version repo returns a data version value', () => {
            let dataVersionRepo: any;
            let extension: any;
            beforeEach(() => {
                dataVersionRepo = {
                    find: async () => {
                        return [{ id: 1, value: 2 }];
                    },
                };
                extension = new ExtensionsListener(dataVersionRepo);
            });
            describe('context has data version', () => {
                let requestContext: any;
                let findSpy: any;
                beforeEach(() => {
                    requestContext = {
                        response: { data: {}, errors: [] },
                        context: { dataVersion: 3 },
                    };
                    findSpy = jest.spyOn(dataVersionRepo, 'find');
                });
                describe('context has global data version', () => {
                    beforeEach(() => {
                        requestContext.context.globalDataVersion = 4;
                    });
                    it('response extensions contain global data version and repo is not called', async () => {
                        const response = await extension.willSendResponse(requestContext);
                        expect(response.context).toEqual(requestContext.context);
                        expect(response.response.extensions).toMatchObject({ dataVersion: 4 });
                        expect(dataVersionRepo.find).not.toHaveBeenCalled();
                    });
                });
                describe('context has no global data version', () => {
                    it('response extensions contain global data version and repo is called', async () => {
                        const response = await extension.willSendResponse(requestContext);
                        expect(response.context).toEqual(requestContext.context);
                        expect(response.response.extensions).toMatchObject({ dataVersion: 2 });
                        expect(dataVersionRepo.find).toHaveBeenCalledTimes(1);
                    });
                });
            });
            describe('context has no data version', () => {
                let requestContext: any;
                beforeEach(() => {
                    requestContext = {
                        response: { data: {}, errors: [] },
                        context: {},
                    };
                });
                it('response extensions contain global data version', async () => {
                    const response = await extension.willSendResponse(requestContext);
                    expect(response.context).toEqual(requestContext.context);
                    expect(response.response.extensions).toMatchObject({ dataVersion: 2 });
                });
            });
        });
    });
    describe('no data version repository supplied', () => {
        let extension: any;
        beforeEach(() => {
            extension = new ExtensionsListener();
        });
        describe('context has data version', () => {
            let requestContext: any;
            beforeEach(() => {
                requestContext = {
                    response: { data: {}, errors: [] },
                    context: { dataVersion: 2 },
                };
            });
            it('response should contain irrelevant entities if its supplied in context', async () => {
                const irrelevantEntities = { blabla: 'blabla' };
                requestContext.context.irrelevantEntities = irrelevantEntities;
                const response = await extension.willSendResponse(requestContext);
                expect(response.context).toEqual({ dataVersion: 2, irrelevantEntities });
                expect(response.response.extensions).toEqual({ irrelevantEntities });
            });
            it('response should contain an undefined irrelevant entities object if its not supplied in context', async () => {
                const response = await extension.willSendResponse(requestContext);
                expect(response.context).toEqual({ dataVersion: 2 });
                expect(response.response.extensions.irrelevantEntities).toBeUndefined();
            });
        });

        describe('context has no data version', () => {
            let requestContext: any;
            beforeEach(() => {
                requestContext = {
                    response: { data: {}, errors: [], extensions: {} },
                    context: {},
                };
            });
            it('response should contain an undefined irrelevant entities object', async () => {
                const response = await extension.willSendResponse(requestContext);
                expect(response.context).toEqual({});
                expect(response.response.extensions.irrelevantEntities).toBeUndefined();
            });
        });
    });
});
