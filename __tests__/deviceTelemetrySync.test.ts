import { ApolloClient, InMemoryCache } from '@apollo/client';
import { MockGraphQLApiLink } from '../src/graphql/mocks/mockLink';
import { GraphQLNativeBridge } from '../src/graphql/native/GraphQLNativeBridge';
import {
  SYNC_DEVICE_TELEMETRY_MUTATION,
  GET_DEVICE_TELEMETRY_QUERY,
} from '../src/graphql/operations';
import { mockServerStore } from '../src/graphql/server/store';

describe('Native Module Device Info & Battery Telemetry Sync', () => {
  let client: ApolloClient<any>;

  beforeEach(() => {
    mockServerStore.resetStore();
    client = new ApolloClient({
      link: new MockGraphQLApiLink(0),
      cache: new InMemoryCache(),
    });
  });

  it('fetches device info and battery telemetry from Native Bridge', async () => {
    const nativeData = await GraphQLNativeBridge.getDeviceInfoAndBattery();

    expect(nativeData).toBeDefined();
    expect(typeof nativeData.batteryLevel).toBe('number');
    expect(typeof nativeData.isCharging).toBe('boolean');
    expect(typeof nativeData.deviceModel).toBe('string');
    expect(typeof nativeData.osVersion).toBe('string');
    expect(typeof nativeData.platform).toBe('string');
  });

  it('syncs native telemetry through SYNC_DEVICE_TELEMETRY_MUTATION via Apollo Client', async () => {
    const nativeData = await GraphQLNativeBridge.getDeviceInfoAndBattery();

    const response = await client.mutate({
      mutation: SYNC_DEVICE_TELEMETRY_MUTATION,
      variables: {
        input: {
          batteryLevel: nativeData.batteryLevel,
          isCharging: nativeData.isCharging,
          deviceModel: nativeData.deviceModel,
          osVersion: nativeData.osVersion,
          platform: nativeData.platform,
        },
      },
    });

    expect(response.data).toBeDefined();
    const synced = response.data.syncDeviceTelemetry;
    expect(synced.id).toBeDefined();
    expect(synced.batteryLevel).toBe(nativeData.batteryLevel);
    expect(synced.isCharging).toBe(nativeData.isCharging);
    expect(synced.deviceModel).toBe(nativeData.deviceModel);
    expect(synced.syncedAt).toBeDefined();
  });

  it('retrieves synced telemetry via GET_DEVICE_TELEMETRY_QUERY', async () => {
    await client.mutate({
      mutation: SYNC_DEVICE_TELEMETRY_MUTATION,
      variables: {
        input: {
          batteryLevel: 0.95,
          isCharging: true,
          deviceModel: 'iPhone 15 Pro',
          osVersion: '17.4',
          platform: 'iOS',
        },
      },
    });

    const queryResponse = await client.query({
      query: GET_DEVICE_TELEMETRY_QUERY,
      fetchPolicy: 'network-only',
    });

    expect(queryResponse.data).toBeDefined();
    const record = queryResponse.data.deviceTelemetry;
    expect(record).not.toBeNull();
    expect(record.batteryLevel).toBe(0.95);
    expect(record.deviceModel).toBe('iPhone 15 Pro');
  });
});
