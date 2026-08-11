import { useState, useEffect, useCallback } from 'react';
import { networkStatusService } from '../offline/NetworkStatusService';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    networkStatusService.isOnline(),
  );

  useEffect(() => {
    const unsubscribe = networkStatusService.subscribe(status => {
      setIsOnline(status);
    });
    return unsubscribe;
  }, []);

  const setOnline = useCallback((status: boolean) => {
    networkStatusService.setOnline(status);
  }, []);

  const toggleOffline = useCallback(() => {
    return networkStatusService.toggleOffline();
  }, []);

  return {
    isOnline,
    setOnline,
    toggleOffline,
  };
};
