import { ApolloLink, Observable, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getAuth } from '@react-native-firebase/auth';

export interface AuthLinkOptions {
  /** Custom token getter function. Defaults to Firebase Auth `getIdToken` */
  getToken?: (forceRefresh?: boolean) => Promise<string | null>;
  /** Custom header name. Defaults to 'authorization' */
  headerName?: string;
  /** Custom header prefix. Defaults to 'Bearer ' */
  headerPrefix?: string;
  /** Callback fired when authentication fails and cannot be recovered */
  onUnauthenticated?: () => void;
}

export const defaultGetToken = async (
  forceRefresh = false,
): Promise<string | null> => {
  try {
    const user = getAuth().currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
};

/**
 * Apollo Link that attaches the authentication token to outgoing requests.
 * Preserves existing authorization headers if already set on request context.
 */
export const createAuthLink = (options: AuthLinkOptions = {}) => {
  const {
    getToken = defaultGetToken,
    headerName = 'authorization',
    headerPrefix = 'Bearer ',
  } = options;

  return setContext(async (_, { headers = {} }) => {
    try {
      const existingAuth =
        headers[headerName] ||
        headers[headerName.toLowerCase()] ||
        headers[headerName.toUpperCase()];

      if (existingAuth) {
        return { headers };
      }

      const token = await getToken(false);
      if (!token) {
        return { headers };
      }

      return {
        headers: {
          ...headers,
          [headerName]: `${headerPrefix}${token}`,
        },
      };
    } catch {
      return { headers };
    }
  });
};

/**
 * Apollo Error Link that intercepts 401 / UNAUTHENTICATED errors,
 * force-refreshes the token, and retries the failed GraphQL operation.
 */
export const createAuthErrorLink = (options: AuthLinkOptions = {}) => {
  const {
    getToken = defaultGetToken,
    headerName = 'authorization',
    headerPrefix = 'Bearer ',
    onUnauthenticated,
  } = options;

  return onError((errorResponse: any) => {
    const { graphQLErrors, networkError, error, operation, forward } =
      errorResponse;
    let isUnauthenticated = false;

    const errorsToInspect =
      graphQLErrors ||
      (error && (error as any).errors) ||
      (error && Array.isArray((error as any).graphQLErrors)
        ? (error as any).graphQLErrors
        : null);

    if (errorsToInspect && Array.isArray(errorsToInspect)) {
      for (const err of errorsToInspect) {
        const code = err.extensions?.code;
        const msg = err.message?.toLowerCase() || '';
        if (
          code === 'UNAUTHENTICATED' ||
          code === 'UNAUTHORIZED' ||
          msg.includes('unauthorized') ||
          msg.includes('unauthenticated')
        ) {
          isUnauthenticated = true;
          break;
        }
      }
    }

    const netErr = networkError || (error && !errorsToInspect ? error : null);
    if (netErr) {
      const status =
        (netErr as any).statusCode ||
        (netErr as any).status ||
        (netErr as any).response?.status;
      const msg = (netErr as any).message?.toLowerCase() || '';
      if (
        status === 401 ||
        msg.includes('unauthorized') ||
        msg.includes('unauthenticated')
      ) {
        isUnauthenticated = true;
      }
    }

    if (isUnauthenticated) {
      return new Observable(observer => {
        let sub: { unsubscribe?: () => void } | null = null;

        getToken(true)
          .then(newToken => {
            if (!newToken) {
              if (onUnauthenticated) {
                onUnauthenticated();
              }
              observer.error(netErr || new Error('User is unauthenticated'));
              return;
            }

            operation.setContext(
              ({ headers = {} }: { headers?: Record<string, string> }) => ({
                headers: {
                  ...headers,
                  [headerName]: `${headerPrefix}${newToken}`,
                },
              }),
            );

            sub = forward(operation).subscribe(observer);
          })
          .catch(err => {
            if (onUnauthenticated) {
              onUnauthenticated();
            }
            observer.error(err);
          });

        return () => {
          if (sub && sub.unsubscribe) {
            sub.unsubscribe();
          }
        };
      });
    }
  });
};

/**
 * Creates a combined Auth & Auth Error Link stack.
 */
export const createCombinedAuthLink = (
  options: AuthLinkOptions = {},
): ApolloLink => {
  return from([createAuthErrorLink(options), createAuthLink(options)]);
};

export const authLink = createAuthLink();
