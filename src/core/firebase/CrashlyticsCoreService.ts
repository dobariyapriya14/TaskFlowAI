import {
  getCrashlytics,
  recordError,
  log,
  setUserId,
  crash,
} from '@react-native-firebase/crashlytics';

const crashlytics = getCrashlytics();

export const CrashlyticsService = {
  logError: (error: Error) => {
    try {
      recordError(crashlytics, error);
    } catch {
      // Ignore
    }
  },

  logMessage: (message: string) => {
    try {
      log(crashlytics, message);
    } catch {
      // Ignore
    }
  },

  setUser: (userId: string) => {
    try {
      setUserId(crashlytics, userId);
    } catch {
      // Ignore
    }
  },

  triggerCrash: () => {
    crash(crashlytics);
  },
};
