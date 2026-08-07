import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { BaseGraphQLService } from './BaseGraphQLService';
import {
  GET_TASKS_QUERY,
  GET_TASK_BY_ID_QUERY,
  GET_AI_INSIGHTS_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
  TOGGLE_TASK_COMPLETED_MUTATION,
} from '../operations';
import { GraphQLTask, TaskInput, AIInsight } from '../schema';

export interface TaskFilterOptions {
  category?: string;
  completed?: boolean;
}

export class GraphQLTaskService extends BaseGraphQLService {
  constructor(client?: ApolloClient<NormalizedCacheObject>) {
    super(client);
  }

  /**
   * Fetch all GraphQL tasks with optional filter criteria
   */
  async getTasks(filter?: TaskFilterOptions): Promise<GraphQLTask[]> {
    const response = await this.query<{ tasks: GraphQLTask[] }>(
      GET_TASKS_QUERY,
      filter,
    );
    return response.data?.tasks || [];
  }

  /**
   * Fetch a single task by ID
   */
  async getTaskById(id: string): Promise<GraphQLTask | null> {
    const response = await this.query<{ task: GraphQLTask | null }>(
      GET_TASK_BY_ID_QUERY,
      { id },
    );
    return response.data?.task || null;
  }

  /**
   * Fetch AI Productivity Insights
   */
  async getAIInsights(): Promise<AIInsight | null> {
    const response = await this.query<{ aiInsights: AIInsight }>(
      GET_AI_INSIGHTS_QUERY,
    );
    return response.data?.aiInsights || null;
  }

  /**
   * Create a new task with optional optimistic updates
   */
  async createTask(
    input: TaskInput,
    options?: { optimistic?: boolean },
  ): Promise<GraphQLTask> {
    const optimisticResponse = options?.optimistic
      ? {
          createTask: {
            __typename: 'GraphQLTask' as const,
            id: `temp-${Date.now()}`,
            title: input.title,
            category: input.category || 'General',
            priority: input.priority || 'Normal',
            completed: input.completed ?? false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }
      : undefined;

    const response = await this.mutate<{ createTask: GraphQLTask }>(
      CREATE_TASK_MUTATION,
      { input },
      {
        optimisticResponse,
        refetchQueries: [
          { query: GET_TASKS_QUERY },
          { query: GET_AI_INSIGHTS_QUERY },
        ],
      },
    );

    if (!response.data?.createTask) {
      throw new Error(
        response.errors?.[0]?.message || 'Failed to create GraphQL task',
      );
    }

    return response.data.createTask;
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, input: TaskInput): Promise<GraphQLTask> {
    const response = await this.mutate<{ updateTask: GraphQLTask }>(
      UPDATE_TASK_MUTATION,
      { id, input },
      {
        refetchQueries: [
          { query: GET_TASKS_QUERY },
          { query: GET_AI_INSIGHTS_QUERY },
        ],
      },
    );

    if (!response.data?.updateTask) {
      throw new Error(
        response.errors?.[0]?.message || `Failed to update task with ID ${id}`,
      );
    }

    return response.data.updateTask;
  }

  /**
   * Toggle completed status of a task
   */
  async toggleTaskCompleted(
    id: string,
    currentTask?: GraphQLTask,
  ): Promise<GraphQLTask> {
    const optimisticResponse = currentTask
      ? {
          toggleTaskCompleted: {
            __typename: 'GraphQLTask' as const,
            ...currentTask,
            completed: !currentTask.completed,
            updatedAt: new Date().toISOString(),
          },
        }
      : undefined;

    const response = await this.mutate<{ toggleTaskCompleted: GraphQLTask }>(
      TOGGLE_TASK_COMPLETED_MUTATION,
      { id },
      {
        optimisticResponse,
        refetchQueries: [
          { query: GET_TASKS_QUERY },
          { query: GET_AI_INSIGHTS_QUERY },
        ],
      },
    );

    if (!response.data?.toggleTaskCompleted) {
      throw new Error(
        response.errors?.[0]?.message ||
          `Failed to toggle task completed status for ID ${id}`,
      );
    }

    return response.data.toggleTaskCompleted;
  }

  /**
   * Delete a task by ID
   */
  async deleteTask(id: string): Promise<boolean> {
    const response = await this.mutate<{ deleteTask: boolean }>(
      DELETE_TASK_MUTATION,
      { id },
      {
        refetchQueries: [
          { query: GET_TASKS_QUERY },
          { query: GET_AI_INSIGHTS_QUERY },
        ],
      },
    );

    return Boolean(response.data?.deleteTask);
  }

  /**
   * Read tasks directly from Apollo Client Cache
   */
  readCachedTasks(filter?: TaskFilterOptions): GraphQLTask[] {
    const cached = this.readQuery<{ tasks: GraphQLTask[] }>(
      GET_TASKS_QUERY,
      filter,
    );
    return cached?.tasks || [];
  }
}

export const graphqlTaskService = new GraphQLTaskService();
