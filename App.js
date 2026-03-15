import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import SplashVideoScreen from './src/screens/SplashVideoScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RecoverPasswordScreen from './src/screens/RecoverPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import TermsScreen from './src/screens/TermsScreen';
import ProfileUpdateScreen from './src/screens/ProfileUpdateScreen';
import WordAssociationGame from './src/screens/WordAssociationScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import MentalLoadGame from './src/screens/MentalLoadScreen';
import ChatBotScreen from './src/screens/ChatBotScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isBootstrapping ? (
          <Stack.Screen name="SplashVideo" component={SplashVideoScreen} />
        ) : isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: true, title: 'Home' }} />
            <Stack.Screen
              name="WordAssociationGame"
              component={WordAssociationGame}
              options={{ headerShown: true, title: 'AssociaPalavra' }}
            />
            <Stack.Screen
              name="MentalLoadGame"
              component={MentalLoadGame}
              options={{ headerShown: true, title: 'Carga Mental' }}
            />
            <Stack.Screen
              name="ProfileUpdate"
              component={ProfileUpdateScreen}
              options={{ headerShown: true, title: 'Update Profile' }}
            />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: true, title: 'Terms' }} />
            <Stack.Screen name="ChatBot" component={ChatBotScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="SplashVideo" component={SplashVideoScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: true, title: 'Terms' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
