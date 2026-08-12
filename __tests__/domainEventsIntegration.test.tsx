import React, { useEffect } from 'react';
import { render, act } from '@testing-library/react-native';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApolloClient } from '../src/graphql/client';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';
import {
  useOfflineTaskMutations,
  offlineTaskRepository,
  networkStatusService,
} from '../src/graphql';
import {
  eventBus,
  DomainEventType,
  asyncEventProcessor,
} from '../src/core/events';

describe('Domain Events & Async Processing Integration', () => {
  let client: ApolloClient<NormalizedCacheObject>;
  let mockLink: MockGraphQLApiLink;

  beforeEach(async () => {
    await AsyncStorage.clear();
    await eventBus.clearHistory();
    await asyncProcessorClear();
    networkStatusService.setOnline(true);

    mockLink = new MockGraphQLApiLink(0);
    mockLink.resetMockStore([
      {
        __typename: 'GraphQLTask',
        id: 'task-100',
        title: 'Initial Event Task',
        category: 'General',
        priority: 'Normal',
        completed: false,
        createdAt: '2026-08-11T10:00:00.000Z',
        updatedAt: '2026-08-11T10:00:00.000Z',
      },
    ]);

    client = createApolloClient({ useMockApi: true, latencyMs: 0 });
    offlineTaskRepository.setClient(client);
  });

  async function asyncProcessorClear() {
    await asyncEventProcessor.clearDLQ();
  }

  it('publishes TASK_CREATED domain event and triggers async background processing when creating a task', async () => {
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

    const eventReceivedMock = jest.fn();
    const unsub = eventBus.subscribe(DomainEventType.TASK_CREATED, evt => {
      eventReceivedMock(evt);
    });

    await act(async () => {
      await hookVal.createTask({
        title: 'Domain Event Test Task',
        category: 'Testing',
      });
    });

    expect(eventReceivedMock).toHaveBeenCalled();
    const publishedEvt = eventReceivedMock.mock.calls[0][0];
    expect(publishedEvt.type).toBe(DomainEventType.TASK_CREATED);
    expect(publishedEvt.payload.title).toBe('Domain Event Test Task');

    const history = eventBus.getEventHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].type).toBe(DomainEventType.TASK_CREATED);

    unsub();
  });
});
