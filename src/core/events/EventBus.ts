import AsyncStorage from '@react-native-async-storage/async-storage';
import { DomainEvent, DomainEventType } from './DomainEvent';

export type EventHandler<T = any> = (
  event: DomainEvent<T>,
) => void | Promise<void>;

export interface EventSubscription {
  id: string;
  eventType: DomainEventType | '*';
  handler: EventHandler;
  priority: number;
}

export const DOMAIN_EVENT_STORE_KEY = '@taskflowai_domain_event_store';
export const MAX_EVENT_HISTORY = 100;

export class EventBusManager {
  private subscriptions: Set<EventSubscription> = new Set();
  private eventHistory: DomainEvent[] = [];
  private isLoaded = false;
  private historyListeners: Set<(history: DomainEvent[]) => void> = new Set();

  constructor() {
    this.loadEventHistory();
  }

  /**
   * Load stored domain event history from AsyncStorage
   */
  public async loadEventHistory(): Promise<DomainEvent[]> {
    if (this.isLoaded) return this.eventHistory;
    try {
      const stored = await AsyncStorage.getItem(DOMAIN_EVENT_STORE_KEY);
      if (stored && !this.isLoaded) {
        this.eventHistory = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to load domain event history from storage:', err);
    } finally {
      this.isLoaded = true;
    }
    this.notifyHistoryListeners();
    return this.eventHistory;
  }

  /**
   * Persist current event history to AsyncStorage
   */
  private async persistEventHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        DOMAIN_EVENT_STORE_KEY,
        JSON.stringify(this.eventHistory),
      );
    } catch (err) {
      console.warn('Failed to save domain event history to storage:', err);
    }
    this.notifyHistoryListeners();
  }

  /**
   * Subscribe to specific domain event or '*' for all events
   */
  public subscribe<T = any>(
    eventType: DomainEventType | '*',
    handler: EventHandler<T>,
    priority: number = 0,
  ): () => void {
    const sub: EventSubscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType,
      handler,
      priority,
    };
    this.subscriptions.add(sub);

    return () => {
      this.subscriptions.delete(sub);
    };
  }

  /**
   * Synchronously publish a domain event to all subscribers
   */
  public publish<T = any>(event: DomainEvent<T>): void {
    this.recordEvent(event);

    const matchingSubs = Array.from(this.subscriptions)
      .filter(sub => sub.eventType === '*' || sub.eventType === event.type)
      .sort((a, b) => b.priority - a.priority);

    for (const sub of matchingSubs) {
      try {
        sub.handler(event);
      } catch (err) {
        console.warn(
          `[EventBus] Error executing subscriber for ${event.type}:`,
          err,
        );
      }
    }
  }

  /**
   * Asynchronously publish a domain event to all subscribers
   */
  public async publishAsync<T = any>(event: DomainEvent<T>): Promise<void> {
    this.recordEvent(event);

    const matchingSubs = Array.from(this.subscriptions)
      .filter(sub => sub.eventType === '*' || sub.eventType === event.type)
      .sort((a, b) => b.priority - a.priority);

    for (const sub of matchingSubs) {
      try {
        await sub.handler(event);
      } catch (err) {
        console.warn(
          `[EventBus] Async error executing subscriber for ${event.type}:`,
          err,
        );
      }
    }
  }

  private recordEvent(event: DomainEvent): void {
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > MAX_EVENT_HISTORY) {
      this.eventHistory = this.eventHistory.slice(0, MAX_EVENT_HISTORY);
    }
    this.isLoaded = true;
    this.persistEventHistory();
  }

  public getEventHistory(): DomainEvent[] {
    return [...this.eventHistory];
  }

  public subscribeHistory(
    listener: (history: DomainEvent[]) => void,
  ): () => void {
    this.historyListeners.add(listener);
    listener([...this.eventHistory]);
    return () => {
      this.historyListeners.delete(listener);
    };
  }

  private notifyHistoryListeners(): void {
    const copy = [...this.eventHistory];
    this.historyListeners.forEach(listener => listener(copy));
  }

  public async clearHistory(): Promise<void> {
    this.eventHistory = [];
    this.isLoaded = true;
    await AsyncStorage.removeItem(DOMAIN_EVENT_STORE_KEY);
    this.notifyHistoryListeners();
  }
}

export const eventBus = new EventBusManager();
