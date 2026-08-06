import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRemoteConfig } from '../context/RemoteConfigContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ForceUpdateScreen: React.FC = () => {
  const { config } = useRemoteConfig();

  const handleUpdate = () => {
    if (config.storeUrl) {
      Linking.openURL(config.storeUrl).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="force-update-screen">
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚀</Text>
        </View>
        <Text style={styles.title}>Update Required</Text>
        <Text style={styles.message}>
          {config.forceUpdateMessage ||
            'A new version of TaskFlowAI is available. Please update to continue using the app.'}
        </Text>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Required Version: {config.minRequiredVersion}
          </Text>
        </View>

        <TouchableOpacity
          testID="force-update-button"
          style={styles.button}
          onPress={handleUpdate}
        >
          <Text style={styles.buttonText}>Update Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  versionContainer: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  versionText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
