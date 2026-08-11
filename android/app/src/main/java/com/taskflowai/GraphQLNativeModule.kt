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

  @ReactMethod
  fun getDeviceInfoAndBattery(promise: Promise) {
    try {
      val intentFilter = android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED)
      val batteryStatus = reactApplicationContext.registerReceiver(null, intentFilter)
      val level = batteryStatus?.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1) ?: -1
      val scale = batteryStatus?.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1) ?: -1
      val batteryPct = if (level >= 0 && scale > 0) level / scale.toFloat() else 0.90f

      val status = batteryStatus?.getIntExtra(android.os.BatteryManager.EXTRA_STATUS, -1) ?: -1
      val isCharging = status == android.os.BatteryManager.BATTERY_STATUS_CHARGING ||
          status == android.os.BatteryManager.BATTERY_STATUS_FULL

      val telemetry = Arguments.createMap()
      telemetry.putDouble("batteryLevel", batteryPct.toDouble())
      telemetry.putBoolean("isCharging", isCharging)
      telemetry.putString("deviceModel", Build.MODEL)
      telemetry.putString("osVersion", Build.VERSION.RELEASE)
      telemetry.putString("platform", "Android")

      promise.resolve(telemetry)
    } catch (e: Exception) {
      promise.reject("ERR_BATTERY_INFO", e.message, e)
    }
  }
}
