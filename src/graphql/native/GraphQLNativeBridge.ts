import { NativeModules, Platform } from 'react-native';

export interface NativeGraphQLHeaders {
  'X-Native-Platform': string;
  'X-Native-Device-Model': string;
  'X-Native-OS-Version': string;
  'X-Native-Security-Token': string;
  'X-Native-Client-Version': string;
}

export interface IGraphQLNativeBridge {
  getNativeHeaders(): Promise<NativeGraphQLHeaders>;
  cacheGraphQLResponse(key: string, value: string): Promise<boolean>;
  getCachedGraphQLResponse(key: string): Promise<string | null>;
  encryptGraphQLPayload(payload: string): Promise<string>;
}

const { GraphQLNativeBridge: NativeModule } = NativeModules;

class GraphQLNativeBridgeService implements IGraphQLNativeBridge {
  private inMemoryCache: Record<string, string> = {};

  async getNativeHeaders(): Promise<NativeGraphQLHeaders> {
    if (NativeModule && typeof NativeModule.getNativeHeaders === 'function') {
      try {
        return await NativeModule.getNativeHeaders();
      } catch {
        // Fall back to JS generated headers if native call fails
      }
    }

    return {
      'X-Native-Platform': Platform.OS === 'ios' ? 'iOS' : 'Android',
      'X-Native-Device-Model':
        Platform.OS === 'ios' ? 'iPhone-Fallback' : 'Android-Fallback',
      'X-Native-OS-Version': String(Platform.Version),
      'X-Native-Security-Token': `js_sec_token_${Date.now()}`,
      'X-Native-Client-Version': '1.0.0-js',
    };
  }

  async cacheGraphQLResponse(key: string, value: string): Promise<boolean> {
    if (
      NativeModule &&
      typeof NativeModule.cacheGraphQLResponse === 'function'
    ) {
      try {
        return await NativeModule.cacheGraphQLResponse(key, value);
      } catch {
        // Fall back
      }
    }
    this.inMemoryCache[key] = value;
    return true;
  }

  async getCachedGraphQLResponse(key: string): Promise<string | null> {
    if (
      NativeModule &&
      typeof NativeModule.getCachedGraphQLResponse === 'function'
    ) {
      try {
        return await NativeModule.getCachedGraphQLResponse(key);
      } catch {
        // Fall back
      }
    }
    return this.inMemoryCache[key] || null;
  }

  async encryptGraphQLPayload(payload: string): Promise<string> {
    if (
      NativeModule &&
      typeof NativeModule.encryptGraphQLPayload === 'function'
    ) {
      try {
        return await NativeModule.encryptGraphQLPayload(payload);
      } catch {
        // Fall back
      }
    }
    return `ENC_JS(${
      Buffer.from ? Buffer.from(payload).toString('base64') : payload
    })`;
  }
}

export const GraphQLNativeBridge = new GraphQLNativeBridgeService();
