import {
  getAnalytics,
  logEvent,
  logLogin as firebaseLogLogin,
} from '@react-native-firebase/analytics';

const analytics = getAnalytics();

export const AnalyticsService = {
  logLogin: async (method: string = 'email') => {
    try {
      await firebaseLogLogin(analytics, { method });
    } catch {
      // Ignore analytics errors in test environments
    }
  },

  logTaskCreated: async (params?: {
    priority?: string;
    category?: string;
    [key: string]: any;
  }) => {
    try {
      await logEvent(analytics, 'task_created', params);
    } catch {
      // Ignore analytics errors in test environments
    }
  },

  logTaskCompleted: async (params?: {
    completed_in?: number;
    [key: string]: any;
  }) => {
    try {
      await logEvent(analytics, 'task_completed', params);
    } catch {
      // Ignore analytics errors in test environments
    }
  },

  logTaskDeleted: async (params?: { [key: string]: any }) => {
    try {
      await logEvent(analytics, 'task_deleted', params);
    } catch {
      // Ignore analytics errors in test environments
    }
  },

  logLogout: async () => {
    try {
      await logEvent(analytics, 'logout');
    } catch {
      // Ignore analytics errors in test environments
    }
  },
};
