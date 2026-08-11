import React, { useEffect } from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { ApolloProvider } from '@apollo/client/react';
import { createApolloClient } from '../src/graphql/client';
import { useGraphQLTaskRepository } from '../src/graphql/hooks/useGraphQLTaskRepository';
import { useGraphQLTaskService } from '../src/graphql/hooks/useGraphQLTaskService';
import { GraphQLTaskRepository } from '../src/graphql/repositories/GraphQLTaskRepository';
import { GraphQLTaskService } from '../src/graphql/services/GraphQLTaskService';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('Apollo Hooks Wiring (useGraphQLTaskRepository & useGraphQLTaskService)', () => {
  let client: ReturnType<typeof createApolloClient>;

  beforeEach(() => {
    client = createApolloClient({ useMockApi: true, latencyMs: 0 });
  });

  it('returns a GraphQLTaskRepository instance wired to ApolloClient context', async () => {
    let repository: any = null;

    const TestComponent = () => {
      const repo = useGraphQLTaskRepository();
      useEffect(() => {
        repository = repo;
      }, [repo]);
      return null;
    };

    await act(async () => {
      render(
        <ApolloProvider client={client}>
          <TestComponent />
        </ApolloProvider>,
      );
    });

    await waitFor(() => {
      expect(repository).not.toBeNull();
    });

    expect(repository).toBeInstanceOf(GraphQLTaskRepository);
    expect(repository.getClient()).toBeDefined();
  });

  it('returns a GraphQLTaskService instance wired to ApolloClient context', async () => {
    let service: any = null;

    const TestComponent = () => {
      const srv = useGraphQLTaskService();
      useEffect(() => {
        service = srv;
      }, [srv]);
      return null;
    };

    await act(async () => {
      render(
        <ApolloProvider client={client}>
          <TestComponent />
        </ApolloProvider>,
      );
    });

    await waitFor(() => {
      expect(service).not.toBeNull();
    });

    expect(service).toBeInstanceOf(GraphQLTaskService);
    expect(service.getClient()).toBeDefined();
  });
});
