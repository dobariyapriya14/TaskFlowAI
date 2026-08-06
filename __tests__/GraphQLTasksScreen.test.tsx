import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '@testing-library/react-native';
import { GraphQLTasksScreen } from '../src/screens/GraphQLTasksScreen';
import { GraphQLProvider } from '../src/graphql/GraphQLProvider';
import { createApolloClient } from '../src/graphql/client';

jest.mock('../src/core/firebase/CrashlyticsCoreService', () => ({
  CrashlyticsService: {
    logError: jest.fn(),
    logMessage: jest.fn(),
  },
}));

describe('GraphQLTasksScreen Integration', () => {
  it('renders screen with GraphQLProvider and Apollo client in mock mode', async () => {
    const testClient = createApolloClient({ useMockApi: true, latencyMs: 0 });

    await render(
      <GraphQLProvider client={testClient}>
        <GraphQLTasksScreen />
      </GraphQLProvider>,
    );

    expect(screen.getByTestId('graphql-tasks-screen')).toBeTruthy();
    expect(screen.getByTestId('native-header-card')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Setup GraphQL Apollo Client')).toBeTruthy();
    });
  });

  it('opens modal to create task', async () => {
    const testClient = createApolloClient({ useMockApi: true, latencyMs: 0 });

    await render(
      <GraphQLProvider client={testClient}>
        <GraphQLTasksScreen />
      </GraphQLProvider>,
    );

    const openModalBtn = screen.getByTestId('open-add-graphql-task-modal');
    await fireEvent.press(openModalBtn);

    await waitFor(() => {
      expect(screen.getByTestId('graphql-task-modal')).toBeTruthy();
    });
  });
});
