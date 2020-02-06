import { PolarisError, RealitiesHolder } from '@enigmatis/polaris-common';
import { Connection, getConnectionManager } from '@enigmatis/polaris-typeorm';

export function getConnectionForReality(realityId: number, realitiesHolder: RealitiesHolder): Connection {
    const connectionManager = getConnectionManager();
    const reality = realitiesHolder.getReality(realityId);
    if (!reality || !reality.name) {
        throw new PolarisError(`Reality id: ${realityId} has no name for connection`, 500);
    }
    if (!connectionManager.has(reality.name)) {
        throw new PolarisError(`There is no connections: '${reality.name}' for reality id: ${reality.id}`, 500);
    }

    return connectionManager.get(reality.name);
}