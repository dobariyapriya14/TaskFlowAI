import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
  from,
  gql,
} from '@apollo/client';
import {
  createRetryLink,
  isRetryableGraphQLError,
} from '../src/graphql/links/retryLink';
import { CrashlyticsService } from '../src/core/firebase/CrashlyticsCoreService';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logMessage: jest.fn(),
  },
}));

const TEST_QUERY = gql`
  query TestRetryQuery {
    tasks {
      id
      title
    }
  }
`;

describe('Apollo RetryLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isRetryableGraphQLError classification', () => {
    it('returns true for network transient errors', () => {
      expect(isRetryableGraphQLError(new Error('Network request failed'))).toBe(
        true,
      );
      expect(isRetryableGraphQLError(new Error('ETIMEDOUT connection'))).toBe(
        true,
      );
      expect(isRetryableGraphQLError({ statusCode: 503 })).toBe(true);
      expect(isRetryableGraphQLError({ statusCode: 429 })).toBe(true);
    });

    it('returns true for transient GraphQL error extensions', () => {
      const err = {
        graphQLErrors: [
          {
            message: 'Service Unavailable',
            extensions: { code: 'UNAVAILABLE' },
          },
        ],
      };
      expect(isRetryableGraphQLError(err)).toBe(true);
    });

    it('returns false for non-retryable GraphQL codes and status codes', () => {
      const authErr = {
        graphQLErrors: [
          {
            message: 'Unauthenticated',
            extensions: { code: 'UNAUTHENTICATED' },
          },
        ],
      };
      expect(isRetryableGraphQLError(authErr)).toBe(false);
      expect(isRetryableGraphQLError({ statusCode: 401 })).toBe(false);
      expect(isRetryableGraphQLError({ statusCode: 400 })).toBe(false);
    });

    it('returns false for null or undefined errors', () => {
      expect(isRetryableGraphQLError(null)).toBe(false);
      expect(isRetryableGraphQLError(undefined)).toBe(false);
    });
  });

  describe('createRetryLink execution flow', () => {
    it('retries transient network error until success within maxAttempts', async () => {
      let attemptsCount = 0;
      const onRetry = jest.fn();

      const retryLink = createRetryLink({
        maxAttempts: 3,
        initialDelay: 1,
        jitter: false,
        onRetry,
      });

      const mockTerminatingLink = new ApolloLink(() => {
        attemptsCount++;
        return new Observable(observer => {
          if (attemptsCount < 3) {
            observer.error(new Error('Network request failed'));
          } else {
            observer.next({
              data: { tasks: [{ id: '1', title: 'Task after retries' }] },
            });
            observer.complete();
          }
        });
      });

      const client = new ApolloClient({
        link: from([retryLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      const result = await client.query<{
        tasks: { id: string; title: string }[];
      }>({
        query: TEST_QUERY,
      });

      expect(attemptsCount).toBe(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(result.data.tasks[0].title).toBe('Task after retries');
      expect(CrashlyticsService.logMessage).toHaveBeenCalledWith(
        expect.stringContaining('[GraphQL Retry] Retrying operation'),
      );
    });

    it('throws error when retries exceed maxAttempts', async () => {
      let attemptsCount = 0;

      const retryLink = createRetryLink({
        maxAttempts: 2,
        initialDelay: 1,
        jitter: false,
      });

      const mockTerminatingLink = new ApolloLink(() => {
        attemptsCount++;
        return new Observable(observer => {
          observer.error(new Error('Network request failed'));
        });
      });

      const client = new ApolloClient({
        link: from([retryLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await expect(client.query({ query: TEST_QUERY })).rejects.toThrow(
        'Network request failed',
      );

      // Initial attempt (1) + 2 retries = 3 calls
      expect(attemptsCount).toBe(3);
    });

    it('skips retries when context skipRetry or retry: false is set', async () => {
      let attemptsCount = 0;

      const retryLink = createRetryLink({
        maxAttempts: 3,
        initialDelay: 1,
        jitter: false,
      });

      const mockTerminatingLink = new ApolloLink(() => {
        attemptsCount++;
        return new Observable(observer => {
          observer.error(new Error('Network request failed'));
        });
      });

      const client = new ApolloClient({
        link: from([retryLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await expect(
        client.query({
          query: TEST_QUERY,
          context: { skipRetry: true },
        }),
      ).rejects.toThrow();

      expect(attemptsCount).toBe(1);
    });

    it('honors context.retry object for custom maxAttempts', async () => {
      let attemptsCount = 0;

      const retryLink = createRetryLink({
        maxAttempts: 1,
        initialDelay: 1,
        jitter: false,
      });

      const mockTerminatingLink = new ApolloLink(() => {
        attemptsCount++;
        return new Observable(observer => {
          observer.error(new Error('Network request failed'));
        });
      });

      const client = new ApolloClient({
        link: from([retryLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await expect(
        client.query({
          query: TEST_QUERY,
          context: { retry: { maxAttempts: 4, initialDelay: 1 } },
        }),
      ).rejects.toThrow();

      // Initial attempt (1) + 4 retries = 5 calls
      expect(attemptsCount).toBe(5);
    });

    it('does not retry non-retryable GraphQL errors like UNAUTHENTICATED', async () => {
      let attemptsCount = 0;

      const retryLink = createRetryLink({
        maxAttempts: 3,
        initialDelay: 1,
        jitter: false,
      });

      const mockTerminatingLink = new ApolloLink(() => {
        attemptsCount++;
        return new Observable(observer => {
          observer.next({
            errors: [
              {
                message: 'Unauthenticated user',
                extensions: { code: 'UNAUTHENTICATED' },
              },
            ],
          });
          observer.complete();
        });
      });

      const client = new ApolloClient({
        link: from([retryLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await expect(client.query({ query: TEST_QUERY })).rejects.toThrow();

      expect(attemptsCount).toBe(1);
    });

    it('supports custom retryIf predicate', async () => {
      let attemptsCount = 0;
      const customRetryIf = jest.fn().mockImplementation(error => {
        return error.message === 'Custom Retryable Error';
      });

      const retryLink = createRetryLink({
        maxAttempts: 2,
        initialDelay: 1,
        jitter: false,
        retryIf: customRetryIf,
      });

      const mockTerminatingLink = new ApolloLink(() => {
        attemptsCount++;
        return new Observable(observer => {
          if (attemptsCount === 1) {
            observer.error(new Error('Custom Retryable Error'));
          } else {
            observer.next({ data: { tasks: [] } });
            observer.complete();
          }
        });
      });

      const client = new ApolloClient({
        link: from([retryLink, mockTerminatingLink]),
        cache: new InMemoryCache(),
      });

      await client.query({ query: TEST_QUERY });

      expect(attemptsCount).toBe(2);
      expect(customRetryIf).toHaveBeenCalled();
    });
  });
});
