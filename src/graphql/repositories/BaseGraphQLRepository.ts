import {
  ApolloClient,
  DocumentNode,
  QueryOptions,
  MutationOptions,
  ApolloQueryResult,
  FetchResult,
  NormalizedCacheObject,
  OperationVariables,
} from '@apollo/client';
import { apolloClient as defaultApolloClient } from '../client';
import { CrashlyticsService } from '../../core/firebase/CrashlyticsCoreService';

export interface GraphQLQueryOptions<
  TData = any,
  TVariables = OperationVariables,
> extends Omit<QueryOptions<TVariables, TData>, 'query'> {}

export interface GraphQLMutationOptions<
  TData = any,
  TVariables = OperationVariables,
> extends Omit<MutationOptions<TData, TVariables>, 'mutation'> {}

export interface IGraphQLRepository<
  T,
  TInput = Partial<T>,
  TFilter = Record<string, any>,
> {
  getClient(): ApolloClient<NormalizedCacheObject>;
  setClient(client: ApolloClient<NormalizedCacheObject>): void;
  getById?(id: string): Promise<T | null>;
  getAll?(filter?: TFilter): Promise<T[]>;
  create?(input: TInput, options?: { optimistic?: boolean }): Promise<T>;
  update?(id: string, input: Partial<TInput>): Promise<T>;
  delete?(id: string): Promise<boolean>;
  readQuery<TData = any, TVariables = OperationVariables>(
    query: DocumentNode,
    variables?: TVariables,
  ): TData | null;
  writeQuery<TData = any, TVariables = OperationVariables>(
    query: DocumentNode,
    data: TData,
    variables?: TVariables,
  ): void;
  resetStore(): Promise<void>;
  clearStore(): Promise<void>;
}

export abstract class BaseGraphQLRepository<
  T = any,
  TInput = Partial<T>,
  TFilter = Record<string, any>,
> implements IGraphQLRepository<T, TInput, TFilter>
{
  protected client: ApolloClient<NormalizedCacheObject>;

  constructor(client?: ApolloClient<NormalizedCacheObject>) {
    this.client = client || defaultApolloClient;
  }

  /**
   * Set a custom ApolloClient instance for this repository
   */
  public setClient(client: ApolloClient<NormalizedCacheObject>): void {
    this.client = client;
  }

  /**
   * Get current ApolloClient instance
   */
  public getClient(): ApolloClient<NormalizedCacheObject> {
    return this.client;
  }

  /**
   * Generic type-safe query execution
   */
  public async query<
    TData = any,
    TVariables extends OperationVariables = OperationVariables,
  >(
    query: DocumentNode,
    variables?: TVariables,
    options?: Partial<GraphQLQueryOptions<TData, TVariables>>,
  ): Promise<ApolloQueryResult<TData>> {
    try {
      const response = await this.client.query<TData, TVariables>({
        query,
        variables: variables as TVariables,
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
        ...options,
      });

      if (response.errors && response.errors.length > 0) {
        response.errors.forEach(err => {
          const msg = `[BaseGraphQLRepository.query] Error: ${err.message}`;
          console.warn(msg);
          this.logToCrashlytics(msg);
        });
      }

      return response;
    } catch (error: any) {
      const msg = `[BaseGraphQLRepository.query] Exception: ${
        error.message || error
      }`;
      console.error(msg);
      this.logToCrashlytics(msg);
      throw error;
    }
  }

  /**
   * Generic type-safe mutation execution
   */
  public async mutate<
    TData = any,
    TVariables extends OperationVariables = OperationVariables,
  >(
    mutation: DocumentNode,
    variables?: TVariables,
    options?: Partial<GraphQLMutationOptions<TData, TVariables>>,
  ): Promise<FetchResult<TData>> {
    try {
      const response = await this.client.mutate<TData, TVariables>({
        mutation,
        variables: variables as TVariables,
        errorPolicy: 'all',
        ...options,
      });

      if (response.errors && response.errors.length > 0) {
        response.errors.forEach(err => {
          const msg = `[BaseGraphQLRepository.mutate] Error: ${err.message}`;
          console.warn(msg);
          this.logToCrashlytics(msg);
        });
      }

      return response;
    } catch (error: any) {
      const msg = `[BaseGraphQLRepository.mutate] Exception: ${
        error.message || error
      }`;
      console.error(msg);
      this.logToCrashlytics(msg);
      throw error;
    }
  }

  /**
   * Read data directly from Apollo Cache
   */
  public readQuery<TData = any, TVariables = OperationVariables>(
    query: DocumentNode,
    variables?: TVariables,
  ): TData | null {
    try {
      return this.client.readQuery<TData, TVariables>({
        query,
        variables,
      });
    } catch {
      return null;
    }
  }

  /**
   * Write data directly to Apollo Cache
   */
  public writeQuery<TData = any, TVariables = OperationVariables>(
    query: DocumentNode,
    data: TData,
    variables?: TVariables,
  ): void {
    try {
      this.client.writeQuery<TData, TVariables>({
        query,
        data,
        variables,
      });
    } catch (error: any) {
      console.warn('[BaseGraphQLRepository.writeQuery] Error:', error);
    }
  }

  /**
   * Reset store (clear cache and refetch active queries)
   */
  public async resetStore(): Promise<void> {
    await this.client.resetStore();
  }

  /**
   * Clear store (clear cache without refetching)
   */
  public async clearStore(): Promise<void> {
    await this.client.clearStore();
  }

  protected logToCrashlytics(message: string): void {
    try {
      CrashlyticsService.logMessage(message);
    } catch {
      // Crashlytics service uninitialized or missing in environment
    }
  }
}
