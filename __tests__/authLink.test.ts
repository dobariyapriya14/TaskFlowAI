import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  from,
  gql,
} from '@apollo/client';
import {
  createAuthLink,
  createAuthErrorLink,
  createCombinedAuthLink,
  defaultGetToken,
} from '../src/graphql/links/authLink';
import { getAuth } from '@react-native-firebase/auth';

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
}));

const TEST_QUERY = gql`
  query TestQuery {
    tasks {
      id
      title
    }
  }
`;

const createMockResponseLink = (response: any) => {
  return new ApolloLink(() => {
    return new Observable(observer => {
      observer.next(response);
      observer.complete();
    });
  });
};

describe('Apollo Auth Link', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('defaultGetToken', () => {
    it('returns null if user is not logged in', async () => {
      (getAuth as jest.Mock).mockReturnValue({ currentUser: null });
      const token = await defaultGetToken();
      expect(token).toBeNull();
    });

    it('returns ID token when user is logged in', async () => {
      const getIdToken = jest.fn().mockResolvedValue('firebase-token-123');
      (getAuth as jest.Mock).mockReturnValue({
        currentUser: { getIdToken },
      });

      const token = await defaultGetToken(true);
      expect(getIdToken).toHaveBeenCalledWith(true);
      expect(token).toBe('firebase-token-123');
    });

    it('returns null if getIdToken throws an error', async () => {
      const getIdToken = jest.fn().mockRejectedValue(new Error('Auth error'));
      (getAuth as jest.Mock).mockReturnValue({
        currentUser: { getIdToken },
      });

      const token = await defaultGetToken();
      expect(token).toBeNull();
    });
  });

  describe('createAuthLink', () => {
    it('attaches Bearer authorization header when token is retrieved', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('custom-jwt-token');
      const authLink = createAuthLink({ getToken: mockGetToken });

      let capturedHeaders: Record<string, string> | undefined;
      const captureLink = new ApolloLink((operation, forward) => {
        capturedHeaders = operation.getContext().headers;
        return forward(operation);
      });

      const mockTerminatingLink = createMockResponseLink({
        data: { tasks: [] },
      });

      const client = new ApolloClient({
        link: from([authLink, captureLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await client.query({ query: TEST_QUERY });

      expect(mockGetToken).toHaveBeenCalledWith(false);
      expect(capturedHeaders?.authorization).toBe('Bearer custom-jwt-token');
    });

    it('supports custom header key and prefix', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('secret-token');
      const authLink = createAuthLink({
        getToken: mockGetToken,
        headerName: 'x-auth-token',
        headerPrefix: 'Token ',
      });

      let capturedHeaders: Record<string, string> | undefined;
      const captureLink = new ApolloLink((operation, forward) => {
        capturedHeaders = operation.getContext().headers;
        return forward(operation);
      });

      const mockTerminatingLink = createMockResponseLink({
        data: { tasks: [] },
      });

      const client = new ApolloClient({
        link: from([authLink, captureLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await client.query({ query: TEST_QUERY });

      expect(capturedHeaders?.['x-auth-token']).toBe('Token secret-token');
    });

    it('leaves headers intact when token is null', async () => {
      const mockGetToken = jest.fn().mockResolvedValue(null);
      const authLink = createAuthLink({ getToken: mockGetToken });

      let capturedHeaders: Record<string, string> | undefined;
      const captureLink = new ApolloLink((operation, forward) => {
        capturedHeaders = operation.getContext().headers;
        return forward(operation);
      });

      const mockTerminatingLink = createMockResponseLink({
        data: { tasks: [] },
      });

      const client = new ApolloClient({
        link: from([authLink, captureLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await client.query({ query: TEST_QUERY });

      expect(capturedHeaders?.authorization).toBeUndefined();
    });
  });

  describe('createAuthErrorLink', () => {
    it('intercepts UNAUTHENTICATED error, force-refreshes token, and retries request successfully', async () => {
      let mockCallCount = 0;
      const mockGetToken = jest.fn().mockImplementation(async forceRefresh => {
        return forceRefresh ? 'refreshed-token' : 'old-token';
      });

      const authLink = createAuthLink({ getToken: mockGetToken });
      const authErrorLink = createAuthErrorLink({ getToken: mockGetToken });

      let lastHeaders: Record<string, string> | undefined;

      const mockTerminatingLink = new ApolloLink(operation => {
        mockCallCount++;
        lastHeaders = operation.getContext().headers;

        return new Observable(observer => {
          if (mockCallCount === 1) {
            observer.next({
              errors: [
                {
                  message: 'UNAUTHENTICATED',
                  extensions: { code: 'UNAUTHENTICATED' },
                },
              ],
            });
          } else {
            observer.next({
              data: { tasks: [{ id: '1', title: 'Retried Task' }] },
            });
          }
          observer.complete();
        });
      });

      const client = new ApolloClient({
        link: from([authErrorLink, authLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      const result = await client.query<{
        tasks: { id: string; title: string }[];
      }>({
        query: TEST_QUERY,
      });

      expect(mockCallCount).toBe(2);
      expect(mockGetToken).toHaveBeenCalledWith(true);
      expect(lastHeaders?.authorization).toBe('Bearer refreshed-token');
      expect((result.data as any).tasks[0].title).toBe('Retried Task');
    });

    it('triggers onUnauthenticated callback when token refresh fails', async () => {
      const mockGetToken = jest.fn().mockImplementation(async forceRefresh => {
        return forceRefresh ? null : 'expired-token';
      });

      const onUnauthenticated = jest.fn();

      const authLink = createAuthLink({ getToken: mockGetToken });
      const authErrorLink = createAuthErrorLink({
        getToken: mockGetToken,
        onUnauthenticated,
      });

      const mockTerminatingLink = createMockResponseLink({
        errors: [
          {
            message: 'UNAUTHENTICATED',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
      });

      const client = new ApolloClient({
        link: from([authErrorLink, authLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await expect(client.query({ query: TEST_QUERY })).rejects.toThrow();

      expect(mockGetToken).toHaveBeenCalledWith(true);
      expect(onUnauthenticated).toHaveBeenCalled();
    });

    it('intercepts HTTP 401 network error and force-refreshes token', async () => {
      let mockCallCount = 0;
      const mockGetToken = jest.fn().mockImplementation(async forceRefresh => {
        return forceRefresh ? 'refreshed-network-token' : 'old-network-token';
      });

      const authLink = createAuthLink({ getToken: mockGetToken });
      const authErrorLink = createAuthErrorLink({ getToken: mockGetToken });

      let lastHeaders: Record<string, string> | undefined;

      const mockTerminatingLink = new ApolloLink(operation => {
        mockCallCount++;
        lastHeaders = operation.getContext().headers;

        return new Observable(observer => {
          if (mockCallCount === 1) {
            const networkError: any = new Error('Unauthorized Network Error');
            networkError.statusCode = 401;
            observer.error(networkError);
          } else {
            observer.next({
              data: { tasks: [{ id: '2', title: 'Network Retried Task' }] },
            });
            observer.complete();
          }
        });
      });

      const client = new ApolloClient({
        link: from([authErrorLink, authLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      const result = await client.query<{
        tasks: { id: string; title: string }[];
      }>({
        query: TEST_QUERY,
      });

      expect(mockCallCount).toBe(2);
      expect(mockGetToken).toHaveBeenCalledWith(true);
      expect(lastHeaders?.authorization).toBe('Bearer refreshed-network-token');
      expect((result.data as any).tasks[0].title).toBe('Network Retried Task');
    });
  });

  describe('createCombinedAuthLink', () => {
    it('creates an operational combined link', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('combined-token');
      const combinedLink = createCombinedAuthLink({ getToken: mockGetToken });

      let capturedHeaders: Record<string, string> | undefined;
      const captureLink = new ApolloLink((operation, forward) => {
        capturedHeaders = operation.getContext().headers;
        return forward(operation);
      });

      const mockTerminatingLink = createMockResponseLink({
        data: { tasks: [] },
      });

      const client = new ApolloClient({
        link: from([combinedLink, captureLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await client.query({ query: TEST_QUERY });

      expect(capturedHeaders?.authorization).toBe('Bearer combined-token');
    });
  });
});
