import { useMemo } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { GraphQLTaskService } from '../services/GraphQLTaskService';

/**
 * Custom React hook that returns a GraphQLTaskService instance wired to the current ApolloClient context.
 */
export const useGraphQLTaskService = (): GraphQLTaskService => {
  const client = useApolloClient();
  return useMemo(() => new GraphQLTaskService(client as any), [client]);
};
