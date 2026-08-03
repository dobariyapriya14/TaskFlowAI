import { getCrashlytics, recordError, log, setUserId, crash } from '@react-native-firebase/crashlytics';

const crashlytics = getCrashlytics();

export const logError = (error: Error) => {
  recordError(crashlytics, error);
};

export const logMessage = (message: string) => {
  log(crashlytics, message);
};

export const setUser = (userId: string) => {
  setUserId(crashlytics, userId);
};

export const triggerCrash = () => {
  crash(crashlytics);
};
