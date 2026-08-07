import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { ForgotPassword } from '../screens/ForgotPassword';
import { HomeScreen } from '../screens/HomeScreen';
import { GraphQLTasksScreen } from '../screens/GraphQLTasksScreen';
import { MaintenanceScreen } from '../screens/MaintenanceScreen';
import { ForceUpdateScreen } from '../screens/ForceUpdateScreen';
import { useAuth } from '../context/AuthContext';
import {
  RemoteConfigProvider,
  useRemoteConfig,
} from '../context/RemoteConfigContext';
import { Loader } from '../components/Loader';

const Stack = createNativeStackNavigator();

const NavigationContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { config, loading: configLoading } = useRemoteConfig();

  if (authLoading || configLoading) {
    return <Loader />;
  }

  if (config.isMaintenanceMode) {
    return <MaintenanceScreen />;
  }

  if (config.isForceUpdateRequired) {
    return <ForceUpdateScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="GraphQLTasks" component={GraphQLTasksScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const AppNavigator = () => {
  return (
    <RemoteConfigProvider>
      <NavigationContent />
    </RemoteConfigProvider>
  );
};
