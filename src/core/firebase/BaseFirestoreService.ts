import { FirestoreRepository } from './FirestoreRepository';
import { DocumentData } from '@react-native-firebase/firestore';

export type { RepositoryQueryOptions as QueryOptions } from './BaseRepository';

/**
 * @deprecated Use `FirestoreRepository` or implementation extending `FirestoreRepository` instead.
 */
export class BaseFirestoreService<
  T extends DocumentData & { id?: string },
> extends FirestoreRepository<T> {
  async add(data: Omit<T, 'id'>, traceName?: string): Promise<string> {
    return this.create(data, traceName);
  }

  async get(id: string, traceName?: string): Promise<T | null> {
    return this.getById(id, traceName);
  }

  async query(
    options: any = {},
    traceName?: string,
  ): Promise<{ data: T[]; lastVisible: any }> {
    return this.queryDocs(options, traceName);
  }
}
