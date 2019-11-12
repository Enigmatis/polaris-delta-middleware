import { PolarisBaseContext } from '@enigmatis/polaris-common';

const irrelevantEntitiesMiddleware = async (
    resolve: any,
    root: any,
    args: any,
    context: PolarisBaseContext,
    info: any,
) => {
    if (context.logger) {
        context.logger.debug('Irrelevant entities middleware started job', { context });
    }
    const result = await resolve(root, args, context, info);
    const tempIrrelevantEntities = context.res.locals.tempIrrelevant;
    if (tempIrrelevantEntities && tempIrrelevantEntities.length !== 0) {
        context.res.locals.irrelevantEntities[info.path.key] = tempIrrelevantEntities;
        delete context.res.locals.tempIrrelevant;
    }
    if (context.logger) {
        context.logger.debug('Irrelevant entities finished the job middleware finished job', {
            context,
        });
    }
    return result;
};

export { irrelevantEntitiesMiddleware };
