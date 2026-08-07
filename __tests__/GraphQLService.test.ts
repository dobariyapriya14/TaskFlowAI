import { createApolloClient } from '../src/graphql/client';
import { BaseGraphQLService } from '../src/graphql/services/BaseGraphQLService';
import { GraphQLTaskService } from '../src/graphql/services/GraphQLTaskService';
import { GET_TASKS_QUERY } from '../src/graphql/operations';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

class TestBaseService extends BaseGraphQLService {}

describe('BaseGraphQLService', () => {
  let testClient: ReturnType<typeof createApolloClient>;
  let service: TestBaseService;

  beforeEach(() => {
    testClient = createApolloClient({ useMockApi: true, latencyMs: 0 });
    service = new TestBaseService(testClient);
  });

  it('allows setting and getting ApolloClient instance', () => {
    expect(service.getClient()).toBe(testClient);
    const newClient = createApolloClient({ useMockApi: true, latencyMs: 0 });
    service.setClient(newClient);
    expect(service.getClient()).toBe(newClient);
  });

  it('executes generic query successfully', async () => {
    const result = await service.query(GET_TASKS_QUERY);
    expect(result.data).toBeDefined();
    expect(result.data.tasks).toBeInstanceOf(Array);
  });

  it('writes to and reads from cache', () => {
    const mockData = {
      tasks: [
        {
          __typename: 'GraphQLTask',
          id: 'test-cache-1',
          title: 'Test Cache Task',
          category: 'Testing',
          priority: 'Normal',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    service.writeQuery(GET_TASKS_QUERY, mockData);
    const cached = service.readQuery<{ tasks: any[] }>(GET_TASKS_QUERY);
    expect(cached?.tasks).toHaveLength(1);
    expect(cached?.tasks[0].title).toBe('Test Cache Task');
  });

  it('resets and clears store without crashing', async () => {
    await expect(service.clearStore()).resolves.not.toThrow();
  });
});

describe('GraphQLTaskService', () => {
  let testClient: ReturnType<typeof createApolloClient>;
  let mockLink: MockGraphQLApiLink;
  let taskService: GraphQLTaskService;

  beforeEach(() => {
    mockLink = new MockGraphQLApiLink(0);
    mockLink.resetMockStore([
      {
        __typename: 'GraphQLTask',
        id: 'task-100',
        title: 'Initial Task',
        category: 'Work',
        priority: 'High',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    testClient = createApolloClient({ useMockApi: true, latencyMs: 0 });
    taskService = new GraphQLTaskService(testClient);
  });

  it('fetches tasks via getTasks()', async () => {
    const tasks = await taskService.getTasks();
    expect(tasks).toBeInstanceOf(Array);
    expect(tasks.length).toBeGreaterThan(0);
  });

  it('fetches single task by ID via getTaskById()', async () => {
    const tasks = await taskService.getTasks();
    const firstId = tasks[0]?.id;
    if (firstId) {
      const task = await taskService.getTaskById(firstId);
      expect(task).not.toBeNull();
      expect(task?.id).toBe(firstId);
    }
  });

  it('fetches AI insights via getAIInsights()', async () => {
    const insights = await taskService.getAIInsights();
    expect(insights).not.toBeNull();
    expect(insights?.productivityScore).toBeGreaterThanOrEqual(0);
    expect(insights?.recommendations).toBeInstanceOf(Array);
  });

  it('creates task via createTask()', async () => {
    const newTask = await taskService.createTask({
      title: 'New Service Task',
      category: 'Testing',
      priority: 'Urgent',
      completed: false,
    });

    expect(newTask).toBeDefined();
    expect(newTask.title).toBe('New Service Task');
    expect(newTask.category).toBe('Testing');
    expect(newTask.priority).toBe('Urgent');
  });

  it('updates task via updateTask()', async () => {
    const tasks = await taskService.getTasks();
    const target = tasks[0];

    const updated = await taskService.updateTask(target.id, {
      title: 'Updated Title',
      priority: 'Low',
    });

    expect(updated.title).toBe('Updated Title');
    expect(updated.priority).toBe('Low');
  });

  it('toggles task completed state via toggleTaskCompleted()', async () => {
    const tasks = await taskService.getTasks();
    const target = tasks[0];
    const initialCompleted = target.completed;

    const toggled = await taskService.toggleTaskCompleted(target.id, target);
    expect(toggled.completed).toBe(!initialCompleted);
  });

  it('deletes task via deleteTask()', async () => {
    const tasks = await taskService.getTasks();
    const initialLength = tasks.length;
    const targetId = tasks[0].id;

    const success = await taskService.deleteTask(targetId);
    expect(success).toBe(true);

    const remainingTasks = await taskService.getTasks();
    expect(remainingTasks.length).toBe(initialLength - 1);
  });
});
