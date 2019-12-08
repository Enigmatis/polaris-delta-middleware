![Polaris-logo](static/img/polaris-logo.png)

# polaris-middlewares

[![NPM version](https://img.shields.io/npm/v/@enigmatis/polaris-middlewares.svg?style=flat-square)](https://www.npmjs.com/package/@enigmatis/polaris-middlewares)
[![Build Status](https://travis-ci.com/Enigmatis/polaris-middlewares.svg?branch=master)](https://travis-ci.com/Enigmatis/polaris-middlewares)

This package contains middlewares for polaris graphql server.\
You can use these middlewares & extensions separately using your apollo server.

For example:

```typescript
import { makeExecutableSchema, applyMiddleware, ApolloServer } from 'apollo-server';
import {
    DataVersionMiddleware,
    SoftDeleteMiddleware,
    RealitiesMiddleware,
    IrrelevantEntitiesMiddleware,
} from '@enigmatis/polaris-middlewares';
const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddlewares = applyMiddleware(
    schema,
    DataVersionMiddleware.getMiddleware(),
    SoftDeleteMiddleware.getMiddleware(),
    RealitiesMiddleware.getMiddleware(),
    IrrelevantEntitiesMiddleware.getMiddleware(),
);
const apolloServer = new ApolloServer({
    schema: schemaWithMiddlewares,
    context: ctx => getPolarisContext(ctx),
});
```

## Data Version Middleware

Data version is a sequence that indicates a version of an entity.
If you want to use polling in order to receive query differences (Deltas), you can use the data version middleware.

This middleware filters array of entities: if the entity/entities have the field `dataVersion` set on them, the middleware return only entities that have a bigger `dataVersion` than
the data version that is set on the context (`context.requestHeaders.dataVersion`).
If no `dataVersion` is set on context, no filter will be applied.
If a single entity is returned, the filter will be applied as well.
If an array of entities with no data version field is returned, no filter will be applied.

For example:

```javascript
const beforeMiddleware = [
    { title: 'x', dataVersion: 2 },
    { title: 'y', dataVersion: 5 },
];

const afterMiddleware = [{ title: 'x', dataVersion: 5 }]; // context.requestHeaders.dataVersion is set to 3
```

## Soft Delete Middleware

It works similar to data version middleware, filtering out all entities which are soft deleted (has a property called `deleted` set to true).

For example:

```javascript
const beforeMiddleware = [
    { title: 'x', deleted: true },
    { title: 'y', deleted: false },
];
const afterMiddleware = [{ title: 'y', deleted: false }];
```

## Irrelevant entities extension

If your context object contains an irrelevant entities object under property `context.returnedExtensions.irrelevantEntities`,
it adds the value of this property to the extensions object in the graphql response.

for example, setting the context irrelevant entities:

```javascript
context.returnedExtensions.irrelevantEntities = { books: [1, 2, 3] };
```

and the graphql response:

```javascript
const response = {
    data: {...},
    errors:[],
    extensions: {
        books: [1,2,3]
    }
}
```
