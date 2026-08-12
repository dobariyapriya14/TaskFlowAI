import AsyncStorage from '@react-native-async-storage/async-storage';
import { DomainEvent } from './DomainEvent';
import { eventBus, EventBusManager } from './EventBus';

export interface DeadLetterItem {
  id: string;
  event: DomainEvent;
  handlerName: string;
  failedAt: string;
  retryCount: number;
  lastError: string;
}

export const DEAD_LETTER_QUEUE_KEY = '@taskflowai_dead_letter_queue';
export const MAX_EVENT_RETRIES = 3;

export class AsyncEventProcessorManager {
  private processingQueue: Array<{
    event: DomainEvent;
    handler: (event: DomainEvent) => Promise<void>;
    handlerName: string;
    retryCount: number;
  }> = [];
  private deadLetterQueue: DeadLetterItem[] = [];
  private isProcessing = false;
  private processedCount = 0;
  private failedCount = 0;
  private isLoaded = false;
  private listeners: Set<
    (state: {
      isProcessing: boolean;
      processedCount: number;
      failedCount: number;
      deadLetterQueue: DeadLetterItem[];
    }) => void
  > = new Set();

  constructor(private bus: EventBusManager = eventBus) {
    this.loadDLQ();
    this.setupBusAutoProcessor();
  }

  public async loadDLQ(): Promise<DeadLetterItem[]> {
    if (this.isLoaded) return this.deadLetterQueue;
    try {
      const stored = await AsyncStorage.getItem(DEAD_LETTER_QUEUE_KEY);
      if (stored && !this.isLoaded) {
        this.deadLetterQueue = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to load DLQ from storage:', err);
    } finally {
      this.isLoaded = true;
    }
    this.notifyListeners();
    return this.deadLetterQueue;
  }

  private async persistDLQ(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        DEAD_LETTER_QUEUE_KEY,
        JSON.stringify(this.deadLetterQueue),
      );
    } catch (err) {
      console.warn('Failed to save DLQ to storage:', err);
    }
    this.notifyListeners();
  }

  /**
   * Automatically process events dispatched through EventBus
   */
  private setupBusAutoProcessor(): void {
    this.bus.subscribe('*', async _event => {
      // Automatic queue processing triggered by Domain Events
    });
  }

  /**
   * Enqueue a domain event to be processed by a named async handler in background
   */
  public enqueueHandler(
    event: DomainEvent,
    handler: (event: DomainEvent) => Promise<void>,
    handlerName: string = 'AnonymousHandler',
  ): void {
    this.processingQueue.push({
      event,
      handler,
      handlerName,
      retryCount: 0,
    });
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.notifyListeners();

    while (this.processingQueue.length > 0) {
      const task = this.processingQueue.shift();
      if (!task) break;

      try {
        await task.handler(task.event);
        this.processedCount += 1;
      } catch (err: any) {
        task.retryCount += 1;
        const errorMsg = err?.message || 'Async processing failed';

        if (task.retryCount < MAX_EVENT_RETRIES) {
          // Re-queue for retry
          this.processingQueue.push(task);
        } else {
          // Exceeded retries -> Move to Dead Letter Queue (DLQ)
          this.failedCount += 1;
          const dlqItem: DeadLetterItem = {
            id: `dlq-${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 6)}`,
            event: task.event,
            handlerName: task.handlerName,
            failedAt: new Date().toISOString(),
            retryCount: task.retryCount,
            lastError: errorMsg,
          };
          this.deadLetterQueue.unshift(dlqItem);
          this.isLoaded = true;
          await this.persistDLQ();
        }
      }
    }

    this.isProcessing = false;
    this.notifyListeners();
  }

  public getStats() {
    return {
      isProcessing: this.isProcessing,
      processedCount: this.processedCount,
      failedCount: this.failedCount,
      deadLetterQueue: [...this.deadLetterQueue],
    };
  }

  public subscribe(
    listener: (state: {
      isProcessing: boolean;
      processedCount: number;
      failedCount: number;
      deadLetterQueue: DeadLetterItem[];
    }) => void,
  ): () => void {
    this.listeners.add(listener);
    listener(this.getStats());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach(l => l(stats));
  }

  public getDeadLetterQueue(): DeadLetterItem[] {
    return [...this.deadLetterQueue];
  }

  public async reprocessDeadLetterItem(
    id: string,
    handler: (event: DomainEvent) => Promise<void>,
  ): Promise<boolean> {
    const idx = this.deadLetterQueue.findIndex(item => item.id === id);
    if (idx === -1) return false;

    const [dlqItem] = this.deadLetterQueue.splice(idx, 1);
    this.isLoaded = true;
    await this.persistDLQ();

    this.enqueueHandler(dlqItem.event, handler, dlqItem.handlerName);
    return true;
  }

  public async clearDLQ(): Promise<void> {
    this.deadLetterQueue = [];
    this.isLoaded = true;
    await AsyncStorage.removeItem(DEAD_LETTER_QUEUE_KEY);
    this.notifyListeners();
  }
}

export const asyncEventProcessor = new AsyncEventProcessorManager();
