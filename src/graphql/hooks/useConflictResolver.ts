import { useState, useEffect, useCallback } from 'react';
import {
  conflictResolver,
  ConflictStrategy,
  ConflictAuditRecord,
} from '../offline/ConflictResolver';

export const useConflictResolver = () => {
  const [strategy, setStrategyState] = useState<ConflictStrategy>(
    conflictResolver.getStrategy(),
  );
  const [auditLog, setAuditLog] = useState<ConflictAuditRecord[]>(
    conflictResolver.getAuditLog(),
  );

  useEffect(() => {
    const unsubStrategy = conflictResolver.subscribeStrategy(s => {
      setStrategyState(s);
    });
    const unsubLog = conflictResolver.subscribeAuditLog(log => {
      setAuditLog(log);
    });
    return () => {
      unsubStrategy();
      unsubLog();
    };
  }, []);

  const setStrategy = useCallback((newStrategy: ConflictStrategy) => {
    conflictResolver.setStrategy(newStrategy);
  }, []);

  const clearAuditLog = useCallback(async () => {
    await conflictResolver.clearAuditLog();
  }, []);

  return {
    strategy,
    setStrategy,
    auditLog,
    resolvedCount: auditLog.length,
    clearAuditLog,
  };
};
