import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  Observable,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getAuth } from '@react-native-firebase/auth';
import {
  GraphQLNativeBridge,
  NativeGraphQLHeaders,
} from './native/GraphQLNativeBridge';
import { MockGraphQLApiLink } from './mocks/mockLink';
import { CrashlyticsService } from '../core/firebase/CrashlyticsCoreService';

export interface ApolloClientOptions {
  useMockApi?: boolean;
  httpUri?: string;
  latencyMs?: number;
}

export let latestNativeHeaders: NativeGraphQLHeaders | null = null;

// Auth Link: attaches the current Firebase ID token to every GraphQL request
export const authLink = setContext(async (_, { headers = {} }) => {
  try {
    const user = getAuth().currentUser;
    if (!user) {
      return { headers };
    }

    const token = await user.getIdToken();
    return {
      headers: {
        ...headers,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    };
  } catch {
    return { headers };
  }
});

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

// Centralized Error Link
export const errorLink = onError(
  ({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message }) => {
        const errMessage = `[GraphQL Error] Operation: ${operation.operationName}, Message: ${message}`;
        console.warn(errMessage);
        try {
          CrashlyticsService.logMessage(errMessage);
        } catch {
          // Crashlytics unavailable
        }
      });
    }
    if (networkError) {
      const errMessage = `[Network Error] Operation: ${operation.operationName}, Message: ${networkError.message}`;
      console.warn(errMessage);
      try {
        CrashlyticsService.logMessage(errMessage);
      } catch {
        // Crashlytics unavailable
      }
    }
  },
);

export const createApolloClient = (options: ApolloClientOptions = {}) => {
  const {
    useMockApi = true,
    httpUri = 'https://api.taskflowai.com/graphql',
    latencyMs = 0,
  } = options;

  const terminatingLink = useMockApi
    ? new MockGraphQLApiLink(latencyMs)
    : new HttpLink({ uri: httpUri });

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          tasks: {
            merge(_existing, incoming) {
              return incoming;
            },
          },
        },
      },
      GraphQLTask: {
        keyFields: ['id'],
      },
    },
  });

  return new ApolloClient({
    link: from([errorLink, authLink, nativeHeaderLink, terminatingLink]),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
};

export const apolloClient = createApolloClient({ useMockApi: true });
