import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Input } from '../components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { authService } from '../features/auth/services/AuthService';
import { handleError } from '../utils/errorHandler';

export const SignupScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.signup(email, password, name);
      // Navigation is handled by auth state observer
    } catch (error: any) {
      handleError(error, 'SignupScreen: handleSignup', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} testID="signup-screen">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Input
          testID="signup-name-input"
          label="Name (optional)"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <Input
          testID="signup-email-input"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          testID="signup-password-input"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Input
          testID="signup-confirm-password-input"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <Button
          testID="signup-submit-button"
          title="Create Account"
          onPress={handleSignup}
          loading={loading}
        />

        <View style={styles.footerLinks}>
          <TouchableOpacity
            testID="navigate-login-button"
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.link}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  footerLinks: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: '#007bff',
    fontSize: 14,
  },
});
