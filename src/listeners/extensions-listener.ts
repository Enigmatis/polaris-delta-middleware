import {GraphQLRequestListener} from 'apollo-server-plugin-base';
import {PolarisBaseContext} from '@enigmatis/polaris-common';

export class ExtensionsListener implements GraphQLRequestListener {
    private readonly dataVersionRepository: any;

    constructor(dataVersionRepository?: any) {
        if (dataVersionRepository) {
            this.dataVersionRepository = dataVersionRepository;
        }
    }

    async willSendResponse(requestContext: any) {
        const {
            context,
            response,
        }: { context: PolarisBaseContext; response: any } = requestContext;
        if (context.logger) {
            context.logger.debug('Data Version extension started instrumenting', {context});
        }
        if (!response.extensions) {
            response.extensions = {};
        }

        if (context.dataVersion) {
            if (context.irrelevantEntities) {
                response.extensions.irrelevantEntities = context.irrelevantEntities;
            }
        }

        if (context.globalDataVersion) {
            response.extensions.dataVersion = context.globalDataVersion;
        } else {
            if (this.dataVersionRepository) {
                try {
                    const result = await this.dataVersionRepository.find();
                    if (result.length >= 1) {
                        response.extensions.dataVersion = result[0].value;
                    }
                    if (context.logger) {
                        context.logger.debug('Data Version extension finished instrumenting', {
                            context,
                        });
                    }
                } catch (err) {
                    if (context.logger) {
                        context.logger.error('Error fetching data version for extensions', {
                            context,
                            graphqlLogProperties: {throwable: err},
                        });
                    }
                }
            }
        }

        return requestContext;
    }
}
