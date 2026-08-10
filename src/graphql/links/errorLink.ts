import { onError } from '@apollo/client/link/error';
import { ApolloLink } from '@apollo/client';
import { CrashlyticsService } from '../../core/firebase/CrashlyticsCoreService';

export interface GraphQLErrorLinkOptions {
  /** Whether to log error details to console.warn (default: true) */
  logToConsole?: boolean;
  /** Whether to send error telemetry logs to Crashlytics (default: true) */
  logToCrashlytics?: boolean;
  /** Optional callback fired specifically when GraphQL errors are returned */
  onGraphQLError?: (errorResponse: any) => void;
  /** Optional callback fired specifically when a network error occurs */
  onNetworkError?: (errorResponse: any) => void;
  /** Optional global error callback fired on any GraphQL or network error */
  onError?: (errorResponse: any) => void;
}

/**
 * Creates an Apollo Error Link that captures, formats, and logs GraphQL and network errors,
 * sending telemetry to Crashlytics and triggering optional callbacks.
 */
export const createErrorLink = (
  options: GraphQLErrorLinkOptions = {},
): ApolloLink => {
  const {
    logToConsole = true,
    logToCrashlytics = true,
    onGraphQLError,
    onNetworkError,
    onError: globalOnError,
  } = options;

  return onError((errorResponse: any) => {
    const { graphQLErrors, networkError, error, operation } = errorResponse;
    const opName = operation?.operationName || 'Unknown';

    const errors =
      graphQLErrors ||
      (error && (error as any).errors) ||
      (error && Array.isArray((error as any).graphQLErrors)
        ? (error as any).graphQLErrors
        : null);

    if (errors && Array.isArray(errors) && errors.length > 0) {
      errors.forEach((err: any) => {
        const code = err.extensions?.code || 'N/A';
        const path =
          err.path && Array.isArray(err.path) ? err.path.join('.') : 'N/A';
        const errMessage = `[GraphQL Error] Operation: ${opName}, Message: ${err.message}, Code: ${code}, Path: ${path}`;

        if (logToConsole) {
          console.warn(errMessage);
        }

        if (logToCrashlytics) {
          try {
            CrashlyticsService.logMessage(errMessage);
          } catch {
            // Crashlytics unavailable
          }
        }
      });

      if (onGraphQLError) {
        try {
          onGraphQLError(errorResponse);
        } catch {
          // Ignore callback exception
        }
      }
    }

    const netErr = networkError || (error && !errors ? error : null);
    if (netErr) {
      const status =
        (netErr as any).statusCode ||
        (netErr as any).status ||
        (netErr as any).response?.status ||
        'N/A';
      const errMessage = `[Network Error] Operation: ${opName}, Message: ${
        netErr.message || 'Unknown network error'
      }, Status: ${status}`;

      if (logToConsole) {
        console.warn(errMessage);
      }

      if (logToCrashlytics) {
        try {
          CrashlyticsService.logMessage(errMessage);
        } catch {
          // Crashlytics unavailable
        }
      }

      if (onNetworkError) {
        try {
          onNetworkError(errorResponse);
        } catch {
          // Ignore callback exception
        }
      }
    }

    if ((errors || netErr) && globalOnError) {
      try {
        globalOnError(errorResponse);
      } catch {
        // Ignore callback exception
      }
    }
  });
};

export const errorLink = createErrorLink();
