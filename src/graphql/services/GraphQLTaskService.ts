import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { BaseGraphQLService } from './BaseGraphQLService';
import { GraphQLTaskRepository } from '../repositories/GraphQLTaskRepository';
import { GraphQLTask, TaskInput, AIInsight } from '../schema';

export interface TaskFilterOptions {
  category?: string;
  completed?: boolean;
}

export class GraphQLTaskService extends BaseGraphQLService {
  private repository: GraphQLTaskRepository;

  constructor(client?: ApolloClient<NormalizedCacheObject>) {
    super(client);
    this.repository = new GraphQLTaskRepository(this.client);
  }

  public setClient(client: ApolloClient<NormalizedCacheObject>): void {
    super.setClient(client);
    this.repository.setClient(client);
  }

  /**
   * Fetch all GraphQL tasks with optional filter criteria
   */
  async getTasks(filter?: TaskFilterOptions): Promise<GraphQLTask[]> {
    return this.repository.getTasks(filter);
  }

  /**
   * Fetch a single task by ID
   */
  async getTaskById(id: string): Promise<GraphQLTask | null> {
    return this.repository.getTaskById(id);
  }

  /**
   * Fetch AI Productivity Insights
   */
  async getAIInsights(): Promise<AIInsight | null> {
    return this.repository.getAIInsights();
  }

  /**
   * Create a new task with optional optimistic updates
   */
  async createTask(
    input: TaskInput,
    options?: { optimistic?: boolean },
  ): Promise<GraphQLTask> {
    return this.repository.createTask(input, options);
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, input: TaskInput): Promise<GraphQLTask> {
    return this.repository.updateTask(id, input);
  }

  /**
   * Toggle completed status of a task
   */
  async toggleTaskCompleted(
    id: string,
    currentTask?: GraphQLTask,
  ): Promise<GraphQLTask> {
    return this.repository.toggleTaskCompleted(id, currentTask);
  }

  /**
   * Delete a task by ID
   */
  async deleteTask(id: string): Promise<boolean> {
    return this.repository.deleteTask(id);
  }

  /**
   * Read tasks directly from Apollo Client Cache
   */
  readCachedTasks(filter?: TaskFilterOptions): GraphQLTask[] {
    return this.repository.readCachedTasks(filter);
  }
}

export const graphqlTaskService = new GraphQLTaskService();
