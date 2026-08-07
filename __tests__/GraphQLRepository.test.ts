import { createApolloClient } from '../src/graphql/client';
import {
  BaseGraphQLRepository,
  GraphQLTaskRepository,
} from '../src/graphql/repositories';
import { GET_TASKS_QUERY } from '../src/graphql/operations';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

class TestBaseRepository extends BaseGraphQLRepository {}

describe('BaseGraphQLRepository', () => {
  let testClient: ReturnType<typeof createApolloClient>;
  let repository: TestBaseRepository;

  beforeEach(() => {
    testClient = createApolloClient({ useMockApi: true, latencyMs: 0 });
    repository = new TestBaseRepository(testClient);
  });

  it('allows setting and getting ApolloClient instance', () => {
    expect(repository.getClient()).toBe(testClient);
    const newClient = createApolloClient({ useMockApi: true, latencyMs: 0 });
    repository.setClient(newClient);
    expect(repository.getClient()).toBe(newClient);
  });

  it('executes generic query successfully', async () => {
    const result = await repository.query(GET_TASKS_QUERY);
    expect(result.data).toBeDefined();
    expect(result.data.tasks).toBeInstanceOf(Array);
  });

  it('writes to and reads from Apollo cache', () => {
    const mockData = {
      tasks: [
        {
          __typename: 'GraphQLTask',
          id: 'repo-cache-1',
          title: 'Repository Cache Task',
          category: 'Testing',
          priority: 'High',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    repository.writeQuery(GET_TASKS_QUERY, mockData);
    const cached = repository.readQuery<{ tasks: any[] }>(GET_TASKS_QUERY);
    expect(cached?.tasks).toHaveLength(1);
    expect(cached?.tasks[0].title).toBe('Repository Cache Task');
  });

  it('resets and clears store without errors', async () => {
    await expect(repository.clearStore()).resolves.not.toThrow();
  });
});

describe('GraphQLTaskRepository', () => {
  let testClient: ReturnType<typeof createApolloClient>;
  let mockLink: MockGraphQLApiLink;
  let taskRepository: GraphQLTaskRepository;

  beforeEach(() => {
    mockLink = new MockGraphQLApiLink(0);
    mockLink.resetMockStore([
      {
        __typename: 'GraphQLTask',
        id: 'task-200',
        title: 'Initial Repo Task',
        category: 'Work',
        priority: 'High',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    testClient = createApolloClient({ useMockApi: true, latencyMs: 0 });
    taskRepository = new GraphQLTaskRepository(testClient);
  });

  it('fetches tasks via getTasks() and getAll()', async () => {
    const tasks = await taskRepository.getTasks();
    expect(tasks).toBeInstanceOf(Array);
    expect(tasks.length).toBeGreaterThan(0);

    const allTasks = await taskRepository.getAll();
    expect(allTasks).toHaveLength(tasks.length);
  });

  it('fetches single task by ID via getTaskById() and getById()', async () => {
    const tasks = await taskRepository.getTasks();
    const firstId = tasks[0]?.id;
    if (firstId) {
      const task = await taskRepository.getTaskById(firstId);
      expect(task).not.toBeNull();
      expect(task?.id).toBe(firstId);

      const taskById = await taskRepository.getById(firstId);
      expect(taskById?.id).toBe(firstId);
    }
  });

  it('fetches AI insights via getAIInsights()', async () => {
    const insights = await taskRepository.getAIInsights();
    expect(insights).not.toBeNull();
    expect(insights?.productivityScore).toBeGreaterThanOrEqual(0);
    expect(insights?.recommendations).toBeInstanceOf(Array);
  });

  it('creates task via createTask() and create()', async () => {
    const newTask = await taskRepository.createTask({
      title: 'New Repo Task',
      category: 'Architecture',
      priority: 'Urgent',
      completed: false,
    });

    expect(newTask).toBeDefined();
    expect(newTask.title).toBe('New Repo Task');
    expect(newTask.category).toBe('Architecture');
    expect(newTask.priority).toBe('Urgent');

    const anotherTask = await taskRepository.create({
      title: 'Generic Interface Created Task',
      priority: 'Normal',
    });
    expect(anotherTask.title).toBe('Generic Interface Created Task');
  });

  it('updates task via updateTask() and update()', async () => {
    const tasks = await taskRepository.getTasks();
    const target = tasks[0];

    const updated = await taskRepository.updateTask(target.id, {
      title: 'Updated Repo Task Title',
      priority: 'Low',
    });

    expect(updated.title).toBe('Updated Repo Task Title');
    expect(updated.priority).toBe('Low');

    const updatedViaGeneric = await taskRepository.update(target.id, {
      title: 'Updated via Generic Interface',
    });
    expect(updatedViaGeneric.title).toBe('Updated via Generic Interface');
  });

  it('toggles task completed state via toggleTaskCompleted()', async () => {
    const tasks = await taskRepository.getTasks();
    const target = tasks[0];
    const initialCompleted = target.completed;

    const toggled = await taskRepository.toggleTaskCompleted(target.id, target);
    expect(toggled.completed).toBe(!initialCompleted);
  });

  it('deletes task via deleteTask() and delete()', async () => {
    const tasks = await taskRepository.getTasks();
    const initialLength = tasks.length;
    const targetId = tasks[0].id;

    const success = await taskRepository.deleteTask(targetId);
    expect(success).toBe(true);

    const remainingTasks = await taskRepository.getTasks();
    expect(remainingTasks.length).toBe(initialLength - 1);
  });

  it('reads cached tasks via readCachedTasks()', () => {
    const mockTask = {
      __typename: 'GraphQLTask' as const,
      id: 'cache-read-1',
      title: 'Cached Task Test',
      category: 'General',
      priority: 'Normal' as const,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    taskRepository.writeQuery(GET_TASKS_QUERY, { tasks: [mockTask] });
    const cached = taskRepository.readCachedTasks();
    expect(cached).toHaveLength(1);
    expect(cached[0].title).toBe('Cached Task Test');
  });
});
