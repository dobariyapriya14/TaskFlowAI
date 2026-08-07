import { useMemo } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { GraphQLTaskRepository } from '../repositories/GraphQLTaskRepository';

/**
 * Custom React hook that returns a GraphQLTaskRepository instance wired to the current ApolloClient context.
 */
export const useGraphQLTaskRepository = (): GraphQLTaskRepository => {
  const client = useApolloClient();
  return useMemo(() => new GraphQLTaskRepository(client as any), [client]);
};
