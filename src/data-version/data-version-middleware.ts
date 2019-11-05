import { PolarisBaseContext } from '@enigmatis/polaris-common';

const dataVersionHeaderName: string = 'data-version';

const dataVersionMiddleware = async (
    resolve: any,
    root: any,
    args: any,
    context: PolarisBaseContext,
    info: any,
) => {
    if (context.logger) {
        context.logger.debug('Data version middleware started job', { context });
    }
    const result = await resolve(root, args, context, info);
    let finalResult;
    if (!root && context.dataVersion && !isNaN(context.dataVersion)) {
        // assert that it has no root (so it is the root)
        if (result instanceof Array) {
            finalResult = result.filter(entity =>
                entity.dataVersion && context.dataVersion
                    ? entity.dataVersion > context.dataVersion
                    : entity,
            );
        } else {
            finalResult = result;
        }
    } else {
        finalResult = result;
    }
    if (context.logger) {
        context.logger.debug('Data version middleware finished job', { context });
    }
    return finalResult;
};

const initContextForDataVersion = async ({ req }: any) => {
    return {
        dataVersion: req.headers[dataVersionHeaderName],
    };
};

export { dataVersionMiddleware, initContextForDataVersion };
