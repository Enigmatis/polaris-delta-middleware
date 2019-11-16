import {
    ApolloServerPlugin,
    GraphQLRequestContext,
    GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { ExtensionsListener } from '..';
import { PolarisGraphQLLogger } from '@enigmatis/polaris-graphql-logger';

export class ExtensionsPlugin implements ApolloServerPlugin {
    readonly logger: any;

    constructor(logger: PolarisGraphQLLogger) {
        this.logger = logger;
    }

    requestDidStart<TContext>(
        requestContext: GraphQLRequestContext<TContext>,
    ): GraphQLRequestListener<TContext> | void {
        return new ExtensionsListener(this.logger);
    }
}
