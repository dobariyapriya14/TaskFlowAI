import { EventEmitter } from 'events';
import {
  GraphQLTask,
  TaskInput,
  AIInsight,
  TaskConnection,
  TaskEdge,
  PageInfo,
} from '../schema';

export interface TaskSubscriptionPayload {
  event: 'CREATED' | 'UPDATED' | 'DELETED';
  taskId: string;
  task: GraphQLTask | null;
}

export const INITIAL_MOCK_TASKS: GraphQLTask[] = [
  {
    id: 'gql-1',
    title: 'Setup GraphQL Apollo Client',
    category: 'Architecture',
    priority: 'High',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'gql-2',
    title: 'Integrate iOS Swift Native Header Module',
    category: 'Native',
    priority: 'Urgent',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'gql-3',
    title: 'Implement Android Kotlin GraphQL Bridge',
    category: 'Native',
    priority: 'High',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'gql-4',
    title: 'Configure Apollo Cache Persistence with AsyncStorage',
    category: 'Architecture',
    priority: 'High',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'gql-5',
    title: 'Implement Optimistic UI Updates for Task Toggle',
    category: 'UI',
    priority: 'Normal',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'gql-6',
    title: 'Add Relay Cursor-based Pagination with fetchMore',
    category: 'GraphQL',
    priority: 'Urgent',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'gql-7',
    title: 'Audit Firebase Security Rules',
    category: 'Security',
    priority: 'High',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'gql-8',
    title: 'Set Up Crashlytics Core Exception Logging',
    category: 'Telemetry',
    priority: 'Normal',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'gql-9',
    title: 'Write Unit Tests for GraphQL Pagination Hook',
    category: 'Testing',
    priority: 'Normal',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'gql-10',
    title: 'Optimize FlashList Render Performance',
    category: 'Performance',
    priority: 'Low',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class MockGraphQLStore {
  private tasks: GraphQLTask[];
  public emitter: EventEmitter;

  constructor(initialTasks: GraphQLTask[] = INITIAL_MOCK_TASKS) {
    this.tasks = JSON.parse(JSON.stringify(initialTasks));
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  public resetStore(customTasks?: GraphQLTask[]): void {
    if (customTasks) {
      this.tasks = JSON.parse(JSON.stringify(customTasks));
    } else {
      this.tasks = JSON.parse(JSON.stringify(INITIAL_MOCK_TASKS));
    }
  }

  public getTasks(category?: string, completed?: boolean): GraphQLTask[] {
    let filtered = [...this.tasks];
    if (category) {
      filtered = filtered.filter(
        t => t.category?.toLowerCase() === category.toLowerCase(),
      );
    }
    if (typeof completed === 'boolean') {
      filtered = filtered.filter(t => t.completed === completed);
    }
    return filtered;
  }

  public getTasksConnection(
    first?: number,
    after?: string,
    category?: string,
    completed?: boolean,
  ): TaskConnection {
    const filtered = this.getTasks(category, completed);
    const totalCount = filtered.length;
    const limit = typeof first === 'number' && first > 0 ? first : 5;

    let startIndex = 0;
    if (after) {
      const foundIndex = filtered.findIndex(
        t => t.id === after || `cursor-${t.id}` === after,
      );
      if (foundIndex !== -1) {
        startIndex = foundIndex + 1;
      }
    }

    const sliced = filtered.slice(startIndex, startIndex + limit);
    const edges: TaskEdge[] = sliced.map(t => ({
      cursor: t.id,
      node: t,
    }));

    const startCursor = edges.length > 0 ? edges[0].cursor : null;
    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
    const hasNextPage = startIndex + sliced.length < totalCount;
    const hasPreviousPage = startIndex > 0;

    const pageInfo: PageInfo = {
      startCursor,
      endCursor,
      hasPreviousPage,
      hasNextPage,
    };

    return {
      edges,
      pageInfo,
      totalCount,
    };
  }

  public getTaskById(id: string): GraphQLTask | null {
    return this.tasks.find(t => t.id === id) || null;
  }

  public getAIInsights(): AIInsight {
    const completedCount = this.tasks.filter(t => t.completed).length;
    const totalCount = this.tasks.length;
    const score =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

    return {
      summary: `You have completed ${completedCount} of ${totalCount} GraphQL tasks. Local mock server active.`,
      productivityScore: score,
      recommendations: [
        'Complete high priority native integration tasks',
        'Leverage Apollo optimistic updates for swift UI responsiveness',
        'Use local mock server for seamless dev and test automation',
      ],
    };
  }

  public createTask(input: TaskInput): GraphQLTask {
    const newTask: GraphQLTask = {
      id: `gql-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: input.title,
      category: input.category || 'General',
      priority: input.priority || 'Normal',
      completed: input.completed ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.unshift(newTask);

    const payload: TaskSubscriptionPayload = {
      event: 'CREATED',
      taskId: newTask.id,
      task: newTask,
    };
    this.emitter.emit('TASK_UPDATED', payload);
    this.emitter.emit('TASK_CREATED', newTask);

    return newTask;
  }

  public updateTask(id: string, input: TaskInput): GraphQLTask {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID '${id}' not found`);
    }
    const existing = this.tasks[index];
    const updated: GraphQLTask = {
      ...existing,
      ...input,
      title: input.title ? input.title : existing.title,
      priority: input.priority || existing.priority,
      completed:
        typeof input.completed === 'boolean'
          ? input.completed
          : existing.completed,
      updatedAt: new Date().toISOString(),
    };
    this.tasks[index] = updated;

    const payload: TaskSubscriptionPayload = {
      event: 'UPDATED',
      taskId: updated.id,
      task: updated,
    };
    this.emitter.emit('TASK_UPDATED', payload);

    return updated;
  }

  public deleteTask(id: string): boolean {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    const deleted = this.tasks.length < initialLen;
    if (deleted) {
      const payload: TaskSubscriptionPayload = {
        event: 'DELETED',
        taskId: id,
        task: null,
      };
      this.emitter.emit('TASK_UPDATED', payload);
      this.emitter.emit('TASK_DELETED', id);
    }
    return deleted;
  }

  public toggleTaskCompleted(id: string): GraphQLTask {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID '${id}' not found`);
    }
    const existing = this.tasks[index];
    const updated: GraphQLTask = {
      ...existing,
      completed: !existing.completed,
      updatedAt: new Date().toISOString(),
    };
    this.tasks[index] = updated;

    const payload: TaskSubscriptionPayload = {
      event: 'UPDATED',
      taskId: updated.id,
      task: updated,
    };
    this.emitter.emit('TASK_UPDATED', payload);

    return updated;
  }
}

export const mockServerStore = new MockGraphQLStore();
