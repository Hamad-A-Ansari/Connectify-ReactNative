import { View, ActivityIndicator } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { Stack, useRouter, useSegments } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function InitialLayout() {
  const {isLoaded, isSignedIn} = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    const isAuthScreen = segments[0] === "(auth)";

    if (!isSignedIn && !isAuthScreen) {
      hasNavigated.current = true;
      router.replace("/(auth)/login");
    } else if (isSignedIn && isAuthScreen) {
      hasNavigated.current = true;
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn, segments])

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Stack screenOptions={{headerShown: false}}/>
}