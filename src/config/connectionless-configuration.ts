import { DataVersion } from '@enigmatis/polaris-typeorm';
import { ConnectionlessIrrelevantEntitiesCriteria } from './connectionless-irrelevant-entities-criteria';

export interface ConnectionlessConfiguration {
    getDataVersion(): Promise<DataVersion>;

    // getRepository<ENTITY>(repo: any): PolarisRepository<ENTITY>;
    // saveSnapshotPage(): (page: SnapshotPage) => void;
    getIrrelevantEntities(typeName: string, criteria: ConnectionlessIrrelevantEntitiesCriteria): Promise<any[]>;
}
