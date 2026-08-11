import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GraphQLTaskRepository } from '../repositories/GraphQLTaskRepository';
import { GraphQLTask, TaskInput } from '../schema';
import { offlineSyncQueue, OfflineSyncQueueManager } from './OfflineSyncQueue';
import {
  networkStatusService,
  NetworkStatusService,
} from './NetworkStatusService';
import { conflictResolver } from './ConflictResolver';

export class OfflineTaskRepository {
  private repository: GraphQLTaskRepository;
  private queue: OfflineSyncQueueManager;
  private network: NetworkStatusService;
  private isSyncing = false;
  private lastSyncedAt: string | null = null;
  private currentSyncPromise: Promise<{
    successCount: number;
    failCount: number;
  }> | null = null;

  constructor(
    client?: ApolloClient<NormalizedCacheObject>,
    queue: OfflineSyncQueueManager = offlineSyncQueue,
    network: NetworkStatusService = networkStatusService,
  ) {
    this.repository = new GraphQLTaskRepository(client);
    this.queue = queue;
    this.network = network;

    this.network.onReconnected(() => {
      this.syncQueue();
    });
  }

  public setClient(client: ApolloClient<NormalizedCacheObject>): void {
    this.repository.setClient(client);
  }

  public getLastSyncedAt(): string | null {
    return this.lastSyncedAt;
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Create task offline or online
   */
  public async createTask(input: TaskInput): Promise<GraphQLTask> {
    if (this.network.isOnline()) {
      try {
        const result = await this.repository.createTask(input, {
          optimistic: true,
        });
        return result;
      } catch (error) {
        console.warn(
          'Network request failed in createTask, switching to offline queue:',
          error,
        );
      }
    }

    // Offline logic
    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
    const optimisticTask: GraphQLTask = {
      __typename: 'GraphQLTask',
      id: tempId,
      title: input.title,
      category: input.category || 'General',
      priority: input.priority || 'Normal',
      completed: input.completed ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.writeTaskToCache(optimisticTask);
    await this.queue.enqueue('CREATE', tempId, input, tempId);

    return optimisticTask;
  }

  /**
   * Update task offline or online
   */
  public async updateTask(
    id: string,
    input: Partial<TaskInput>,
    currentTask?: GraphQLTask,
  ): Promise<GraphQLTask> {
    if (this.network.isOnline()) {
      try {
        const cachedTask = currentTask || this.getTaskFromCache(id);
        const fullInput: TaskInput = {
          title:
            input.title !== undefined
              ? input.title
              : cachedTask?.title || 'Task',
          category:
            input.category !== undefined
              ? input.category
              : cachedTask?.category || 'General',
          priority:
            input.priority !== undefined
              ? input.priority
              : cachedTask?.priority || 'Normal',
          completed:
            input.completed !== undefined
              ? input.completed
              : cachedTask?.completed ?? false,
        };
        const result = await this.repository.updateTask(id, fullInput, {
          optimistic: true,
          currentTask,
        });
        return result;
      } catch (error) {
        console.warn(
          `Network request failed for updateTask ${id}, switching to offline queue:`,
          error,
        );
      }
    }

    // Offline logic
    const cachedTask = currentTask || this.getTaskFromCache(id);
    const updatedTask: GraphQLTask = {
      __typename: 'GraphQLTask',
      id,
      title: input.title !== undefined ? input.title : cachedTask?.title || '',
      category:
        input.category !== undefined
          ? input.category
          : cachedTask?.category || 'General',
      priority:
        input.priority !== undefined
          ? input.priority
          : cachedTask?.priority || 'Normal',
      completed:
        input.completed !== undefined
          ? input.completed
          : cachedTask?.completed ?? false,
      createdAt: cachedTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.writeTaskToCache(updatedTask);
    const tempId = id.startsWith('temp-') ? id : undefined;
    await this.queue.enqueue('UPDATE', id, input, tempId);

    return updatedTask;
  }

  /**
   * Toggle completion status offline or online
   */
  public async toggleTaskCompleted(
    id: string,
    currentTask?: GraphQLTask,
  ): Promise<GraphQLTask> {
    const task = currentTask || this.getTaskFromCache(id);
    const nextCompleted = !(task?.completed ?? false);
    return this.updateTask(id, { completed: nextCompleted }, task || undefined);
  }

  /**
   * Delete task offline or online
   */
  public async deleteTask(id: string): Promise<boolean> {
    if (id.startsWith('temp-')) {
      await this.queue.cancelPendingForTempId(id);
      this.removeTaskFromCache(id);
      return true;
    }

    if (this.network.isOnline()) {
      try {
        const result = await this.repository.deleteTask(id);
        return result;
      } catch (error) {
        console.warn(
          `Network request failed for deleteTask ${id}, switching to offline queue:`,
          error,
        );
      }
    }

    this.removeTaskFromCache(id);
    await this.queue.enqueue('DELETE', id);
    return true;
  }

  /**
   * Process and flush pending sync queue
   */
  public async syncQueue(): Promise<{
    successCount: number;
    failCount: number;
  }> {
    if (!this.network.isOnline()) {
      return { successCount: 0, failCount: 0 };
    }

    const pendingItems = this.queue.getPendingItems();
    if (pendingItems.length === 0) {
      return { successCount: 0, failCount: 0 };
    }

    if (this.currentSyncPromise) {
      return this.currentSyncPromise;
    }

    this.isSyncing = true;
    this.currentSyncPromise = (async () => {
      let successCount = 0;
      let failCount = 0;

      try {
        const itemsToProcess = this.queue.getPendingItems();

        for (const item of itemsToProcess) {
          await this.queue.setItemProcessing(item.id);
          try {
            if (item.type === 'CREATE') {
              const input = item.payload as TaskInput;
              const created = await this.repository.createTask(input);
              if (item.tempId && created.id) {
                await this.queue.updateTempIdMapping(item.tempId, created.id);
                this.replaceTempIdInCache(item.tempId, created);
              }
            } else if (item.type === 'UPDATE' || item.type === 'TOGGLE') {
              let input = item.payload as Partial<TaskInput>;
              let serverTask: GraphQLTask | null = null;
              try {
                serverTask = await this.repository.getTaskById(item.taskId);
                if (
                  serverTask &&
                  conflictResolver.hasConflict(
                    input,
                    serverTask,
                    item.createdAt,
                  )
                ) {
                  const resolution = conflictResolver.resolveConflict(
                    input,
                    serverTask,
                    conflictResolver.getStrategy(),
                    item.createdAt,
                  );
                  input = resolution.resolvedInput;
                  this.writeTaskToCache(resolution.resolvedTask);
                }
              } catch (fetchErr) {
                console.warn(
                  'Could not fetch server task for conflict check:',
                  fetchErr,
                );
              }

              const fullInput: TaskInput = {
                title:
                  input.title !== undefined
                    ? input.title
                    : serverTask?.title || 'Task',
                category:
                  input.category !== undefined
                    ? input.category
                    : serverTask?.category || 'General',
                priority:
                  input.priority !== undefined
                    ? input.priority
                    : serverTask?.priority || 'Normal',
                completed:
                  input.completed !== undefined
                    ? input.completed
                    : serverTask?.completed ?? false,
              };

              await this.repository.updateTask(item.taskId, fullInput);
            } else if (item.type === 'DELETE') {
              await this.repository.deleteTask(item.taskId);
            }

            await this.queue.dequeue(item.id);
            successCount += 1;
          } catch (err: any) {
            failCount += 1;
            const msg = err.message || 'Sync failed';
            await this.queue.setItemFailed(item.id, msg);
          }
        }

        this.lastSyncedAt = new Date().toISOString();
      } finally {
        this.isSyncing = false;
        this.currentSyncPromise = null;
      }

      return { successCount, failCount };
    })();

    return this.currentSyncPromise;
  }

  private getTaskFromCache(id: string): GraphQLTask | null {
    try {
      const tasks = this.repository.readCachedTasks();
      return tasks.find(t => t.id === id) || null;
    } catch {
      return null;
    }
  }

  private writeTaskToCache(task: GraphQLTask): void {
    try {
      const client = (this.repository as any).client;
      if (!client) return;

      const cached = this.repository.readCachedTasks();
      const existingIdx = cached.findIndex(t => t.id === task.id);
      let newTasks: GraphQLTask[];
      if (existingIdx >= 0) {
        newTasks = [...cached];
        newTasks[existingIdx] = task;
      } else {
        newTasks = [task, ...cached];
      }

      const { GET_TASKS_QUERY } = require('../operations');
      client.writeQuery({
        query: GET_TASKS_QUERY,
        data: { tasks: newTasks },
      });
    } catch (err) {
      console.warn('Failed to write task to Apollo Cache:', err);
    }
  }

  private removeTaskFromCache(id: string): void {
    try {
      const client = (this.repository as any).client;
      if (!client) return;

      const cached = this.repository.readCachedTasks();
      const newTasks = cached.filter(t => t.id !== id);

      const { GET_TASKS_QUERY } = require('../operations');
      client.writeQuery({
        query: GET_TASKS_QUERY,
        data: { tasks: newTasks },
      });
    } catch (err) {
      console.warn('Failed to remove task from Apollo Cache:', err);
    }
  }

  private replaceTempIdInCache(tempId: string, serverTask: GraphQLTask): void {
    try {
      const client = (this.repository as any).client;
      if (!client) return;

      const cached = this.repository.readCachedTasks();
      const newTasks = cached.map(t => (t.id === tempId ? serverTask : t));

      const { GET_TASKS_QUERY } = require('../operations');
      client.writeQuery({
        query: GET_TASKS_QUERY,
        data: { tasks: newTasks },
      });
    } catch (err) {
      console.warn('Failed to replace temp ID in Apollo Cache:', err);
    }
  }
}

export const offlineTaskRepository = new OfflineTaskRepository();
