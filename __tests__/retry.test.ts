import {
  retryWithBackoff,
  isTransientError,
  calculateBackoffDelay,
} from '../src/utils/retry';

describe('retryWithBackoff Utility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('isTransientError classification', () => {
    it('identifies Firebase transient error codes correctly', () => {
      expect(isTransientError({ code: 'unavailable' })).toBe(true);
      expect(isTransientError({ code: 'resource-exhausted' })).toBe(true);
      expect(isTransientError({ code: 'auth/network-request-failed' })).toBe(
        true,
      );
      expect(isTransientError({ code: 'firestore/deadline-exceeded' })).toBe(
        true,
      );
    });

    it('identifies HTTP transient status codes correctly', () => {
      expect(isTransientError({ status: 500 })).toBe(true);
      expect(isTransientError({ status: 503 })).toBe(true);
      expect(isTransientError({ status: 429 })).toBe(true);
      expect(isTransientError({ status: 404 })).toBe(false);
      expect(isTransientError({ status: 401 })).toBe(false);
    });

    it('identifies transient network error messages correctly', () => {
      expect(isTransientError(new Error('Network request failed'))).toBe(true);
      expect(isTransientError(new Error('ETIMEDOUT connection failed'))).toBe(
        true,
      );
      expect(isTransientError(new Error('Socket hung up'))).toBe(true);
      expect(isTransientError(new Error('User not found'))).toBe(false);
    });

    it('returns false for non-transient errors or null', () => {
      expect(isTransientError(null)).toBe(false);
      expect(isTransientError(undefined)).toBe(false);
      expect(isTransientError({ code: 'auth/wrong-password' })).toBe(false);
      expect(isTransientError({ code: 'permission-denied' })).toBe(false);
    });
  });

  describe('calculateBackoffDelay', () => {
    it('calculates deterministic exponential delay without jitter', () => {
      // attempt 1: 1000 * (2 ^ 0) = 1000
      expect(calculateBackoffDelay(1, 1000, 10000, 2, false)).toBe(1000);
      // attempt 2: 1000 * (2 ^ 1) = 2000
      expect(calculateBackoffDelay(2, 1000, 10000, 2, false)).toBe(2000);
      // attempt 3: 1000 * (2 ^ 2) = 4000
      expect(calculateBackoffDelay(3, 1000, 10000, 2, false)).toBe(4000);
    });

    it('caps backoff delay at maxDelayMs', () => {
      expect(calculateBackoffDelay(10, 1000, 5000, 2, false)).toBe(5000);
    });

    it('applies full jitter when enabled', () => {
      const delay = calculateBackoffDelay(3, 1000, 10000, 2, true);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(4000);
    });
  });

  describe('retryWithBackoff execution flow', () => {
    it('resolves immediately on the first attempt if fn succeeds', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure until success', async () => {
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce({ code: 'unavailable' })
        .mockRejectedValueOnce({ code: 'network-request-failed' })
        .mockResolvedValue('success on 3rd attempt');

      const onRetryMock = jest.fn();

      const promise = retryWithBackoff(mockFn, {
        maxRetries: 3,
        initialDelayMs: 100,
        jitter: false,
        onRetry: onRetryMock,
      });

      // Advance timers for 1st retry (100ms)
      await jest.advanceTimersByTimeAsync(100);
      // Advance timers for 2nd retry (200ms)
      await jest.advanceTimersByTimeAsync(200);

      const result = await promise;

      expect(result).toBe('success on 3rd attempt');
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(onRetryMock).toHaveBeenCalledTimes(2);
      expect(onRetryMock).toHaveBeenNthCalledWith(
        1,
        { code: 'unavailable' },
        1,
        100,
      );
      expect(onRetryMock).toHaveBeenNthCalledWith(
        2,
        { code: 'network-request-failed' },
        2,
        200,
      );
    });

    it('throws error after maxRetries is exhausted', async () => {
      const transientErr = { code: 'unavailable' };
      const mockFn = jest.fn().mockRejectedValue(transientErr);

      const promise = retryWithBackoff(mockFn, {
        maxRetries: 2,
        initialDelayMs: 100,
        jitter: false,
      });

      // Run pending timers for all retries asynchronously
      const catchHandler = jest.fn();
      promise.catch(catchHandler);

      await jest.advanceTimersByTimeAsync(100); // 1st retry
      await jest.advanceTimersByTimeAsync(200); // 2nd retry

      await expect(promise).rejects.toEqual(transientErr);
      expect(mockFn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('does not retry if shouldRetry returns false', async () => {
      const nonTransientErr = { code: 'auth/wrong-password' };
      const mockFn = jest.fn().mockRejectedValue(nonTransientErr);

      await expect(
        retryWithBackoff(mockFn, {
          maxRetries: 3,
        }),
      ).rejects.toEqual(nonTransientErr);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('allows custom shouldRetry predicate', async () => {
      const customErr = new Error('Custom error');
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(customErr)
        .mockResolvedValue('ok');

      const customShouldRetry = jest.fn().mockReturnValue(true);

      const promise = retryWithBackoff(mockFn, {
        maxRetries: 1,
        initialDelayMs: 50,
        jitter: false,
        shouldRetry: customShouldRetry,
      });

      await jest.advanceTimersByTimeAsync(50);

      const result = await promise;

      expect(result).toBe('ok');
      expect(customShouldRetry).toHaveBeenCalledWith(customErr, 1);
    });
  });
});
