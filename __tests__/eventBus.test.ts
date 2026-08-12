import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EventBusManager,
  DomainEventType,
  createDomainEvent,
  AsyncEventProcessorManager,
  MAX_EVENT_RETRIES,
} from '../src/core/events';

describe('EventBusManager & AsyncEventProcessorManager', () => {
  let eventBus: EventBusManager;
  let asyncProcessor: AsyncEventProcessorManager;

  beforeEach(async () => {
    await AsyncStorage.clear();
    eventBus = new EventBusManager();
    await eventBus.clearHistory();
    asyncProcessor = new AsyncEventProcessorManager(eventBus);
    await asyncProcessor.clearDLQ();
  });

  it('publishes and subscribes to domain events in priority order', () => {
    const receivedOrder: string[] = [];

    eventBus.subscribe(
      DomainEventType.TASK_CREATED,
      evt => {
        receivedOrder.push(`low-${evt.payload.title}`);
      },
      0,
    );

    eventBus.subscribe(
      DomainEventType.TASK_CREATED,
      evt => {
        receivedOrder.push(`high-${evt.payload.title}`);
      },
      10,
    );

    const event = createDomainEvent(DomainEventType.TASK_CREATED, 'task-1', {
      title: 'Test Task',
    });

    eventBus.publish(event);

    expect(receivedOrder).toEqual(['high-Test Task', 'low-Test Task']);
    expect(eventBus.getEventHistory().length).toBe(1);
    expect(eventBus.getEventHistory()[0].id).toBe(event.id);
  });

  it('persists event history to AsyncStorage', async () => {
    const event = createDomainEvent(DomainEventType.TASK_COMPLETED, 'task-2', {
      title: 'Completed Task',
    });

    eventBus.publish(event);

    const history = await eventBus.loadEventHistory();
    expect(history.length).toBe(1);
    expect(history[0].aggregateId).toBe('task-2');
  });

  it('processes async event handlers and routes failing handlers to DLQ', async () => {
    const event = createDomainEvent(DomainEventType.TASK_DELETED, 'task-3', {
      title: 'Deleted Task',
    });

    let attempts = 0;
    const failingHandler = jest.fn(async () => {
      attempts += 1;
      throw new Error('Failing Handler Error');
    });

    asyncProcessor.enqueueHandler(event, failingHandler, 'TestFailingHandler');

    // Allow worker loop microtasks to flush retries
    await new Promise(r => setTimeout(r, 50));

    expect(attempts).toBe(MAX_EVENT_RETRIES);
    const dlq = asyncProcessor.getDeadLetterQueue();
    expect(dlq.length).toBe(1);
    expect(dlq[0].handlerName).toBe('TestFailingHandler');
    expect(dlq[0].lastError).toBe('Failing Handler Error');
  });

  it('allows reprocessDeadLetterItem to re-enqueue items from DLQ', async () => {
    const event = createDomainEvent(DomainEventType.TASK_UPDATED, 'task-4', {
      title: 'Updated Task',
    });

    const failingHandler = jest.fn(async () => {
      throw new Error('Initial Failure');
    });

    asyncProcessor.enqueueHandler(event, failingHandler, 'DLQTestHandler');
    await new Promise(r => setTimeout(r, 50));

    const dlq = asyncProcessor.getDeadLetterQueue();
    expect(dlq.length).toBe(1);

    const successHandler = jest.fn(async () => {
      // Reprocess successfully
    });

    const result = await asyncProcessor.reprocessDeadLetterItem(
      dlq[0].id,
      successHandler,
    );
    expect(result).toBe(true);

    await new Promise(r => setTimeout(r, 50));
    expect(successHandler).toHaveBeenCalled();
    expect(asyncProcessor.getDeadLetterQueue().length).toBe(0);
  });
});
