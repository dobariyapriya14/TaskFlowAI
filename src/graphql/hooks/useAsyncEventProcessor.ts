import { useState, useEffect, useCallback } from 'react';
import {
  asyncEventProcessor,
  DeadLetterItem,
  DomainEvent,
} from '../../core/events';

export interface UseAsyncEventProcessorReturn {
  isProcessing: boolean;
  processedCount: number;
  failedCount: number;
  deadLetterQueue: DeadLetterItem[];
  reprocessDLQ: (
    id: string,
    handler: (event: DomainEvent) => Promise<void>,
  ) => Promise<boolean>;
  clearDLQ: () => Promise<void>;
}

export function useAsyncEventProcessor(): UseAsyncEventProcessorReturn {
  const [stats, setStats] = useState(() => asyncEventProcessor.getStats());

  useEffect(() => {
    const unsubscribe = asyncEventProcessor.subscribe(newStats => {
      setStats(newStats);
    });
    return unsubscribe;
  }, []);

  const reprocessDLQ = useCallback(
    async (
      id: string,
      handler: (event: DomainEvent) => Promise<void>,
    ): Promise<boolean> => {
      return asyncEventProcessor.reprocessDeadLetterItem(id, handler);
    },
    [],
  );

  const clearDLQ = useCallback(async () => {
    await asyncEventProcessor.clearDLQ();
  }, []);

  return {
    isProcessing: stats.isProcessing,
    processedCount: stats.processedCount,
    failedCount: stats.failedCount,
    deadLetterQueue: stats.deadLetterQueue,
    reprocessDLQ,
    clearDLQ,
  };
}
