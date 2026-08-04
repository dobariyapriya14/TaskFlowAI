import { Alert } from 'react-native';
import { logError, logMessage } from '../services/crashlytics';

/**
 * Centralized error handler
 * @param error The error object or string
 * @param context A descriptive string of where the error occurred
 * @param showAlert Whether to show a user-facing Alert dialog
 */
export const handleError = (
  error: unknown,
  context: string = 'Unknown context',
  showAlert: boolean = false,
) => {
  let err: Error;

  if (error instanceof Error) {
    err = error;
  } else if (typeof error === 'string') {
    err = new Error(error);
  } else {
    err = new Error(JSON.stringify(error));
  }

  // 1. Log custom breadcrumb context to Crashlytics
  logMessage(`[Error Context]: ${context} | Message: ${err.message}`);

  // 2. Record the non-fatal error to Crashlytics if not already reported
  if (!(err as any)._isReported) {
    logError(err);
    (err as any)._isReported = true;
  }

  // 3. Log to console for local development
  console.error(`[ErrorHandler] ${context}:`, err);

  // 4. Optionally show an Alert to the user
  if (showAlert) {
    Alert.alert(
      'Error',
      err.message || 'Something went wrong. Please try again.',
    );
  }
};
