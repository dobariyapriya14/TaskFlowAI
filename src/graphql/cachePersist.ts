import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageWrapper, CachePersistor } from 'apollo3-cache-persist';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';

export interface CachePersistOptions {
  key?: string;
  maxSize?: number | false;
  debug?: boolean;
}

export const DEFAULT_CACHE_PERSIST_KEY = 'apollo-cache-persist';

let currentPersistor: CachePersistor<NormalizedCacheObject> | null = null;

/**
 * Initializes and restores the Apollo InMemoryCache from AsyncStorage persistence.
 */
export const initApolloCachePersist = async (
  cache: InMemoryCache,
  options: CachePersistOptions = {},
): Promise<CachePersistor<NormalizedCacheObject>> => {
  const {
    key = DEFAULT_CACHE_PERSIST_KEY,
    maxSize = 1048576, // 1MB default threshold
    debug = false,
  } = options;

  const persistor = new CachePersistor<NormalizedCacheObject>({
    cache,
    storage: new AsyncStorageWrapper(AsyncStorage),
    key,
    maxSize,
    debug,
  });

  await persistor.restore();
  currentPersistor = persistor;
  return persistor;
};

/**
 * Gets the active CachePersistor instance if initialized.
 */
export const getApolloCachePersistor =
  (): CachePersistor<NormalizedCacheObject> | null => {
    return currentPersistor;
  };

/**
 * Resets active persistor reference (useful for testing).
 */
export const resetApolloCachePersistor = (): void => {
  currentPersistor = null;
};

/**
 * Purges the persisted Apollo cache from AsyncStorage.
 */
export const purgeApolloCache = async (
  persistor?: CachePersistor<NormalizedCacheObject> | null,
): Promise<void> => {
  const targetPersistor =
    persistor === undefined ? currentPersistor : persistor;
  if (targetPersistor) {
    await targetPersistor.purge();
  } else {
    await AsyncStorage.removeItem(DEFAULT_CACHE_PERSIST_KEY);
  }
};
