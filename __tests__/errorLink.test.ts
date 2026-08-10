import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  from,
  gql,
} from '@apollo/client';
import { createErrorLink } from '../src/graphql/links/errorLink';
import { CrashlyticsService } from '../src/core/firebase/CrashlyticsCoreService';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logMessage: jest.fn(),
  },
}));

const TEST_QUERY = gql`
  query TestErrorQuery {
    tasks {
      id
      title
    }
  }
`;

describe('Apollo ErrorLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('captures GraphQL errors, logs to Crashlytics and console, and invokes callbacks', async () => {
    const onGraphQLError = jest.fn();
    const onError = jest.fn();

    const errorLink = createErrorLink({
      onGraphQLError,
      onError,
    });

    const mockTerminatingLink = new ApolloLink(() => {
      return new Observable(observer => {
        observer.next({
          errors: [
            {
              message: 'Invalid task ID',
              extensions: { code: 'BAD_USER_INPUT' },
              path: ['tasks', 0],
            },
          ],
        });
        observer.complete();
      });
    });

    const client = new ApolloClient({
      link: from([errorLink, mockTerminatingLink]),
      cache: new InMemoryCache(),
    });

    await expect(client.query({ query: TEST_QUERY })).rejects.toThrow();

    expect(onGraphQLError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(CrashlyticsService.logMessage).toHaveBeenCalledWith(
      expect.stringContaining(
        '[GraphQL Error] Operation: TestErrorQuery, Message: Invalid task ID, Code: BAD_USER_INPUT, Path: tasks.0',
      ),
    );
  });

  it('captures Network error, logs to Crashlytics and console, and invokes callbacks', async () => {
    const onNetworkError = jest.fn();
    const onError = jest.fn();

    const errorLink = createErrorLink({
      onNetworkError,
      onError,
    });

    const mockTerminatingLink = new ApolloLink(() => {
      return new Observable(observer => {
        const netErr: any = new Error('Gateway Timeout');
        netErr.statusCode = 504;
        observer.error(netErr);
      });
    });

    const client = new ApolloClient({
      link: from([errorLink, mockTerminatingLink]),
      cache: new InMemoryCache(),
    });

    await expect(client.query({ query: TEST_QUERY })).rejects.toThrow(
      'Gateway Timeout',
    );

    expect(onNetworkError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(CrashlyticsService.logMessage).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Network Error] Operation: TestErrorQuery, Message: Gateway Timeout, Status: 504',
      ),
    );
  });

  it('respects logToConsole and logToCrashlytics false options', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const errorLink = createErrorLink({
      logToConsole: false,
      logToCrashlytics: false,
    });

    const mockTerminatingLink = new ApolloLink(() => {
      return new Observable(observer => {
        observer.next({
          errors: [
            {
              message: 'Forbidden resource',
              extensions: { code: 'FORBIDDEN' },
            },
          ],
        });
        observer.complete();
      });
    });

    const client = new ApolloClient({
      link: from([errorLink, mockTerminatingLink]),
      cache: new InMemoryCache(),
    });

    await expect(client.query({ query: TEST_QUERY })).rejects.toThrow();

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(CrashlyticsService.logMessage).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
