import { useCallback, useEffect } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { offlineTaskRepository } from '../offline/OfflineTaskRepository';
import { useNetworkStatus } from './useNetworkStatus';
import { useOfflineSyncQueue } from './useOfflineSyncQueue';
import { GraphQLTask, TaskInput } from '../schema';

export const useOfflineTaskMutations = () => {
  const client = useApolloClient();
  const { isOnline, setOnline, toggleOffline } = useNetworkStatus();
  const {
    queue,
    pendingCount,
    isSyncing,
    lastSyncedAt,
    syncQueue,
    clearQueue,
  } = useOfflineSyncQueue();

  useEffect(() => {
    if (client) {
      offlineTaskRepository.setClient(client as any);
    }
  }, [client]);

  const createTask = useCallback(
    async (input: TaskInput): Promise<GraphQLTask> => {
      return offlineTaskRepository.createTask(input);
    },
    [],
  );

  const updateTask = useCallback(
    async (
      id: string,
      input: TaskInput,
      currentTask?: GraphQLTask,
    ): Promise<GraphQLTask> => {
      return offlineTaskRepository.updateTask(id, input, currentTask);
    },
    [],
  );

  const toggleTaskCompleted = useCallback(
    async (
      idOrTask: string | GraphQLTask,
      currentTask?: GraphQLTask,
    ): Promise<GraphQLTask> => {
      const id = typeof idOrTask === 'string' ? idOrTask : idOrTask.id;
      const task = typeof idOrTask === 'object' ? idOrTask : currentTask;
      return offlineTaskRepository.toggleTaskCompleted(id, task);
    },
    [],
  );

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    return offlineTaskRepository.deleteTask(id);
  }, []);

  return {
    createTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
    syncQueue,
    clearQueue,
    isOnline,
    setOnline,
    toggleOffline,
    queue,
    pendingCount,
    isSyncing,
    creating: isSyncing,
    updating: isSyncing,
    lastSyncedAt,
  };
};
