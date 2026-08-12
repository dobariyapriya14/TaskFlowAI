export enum DomainEventType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_DELETED = 'TASK_DELETED',
  SYNC_QUEUE_FLUSHED = 'SYNC_QUEUE_FLUSHED',
  CONFLICT_RESOLVED = 'CONFLICT_RESOLVED',
  TELEMETRY_SYNCED = 'TELEMETRY_SYNCED',
}

export interface DomainEvent<T = any> {
  id: string;
  type: DomainEventType;
  aggregateId: string;
  payload: T;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function createDomainEvent<T = any>(
  type: DomainEventType,
  aggregateId: string,
  payload: T,
  metadata?: Record<string, any>,
): DomainEvent<T> {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    aggregateId,
    payload,
    timestamp: new Date().toISOString(),
    metadata,
  };
}
