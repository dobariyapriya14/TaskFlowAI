import Foundation
import React

@objc(GraphQLNativeBridge)
class GraphQLNativeBridge: NSObject {
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc(getNativeHeaders:withRejecter:)
  func getNativeHeaders(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let systemVersion = UIDevice.current.systemVersion
    let model = UIDevice.current.model
    let nativeToken = "native_sec_token_" + String(Int(Date().timeIntervalSince1990))
    
    let headers: [String: Any] = [
      "X-Native-Platform": "iOS",
      "X-Native-Device-Model": model,
      "X-Native-OS-Version": systemVersion,
      "X-Native-Security-Token": nativeToken,
      "X-Native-Client-Version": "1.0.0"
    ]
    
    resolve(headers)
  }
  
  @objc(cacheGraphQLResponse:value:withResolver:withRejecter:)
  func cacheGraphQLResponse(_ key: String, value: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    UserDefaults.standard.set(value, forKey: "gql_cache_" + key)
    resolve(true)
  }
  
  @objc(getCachedGraphQLResponse:withResolver:withRejecter:)
  func getCachedGraphQLResponse(_ key: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let cachedValue = UserDefaults.standard.string(forKey: "gql_cache_" + key)
    resolve(cachedValue)
  }

  @objc(encryptGraphQLPayload:withResolver:withRejecter:)
  func encryptGraphQLPayload(_ payload: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let encrypted = "ENC(" + Data(payload.utf8).base64EncodedString() + ")"
    resolve(encrypted)
  }
}
