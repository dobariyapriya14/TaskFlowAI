import React, { useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { ApolloProvider } from '@apollo/client/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApolloClient } from '../src/graphql/client';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';
import { useOfflineTaskMutations } from '../src/graphql/hooks/useOfflineTaskMutations';
import { offlineSyncQueue } from '../src/graphql/offline/OfflineSyncQueue';
import { networkStatusService } from '../src/graphql/offline/NetworkStatusService';
import { conflictResolver } from '../src/graphql/offline/ConflictResolver';

describe('Multi-Device Simultaneous Edit Integration', () => {
  let mockLink: MockGraphQLApiLink;
  let client: ReturnType<typeof createApolloClient>;

  beforeEach(async () => {
    await AsyncStorage.clear();
    await offlineSyncQueue.clearQueue();
    await conflictResolver.clearAuditLog();
    conflictResolver.setStrategy('FIELD_LEVEL_MERGE');
    networkStatusService.setOnline(true);

    mockLink = new MockGraphQLApiLink(0);
    mockLink.resetMockStore([
      {
        __typename: 'GraphQLTask',
        id: 'shared-task-1',
        title: 'Original Title',
        category: 'Shared',
        priority: 'Normal',
        completed: false,
        createdAt: '2026-08-11T10:00:00.000Z',
        updatedAt: '2026-08-11T10:00:00.000Z',
      },
    ]);

    client = createApolloClient({ useMockApi: true, latencyMs: 0 });
  });

  it('merges simultaneous edits from Device A (offline title edit) and Device B (server completion edit)', async () => {
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

    // Step 1: Device A goes offline and edits title
    await act(async () => {
      hookVal.setOnline(false);
    });

    await act(async () => {
      await hookVal.updateTask('shared-task-1', {
        title: 'Device A New Title',
      });
    });

    expect(hookVal.pendingCount).toBe(1);

    // Step 2: Device B (simulated remote server update) completes task concurrently
    const newerServerTime = new Date(Date.now() + 5000).toISOString();
    mockLink.resetMockStore([
      {
        __typename: 'GraphQLTask',
        id: 'shared-task-1',
        title: 'Server Concurrent Title',
        category: 'Shared',
        priority: 'Normal',
        completed: true, // Device B completed this task
        createdAt: '2026-08-11T10:00:00.000Z',
        updatedAt: newerServerTime,
      },
    ]);

    // Step 3: Device A comes back online and syncs queue
    await act(async () => {
      hookVal.setOnline(true);
      await hookVal.syncQueue();
    });

    await waitFor(() => {
      expect(conflictResolver.getAuditLog().length).toBeGreaterThan(0);
    });

    // Step 4: Verify conflict resolution audit log and merged task in mock store
    const auditLog = conflictResolver.getAuditLog();
    expect(auditLog[0].taskId).toBe('shared-task-1');

    const store = mockLink.getMockStore();
    const serverTask = store.find(t => t.id === 'shared-task-1');
    expect(serverTask).toBeDefined();
    expect(serverTask?.title).toBe('Device A New Title');
    expect(serverTask?.completed).toBe(true);
  });
});
