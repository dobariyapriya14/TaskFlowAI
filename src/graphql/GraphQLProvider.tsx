import React, { useEffect, useMemo, useRef } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { ApolloClient } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { apolloClient as defaultClient } from './client';

export interface GraphQLProviderProps {
  client?: ApolloClient;
  children: React.ReactNode;
}

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({
  client: clientProp,
  children,
}) => {
  const { user } = useAuth();
  const previousUserRef = useRef(user);
  const client = useMemo(() => clientProp ?? defaultClient, [clientProp]);

  useEffect(() => {
    if (previousUserRef.current && !user) {
      void client.clearStore();
    }
    previousUserRef.current = user;
  }, [client, user]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
