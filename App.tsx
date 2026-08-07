import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import { GraphQLProvider } from './src/graphql/GraphQLProvider';
import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  return (
    <AuthProvider>
      <GraphQLProvider>
        <AppNavigator />
      </GraphQLProvider>
    </AuthProvider>
  );
}

export default App;
