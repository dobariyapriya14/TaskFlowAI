import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  OfflineSyncQueueManager,
  OFFLINE_SYNC_QUEUE_KEY,
} from '../src/graphql/offline/OfflineSyncQueue';
import { NetworkStatusService } from '../src/graphql/offline/NetworkStatusService';

describe('OfflineSyncQueue & NetworkStatusService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('NetworkStatusService', () => {
    it('initializes with default online status', () => {
      const net = new NetworkStatusService(true);
      expect(net.isOnline()).toBe(true);
    });

    it('notifies listeners on status change', () => {
      const net = new NetworkStatusService(true);
      const listener = jest.fn();
      net.subscribe(listener);

      expect(listener).toHaveBeenCalledWith(true);
      net.setOnline(false);
      expect(listener).toHaveBeenCalledWith(false);
      expect(net.isOnline()).toBe(false);
    });

    it('toggles offline status', () => {
      const net = new NetworkStatusService(true);
      const status = net.toggleOffline();
      expect(status).toBe(false);
      expect(net.isOnline()).toBe(false);
    });

    it('triggers reconnection callbacks when changing from offline to online', () => {
      const net = new NetworkStatusService(false);
      const callback = jest.fn();
      net.onReconnected(callback);

      net.setOnline(true);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('OfflineSyncQueueManager', () => {
    let queue: OfflineSyncQueueManager;

    beforeEach(async () => {
      queue = new OfflineSyncQueueManager();
      await queue.clearQueue();
    });

    it('enqueues a mutation operation and persists to AsyncStorage', async () => {
      const item = await queue.enqueue(
        'CREATE',
        'temp-101',
        { title: 'Offline Task' },
        'temp-101',
      );

      expect(item.id).toBeDefined();
      expect(item.type).toBe('CREATE');
      expect(item.taskId).toBe('temp-101');
      expect(item.status).toBe('pending');

      const items = queue.getPendingItems();
      expect(items.length).toBe(1);

      const storedRaw = await AsyncStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
      expect(storedRaw).not.toBeNull();
      const stored = JSON.parse(storedRaw!);
      expect(stored[0].taskId).toBe('temp-101');
    });

    it('updates temporary ID mapping when server returns actual ID', async () => {
      await queue.enqueue(
        'CREATE',
        'temp-202',
        { title: 'New Task' },
        'temp-202',
      );
      await queue.enqueue(
        'UPDATE',
        'temp-202',
        { title: 'New Task Updated' },
        'temp-202',
      );

      await queue.updateTempIdMapping('temp-202', 'server-id-999');

      const items = queue.getQueue();
      expect(items[0].taskId).toBe('server-id-999');
      expect(items[1].taskId).toBe('server-id-999');
    });

    it('cancels pending operations when an offline temporary task is deleted', async () => {
      await queue.enqueue(
        'CREATE',
        'temp-303',
        { title: 'Temp Task' },
        'temp-303',
      );
      await queue.enqueue(
        'UPDATE',
        'temp-303',
        { title: 'Updated' },
        'temp-303',
      );

      const cancelled = await queue.cancelPendingForTempId('temp-303');
      expect(cancelled).toBe(true);

      const pending = queue.getPendingItems();
      expect(pending.length).toBe(0);
    });

    it('tracks retries and marks status as failed after exceeding max retries', async () => {
      const item = await queue.enqueue('DELETE', 'task-555');

      await queue.setItemFailed(item.id, 'Network error 1');
      await queue.setItemFailed(item.id, 'Network error 2');
      await queue.setItemFailed(item.id, 'Network error 3');

      const current = queue.getQueue().find(q => q.id === item.id);
      expect(current?.status).toBe('failed');
      expect(current?.retryCount).toBe(3);
      expect(current?.lastError).toBe('Network error 3');
    });

    it('resets failed retry counts when retryFailed() is called', async () => {
      const item = await queue.enqueue('DELETE', 'task-777');
      await queue.setItemFailed(item.id, 'Err 1');
      await queue.setItemFailed(item.id, 'Err 2');
      await queue.setItemFailed(item.id, 'Err 3');

      await queue.retryFailed();

      const current = queue.getQueue().find(q => q.id === item.id);
      expect(current?.status).toBe('pending');
      expect(current?.retryCount).toBe(0);
      expect(current?.lastError).toBeNull();
    });
  });
});
