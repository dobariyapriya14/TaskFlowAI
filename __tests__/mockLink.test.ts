import { createApolloClient } from '../src/graphql/client';
import {
  GET_TASKS_QUERY,
  CREATE_TASK_MUTATION,
  TOGGLE_TASK_COMPLETED_MUTATION,
  DELETE_TASK_MUTATION,
  GET_AI_INSIGHTS_QUERY,
} from '../src/graphql/operations';
import { GraphQLTask } from '../src/graphql/schema';

// Mock Crashlytics
jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('MockGraphQLApiLink & Operations', () => {
  it('executes GetTasks query returning initial mock tasks', async () => {
    const client = createApolloClient({ useMockApi: true, latencyMs: 0 });
    const response = await client.query<{ tasks: GraphQLTask[] }>({
      query: GET_TASKS_QUERY,
    });

    expect(response.data).toBeDefined();
    expect(response.data!.tasks.length).toBeGreaterThan(0);
    expect(response.data!.tasks[0].title).toBeDefined();
  });

  it('executes CreateTask mutation and updates task list', async () => {
    const client = createApolloClient({ useMockApi: true, latencyMs: 0 });

    const createRes = await client.mutate<{ createTask: GraphQLTask }>({
      mutation: CREATE_TASK_MUTATION,
      variables: {
        input: {
          title: 'Testing GraphQL Apollo Integration',
          category: 'QA',
          priority: 'High',
          completed: false,
        },
      },
    });

    expect(createRes.data?.createTask).toBeDefined();
    expect(createRes.data?.createTask.title).toBe(
      'Testing GraphQL Apollo Integration',
    );

    const tasksRes = await client.query<{ tasks: GraphQLTask[] }>({
      query: GET_TASKS_QUERY,
    });
    expect(
      tasksRes.data!.tasks.some(
        t => t.title === 'Testing GraphQL Apollo Integration',
      ),
    ).toBe(true);
  });

  it('executes ToggleTaskCompleted mutation', async () => {
    const client = createApolloClient({ useMockApi: true, latencyMs: 0 });

    const tasksRes = await client.query<{ tasks: GraphQLTask[] }>({
      query: GET_TASKS_QUERY,
    });
    const targetTask = tasksRes.data!.tasks[0];

    const toggleRes = await client.mutate<{ toggleTaskCompleted: GraphQLTask }>(
      {
        mutation: TOGGLE_TASK_COMPLETED_MUTATION,
        variables: { id: targetTask.id },
      },
    );

    expect(toggleRes.data?.toggleTaskCompleted.completed).toBe(
      !targetTask.completed,
    );
  });

  it('executes DeleteTask mutation', async () => {
    const client = createApolloClient({ useMockApi: true, latencyMs: 0 });

    const tasksRes = await client.query<{ tasks: GraphQLTask[] }>({
      query: GET_TASKS_QUERY,
    });
    const targetTask = tasksRes.data!.tasks[0];

    const deleteRes = await client.mutate<{ deleteTask: boolean }>({
      mutation: DELETE_TASK_MUTATION,
      variables: { id: targetTask.id },
    });

    expect(deleteRes.data?.deleteTask).toBe(true);
  });

  it('executes GetAIInsights query returning productivity scores', async () => {
    const client = createApolloClient({ useMockApi: true, latencyMs: 0 });

    const response = await client.query<{
      aiInsights: { productivityScore: number; recommendations: string[] };
    }>({
      query: GET_AI_INSIGHTS_QUERY,
    });

    expect(response.data).toBeDefined();
    expect(response.data!.aiInsights).toBeDefined();
    expect(typeof response.data!.aiInsights.productivityScore).toBe('number');
    expect(response.data!.aiInsights.recommendations).toBeInstanceOf(Array);
  });
});
