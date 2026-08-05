import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';

const SignupScreenLazy = React.lazy(() =>
  import('../screens/SignupScreen').then(module => ({
    default: module.SignupScreen,
  })),
);
const ForgotPasswordLazy = React.lazy(() =>
  import('../screens/ForgotPassword').then(module => ({
    default: module.ForgotPassword,
  })),
);

const withSuspense = (Component: React.ComponentType<any>) => (props: any) =>
  (
    <Suspense fallback={<Loader />}>
      <Component {...props} />
    </Suspense>
  );

const LazySignupScreen = withSuspense(SignupScreenLazy);
const LazyForgotPasswordScreen = withSuspense(ForgotPasswordLazy);

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={LazySignupScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={LazyForgotPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
