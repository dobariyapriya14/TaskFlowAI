import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  RemoteConfigCoreService,
  RemoteConfigState,
  REMOTE_CONFIG_DEFAULTS,
  isVersionLower,
} from '../core/firebase/RemoteConfigCoreService';

interface RemoteConfigContextType {
  config: RemoteConfigState;
  loading: boolean;
  refetchConfig: () => Promise<void>;
}

const defaultState: RemoteConfigState = {
  isMaintenanceMode: REMOTE_CONFIG_DEFAULTS.is_maintenance_mode,
  maintenanceMessage: REMOTE_CONFIG_DEFAULTS.maintenance_message,
  minRequiredVersion: REMOTE_CONFIG_DEFAULTS.min_required_version,
  isForceUpdateRequired: isVersionLower(
    '0.0.1',
    REMOTE_CONFIG_DEFAULTS.min_required_version,
  ),
  forceUpdateMessage: REMOTE_CONFIG_DEFAULTS.force_update_message,
  storeUrl: REMOTE_CONFIG_DEFAULTS.store_url,
  features: {
    aiTaskSuggestions: REMOTE_CONFIG_DEFAULTS.feature_ai_task_suggestions,
    darkMode: REMOTE_CONFIG_DEFAULTS.feature_dark_mode,
  },
};

const RemoteConfigContext = createContext<RemoteConfigContextType>({
  config: defaultState,
  loading: true,
  refetchConfig: async () => {},
});

export const RemoteConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<RemoteConfigState>(defaultState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    RemoteConfigCoreService.init(updatedConfig => {
      if (isMounted) {
        setConfig(updatedConfig);
      }
    })
      .then(initialConfig => {
        if (isMounted) {
          setConfig(initialConfig);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refetchConfig = async () => {
    setLoading(true);
    const updated = await RemoteConfigCoreService.fetchNow();
    setConfig(updated);
    setLoading(false);
  };

  return (
    <RemoteConfigContext.Provider value={{ config, loading, refetchConfig }}>
      {children}
    </RemoteConfigContext.Provider>
  );
};

export const useRemoteConfig = () => useContext(RemoteConfigContext);
