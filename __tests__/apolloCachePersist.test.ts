import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initApolloCachePersist,
  purgeApolloCache,
  getApolloCachePersistor,
  resetApolloCachePersistor,
  DEFAULT_CACHE_PERSIST_KEY,
} from '../src/graphql/cachePersist';
import { createApolloCache } from '../src/graphql/client';
import { GET_TASKS_QUERY } from '../src/graphql/operations';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('Apollo Cache Persistence', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    resetApolloCachePersistor();
    await AsyncStorage.clear();
  });

  it('initializes cache persistor and restores cache successfully', async () => {
    const cache = createApolloCache();
    const persistor = await initApolloCachePersist(cache, {
      key: 'test-cache-key',
    });

    expect(persistor).toBeDefined();
    expect(getApolloCachePersistor()).toBe(persistor);
  });

  it('purges persisted cache when purgeApolloCache is invoked', async () => {
    const cache = createApolloCache();
    const persistor = await initApolloCachePersist(cache, {
      key: 'test-purge-key',
    });

    const removeItemSpy = jest.spyOn(AsyncStorage, 'removeItem');
    await purgeApolloCache(persistor);

    expect(removeItemSpy).toHaveBeenCalledWith('test-purge-key');
  });

  it('purges default cache key if no persistor is passed', async () => {
    const removeItemSpy = jest.spyOn(AsyncStorage, 'removeItem');
    await purgeApolloCache(null);

    expect(removeItemSpy).toHaveBeenCalledWith(DEFAULT_CACHE_PERSIST_KEY);
  });

  it('persists data to AsyncStorage and restores it into a fresh cache instance', async () => {
    const key = 'test-e2e-cache-key';
    const cache1 = createApolloCache();
    const persistor1 = await initApolloCachePersist(cache1, { key });

    // Write dummy data into cache1
    cache1.writeQuery({
      query: GET_TASKS_QUERY,
      data: {
        tasks: [
          {
            __typename: 'GraphQLTask',
            id: 'task-persisted-1',
            title: 'Persisted Task Test',
            completed: false,
            priority: 'HIGH',
            category: 'TEST',
            createdAt: '2026-08-10T10:00:00Z',
            updatedAt: '2026-08-10T10:00:00Z',
          },
        ],
      },
    });

    // Force flush cache to storage
    await persistor1.persist();

    // Create a brand new empty cache and restore from AsyncStorage
    resetApolloCachePersistor();
    const cache2 = createApolloCache();
    await initApolloCachePersist(cache2, { key });

    // Read back query from cache2 without network call
    const cachedData = cache2.readQuery<{ tasks: any[] }>({
      query: GET_TASKS_QUERY,
    });

    expect(cachedData).toBeDefined();
    expect(cachedData?.tasks).toHaveLength(1);
    expect(cachedData?.tasks[0].title).toBe('Persisted Task Test');
  });
});
