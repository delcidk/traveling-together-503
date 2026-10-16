import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts, BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../src/theme/colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to the login page.
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect away from the login page.
      router.replace('/(app)/');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BarlowCondensed_800ExtraBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
      <Toast />
    </AuthProvider>
  );
}
