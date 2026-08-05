import {
  getRemoteConfig,
  setDefaults,
  setConfigSettings,
  fetchAndActivate,
  onConfigUpdate,
  getValue,
  getBoolean as firebaseGetBoolean,
  getString as firebaseGetString,
  getNumber as firebaseGetNumber,
  ConfigValue,
} from '@react-native-firebase/remote-config';

export const REMOTE_CONFIG_DEFAULTS = {
  is_maintenance_mode: false,
  maintenance_message:
    'TaskFlowAI is currently undergoing scheduled maintenance. Please check back shortly.',
  min_required_version: '0.0.1',
  force_update_message:
    'A new version of TaskFlowAI is available. Please update to continue using the app.',
  store_url: 'https://play.google.com/store/apps/details?id=com.taskflowai',
  feature_ai_task_suggestions: true,
  feature_dark_mode: false,
};

export interface RemoteConfigState {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  minRequiredVersion: string;
  isForceUpdateRequired: boolean;
  forceUpdateMessage: string;
  storeUrl: string;
  features: {
    aiTaskSuggestions: boolean;
    darkMode: boolean;
    [key: string]: boolean;
  };
}

/**
 * Compare two semver strings (e.g. "0.0.1" vs "0.0.2").
 * Returns true if currentVersion < minVersion.
 */
export const isVersionLower = (
  currentVersion: string,
  minVersion: string,
): boolean => {
  if (!currentVersion || !minVersion) return false;
  const currentParts = currentVersion.split('.').map(n => parseInt(n, 10) || 0);
  const minParts = minVersion.split('.').map(n => parseInt(n, 10) || 0);
  const maxLength = Math.max(currentParts.length, minParts.length);

  for (let i = 0; i < maxLength; i++) {
    const current = currentParts[i] || 0;
    const min = minParts[i] || 0;
    if (current < min) return true;
    if (current > min) return false;
  }
  return false;
};

const remoteConfigInstance = getRemoteConfig();

export const RemoteConfigCoreService = {
  async init(
    onUpdate?: (state: RemoteConfigState) => void,
  ): Promise<RemoteConfigState> {
    try {
      await setDefaults(remoteConfigInstance, REMOTE_CONFIG_DEFAULTS);
      await setConfigSettings(remoteConfigInstance, {
        minimumFetchIntervalMillis: __DEV__ ? 0 : 3600000,
      });

      await fetchAndActivate(remoteConfigInstance);

      if (onUpdate) {
        onConfigUpdate(remoteConfigInstance, async () => {
          await fetchAndActivate(remoteConfigInstance);
          onUpdate(this.getState());
        });
      }
    } catch {
      // Fallback gracefully to in-app defaults if offline/unreachable
    }

    return this.getState();
  },

  async fetchNow(): Promise<RemoteConfigState> {
    try {
      await fetchAndActivate(remoteConfigInstance);
    } catch {
      // Ignore
    }
    return this.getState();
  },

  getValue(key: string): ConfigValue {
    try {
      return getValue(remoteConfigInstance, key);
    } catch {
      return {
        value: String((REMOTE_CONFIG_DEFAULTS as any)[key] ?? ''),
        source: 'default',
      } as ConfigValue;
    }
  },

  getBoolean(key: string): boolean {
    try {
      return firebaseGetBoolean(remoteConfigInstance, key);
    } catch {
      return Boolean((REMOTE_CONFIG_DEFAULTS as any)[key] ?? false);
    }
  },

  getString(key: string): string {
    try {
      const val = firebaseGetString(remoteConfigInstance, key);
      return val || String((REMOTE_CONFIG_DEFAULTS as any)[key] ?? '');
    } catch {
      return String((REMOTE_CONFIG_DEFAULTS as any)[key] ?? '');
    }
  },

  getNumber(key: string): number {
    try {
      return firebaseGetNumber(remoteConfigInstance, key);
    } catch {
      return Number((REMOTE_CONFIG_DEFAULTS as any)[key] ?? 0);
    }
  },

  isMaintenanceMode(): boolean {
    return this.getBoolean('is_maintenance_mode');
  },

  getMaintenanceMessage(): string {
    return this.getString('maintenance_message');
  },

  getMinRequiredVersion(): string {
    return this.getString('min_required_version');
  },

  isForceUpdateRequired(currentVersion: string = '0.0.1'): boolean {
    const minVersion = this.getMinRequiredVersion();
    return isVersionLower(currentVersion, minVersion);
  },

  getForceUpdateMessage(): string {
    return this.getString('force_update_message');
  },

  getStoreUrl(): string {
    return this.getString('store_url');
  },

  isFeatureEnabled(featureKey: string): boolean {
    return this.getBoolean(featureKey);
  },

  getState(currentVersion: string = '0.0.1'): RemoteConfigState {
    const minVersion = this.getMinRequiredVersion();
    return {
      isMaintenanceMode: this.isMaintenanceMode(),
      maintenanceMessage: this.getMaintenanceMessage(),
      minRequiredVersion: minVersion,
      isForceUpdateRequired: isVersionLower(currentVersion, minVersion),
      forceUpdateMessage: this.getForceUpdateMessage(),
      storeUrl: this.getStoreUrl(),
      features: {
        aiTaskSuggestions: this.isFeatureEnabled('feature_ai_task_suggestions'),
        darkMode: this.isFeatureEnabled('feature_dark_mode'),
      },
    };
  },
};
