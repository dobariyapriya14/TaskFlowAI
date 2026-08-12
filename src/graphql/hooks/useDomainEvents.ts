import { useState, useEffect, useCallback } from 'react';
import {
  eventBus,
  DomainEvent,
  DomainEventType,
  createDomainEvent,
} from '../../core/events';

export interface UseDomainEventsReturn {
  events: DomainEvent[];
  latestEvent: DomainEvent | null;
  publishEvent: <T = any>(
    type: DomainEventType,
    aggregateId: string,
    payload: T,
    metadata?: Record<string, any>,
  ) => void;
  clearHistory: () => Promise<void>;
}

export function useDomainEvents(): UseDomainEventsReturn {
  const [events, setEvents] = useState<DomainEvent[]>(() =>
    eventBus.getEventHistory(),
  );

  useEffect(() => {
    const unsubscribe = eventBus.subscribeHistory(history => {
      setEvents(history);
    });
    return unsubscribe;
  }, []);

  const publishEvent = useCallback(
    <T = any>(
      type: DomainEventType,
      aggregateId: string,
      payload: T,
      metadata?: Record<string, any>,
    ) => {
      const event = createDomainEvent(type, aggregateId, payload, metadata);
      eventBus.publish(event);
    },
    [],
  );

  const clearHistory = useCallback(async () => {
    await eventBus.clearHistory();
  }, []);

  return {
    events,
    latestEvent: events.length > 0 ? events[0] : null,
    publishEvent,
    clearHistory,
  };
}
