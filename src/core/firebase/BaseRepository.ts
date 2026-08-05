import {
  QueryConstraint,
  WriteBatch,
  Transaction,
} from '@react-native-firebase/firestore';

export interface RepositoryQueryOptions {
  constraints?: QueryConstraint[];
  limitDocs?: number;
  lastDoc?: any;
}

export interface QueryResult<T> {
  data: T[];
  lastVisible: any;
}

export interface BaseRepository<T extends { id?: string }> {
  create(data: Omit<T, 'id'>, traceName?: string): Promise<string>;
  setWithId(id: string, data: Omit<T, 'id'>, traceName?: string): Promise<void>;
  getById(id: string, traceName?: string): Promise<T | null>;
  update(id: string, data: Partial<T>, traceName?: string): Promise<void>;
  delete(id: string, traceName?: string): Promise<void>;
  queryDocs(
    options?: RepositoryQueryOptions,
    traceName?: string,
  ): Promise<QueryResult<T>>;
  subscribeToDoc(
    id: string,
    onUpdate: (data: T | null) => void,
    onError?: (error: Error) => void,
  ): () => void;
  subscribeToQuery(
    options: RepositoryQueryOptions,
    onUpdate: (data: T[]) => void,
    onError?: (error: Error) => void,
  ): () => void;
  batchWrite(
    batchOperations: (batch: WriteBatch) => void,
    traceName?: string,
  ): Promise<void>;
  runTransaction<R>(
    updateFunction: (transaction: Transaction) => Promise<R>,
    traceName?: string,
  ): Promise<R>;
}
