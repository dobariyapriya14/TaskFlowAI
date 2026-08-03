import { getAnalytics, logEvent, logLogin as firebaseLogLogin } from '@react-native-firebase/analytics';

const analytics = getAnalytics();

export const logLogin = async (method: string = 'email') => {
  await firebaseLogLogin(analytics, { method });
};

export const logTaskCreated = async (params?: { priority?: string; category?: string; [key: string]: any }) => {
  logEvent(analytics, 'task_created', params);
};

export const logTaskCompleted = async (params?: { completed_in?: number; [key: string]: any }) => {
  logEvent(analytics, 'task_completed', params);
};

export const logTaskDeleted = async (params?: { [key: string]: any }) => {
  logEvent(analytics, 'task_deleted', params);
};

export const logLogout = async () => {
  logEvent(analytics, 'logout');
};
