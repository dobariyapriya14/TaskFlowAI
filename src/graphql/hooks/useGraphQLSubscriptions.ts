import { useEffect, useState, useCallback } from 'react';
import { useSubscription } from '@apollo/client/react';
import {
  TASK_UPDATED_SUBSCRIPTION,
  TASK_CREATED_SUBSCRIPTION,
  TASK_DELETED_SUBSCRIPTION,
} from '../operations';
import { GraphQLTask } from '../schema';
import { useGraphQLTasks } from './useGraphQLTasks';
import { TaskFilterOptions } from '../services/GraphQLTaskService';

export interface TaskSubscriptionData {
  taskUpdated?: {
    event: 'CREATED' | 'UPDATED' | 'DELETED';
    taskId: string;
    task: GraphQLTask | null;
  };
}

export const useTaskUpdatedSubscription = () => {
  return useSubscription<TaskSubscriptionData>(TASK_UPDATED_SUBSCRIPTION);
};

export const useTaskCreatedSubscription = () => {
  return useSubscription<{ taskCreated: GraphQLTask }>(
    TASK_CREATED_SUBSCRIPTION,
  );
};

export const useTaskDeletedSubscription = () => {
  return useSubscription<{ taskDeleted: string }>(TASK_DELETED_SUBSCRIPTION);
};

export const useRealtimeTasks = (filter?: TaskFilterOptions) => {
  const {
    tasks: initialTasks,
    loading,
    error,
    refetch,
  } = useGraphQLTasks(filter);
  const [tasks, setTasks] = useState<GraphQLTask[]>([]);
  const { data: subscriptionData } = useTaskUpdatedSubscription();

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  useEffect(() => {
    if (!subscriptionData?.taskUpdated) return;

    const { event, taskId, task } = subscriptionData.taskUpdated;

    setTasks(prevTasks => {
      if (event === 'CREATED' && task) {
        // Avoid duplicate
        if (prevTasks.some(t => t.id === task.id)) return prevTasks;
        return [task, ...prevTasks];
      }

      if (event === 'UPDATED' && task) {
        return prevTasks.map(t => (t.id === taskId ? task : t));
      }

      if (event === 'DELETED') {
        return prevTasks.filter(t => t.id !== taskId);
      }

      return prevTasks;
    });
  }, [subscriptionData]);

  const refresh = useCallback(() => {
    return refetch();
  }, [refetch]);

  return {
    tasks,
    loading,
    error,
    refresh,
    latestUpdate: subscriptionData?.taskUpdated || null,
  };
};
