import { DomainEventType } from '../DomainEvent';
import { eventBus, EventBusManager } from '../EventBus';
import {
  asyncEventProcessor,
  AsyncEventProcessorManager,
} from '../AsyncEventProcessor';
import { AnalyticsService } from '../../firebase/AnalyticsCoreService';

export class DomainEventHandlers {
  private isInitialized = false;

  constructor(
    private bus: EventBusManager = eventBus,
    private processor: AsyncEventProcessorManager = asyncEventProcessor,
  ) {}

  public registerAllHandlers(): void {
    if (this.isInitialized) return;

    // Analytics Domain Handler
    this.bus.subscribe(DomainEventType.TASK_CREATED, event => {
      this.processor.enqueueHandler(
        event,
        async evt => {
          await AnalyticsService.logTaskCreated({
            priority: evt.payload?.priority || 'Normal',
            category: evt.payload?.category || 'General',
          });
        },
        'AnalyticsTaskCreatedHandler',
      );
    });

    this.bus.subscribe(DomainEventType.TASK_COMPLETED, event => {
      this.processor.enqueueHandler(
        event,
        async () => {
          await AnalyticsService.logTaskCompleted({ completed_in: 0 });
        },
        'AnalyticsTaskCompletedHandler',
      );
    });

    this.bus.subscribe(DomainEventType.TASK_DELETED, event => {
      this.processor.enqueueHandler(
        event,
        async () => {
          await AnalyticsService.logTaskDeleted();
        },
        'AnalyticsTaskDeletedHandler',
      );
    });

    // Telemetry & Sync Handlers
    this.bus.subscribe(DomainEventType.SYNC_QUEUE_FLUSHED, event => {
      this.processor.enqueueHandler(
        event,
        async _evt => {
          // Log background queue sync execution
        },
        'TelemetrySyncQueueFlushedHandler',
      );
    });

    // Conflict Resolution Handler
    this.bus.subscribe(DomainEventType.CONFLICT_RESOLVED, event => {
      this.processor.enqueueHandler(
        event,
        async _evt => {
          // Process conflict resolution audit event
        },
        'ConflictResolvedHandler',
      );
    });

    this.isInitialized = true;
  }
}

export const domainEventHandlers = new DomainEventHandlers();
domainEventHandlers.registerAllHandlers();
