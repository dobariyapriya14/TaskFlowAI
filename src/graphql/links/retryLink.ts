import { RetryLink } from '@apollo/client/link/retry';
import { Operation } from '@apollo/client';
import { isTransientError, calculateBackoffDelay } from '../../utils/retry';
import { CrashlyticsService } from '../../core/firebase/CrashlyticsCoreService';

export interface GraphQLRetryLinkOptions {
  /** Maximum number of retry attempts allowed (default: 3) */
  maxAttempts?: number;
  /** Initial delay before first retry in milliseconds (default: 300) */
  initialDelay?: number;
  /** Upper bound maximum delay in milliseconds (default: 3000) */
  maxDelay?: number;
  /** Exponential backoff multiplier factor (default: 2) */
  backoffFactor?: number;
  /** Whether to apply randomized full jitter to delay (default: true) */
  jitter?: boolean;
  /** Optional callback fired on each retry attempt */
  onRetry?: (error: any, operation: Operation, attempt: number) => void;
  /** Optional custom predicate to determine if an operation should be retried */
  retryIf?: (error: any, operation: Operation) => boolean;
}

const NON_RETRYABLE_CODES = new Set([
  'UNAUTHENTICATED',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'BAD_USER_INPUT',
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
]);

const RETRYABLE_GRAPHQL_CODES = new Set([
  'UNAVAILABLE',
  'RESOURCE_EXHAUSTED',
  'DEADLINE_EXCEEDED',
  'THROTTLED',
  'BAD_GATEWAY',
  'SERVICE_UNAVAILABLE',
  'INTERNAL_SERVER_ERROR',
]);

/**
 * Determines whether a GraphQL operational or network error is transient and safe to retry.
 */
export function isRetryableGraphQLError(error: any): boolean {
  if (!error) return false;

  // Inspect GraphQL errors inside error object
  const graphQLErrors =
    error.graphQLErrors || (Array.isArray(error.errors) ? error.errors : null);

  if (
    graphQLErrors &&
    Array.isArray(graphQLErrors) &&
    graphQLErrors.length > 0
  ) {
    for (const err of graphQLErrors) {
      const code = err.extensions?.code;
      if (code && NON_RETRYABLE_CODES.has(code)) {
        return false;
      }
      if (code && RETRYABLE_GRAPHQL_CODES.has(code)) {
        return true;
      }
    }
  }

  // Inspect HTTP status / code on network errors
  const status =
    error.statusCode ||
    error.status ||
    error.response?.status ||
    error.networkError?.statusCode ||
    error.networkError?.status ||
    error.networkError?.response?.status;

  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return false;
  }

  if (
    status === 408 ||
    status === 429 ||
    (typeof status === 'number' && status >= 500 && status <= 599)
  ) {
    return true;
  }

  // Fall back to generic transient error check
  return isTransientError(error) || isTransientError(error.networkError);
}

/**
 * Creates an Apollo RetryLink with exponential backoff, jitter, operation context overrides,
 * and Crashlytics telemetry logging.
 */
export const createRetryLink = (
  options: GraphQLRetryLinkOptions = {},
): RetryLink => {
  const {
    maxAttempts = 3,
    initialDelay = 300,
    maxDelay = 3000,
    backoffFactor = 2,
    jitter = true,
    onRetry,
    retryIf,
  } = options;

  return new RetryLink({
    delay: (count, operation, _error) => {
      const context = operation.getContext();
      const customInitial =
        typeof context?.retry === 'object' &&
        typeof context.retry?.initialDelay === 'number'
          ? context.retry.initialDelay
          : initialDelay;
      const customMaxDelay =
        typeof context?.retry === 'object' &&
        typeof context.retry?.maxDelay === 'number'
          ? context.retry.maxDelay
          : maxDelay;

      return calculateBackoffDelay(
        count,
        customInitial,
        customMaxDelay,
        backoffFactor,
        jitter,
      );
    },
    attempts: (count, operation, error) => {
      const context = operation.getContext();

      // Check context overrides for skipping retry
      if (context?.skipRetry === true || context?.retry === false) {
        return false;
      }

      // Check context overrides for custom maxAttempts
      const effectiveMax =
        typeof context?.retry === 'object' &&
        typeof context.retry?.maxAttempts === 'number'
          ? context.retry.maxAttempts
          : maxAttempts;

      if (count > effectiveMax) {
        return false;
      }

      const shouldRetry = retryIf
        ? retryIf(error, operation)
        : isRetryableGraphQLError(error);

      if (shouldRetry) {
        const opName = operation.operationName || 'Unknown';
        const errMsg = error?.message || String(error);
        const logMsg = `[GraphQL Retry] Retrying operation '${opName}' (Attempt ${count}/${effectiveMax}) due to error: ${errMsg}`;
        console.warn(logMsg);
        try {
          CrashlyticsService.logMessage(logMsg);
        } catch {
          // Crashlytics unavailable
        }

        if (onRetry) {
          try {
            onRetry(error, operation, count);
          } catch {
            // Swallow callback errors
          }
        }

        return true;
      }

      return false;
    },
  });
};

export const retryLink = createRetryLink();
