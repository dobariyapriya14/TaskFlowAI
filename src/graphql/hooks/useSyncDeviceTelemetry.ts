import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  SYNC_DEVICE_TELEMETRY_MUTATION,
  GET_DEVICE_TELEMETRY_QUERY,
} from '../operations';
import { DeviceTelemetry, DeviceTelemetryInput } from '../schema';
import { GraphQLNativeBridge } from '../native/GraphQLNativeBridge';

export const useSyncDeviceTelemetry = () => {
  const [syncMutation, { loading: syncing, error: syncError }] = useMutation<{
    syncDeviceTelemetry: DeviceTelemetry;
  }>(SYNC_DEVICE_TELEMETRY_MUTATION, {
    refetchQueries: [{ query: GET_DEVICE_TELEMETRY_QUERY }],
  });

  const {
    data: telemetryData,
    loading: loadingTelemetry,
    refetch,
  } = useQuery<{
    deviceTelemetry: DeviceTelemetry | null;
  }>(GET_DEVICE_TELEMETRY_QUERY);

  const [lastSynced, setLastSynced] = useState<DeviceTelemetry | null>(
    telemetryData?.deviceTelemetry || null,
  );

  const syncNativeDeviceTelemetry = useCallback(async () => {
    try {
      const nativeData = await GraphQLNativeBridge.getDeviceInfoAndBattery();
      const input: DeviceTelemetryInput = {
        batteryLevel: nativeData.batteryLevel,
        isCharging: nativeData.isCharging,
        deviceModel: nativeData.deviceModel,
        osVersion: nativeData.osVersion,
        platform: nativeData.platform,
      };

      const result = await syncMutation({
        variables: { input },
      });

      const syncedRecord = result.data?.syncDeviceTelemetry || null;
      if (syncedRecord) {
        setLastSynced(syncedRecord);
      }
      return syncedRecord;
    } catch (err) {
      console.warn('Failed to sync native device telemetry:', err);
      throw err;
    }
  }, [syncMutation]);

  return {
    syncNativeDeviceTelemetry,
    syncedTelemetry: lastSynced || telemetryData?.deviceTelemetry || null,
    syncing,
    loadingTelemetry,
    syncError,
    refetch,
  };
};
