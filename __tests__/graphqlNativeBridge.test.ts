import { GraphQLNativeBridge } from '../src/graphql/native/GraphQLNativeBridge';

describe('GraphQLNativeBridge Service', () => {
  it('fetches native headers with fallback values when running in JS runtime', async () => {
    const headers = await GraphQLNativeBridge.getNativeHeaders();

    expect(headers).toBeDefined();
    expect(headers['X-Native-Platform']).toMatch(/iOS|Android/);
    expect(headers['X-Native-Security-Token']).toBeDefined();
    expect(headers['X-Native-Client-Version']).toBeDefined();
  });

  it('handles caching and retrieving values in memory/native storage', async () => {
    const key = 'test_key';
    const value = 'test_payload_value';

    const saveSuccess = await GraphQLNativeBridge.cacheGraphQLResponse(
      key,
      value,
    );
    expect(saveSuccess).toBe(true);

    const cachedValue = await GraphQLNativeBridge.getCachedGraphQLResponse(key);
    expect(cachedValue).toBe(value);
  });

  it('encrypts payload with fallback simulation', async () => {
    const payload = '{"query":"tasks"}';
    const encrypted = await GraphQLNativeBridge.encryptGraphQLPayload(payload);
    expect(encrypted).toContain('ENC');
  });
});
