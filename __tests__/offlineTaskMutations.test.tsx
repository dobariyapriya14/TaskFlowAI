import React, { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { ApolloProvider } from '@apollo/client/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApolloClient } from '../src/graphql/client';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';
import { useOfflineTaskMutations } from '../src/graphql/hooks/useOfflineTaskMutations';
import { offlineSyncQueue } from '../src/graphql/offline/OfflineSyncQueue';
import { networkStatusService } from '../src/graphql/offline/NetworkStatusService';

describe('useOfflineTaskMutations & Offline Sync Queue Integration', () => {
  let mockLink: MockGraphQLApiLink;
  let client: ReturnType<typeof createApolloClient>;

  beforeEach(async () => {
    await AsyncStorage.clear();
    await offlineSyncQueue.clearQueue();
    networkStatusService.setOnline(true);

    mockLink = new MockGraphQLApiLink(0);
    mockLink.resetMockStore([
      {
        __typename: 'GraphQLTask',
        id: 'server-task-1',
        title: 'Initial Server Task',
        category: 'GraphQL',
        priority: 'Normal',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    client = createApolloClient({ useMockApi: true, latencyMs: 0 });
  });

  it('creates task optimistically when offline and enqueues CREATE mutation', async () => {
    let hookVal: any = null;

    const TestComponent = () => {
      const val = useOfflineTaskMutations();
      useEffect(() => {
        hookVal = val;
      }, [val]);
      return null;
    };

    await act(async () => {
      render(
        <ApolloProvider client={client}>
          <TestComponent />
        </ApolloProvider>,
      );
    });

    // Switch to offline mode
    await act(async () => {
      hookVal.setOnline(false);
    });

    expect(hookVal.isOnline).toBe(false);

    let created: any = null;
    await act(async () => {
      created = await hookVal.createTask({
        title: 'Offline Created Task',
        category: 'Offline',
        priority: 'High',
      });
    });

    expect(created).toBeDefined();
    expect(created.id.startsWith('temp-')).toBe(true);
    expect(created.title).toBe('Offline Created Task');

    expect(hookVal.pendingCount).toBe(1);
    const queue = offlineSyncQueue.getQueue();
    expect(queue[0].type).toBe('CREATE');
    expect(queue[0].taskId).toBe(created.id);
  });

  it('updates existing task optimistically when offline and enqueues UPDATE mutation', async () => {
    let hookVal: any = null;

    const TestComponent = () => {
      const val = useOfflineTaskMutations();
      useEffect(() => {
        hookVal = val;
      }, [val]);
      return null;
    };

    await act(async () => {
      render(
        <ApolloProvider client={client}>
          <TestComponent />
        </ApolloProvider>,
      );
    });

    await act(async () => {
      hookVal.setOnline(false);
    });

    let updated: any = null;
    await act(async () => {
      updated = await hookVal.updateTask('server-task-1', {
        title: 'Updated Offline Title',
        category: 'OfflineEdit',
        priority: 'Urgent',
      });
    });

    expect(updated.id).toBe('server-task-1');
    expect(updated.title).toBe('Updated Offline Title');
    expect(hookVal.pendingCount).toBe(1);

    const queue = offlineSyncQueue.getQueue();
    expect(queue[0].type).toBe('UPDATE');
    expect(queue[0].taskId).toBe('server-task-1');
  });

  it('cancels unsynced temporary task on delete without enqueuing network mutation', async () => {
    let hookVal: any = null;

    const TestComponent = () => {
      const val = useOfflineTaskMutations();
      useEffect(() => {
        hookVal = val;
      }, [val]);
      return null;
    };

    await act(async () => {
      render(
        <ApolloProvider client={client}>
          <TestComponent />
        </ApolloProvider>,
      );
    });

    await act(async () => {
      hookVal.setOnline(false);
    });

    let created: any = null;
    await act(async () => {
      created = await hookVal.createTask({
        title: 'Temporary Task to Delete',
      });
    });

    expect(hookVal.pendingCount).toBe(1);

    await act(async () => {
      await hookVal.deleteTask(created.id);
    });

    expect(hookVal.pendingCount).toBe(0);
    expect(offlineSyncQueue.getQueue().length).toBe(0);
  });

  it('flushes pending queue items automatically when switching back online', async () => {
    let hookVal: any = null;

    const TestComponent = () => {
      const val = useOfflineTaskMutations();
      useEffect(() => {
        hookVal = val;
      }, [val]);
      return null;
    };

    await act(async () => {
      render(
        <ApolloProvider client={client}>
          <TestComponent />
        </ApolloProvider>,
      );
    });

    // Go offline & create task
    await act(async () => {
      hookVal.setOnline(false);
    });

    await act(async () => {
      await hookVal.createTask({
        title: 'Pending Sync Task',
        category: 'SyncTest',
      });
    });

    expect(hookVal.pendingCount).toBe(1);

    // Reconnect network & sync queue
    await act(async () => {
      hookVal.setOnline(true);
    });

    await waitFor(
      () => {
        expect(offlineSyncQueue.getQueue().length).toBe(0);
      },
      { timeout: 2000 },
    );

    expect(hookVal.pendingCount).toBe(0);
  });
});
