import AsyncStorage from '@react-native-async-storage/async-storage';
import { GraphQLTask, TaskInput } from '../schema';

export type ConflictStrategy =
  | 'FIELD_LEVEL_MERGE'
  | 'LAST_WRITE_WINS'
  | 'SERVER_WINS'
  | 'CLIENT_WINS';

export interface ConflictAuditRecord {
  id: string;
  taskId: string;
  strategy: ConflictStrategy;
  timestamp: string;
  localPayload: Partial<TaskInput>;
  serverTask: GraphQLTask;
  resolvedTask: GraphQLTask;
}

export const CONFLICT_AUDIT_LOG_KEY = '@taskflowai_conflict_audit_log';

export class ConflictResolverManager {
  private activeStrategy: ConflictStrategy = 'FIELD_LEVEL_MERGE';
  private auditLog: ConflictAuditRecord[] = [];
  private isLoaded = false;
  private listeners: Set<(log: ConflictAuditRecord[]) => void> = new Set();
  private strategyListeners: Set<(strategy: ConflictStrategy) => void> =
    new Set();

  constructor() {
    this.loadAuditLog();
  }

  public getStrategy(): ConflictStrategy {
    return this.activeStrategy;
  }

  public setStrategy(strategy: ConflictStrategy): void {
    this.activeStrategy = strategy;
    this.strategyListeners.forEach(listener => listener(strategy));
  }

  public subscribeStrategy(
    listener: (strategy: ConflictStrategy) => void,
  ): () => void {
    this.strategyListeners.add(listener);
    listener(this.activeStrategy);
    return () => {
      this.strategyListeners.delete(listener);
    };
  }

  public async loadAuditLog(): Promise<ConflictAuditRecord[]> {
    if (this.isLoaded) {
      return this.auditLog;
    }
    try {
      const stored = await AsyncStorage.getItem(CONFLICT_AUDIT_LOG_KEY);
      if (stored && !this.isLoaded) {
        this.auditLog = JSON.parse(stored);
      }
    } catch {
      if (!this.isLoaded) {
        this.auditLog = [];
      }
    } finally {
      this.isLoaded = true;
    }
    this.notifyListeners();
    return this.auditLog;
  }

  private async persistAuditLog(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CONFLICT_AUDIT_LOG_KEY,
        JSON.stringify(this.auditLog),
      );
    } catch (e) {
      console.warn('Failed to persist conflict audit log:', e);
    }
    this.notifyListeners();
  }

  public getAuditLog(): ConflictAuditRecord[] {
    return [...this.auditLog];
  }

  public subscribeAuditLog(
    listener: (log: ConflictAuditRecord[]) => void,
  ): () => void {
    this.listeners.add(listener);
    listener([...this.auditLog]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const copy = [...this.auditLog];
    this.listeners.forEach(l => l(copy));
  }

  public async clearAuditLog(): Promise<void> {
    this.auditLog = [];
    this.isLoaded = true;
    await AsyncStorage.removeItem(CONFLICT_AUDIT_LOG_KEY);
    this.notifyListeners();
  }

  /**
   * Detects whether a conflict exists between local payload and server task state
   */
  public hasConflict(
    localPayload: TaskInput | Partial<TaskInput>,
    serverTask: GraphQLTask,
    clientBaseTimestamp?: string,
  ): boolean {
    if (!serverTask) return false;

    if (clientBaseTimestamp && serverTask.updatedAt) {
      const serverTime = new Date(serverTask.updatedAt).getTime();
      const baseTime = new Date(clientBaseTimestamp).getTime();
      if (serverTime > baseTime + 100) {
        return true;
      }
    }

    if (
      localPayload.title !== undefined &&
      localPayload.title !== serverTask.title
    ) {
      return true;
    }
    if (
      localPayload.completed !== undefined &&
      localPayload.completed !== serverTask.completed
    ) {
      return true;
    }
    if (
      localPayload.category !== undefined &&
      localPayload.category !== serverTask.category
    ) {
      return true;
    }
    if (
      localPayload.priority !== undefined &&
      localPayload.priority !== serverTask.priority
    ) {
      return true;
    }

    return false;
  }

  /**
   * Resolves concurrent edits using specified strategy or default strategy
   */
  public resolveConflict(
    localPayload: TaskInput | Partial<TaskInput>,
    serverTask: GraphQLTask,
    strategy: ConflictStrategy = this.activeStrategy,
    clientTimestamp?: string,
  ): { resolvedTask: GraphQLTask; resolvedInput: TaskInput } {
    let resolvedTask: GraphQLTask;
    let resolvedInput: TaskInput;

    const nowIso = new Date().toISOString();

    switch (strategy) {
      case 'SERVER_WINS':
        resolvedInput = {
          title: serverTask.title,
          category: serverTask.category || 'General',
          priority: serverTask.priority || 'Normal',
          completed: serverTask.completed,
        };
        resolvedTask = {
          ...serverTask,
          updatedAt: nowIso,
        };
        break;

      case 'CLIENT_WINS':
        resolvedInput = {
          title: localPayload.title ?? serverTask.title,
          category: localPayload.category ?? serverTask.category ?? 'General',
          priority: localPayload.priority ?? serverTask.priority ?? 'Normal',
          completed: localPayload.completed ?? serverTask.completed,
        };
        resolvedTask = {
          ...serverTask,
          ...resolvedInput,
          updatedAt: nowIso,
        };
        break;

      case 'LAST_WRITE_WINS': {
        const clientTime = clientTimestamp
          ? new Date(clientTimestamp).getTime()
          : Date.now();
        const serverTime = serverTask.updatedAt
          ? new Date(serverTask.updatedAt).getTime()
          : 0;

        if (clientTime >= serverTime) {
          resolvedInput = {
            title: localPayload.title ?? serverTask.title,
            category: localPayload.category ?? serverTask.category ?? 'General',
            priority: localPayload.priority ?? serverTask.priority ?? 'Normal',
            completed: localPayload.completed ?? serverTask.completed,
          };
        } else {
          resolvedInput = {
            title: serverTask.title,
            category: serverTask.category || 'General',
            priority: serverTask.priority || 'Normal',
            completed: serverTask.completed,
          };
        }

        resolvedTask = {
          ...serverTask,
          ...resolvedInput,
          updatedAt: nowIso,
        };
        break;
      }

      case 'FIELD_LEVEL_MERGE':
      default: {
        resolvedInput = {
          title:
            localPayload.title !== undefined
              ? localPayload.title
              : serverTask.title,
          category:
            localPayload.category !== undefined
              ? localPayload.category
              : serverTask.category || 'General',
          priority:
            localPayload.priority !== undefined
              ? localPayload.priority
              : serverTask.priority || 'Normal',
          completed:
            localPayload.completed !== undefined
              ? localPayload.completed
              : serverTask.completed,
        };

        resolvedTask = {
          ...serverTask,
          ...resolvedInput,
          updatedAt: nowIso,
        };
        break;
      }
    }

    const auditRecord: ConflictAuditRecord = {
      id: `conflict-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`,
      taskId: serverTask.id,
      strategy,
      timestamp: nowIso,
      localPayload,
      serverTask,
      resolvedTask,
    };

    this.auditLog.unshift(auditRecord);
    this.isLoaded = true;
    this.persistAuditLog();

    return { resolvedTask, resolvedInput };
  }
}

export const conflictResolver = new ConflictResolverManager();
