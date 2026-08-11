import React, { useEffect } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { ApolloProvider } from '@apollo/client/react';
import { createApolloClient } from '../src/graphql/client';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';
import {
  useGraphQLTasks,
  useGraphQLTaskById,
  useGraphQLAIInsights,
  useGraphQLTaskMutations,
} from '../src/graphql/hooks/useGraphQLTasks';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('Apollo Tasks & AI Insights Hooks', () => {
  let mockLink: MockGraphQLApiLink;
  let client: ReturnType<typeof createApolloClient>;

  beforeEach(() => {
    mockLink = new MockGraphQLApiLink(0);
    mockLink.resetMockStore([
      {
        __typename: 'GraphQLTask',
        id: 'gql-hook-1',
        title: 'Hook Unit Test Task 1',
        category: 'Testing',
        priority: 'High',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        __typename: 'GraphQLTask',
        id: 'gql-hook-2',
        title: 'Hook Unit Test Task 2',
        category: 'UI',
        priority: 'Normal',
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    client = createApolloClient({ useMockApi: true, latencyMs: 0 });
  });

  describe('useGraphQLTasks', () => {
    it('fetches tasks list successfully', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTasks();
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal?.loading).toBe(false);
      });

      expect(hookVal.tasks).toBeInstanceOf(Array);
      expect(hookVal.tasks.length).toBeGreaterThan(0);
      expect(hookVal.error).toBeUndefined();
    });

    it('filters tasks by category when filter is provided', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTasks({ category: 'Testing' });
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal?.loading).toBe(false);
      });

      expect(hookVal.tasks).toBeInstanceOf(Array);
      expect(
        hookVal.tasks.every(
          (t: any) => t.category?.toLowerCase() === 'testing',
        ),
      ).toBe(true);
    });

    it('refetches tasks when refetch() is called', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTasks();
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal?.loading).toBe(false);
      });

      await act(async () => {
        const refetched = await hookVal.refetch();
        expect(refetched.data.tasks).toBeDefined();
      });
    });
  });

  describe('useGraphQLTaskById', () => {
    it('fetches task by ID when valid ID is provided', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTaskById('gql-hook-1');
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal?.loading).toBe(false);
      });

      expect(hookVal.task).not.toBeNull();
      expect(hookVal.task?.id).toBe('gql-hook-1');
      expect(hookVal.task?.title).toBe('Hook Unit Test Task 1');
    });

    it('returns null when task ID is not found', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTaskById('non-existent-id');
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal?.loading).toBe(false);
      });

      expect(hookVal.task).toBeNull();
    });
  });

  describe('useGraphQLAIInsights', () => {
    it('fetches AI Insights summary and score', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLAIInsights();
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal?.loading).toBe(false);
      });

      expect(hookVal.aiInsights).toBeDefined();
      expect(typeof hookVal.aiInsights?.summary).toBe('string');
      expect(typeof hookVal.aiInsights?.productivityScore).toBe('number');
      expect(hookVal.aiInsights?.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('useGraphQLTaskMutations', () => {
    it('creates a new task via createTask()', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTaskMutations();
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal).not.toBeNull();
      });

      let createdTask: any;
      await act(async () => {
        createdTask = await hookVal.createTask({
          title: 'Created via Mutation Hook',
          category: 'Architecture',
          priority: 'Urgent',
          completed: false,
        });
      });

      expect(createdTask).toBeDefined();
      expect(createdTask.title).toBe('Created via Mutation Hook');
      expect(createdTask.category).toBe('Architecture');
    });

    it('creates a task with optimistic updates option', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTaskMutations();
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal).not.toBeNull();
      });

      let createdTask: any;
      await act(async () => {
        createdTask = await hookVal.createTask(
          {
            title: 'Optimistic Task',
            category: 'UI',
            priority: 'High',
          },
          { optimistic: true },
        );
      });

      expect(createdTask).toBeDefined();
      expect(createdTask.title).toBe('Optimistic Task');
    });

    it('updates an existing task via updateTask()', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTaskMutations();
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal).not.toBeNull();
      });

      let updatedTask: any;
      await act(async () => {
        updatedTask = await hookVal.updateTask('gql-hook-1', {
          title: 'Updated Hook Title',
          priority: 'Low',
        });
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask.id).toBe('gql-hook-1');
      expect(updatedTask.title).toBe('Updated Hook Title');
      expect(updatedTask.priority).toBe('Low');
    });

    it('toggles task completion status via toggleTaskCompleted()', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTaskMutations();
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal).not.toBeNull();
      });

      let toggled: any;
      await act(async () => {
        toggled = await hookVal.toggleTaskCompleted('gql-hook-1');
      });

      expect(toggled).toBeDefined();
      expect(toggled.id).toBe('gql-hook-1');
      expect(toggled.completed).toBe(true);
    });

    it('deletes a task via deleteTask()', async () => {
      let hookVal: any = null;

      const TestComponent = () => {
        const value = useGraphQLTaskMutations();
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <TestComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal).not.toBeNull();
      });

      let success = false;
      await act(async () => {
        success = await hookVal.deleteTask('gql-hook-2');
      });

      expect(success).toBe(true);
    });
  });
});
