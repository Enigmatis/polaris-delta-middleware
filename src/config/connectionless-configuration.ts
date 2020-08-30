import { DataVersion, SnapshotPage } from '@enigmatis/polaris-typeorm';
import { ConnectionlessIrrelevantEntitiesCriteria } from './connectionless-irrelevant-entities-criteria';

export interface ConnectionlessConfiguration {
    getDataVersion(): Promise<DataVersion>;

    saveSnapshotPage(page: SnapshotPage): void;

    getIrrelevantEntities(typeName: string, criteria: ConnectionlessIrrelevantEntitiesCriteria): Promise<any[]>;

    getSnapshotPageById(id: string): Promise<SnapshotPage>;

    deleteSnapshotPageBySecondsToBeOutdated(secondsToBeOutdated: number, tablePath: string): void;
}
