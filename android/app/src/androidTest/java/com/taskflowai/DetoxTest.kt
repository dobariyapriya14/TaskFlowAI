package com.taskflowai

import com.wix.detox.Detox
import com.wix.detox.config.DetoxConfig
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.rule.ActivityTestRule
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
@LargeTest
class DetoxTest {

    @get:Rule
    val activityRule = ActivityTestRule(MainActivity::class.java, false, false)

    @Test
    fun runDetoxTests() {
        val detoxConfig = DetoxConfig().apply {
            idlePolicyConfig.masterTimeoutSec = 90
            idlePolicyConfig.idleResourceTimeoutSec = 60
        }
        Detox.runTests(activityRule, detoxConfig)
    }
}
