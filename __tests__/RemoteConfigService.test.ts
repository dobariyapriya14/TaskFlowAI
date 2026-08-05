import {
  isVersionLower,
  REMOTE_CONFIG_DEFAULTS,
  RemoteConfigCoreService,
} from '../src/core/firebase/RemoteConfigCoreService';

jest.mock('@react-native-firebase/remote-config', () => {
  const mockDefaults = {
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

  return {
    getRemoteConfig: jest.fn(() => ({})),
    setDefaults: jest.fn(() => Promise.resolve()),
    setConfigSettings: jest.fn(() => Promise.resolve()),
    fetchAndActivate: jest.fn(() => Promise.resolve(true)),
    onConfigUpdate: jest.fn(),
    getValue: jest.fn((_, key) => ({
      value: (mockDefaults as any)[key],
      source: 'default',
    })),
    getBoolean: jest.fn((_, key) => Boolean((mockDefaults as any)[key])),
    getString: jest.fn((_, key) => String((mockDefaults as any)[key] ?? '')),
    getNumber: jest.fn((_, key) => Number((mockDefaults as any)[key] ?? 0)),
  };
});

describe('RemoteConfigCoreService', () => {
  describe('isVersionLower helper', () => {
    it('should return true when current version is lower than min version', () => {
      expect(isVersionLower('0.0.1', '0.0.2')).toBe(true);
      expect(isVersionLower('1.0.0', '1.1.0')).toBe(true);
      expect(isVersionLower('1.2.3', '2.0.0')).toBe(true);
    });

    it('should return false when current version is equal or greater', () => {
      expect(isVersionLower('0.0.1', '0.0.1')).toBe(false);
      expect(isVersionLower('1.2.0', '1.1.9')).toBe(false);
      expect(isVersionLower('2.0.0', '1.9.9')).toBe(false);
    });

    it('should handle invalid or missing version strings gracefully', () => {
      expect(isVersionLower('', '1.0.0')).toBe(false);
      expect(isVersionLower('1.0.0', '')).toBe(false);
    });
  });

  describe('Service getters and defaults', () => {
    it('should initialize and return initial config state', async () => {
      const state = await RemoteConfigCoreService.init();
      expect(state.isMaintenanceMode).toBe(false);
      expect(state.maintenanceMessage).toBe(
        REMOTE_CONFIG_DEFAULTS.maintenance_message,
      );
      expect(state.minRequiredVersion).toBe('0.0.1');
      expect(state.isForceUpdateRequired).toBe(false);
      expect(state.features.aiTaskSuggestions).toBe(true);
      expect(state.features.darkMode).toBe(false);
    });

    it('should detect force update when app version is lower than min_required_version', () => {
      const state = RemoteConfigCoreService.getState('0.0.0');
      expect(state.isForceUpdateRequired).toBe(true);
    });

    it('should resolve feature flags correctly', () => {
      expect(
        RemoteConfigCoreService.isFeatureEnabled('feature_ai_task_suggestions'),
      ).toBe(true);
      expect(
        RemoteConfigCoreService.isFeatureEnabled('feature_dark_mode'),
      ).toBe(false);
    });
  });
});
