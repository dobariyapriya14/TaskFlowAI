import { ApolloLink, Observable, Operation, FetchResult } from '@apollo/client';
import { GraphQLTask, TaskInput, AIInsight } from '../schema';

let mockTasksStore: GraphQLTask[] = [
  {
    __typename: 'GraphQLTask',
    id: 'gql-1',
    title: 'Setup GraphQL Apollo Client',
    category: 'Architecture',
    priority: 'High',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-2',
    title: 'Integrate iOS Swift Native Header Module',
    category: 'Native',
    priority: 'Urgent',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-3',
    title: 'Implement Android Kotlin GraphQL Bridge',
    category: 'Native',
    priority: 'High',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-4',
    title: 'Configure Apollo Cache Persistence with AsyncStorage',
    category: 'Architecture',
    priority: 'High',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-5',
    title: 'Implement Optimistic UI Updates for Task Toggle',
    category: 'UI',
    priority: 'Normal',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-6',
    title: 'Add Relay Cursor-based Pagination with fetchMore',
    category: 'GraphQL',
    priority: 'Urgent',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-7',
    title: 'Audit Firebase Security Rules',
    category: 'Security',
    priority: 'High',
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-8',
    title: 'Set Up Crashlytics Core Exception Logging',
    category: 'Telemetry',
    priority: 'Normal',
    completed: true,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-9',
    title: 'Write Unit Tests for GraphQL Pagination Hook',
    category: 'Testing',
    priority: 'Normal',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    __typename: 'GraphQLTask',
    id: 'gql-10',
    title: 'Optimize FlashList Render Performance',
    category: 'Performance',
    priority: 'Low',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class MockGraphQLApiLink extends ApolloLink {
  private latencyMs: number;

  constructor(latencyMs: number = 100) {
    super();
    this.latencyMs = latencyMs;
  }

  public resetMockStore(initialTasks?: GraphQLTask[]) {
    if (initialTasks) {
      mockTasksStore = initialTasks.map(t => ({
        __typename: 'GraphQLTask',
        ...t,
      }));
    } else {
      mockTasksStore = [];
    }
  }

  public getMockStore(): GraphQLTask[] {
    return [...mockTasksStore];
  }

  public request(operation: Operation): Observable<FetchResult> {
    return new Observable(observer => {
      const timer = setTimeout(() => {
        try {
          const { operationName, variables } = operation;
          let resultData: any = {};

          switch (operationName) {
            case 'GetTasks': {
              let filtered = mockTasksStore.map(t => ({
                __typename: 'GraphQLTask' as const,
                ...t,
              }));
              if (variables?.category) {
                filtered = filtered.filter(
                  t =>
                    t.category?.toLowerCase() ===
                    variables.category.toLowerCase(),
                );
              }
              if (typeof variables?.completed === 'boolean') {
                filtered = filtered.filter(
                  t => t.completed === variables.completed,
                );
              }
              resultData = { tasks: filtered };
              break;
            }

            case 'GetTasksConnection': {
              let filtered = mockTasksStore.map(t => ({
                __typename: 'GraphQLTask' as const,
                ...t,
              }));
              if (variables?.category) {
                filtered = filtered.filter(
                  t =>
                    t.category?.toLowerCase() ===
                    variables.category.toLowerCase(),
                );
              }
              if (typeof variables?.completed === 'boolean') {
                filtered = filtered.filter(
                  t => t.completed === variables.completed,
                );
              }

              const totalCount = filtered.length;
              const first =
                typeof variables?.first === 'number' ? variables.first : 5;
              const after = variables?.after || null;

              let startIndex = 0;
              if (after) {
                const afterIndex = filtered.findIndex(
                  t => t.id === after || `cursor-${t.id}` === after,
                );
                if (afterIndex !== -1) {
                  startIndex = afterIndex + 1;
                }
              }

              const sliced = filtered.slice(startIndex, startIndex + first);
              const edges = sliced.map(t => ({
                __typename: 'TaskEdge' as const,
                cursor: t.id,
                node: t,
              }));

              const startCursor = edges.length > 0 ? edges[0].cursor : null;
              const endCursor =
                edges.length > 0 ? edges[edges.length - 1].cursor : null;
              const hasNextPage = startIndex + sliced.length < totalCount;
              const hasPreviousPage = startIndex > 0;

              resultData = {
                tasksConnection: {
                  __typename: 'TaskConnection' as const,
                  edges,
                  pageInfo: {
                    __typename: 'PageInfo' as const,
                    startCursor,
                    endCursor,
                    hasPreviousPage,
                    hasNextPage,
                  },
                  totalCount,
                },
              };
              break;
            }

            case 'GetTaskById': {
              const found = mockTasksStore.find(t => t.id === variables.id);
              const task = found
                ? { __typename: 'GraphQLTask' as const, ...found }
                : null;
              resultData = { task };
              break;
            }

            case 'GetAIInsights': {
              const completedCount = mockTasksStore.filter(
                t => t.completed,
              ).length;
              const totalCount = mockTasksStore.length;
              const score =
                totalCount > 0
                  ? Math.round((completedCount / totalCount) * 100)
                  : 100;

              const aiInsights: AIInsight = {
                __typename: 'AIInsight',
                summary: `You have completed ${completedCount} of ${totalCount} GraphQL tasks. Native bridge active.`,
                productivityScore: score,
                recommendations: [
                  'Complete high priority native integration tasks',
                  'Leverage Apollo optimistic updates for swift UI responsiveness',
                  'Use native response caching for instant offline start',
                ],
              };
              resultData = { aiInsights };
              break;
            }

            case 'CreateTask': {
              const input: TaskInput = variables.input;
              const newTask: GraphQLTask = {
                __typename: 'GraphQLTask',
                id: `gql-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                title: input.title,
                category: input.category || 'General',
                priority: input.priority || 'Normal',
                completed: input.completed ?? false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              mockTasksStore.unshift(newTask);
              resultData = { createTask: newTask };
              break;
            }

            case 'UpdateTask': {
              const { id, input } = variables as {
                id: string;
                input: TaskInput;
              };
              const index = mockTasksStore.findIndex(t => t.id === id);
              if (index === -1) {
                throw new Error(`Task with ID ${id} not found`);
              }
              const updatedTask: GraphQLTask = {
                ...mockTasksStore[index],
                ...input,
                __typename: 'GraphQLTask',
                updatedAt: new Date().toISOString(),
              };
              mockTasksStore[index] = updatedTask;
              resultData = { updateTask: updatedTask };
              break;
            }

            case 'ToggleTaskCompleted': {
              const { id } = variables as { id: string };
              const index = mockTasksStore.findIndex(t => t.id === id);
              if (index === -1) {
                throw new Error(`Task with ID ${id} not found`);
              }
              const updatedTask: GraphQLTask = {
                ...mockTasksStore[index],
                __typename: 'GraphQLTask',
                completed: !mockTasksStore[index].completed,
                updatedAt: new Date().toISOString(),
              };
              mockTasksStore[index] = updatedTask;
              resultData = { toggleTaskCompleted: updatedTask };
              break;
            }

            case 'DeleteTask': {
              const { id } = variables as { id: string };
              const initialLen = mockTasksStore.length;
              mockTasksStore = mockTasksStore.filter(t => t.id !== id);
              resultData = { deleteTask: mockTasksStore.length < initialLen };
              break;
            }

            default:
              resultData = {};
              break;
          }

          observer.next({ data: resultData });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, this.latencyMs);

      return () => clearTimeout(timer);
    });
  }
}
