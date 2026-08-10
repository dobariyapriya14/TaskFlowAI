import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import {
  apolloClient as defaultClient,
  initApolloCachePersist,
  purgeApolloCache,
} from './client';

export interface GraphQLProviderProps {
  client?: ApolloClient;
  persistCache?: boolean;
  children: React.ReactNode;
}

export const GraphQLProvider: React.FC<GraphQLProviderProps> = ({
  client: clientProp,
  persistCache = false,
  children,
}) => {
  const { user } = useAuth();
  const previousUserRef = useRef(user);
  const client = useMemo(() => clientProp ?? defaultClient, [clientProp]);
  const [, setIsCacheRestored] = useState(!persistCache);

  useEffect(() => {
    let isMounted = true;
    if (persistCache && client.cache instanceof InMemoryCache) {
      initApolloCachePersist(client.cache)
        .catch((error: unknown) => {
          console.error(
            'Failed to initialize Apollo cache persistence:',
            error,
          );
        })
        .finally(() => {
          if (isMounted) {
            setIsCacheRestored(true);
          }
        });
    } else {
      setIsCacheRestored(true);
    }

    return () => {
      isMounted = false;
    };
  }, [client, persistCache]);

  useEffect(() => {
    if (previousUserRef.current && !user) {
      Promise.all([
        client.clearStore().catch((error: unknown) => {
          console.error('Failed to clear store:', error);
        }),
        purgeApolloCache().catch((error: unknown) => {
          console.error('Failed to purge persistent cache:', error);
        }),
      ]);
    }
    previousUserRef.current = user;
  }, [client, user]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
