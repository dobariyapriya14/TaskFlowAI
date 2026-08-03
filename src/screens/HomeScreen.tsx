import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { Button } from '../components/Button';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const HomeScreen = () => {
  const { user } = useAuth();
  const [loadingApi, setLoadingApi] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error(error);
    }
  };

  const testHealthAPI = async () => {
    setLoadingApi(true);
    try {
      // Use standard localhost for iOS simulator or 10.0.2.2 for Android emulator
      // Default firebase emulator port for functions is 5001
      // Replace PROJECT_ID with your actual project ID (taskflowai-c0f40)
      const host = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
      const baseUrl = `http://${host}:5001/taskflowai-c0f40/us-central1/health`;
      
      const response = await fetch(baseUrl);
      const data = await response.json();
      
      Alert.alert('API Response', JSON.stringify(data, null, 2));
    } catch (error: any) {
      Alert.alert('API Error', error.message + '\n\nMake sure your local Firebase emulator is running!');
    } finally {
      setLoadingApi(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>{user?.displayName || user?.email}</Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Test Health API" 
            onPress={testHealthAPI} 
            loading={loadingApi} 
          />
          <Button 
            title="Logout" 
            onPress={handleLogout} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  }
});
