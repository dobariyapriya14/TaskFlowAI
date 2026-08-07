import { ApolloClient, ApolloLink, InMemoryCache, from } from '@apollo/client';
import { createApolloClient, authLink } from '../src/graphql/client';
import { GET_TASKS_QUERY } from '../src/graphql/operations';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';
import { getAuth } from '@react-native-firebase/auth';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('Apollo Client Setup', () => {
  it('authLink attaches Firebase ID token to request headers', async () => {
    const getIdToken = jest.fn().mockResolvedValue('test-firebase-token');
    (getAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'test-uid', getIdToken },
    });

    let capturedHeaders: Record<string, string> | undefined;
    const captureLink = new ApolloLink((operation, forward) => {
      capturedHeaders = operation.getContext().headers;
      return forward(operation);
    });

    const client = new ApolloClient({
      link: from([authLink, captureLink, new MockGraphQLApiLink(0)]),
      cache: new InMemoryCache(),
    });

    await client.query({ query: GET_TASKS_QUERY });

    expect(getIdToken).toHaveBeenCalled();
    expect(capturedHeaders?.authorization).toBe('Bearer test-firebase-token');
  });

  it('creates client with mock link and executes query with native link headers', async () => {
    const client = createApolloClient({ useMockApi: true, latencyMs: 0 });
    const response = await client.query<{ tasks: any[] }>({
      query: GET_TASKS_QUERY,
    });

    expect(response.data).toBeDefined();
    expect(response.data!.tasks).toBeInstanceOf(Array);
  });
});
