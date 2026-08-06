import React from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { ApolloClient } from '@apollo/client';
import { apolloClient as defaultClient } from './client';

export interface GraphQLProviderProps {
  client?: ApolloClient<any>;
  children: React.ReactNode;
}

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({
  client = defaultClient,
  children,
}) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
