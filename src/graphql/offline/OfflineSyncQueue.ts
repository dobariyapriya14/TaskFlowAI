import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskInput } from '../schema';

export type QueueItemType = 'CREATE' | 'UPDATE' | 'TOGGLE' | 'DELETE';
export type QueueItemStatus = 'pending' | 'processing' | 'failed' | 'synced';

export interface QueueItem {
  id: string;
  type: QueueItemType;
  tempId?: string;
  taskId: string;
  payload?: TaskInput | Partial<TaskInput>;
  createdAt: string;
  retryCount: number;
  lastError?: string | null;
  status: QueueItemStatus;
}

export const OFFLINE_SYNC_QUEUE_KEY = '@taskflowai_offline_sync_queue';
export const MAX_QUEUE_RETRIES = 3;

export class OfflineSyncQueueManager {
  private queue: QueueItem[] = [];
  private isLoaded = false;
  private listeners: Set<(queue: QueueItem[]) => void> = new Set();

  constructor() {
    this.loadQueue();
  }

  /**
   * Load stored queue from AsyncStorage
   */
  public async loadQueue(): Promise<QueueItem[]> {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      } else {
        this.queue = [];
      }
    } catch (error) {
      console.warn('Failed to load offline sync queue from storage:', error);
      this.queue = [];
    } finally {
      this.isLoaded = true;
      this.notifyListeners();
    }
    return this.queue;
  }

  /**
   * Persist current queue state to AsyncStorage
   */
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        OFFLINE_SYNC_QUEUE_KEY,
        JSON.stringify(this.queue),
      );
    } catch (error) {
      console.warn('Failed to save offline sync queue to storage:', error);
    }
    this.notifyListeners();
  }

  /**
   * Get all active queue items
   */
  public getQueue(): QueueItem[] {
    return [...this.queue];
  }

  /**
   * Get pending queue items sorted chronologically
   */
  public getPendingItems(): QueueItem[] {
    return this.queue.filter(
      item => item.status === 'pending' || item.status === 'failed',
    );
  }

  /**
   * Subscribe to queue state updates
   */
  public subscribe(listener: (queue: QueueItem[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.queue]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const copy = [...this.queue];
    this.listeners.forEach(listener => listener(copy));
  }

  /**
   * Enqueue a new mutation operation
   */
  public async enqueue(
    type: QueueItemType,
    taskId: string,
    payload?: TaskInput | Partial<TaskInput>,
    tempId?: string,
  ): Promise<QueueItem> {
    if (!this.isLoaded) {
      await this.loadQueue();
    }

    const item: QueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      taskId,
      tempId,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    };

    this.queue.push(item);
    await this.persistQueue();
    return item;
  }

  /**
   * Cancel and remove pending operations for a temporary unsynced task.
   * Useful when a task was created offline and deleted offline before syncing.
   */
  public async cancelPendingForTempId(tempId: string): Promise<boolean> {
    if (!this.isLoaded) {
      await this.loadQueue();
    }

    const initialLength = this.queue.length;
    this.queue = this.queue.filter(
      item => item.tempId !== tempId && item.taskId !== tempId,
    );

    const removed = this.queue.length < initialLength;
    if (removed) {
      await this.persistQueue();
    }
    return removed;
  }

  /**
   * Update queue item when a temporary ID is assigned a server ID after creation.
   * Replaces taskId and tempId in subsequent queue items.
   */
  public async updateTempIdMapping(
    tempId: string,
    serverId: string,
  ): Promise<void> {
    if (!this.isLoaded) {
      await this.loadQueue();
    }

    let modified = false;
    this.queue = this.queue.map(item => {
      if (item.taskId === tempId || item.tempId === tempId) {
        modified = true;
        return {
          ...item,
          taskId: serverId,
          tempId: serverId,
          payload: item.payload
            ? {
                ...item.payload,
              }
            : item.payload,
        };
      }
      return item;
    });

    if (modified) {
      await this.persistQueue();
    }
  }

  /**
   * Mark a queue item as processing
   */
  public async setItemProcessing(id: string): Promise<void> {
    const item = this.queue.find(q => q.id === id);
    if (item) {
      item.status = 'processing';
      await this.persistQueue();
    }
  }

  /**
   * Record a failed attempt for a queue item
   */
  public async setItemFailed(id: string, errorMessage: string): Promise<void> {
    const item = this.queue.find(q => q.id === id);
    if (item) {
      item.retryCount += 1;
      item.lastError = errorMessage;
      item.status = item.retryCount >= MAX_QUEUE_RETRIES ? 'failed' : 'pending';
      await this.persistQueue();
    }
  }

  /**
   * Remove a queue item after successful sync
   */
  public async dequeue(id: string): Promise<void> {
    this.queue = this.queue.filter(q => q.id !== id);
    await this.persistQueue();
  }

  /**
   * Clear all queue items
   */
  public async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(OFFLINE_SYNC_QUEUE_KEY);
    this.notifyListeners();
  }

  /**
   * Reset retry count for failed items
   */
  public async retryFailed(): Promise<void> {
    this.queue.forEach(item => {
      if (item.status === 'failed') {
        item.status = 'pending';
        item.retryCount = 0;
        item.lastError = null;
      }
    });
    await this.persistQueue();
  }
}

export const offlineSyncQueue = new OfflineSyncQueueManager();
