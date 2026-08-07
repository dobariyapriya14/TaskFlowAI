import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  Observable,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import {
  GraphQLNativeBridge,
  NativeGraphQLHeaders,
} from './native/GraphQLNativeBridge';
import { MockGraphQLApiLink } from './mocks/mockLink';
import { CrashlyticsService } from '../core/firebase/CrashlyticsCoreService';
import {
  authLink,
  createAuthLink,
  createAuthErrorLink,
  createCombinedAuthLink,
  AuthLinkOptions,
} from './links/authLink';

export {
  authLink,
  createAuthLink,
  createAuthErrorLink,
  createCombinedAuthLink,
};
export type { AuthLinkOptions };

export interface ApolloClientOptions {
  useMockApi?: boolean;
  httpUri?: string;
  latencyMs?: number;
  authOptions?: AuthLinkOptions;
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

// Centralized Error Link
export const errorLink = onError((errorResponse: any) => {
  const { graphQLErrors, networkError, error, operation } = errorResponse;
  const opName = operation?.operationName || 'Unknown';

  const errors =
    graphQLErrors ||
    (error && (error as any).errors) ||
    (error && Array.isArray((error as any).graphQLErrors)
      ? (error as any).graphQLErrors
      : null);

  if (errors && Array.isArray(errors)) {
    errors.forEach((err: any) => {
      const errMessage = `[GraphQL Error] Operation: ${opName}, Message: ${err.message}`;
      console.warn(errMessage);
      try {
        CrashlyticsService.logMessage(errMessage);
      } catch {
        // Crashlytics unavailable
      }
    });
  }

  const netErr = networkError || (error && !errors ? error : null);
  if (netErr) {
    const errMessage = `[Network Error] Operation: ${opName}, Message: ${netErr.message}`;
    console.warn(errMessage);
    try {
      CrashlyticsService.logMessage(errMessage);
    } catch {
      // Crashlytics unavailable
    }
  }
});

export const createApolloClient = (options: ApolloClientOptions = {}) => {
  const {
    useMockApi = true,
    httpUri = 'https://api.taskflowai.com/graphql',
    latencyMs = 0,
    authOptions,
  } = options;

  const activeAuthLink = authOptions
    ? createCombinedAuthLink(authOptions)
    : createCombinedAuthLink();

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
    link: from([errorLink, activeAuthLink, nativeHeaderLink, terminatingLink]),
    cache,
  });
};

export const apolloClient = createApolloClient({ useMockApi: true });
