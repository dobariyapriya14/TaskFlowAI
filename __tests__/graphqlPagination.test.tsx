import React, { useEffect } from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from '@testing-library/react-native';
import { createApolloClient } from '../src/graphql/client';
import { GraphQLProvider } from '../src/graphql/GraphQLProvider';
import { AuthProvider } from '../src/context/AuthContext';
import { GraphQLTaskRepository } from '../src/graphql/repositories/GraphQLTaskRepository';
import { GraphQLTaskService } from '../src/graphql/services/GraphQLTaskService';
import { useGraphQLTasksConnection } from '../src/graphql/hooks/useGraphQLTasks';
import { GraphQLTasksScreen } from '../src/screens/GraphQLTasksScreen';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('GraphQL Cursor-Based Pagination with fetchMore', () => {
  let client: ReturnType<typeof createApolloClient>;

  beforeEach(() => {
    client = createApolloClient({ useMockApi: true, latencyMs: 0 });
  });

  describe('GraphQLTaskRepository & GraphQLTaskService Connection', () => {
    it('fetches initial page of tasksConnection with cursor pagination info', async () => {
      const repository = new GraphQLTaskRepository(client);
      const connection = await repository.getTasksConnection({ first: 3 });

      expect(connection).not.toBeNull();
      expect(connection?.edges.length).toBe(3);
      expect(connection?.totalCount).toBeGreaterThanOrEqual(10);
      expect(connection?.pageInfo.hasNextPage).toBe(true);
      expect(connection?.pageInfo.startCursor).toBe('gql-1');
      expect(connection?.pageInfo.endCursor).toBe('gql-3');
    });

    it('fetches subsequent page using after cursor via GraphQLTaskService', async () => {
      const service = new GraphQLTaskService(client);
      const firstPage = await service.getTasksConnection({ first: 3 });
      const endCursor = firstPage?.pageInfo.endCursor;

      expect(endCursor).toBe('gql-3');

      const secondPage = await service.getTasksConnection({
        first: 3,
        after: endCursor,
      });

      expect(secondPage).not.toBeNull();
      expect(secondPage?.edges.length).toBe(3);
      expect(secondPage?.edges[0].node.id).toBe('gql-4');
      expect(secondPage?.pageInfo.startCursor).toBe('gql-4');
      expect(secondPage?.pageInfo.hasPreviousPage).toBe(true);
    });
  });

  describe('useGraphQLTasksConnection Hook with fetchMore', () => {
    it('fetches initial items and executes fetchMore to append next page', async () => {
      let latestHookVal: any = null;

      const TestHookContainer = () => {
        const hookVal = useGraphQLTasksConnection({ first: 3 });
        useEffect(() => {
          latestHookVal = hookVal;
        }, [hookVal]);
        return null;
      };

      await render(
        <GraphQLProvider client={client}>
          <TestHookContainer />
        </GraphQLProvider>,
      );

      await waitFor(() => {
        expect(latestHookVal?.tasks?.length).toBe(3);
        expect(latestHookVal?.hasNextPage).toBe(true);
      });

      expect(latestHookVal.totalCount).toBeGreaterThanOrEqual(10);

      // Trigger fetchMore
      await act(async () => {
        await latestHookVal.fetchMoreTasks();
      });

      await waitFor(() => {
        expect(latestHookVal?.tasks?.length).toBe(6);
      });

      expect(latestHookVal.tasks[0].id).toBe('gql-1');
      expect(latestHookVal.tasks[3].id).toBe('gql-4');
    });
  });

  describe('GraphQLTasksScreen Paginated UI Integration', () => {
    it('renders initial page and loads more tasks when pressing Load More button', async () => {
      await render(
        <AuthProvider>
          <GraphQLProvider client={client}>
            <GraphQLTasksScreen />
          </GraphQLProvider>
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('graphql-tasks-screen')).toBeTruthy();
        expect(screen.getByText('Setup GraphQL Apollo Client')).toBeTruthy();
        expect(screen.getByTestId('load-more-button')).toBeTruthy();
      });

      const loadMoreBtn = screen.getByTestId('load-more-button');
      await fireEvent.press(loadMoreBtn);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Configure Apollo Cache Persistence with AsyncStorage',
          ),
        ).toBeTruthy();
      });
    });
  });
});
