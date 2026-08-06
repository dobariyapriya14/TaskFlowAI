#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(GraphQLNativeBridge, NSObject)

RCT_EXTERN_METHOD(getNativeHeaders:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cacheGraphQLResponse:(NSString *)key
                  value:(NSString *)value
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCachedGraphQLResponse:(NSString *)key
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(encryptGraphQLPayload:(NSString *)payload
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

@end
