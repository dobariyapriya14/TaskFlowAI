import { useState, useEffect, useCallback } from 'react';
import { offlineSyncQueue, QueueItem } from '../offline/OfflineSyncQueue';
import { offlineTaskRepository } from '../offline/OfflineTaskRepository';

export const useOfflineSyncQueue = () => {
  const [queue, setQueue] = useState<QueueItem[]>(offlineSyncQueue.getQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(
    offlineTaskRepository.getIsSyncing(),
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    offlineTaskRepository.getLastSyncedAt(),
  );

  useEffect(() => {
    const unsubscribe = offlineSyncQueue.subscribe(updatedQueue => {
      setQueue(updatedQueue);
    });
    return unsubscribe;
  }, []);

  const pendingCount = queue.filter(
    item => item.status === 'pending' || item.status === 'failed',
  ).length;

  const failedCount = queue.filter(item => item.status === 'failed').length;

  const syncQueue = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await offlineTaskRepository.syncQueue();
      setLastSyncedAt(offlineTaskRepository.getLastSyncedAt());
      return res;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const clearQueue = useCallback(async () => {
    await offlineSyncQueue.clearQueue();
  }, []);

  const retryFailed = useCallback(async () => {
    await offlineSyncQueue.retryFailed();
    return syncQueue();
  }, [syncQueue]);

  return {
    queue,
    pendingCount,
    failedCount,
    isSyncing,
    lastSyncedAt,
    syncQueue,
    clearQueue,
    retryFailed,
  };
};
