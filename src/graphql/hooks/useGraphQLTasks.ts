import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_TASKS_QUERY,
  GET_TASKS_CONNECTION_QUERY,
  GET_TASK_BY_ID_QUERY,
  GET_AI_INSIGHTS_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  TOGGLE_TASK_COMPLETED_MUTATION,
} from '../operations';
import { GraphQLTask, TaskInput, AIInsight, TaskConnection } from '../schema';
import { TaskFilterOptions } from '../services/GraphQLTaskService';

export const useGraphQLTasks = (filter?: TaskFilterOptions) => {
  const { data, loading, error, refetch } = useQuery<{ tasks: GraphQLTask[] }>(
    GET_TASKS_QUERY,
    {
      variables: filter,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    tasks: data?.tasks || [],
    loading,
    error,
    refetch,
  };
};

export interface UseGraphQLTasksConnectionOptions extends TaskFilterOptions {
  first?: number;
}

export const useGraphQLTasksConnection = (
  options?: UseGraphQLTasksConnectionOptions,
) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const first = options?.first ?? 5;

  const { data, loading, error, fetchMore, refetch } = useQuery<{
    tasksConnection: TaskConnection;
  }>(GET_TASKS_CONNECTION_QUERY, {
    variables: {
      first,
      after: null,
      category: options?.category,
      completed: options?.completed,
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const connection = data?.tasksConnection;
  const edges = connection?.edges || [];
  const tasks = edges.map(e => e.node);
  const pageInfo = connection?.pageInfo || {
    startCursor: null,
    endCursor: null,
    hasPreviousPage: false,
    hasNextPage: false,
  };
  const totalCount = connection?.totalCount || 0;

  const fetchMoreTasks = useCallback(async () => {
    if (!pageInfo.hasNextPage || loadingMore || !pageInfo.endCursor) {
      return;
    }
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: {
          first,
          after: pageInfo.endCursor,
          category: options?.category,
          completed: options?.completed,
        },
      });
    } catch (e) {
      console.warn('Error fetching more tasks:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [
    fetchMore,
    first,
    loadingMore,
    options?.category,
    options?.completed,
    pageInfo.endCursor,
    pageInfo.hasNextPage,
  ]);

  return {
    tasks,
    edges,
    pageInfo,
    totalCount,
    loading,
    loadingMore,
    error,
    refetch,
    fetchMoreTasks,
    hasNextPage: pageInfo.hasNextPage,
  };
};

export const useGraphQLTaskById = (id: string) => {
  const { data, loading, error, refetch } = useQuery<{
    task: GraphQLTask | null;
  }>(GET_TASK_BY_ID_QUERY, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    task: data?.task || null,
    loading,
    error,
    refetch,
  };
};

export const useGraphQLAIInsights = () => {
  const { data, loading, error, refetch } = useQuery<{
    aiInsights: AIInsight;
  }>(GET_AI_INSIGHTS_QUERY);

  return {
    aiInsights: data?.aiInsights,
    loading,
    error,
    refetch,
  };
};

export const useGraphQLTaskMutations = () => {
  const [createTaskMutation, { loading: creating }] = useMutation<{
    createTask: GraphQLTask;
  }>(CREATE_TASK_MUTATION, {
    refetchQueries: [
      { query: GET_TASKS_QUERY },
      { query: GET_TASKS_CONNECTION_QUERY },
      { query: GET_AI_INSIGHTS_QUERY },
    ],
  });

  const [updateTaskMutation, { loading: updating }] = useMutation<{
    updateTask: GraphQLTask;
  }>(UPDATE_TASK_MUTATION, {
    refetchQueries: [
      { query: GET_TASKS_QUERY },
      { query: GET_TASKS_CONNECTION_QUERY },
      { query: GET_AI_INSIGHTS_QUERY },
    ],
  });

  const [toggleTaskCompletedMutation, { loading: toggling }] = useMutation<{
    toggleTaskCompleted: GraphQLTask;
  }>(TOGGLE_TASK_COMPLETED_MUTATION, {
    refetchQueries: [
      { query: GET_TASKS_QUERY },
      { query: GET_TASKS_CONNECTION_QUERY },
      { query: GET_AI_INSIGHTS_QUERY },
    ],
  });

  const [deleteTaskMutation, { loading: deleting }] = useMutation<{
    deleteTask: boolean;
  }>(DELETE_TASK_MUTATION, {
    refetchQueries: [
      { query: GET_TASKS_QUERY },
      { query: GET_TASKS_CONNECTION_QUERY },
      { query: GET_AI_INSIGHTS_QUERY },
    ],
  });

  const createTask = async (
    input: TaskInput,
    options?: { optimistic?: boolean },
  ): Promise<GraphQLTask> => {
    const res = await createTaskMutation({
      variables: { input },
      optimisticResponse: options?.optimistic
        ? {
            createTask: {
              __typename: 'GraphQLTask',
              id: `temp-${Date.now()}`,
              title: input.title,
              category: input.category || 'General',
              priority: input.priority || 'Normal',
              completed: input.completed ?? false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }
        : undefined,
    });

    if (!res.data?.createTask) {
      throw new Error('Failed to create task');
    }
    return res.data.createTask;
  };

  const updateTask = async (
    id: string,
    input: TaskInput,
    options?: { optimistic?: boolean; currentTask?: GraphQLTask },
  ): Promise<GraphQLTask> => {
    const optimisticResponse =
      options?.optimistic && options?.currentTask
        ? {
            updateTask: {
              __typename: 'GraphQLTask' as const,
              ...options.currentTask,
              ...input,
              priority: input.priority || options.currentTask.priority,
              completed: input.completed ?? options.currentTask.completed,
              updatedAt: new Date().toISOString(),
            },
          }
        : undefined;

    const res = await updateTaskMutation({
      variables: { id, input },
      optimisticResponse,
    });
    if (!res.data?.updateTask) {
      throw new Error(`Failed to update task with ID ${id}`);
    }
    return res.data.updateTask;
  };

  const toggleTaskCompleted = async (
    taskOrId: GraphQLTask | string,
    currentTask?: GraphQLTask,
  ): Promise<GraphQLTask> => {
    const task = typeof taskOrId === 'object' ? taskOrId : currentTask;
    const id = typeof taskOrId === 'string' ? taskOrId : taskOrId.id;

    const optimisticResponse = task
      ? {
          toggleTaskCompleted: {
            __typename: 'GraphQLTask' as const,
            ...task,
            completed: !task.completed,
            updatedAt: new Date().toISOString(),
          },
        }
      : undefined;

    const res = await toggleTaskCompletedMutation({
      variables: { id },
      optimisticResponse,
    });

    if (!res.data?.toggleTaskCompleted) {
      throw new Error(`Failed to toggle task completed for ID ${id}`);
    }
    return res.data.toggleTaskCompleted;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const res = await deleteTaskMutation({
      variables: { id },
    });
    return Boolean(res.data?.deleteTask);
  };

  return {
    createTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
    creating,
    updating,
    toggling,
    deleting,
  };
};
