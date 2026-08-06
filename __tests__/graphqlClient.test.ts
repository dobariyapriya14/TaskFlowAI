import { createApolloClient } from '../src/graphql/client';
import { GET_TASKS_QUERY } from '../src/graphql/operations';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('Apollo Client Setup', () => {
  it('creates client with mock link and executes query with native link headers', async () => {
    const client = createApolloClient({ useMockApi: true, latencyMs: 0 });
    const response = await client.query<{ tasks: any[] }>({
      query: GET_TASKS_QUERY,
    });

    expect(response.data).toBeDefined();
    expect(response.data!.tasks).toBeInstanceOf(Array);
  });
});
