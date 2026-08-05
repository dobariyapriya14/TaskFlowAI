import {
  getAnalytics,
  logEvent,
  logLogin as firebaseLogLogin,
} from '@react-native-firebase/analytics';

const analytics = getAnalytics();

export const AnalyticsService = {
  logLogin: async (method: string = 'email') => {
    await firebaseLogLogin(analytics, { method });
  },

  logTaskCreated: async (params?: {
    priority?: string;
    category?: string;
    [key: string]: any;
  }) => {
    await logEvent(analytics, 'task_created', params);
  },

  logTaskCompleted: async (params?: {
    completed_in?: number;
    [key: string]: any;
  }) => {
    await logEvent(analytics, 'task_completed', params);
  },

  logTaskDeleted: async (params?: { [key: string]: any }) => {
    await logEvent(analytics, 'task_deleted', params);
  },

  logLogout: async () => {
    await logEvent(analytics, 'logout');
  },
};
