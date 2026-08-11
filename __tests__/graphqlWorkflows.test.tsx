import React, { useEffect } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { ApolloProvider } from '@apollo/client/react';
import { createApolloClient } from '../src/graphql/client';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';
import { GraphQLTaskService } from '../src/graphql/services/GraphQLTaskService';
import { GraphQLTaskRepository } from '../src/graphql/repositories/GraphQLTaskRepository';
import {
  useGraphQLTasks,
  useGraphQLTasksConnection,
  useGraphQLAIInsights,
  useGraphQLTaskMutations,
} from '../src/graphql/hooks/useGraphQLTasks';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('End-to-End GraphQL Workflows Integration Tests', () => {
  let mockLink: MockGraphQLApiLink;

  beforeEach(() => {
    mockLink = new MockGraphQLApiLink(0);
    mockLink.resetMockStore([
      {
        __typename: 'GraphQLTask',
        id: 'flow-1',
        title: 'Workflow Setup Task',
        category: 'Architecture',
        priority: 'High',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        __typename: 'GraphQLTask',
        id: 'flow-2',
        title: 'Workflow Testing Task',
        category: 'Testing',
        priority: 'Normal',
        completed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  });

  describe('Workflow 1: Full Task Lifecycle & AI Insights Recalculation', () => {
    it('executes create, query, update, toggle, AI insights recalculation, and delete workflow', async () => {
      const client = createApolloClient({ useMockApi: true, latencyMs: 0 });
      const taskService = new GraphQLTaskService(client);
      const taskRepo = new GraphQLTaskRepository(client);

      // Step 1: Query initial tasks & insights
      const initialTasks = await taskService.getTasks();
      const initialInsights = await taskService.getAIInsights();
      expect(initialTasks.length).toBe(2);
      expect(initialInsights?.productivityScore).toBe(50); // 1 completed out of 2 = 50%

      // Step 2: Create new task via Service
      const newTask = await taskService.createTask({
        title: 'Integration Workflow Task 3',
        category: 'Workflows',
        priority: 'Urgent',
        completed: false,
      });
      expect(newTask.id).toBeDefined();

      // Step 3: Verify created task appears in Repository cache and query
      const tasksAfterCreate = await taskRepo.getTasks();
      expect(tasksAfterCreate.length).toBe(3);

      // Step 4: Toggle newly created task to completed
      const toggled = await taskService.toggleTaskCompleted(newTask.id);
      expect(toggled.completed).toBe(true);

      // Step 5: Recalculate AI Insights after completion update
      const updatedInsights = await taskService.getAIInsights();
      expect(updatedInsights?.productivityScore).toBe(67); // 2 completed out of 3 = 67%

      // Step 6: Update task details
      const updatedTask = await taskRepo.updateTask(newTask.id, {
        title: 'Renamed Workflow Task 3',
        priority: 'Low',
      });
      expect(updatedTask.title).toBe('Renamed Workflow Task 3');

      // Step 7: Delete task
      const deleteSuccess = await taskService.deleteTask(newTask.id);
      expect(deleteSuccess).toBe(true);

      const finalTasks = await taskService.getTasks();
      expect(finalTasks.length).toBe(2);
    });
  });

  describe('Workflow 2: Relay Cursor Pagination & Cache Merge Integration', () => {
    it('executes paginated task fetching and cursor navigation', async () => {
      const client = createApolloClient({ useMockApi: true, latencyMs: 0 });
      let hookVal: any = null;

      const PaginatedComponent = () => {
        const value = useGraphQLTasksConnection({ first: 1 });
        useEffect(() => {
          hookVal = value;
        }, [value]);
        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <PaginatedComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(hookVal?.loading).toBe(false);
      });

      // Verify 1st page
      expect(hookVal.tasks.length).toBe(1);
      expect(hookVal.hasNextPage).toBe(true);
      expect(hookVal.totalCount).toBe(2);

      // Fetch next page via fetchMoreTasks
      await act(async () => {
        await hookVal.fetchMoreTasks();
      });

      await waitFor(() => {
        expect(hookVal.tasks.length).toBe(2);
      });

      expect(hookVal.tasks[0].id).toBe('flow-1');
      expect(hookVal.tasks[1].id).toBe('flow-2');
    });
  });

  describe('Workflow 3: React Hooks & Optimistic UI Updates Integration', () => {
    it('executes optimistic task creation and completion toggle via React Hooks', async () => {
      const client = createApolloClient({ useMockApi: true, latencyMs: 0 });
      let mutationHook: any = null;
      let queryHook: any = null;
      let insightsHook: any = null;

      const HookWorkflowComponent = () => {
        const mutations = useGraphQLTaskMutations();
        const queries = useGraphQLTasks();
        const insights = useGraphQLAIInsights();

        useEffect(() => {
          mutationHook = mutations;
          queryHook = queries;
          insightsHook = insights;
        }, [mutations, queries, insights]);

        return null;
      };

      await act(async () => {
        render(
          <ApolloProvider client={client}>
            <HookWorkflowComponent />
          </ApolloProvider>,
        );
      });

      await waitFor(() => {
        expect(mutationHook).not.toBeNull();
        expect(queryHook?.loading).toBe(false);
        expect(insightsHook?.loading).toBe(false);
      });

      // Execute Optimistic Creation
      let createdTask: any;
      await act(async () => {
        createdTask = await mutationHook.createTask(
          {
            title: 'Optimistic Workflow Task',
            category: 'Optimistic',
            priority: 'High',
          },
          { optimistic: true },
        );
      });

      expect(createdTask).toBeDefined();
      expect(createdTask.title).toBe('Optimistic Workflow Task');

      // Execute Toggle Mutation
      let toggledTask: any;
      await act(async () => {
        toggledTask = await mutationHook.toggleTaskCompleted('flow-1');
      });

      expect(toggledTask.completed).toBe(true);
    });
  });
});
