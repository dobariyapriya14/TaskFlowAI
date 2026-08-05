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
    recordError(crashlytics, error);
  },

  logMessage: (message: string) => {
    log(crashlytics, message);
  },

  setUser: (userId: string) => {
    setUserId(crashlytics, userId);
  },

  triggerCrash: () => {
    crash(crashlytics);
  },
};
