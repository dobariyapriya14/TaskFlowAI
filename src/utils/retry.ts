/**
 * Options for configuring retry behavior with exponential backoff.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay before the first retry in milliseconds (default: 1000) */
  initialDelayMs?: number;
  /** Maximum upper bound delay in milliseconds (default: 10000) */
  maxDelayMs?: number;
  /** Exponential multiplier factor (default: 2) */
  backoffFactor?: number;
  /** Whether to apply randomized full jitter to backoff delay (default: true) */
  jitter?: boolean;
  /** Custom predicate to determine whether an error is retryable */
  shouldRetry?: (error: any, attempt: number) => boolean;
  /** Callback fired on each retry attempt */
  onRetry?: (error: any, attempt: number, delayMs: number) => void;
}

/**
 * Common Firebase and HTTP transient error codes and messages that indicate network or server availability issues.
 */
const TRANSIENT_FIREBASE_CODES = new Set([
  'unavailable',
  'resource-exhausted',
  'deadline-exceeded',
  'network-request-failed',
  'auth/network-request-failed',
  'auth/internal-error',
  'unknown',
  'internal',
]);

const TRANSIENT_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Determines whether an error is transient and safe to retry.
 * @param error The thrown error object or value
 */
export function isTransientError(error: any): boolean {
  if (!error) return false;

  // Check Firebase error code
  const code = error?.code || error?.userInfo?.code;
  if (code && typeof code === 'string') {
    const normalizedCode = code
      .replace(/^firestore\//, '')
      .replace(/^auth\//, '');
    if (
      TRANSIENT_FIREBASE_CODES.has(code) ||
      TRANSIENT_FIREBASE_CODES.has(normalizedCode)
    ) {
      return true;
    }
  }

  // Check HTTP status code
  const status = error?.status || error?.response?.status;
  if (typeof status === 'number' && TRANSIENT_STATUS_CODES.has(status)) {
    return true;
  }

  // Check error message text
  const message = (error?.message || String(error)).toLowerCase();
  const transientKeywords = [
    'network',
    'timeout',
    'econnreset',
    'etimedout',
    'offline',
    'fetch failed',
    'socket',
    'temporarily unavailable',
  ];

  return transientKeywords.some(keyword => message.includes(keyword));
}

/**
 * Calculates exponential backoff delay with optional full jitter.
 */
export function calculateBackoffDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  backoffFactor: number,
  jitter: boolean = true,
): number {
  const calculatedDelay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
  const cappedDelay = Math.min(calculatedDelay, maxDelayMs);

  if (!jitter) {
    return Math.floor(cappedDelay);
  }

  // Full Jitter formula: random value between 0 and cappedDelay
  return Math.floor(Math.random() * cappedDelay);
}

/**
 * Executes an async function and automatically retries upon failure using exponential backoff.
 *
 * @param fn The async operation to execute
 * @param options Retry options configuring delay, max retries, jitter, and error predicates
 * @returns The resolved result of fn
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffFactor = 2,
    jitter = true,
    shouldRetry = isTransientError,
    onRetry,
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;

      const isRetryable = shouldRetry(error, attempt);
      if (attempt > maxRetries || !isRetryable) {
        throw error;
      }

      const delayMs = calculateBackoffDelay(
        attempt,
        initialDelayMs,
        maxDelayMs,
        backoffFactor,
        jitter,
      );

      if (onRetry) {
        try {
          onRetry(error, attempt, delayMs);
        } catch {
          // Ignore errors inside onRetry callback
        }
      }

      await new Promise<void>(resolve => setTimeout(resolve, delayMs));
    }
  }
}
