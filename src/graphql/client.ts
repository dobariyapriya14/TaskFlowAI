import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  Observable,
  from,
} from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import {
  GraphQLNativeBridge,
  NativeGraphQLHeaders,
} from './native/GraphQLNativeBridge';
import { MockGraphQLApiLink } from './mocks/mockLink';
import {
  authLink,
  createAuthLink,
  createAuthErrorLink,
  createCombinedAuthLink,
  AuthLinkOptions,
  retryLink,
  createRetryLink,
  GraphQLRetryLinkOptions,
  errorLink,
  createErrorLink,
  GraphQLErrorLinkOptions,
} from './links';
import {
  initApolloCachePersist,
  purgeApolloCache,
  getApolloCachePersistor,
  CachePersistOptions,
} from './cachePersist';

export {
  authLink,
  createAuthLink,
  createAuthErrorLink,
  createCombinedAuthLink,
  retryLink,
  createRetryLink,
  errorLink,
  createErrorLink,
  initApolloCachePersist,
  purgeApolloCache,
  getApolloCachePersistor,
};
export type {
  AuthLinkOptions,
  GraphQLRetryLinkOptions,
  GraphQLErrorLinkOptions,
  CachePersistOptions,
};

export interface ApolloClientOptions {
  useMockApi?: boolean;
  httpUri?: string;
  latencyMs?: number;
  authOptions?: AuthLinkOptions;
  retryOptions?: GraphQLRetryLinkOptions;
  errorOptions?: GraphQLErrorLinkOptions;
  cache?: InMemoryCache;
}

export let latestNativeHeaders: NativeGraphQLHeaders | null = null;

// Native Module Link: Intercepts requests and injects native security telemetry headers via Native Bridge
export const nativeHeaderLink = new ApolloLink((operation, forward) => {
  return new Observable(observer => {
    let sub: any = null;

    GraphQLNativeBridge.getNativeHeaders()
      .then(headers => {
        latestNativeHeaders = headers;
        operation.setContext(({ headers: existingHeaders = {} }) => ({
          headers: {
            ...existingHeaders,
            ...headers,
          },
        }));
        sub = forward(operation).subscribe(observer);
      })
      .catch(() => {
        sub = forward(operation).subscribe(observer);
      });

    return () => {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    };
  });
});

export const createApolloCache = (): InMemoryCache => {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          tasks: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
          tasksConnection: relayStylePagination(['category', 'completed']),
        },
      },
      GraphQLTask: {
        keyFields: ['id'],
      },
    },
  });
};

export const createApolloClient = (options: ApolloClientOptions = {}) => {
  const {
    useMockApi = true,
    httpUri = 'https://api.taskflowai.com/graphql',
    latencyMs = 0,
    authOptions,
    retryOptions,
    errorOptions,
    cache = createApolloCache(),
  } = options;

  const activeErrorLink = errorOptions
    ? createErrorLink(errorOptions)
    : errorLink;
  const activeRetryLink = retryOptions
    ? createRetryLink(retryOptions)
    : retryLink;
  const activeAuthLink = authOptions
    ? createCombinedAuthLink(authOptions)
    : createCombinedAuthLink();

  const terminatingLink = useMockApi
    ? new MockGraphQLApiLink(latencyMs)
    : new HttpLink({ uri: httpUri });

  return new ApolloClient({
    link: from([
      activeErrorLink,
      activeRetryLink,
      activeAuthLink,
      nativeHeaderLink,
      terminatingLink,
    ]),
    cache,
  });
};

export const apolloClient = createApolloClient({ useMockApi: true });
