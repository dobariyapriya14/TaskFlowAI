import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';
import {
  TASK_UPDATED_SUBSCRIPTION,
  TASK_CREATED_SUBSCRIPTION,
  TASK_DELETED_SUBSCRIPTION,
  CREATE_TASK_MUTATION,
  TOGGLE_TASK_COMPLETED_MUTATION,
  DELETE_TASK_MUTATION,
} from '../src/graphql/operations';
import { mockServerStore } from '../src/graphql/server/store';

describe('GraphQL Subscriptions for Real-time Task Updates', () => {
  let client: ApolloClient<any>;
  let mockLink: MockGraphQLApiLink;

  beforeEach(() => {
    mockServerStore.resetStore();
    mockLink = new MockGraphQLApiLink(0);
    client = new ApolloClient({
      link: mockLink,
      cache: new InMemoryCache(),
    });
  });

  it('subscribes to TASK_UPDATED_SUBSCRIPTION and receives updates on task creation', done => {
    const observable = client.subscribe({
      query: TASK_UPDATED_SUBSCRIPTION,
    });

    const subscription = observable.subscribe({
      next(response) {
        try {
          expect(response.data).toBeDefined();
          const payload = response.data.taskUpdated;
          expect(payload.event).toBe('CREATED');
          expect(payload.task.title).toBe('Realtime Subscription Task');
          subscription.unsubscribe();
          done();
        } catch (err) {
          subscription.unsubscribe();
          done(err);
        }
      },
      error(err) {
        done(err);
      },
    });

    // Trigger task creation after subscription is active
    setTimeout(() => {
      client.mutate({
        mutation: CREATE_TASK_MUTATION,
        variables: {
          input: {
            title: 'Realtime Subscription Task',
            category: 'Realtime',
            priority: 'High',
          },
        },
      });
    }, 10);
  });

  it('subscribes to TASK_CREATED_SUBSCRIPTION and receives created task payload', done => {
    const observable = client.subscribe({
      query: TASK_CREATED_SUBSCRIPTION,
    });

    const subscription = observable.subscribe({
      next(response) {
        try {
          expect(response.data).toBeDefined();
          expect(response.data.taskCreated.title).toBe('Task Created Event');
          subscription.unsubscribe();
          done();
        } catch (err) {
          subscription.unsubscribe();
          done(err);
        }
      },
      error(err) {
        done(err);
      },
    });

    setTimeout(() => {
      client.mutate({
        mutation: CREATE_TASK_MUTATION,
        variables: {
          input: {
            title: 'Task Created Event',
            category: 'Testing',
            priority: 'Normal',
          },
        },
      });
    }, 10);
  });

  it('receives TASK_UPDATED notification on toggleTaskCompleted mutation', done => {
    const targetTaskId = 'gql-1';

    const observable = client.subscribe({
      query: TASK_UPDATED_SUBSCRIPTION,
    });

    const subscription = observable.subscribe({
      next(response) {
        try {
          expect(response.data).toBeDefined();
          const payload = response.data.taskUpdated;
          expect(payload.event).toBe('UPDATED');
          expect(payload.taskId).toBe(targetTaskId);
          subscription.unsubscribe();
          done();
        } catch (err) {
          subscription.unsubscribe();
          done(err);
        }
      },
      error(err) {
        done(err);
      },
    });

    setTimeout(() => {
      client.mutate({
        mutation: TOGGLE_TASK_COMPLETED_MUTATION,
        variables: { id: targetTaskId },
      });
    }, 10);
  });

  it('subscribes to TASK_DELETED_SUBSCRIPTION and receives notification on task deletion', done => {
    const targetTaskId = 'gql-2';

    const observable = client.subscribe({
      query: TASK_DELETED_SUBSCRIPTION,
    });

    const subscription = observable.subscribe({
      next(response) {
        try {
          expect(response.data).toBeDefined();
          expect(response.data.taskDeleted).toBe(targetTaskId);
          subscription.unsubscribe();
          done();
        } catch (err) {
          subscription.unsubscribe();
          done(err);
        }
      },
      error(err) {
        done(err);
      },
    });

    setTimeout(() => {
      client.mutate({
        mutation: DELETE_TASK_MUTATION,
        variables: { id: targetTaskId },
      });
    }, 10);
  });
});
