package com.taskflowai

import android.content.Context
import android.os.Build
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class GraphQLNativeModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "GraphQLNativeBridge"
  }

  @ReactMethod
  fun getNativeHeaders(promise: Promise) {
    try {
      val headers = Arguments.createMap()
      headers.putString("X-Native-Platform", "Android")
      headers.putString("X-Native-Device-Model", Build.MODEL)
      headers.putString("X-Native-OS-Version", Build.VERSION.RELEASE)
      headers.putString("X-Native-Security-Token", "native_sec_token_" + System.currentTimeMillis())
      headers.putString("X-Native-Client-Version", "1.0.0")
      promise.resolve(headers)
    } catch (e: Exception) {
      promise.reject("ERR_HEADERS", e.message, e)
    }
  }

  @ReactMethod
  fun cacheGraphQLResponse(key: String, value: String, promise: Promise) {
    try {
      val prefs = reactApplicationContext.getSharedPreferences("GQL_CACHE", Context.MODE_PRIVATE)
      prefs.edit().putString("gql_cache_$key", value).apply()
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("ERR_CACHE_WRITE", e.message, e)
    }
  }

  @ReactMethod
  fun getCachedGraphQLResponse(key: String, promise: Promise) {
    try {
      val prefs = reactApplicationContext.getSharedPreferences("GQL_CACHE", Context.MODE_PRIVATE)
      val cached = prefs.getString("gql_cache_$key", null)
      promise.resolve(cached)
    } catch (e: Exception) {
      promise.reject("ERR_CACHE_READ", e.message, e)
    }
  }

  @ReactMethod
  fun encryptGraphQLPayload(payload: String, promise: Promise) {
    try {
      val encoded = Base64.encodeToString(payload.toByteArray(Charsets.UTF_8), Base64.NO_WRAP)
      promise.resolve("ENC($encoded)")
    } catch (e: Exception) {
      promise.reject("ERR_ENCRYPT", e.message, e)
    }
  }
}
