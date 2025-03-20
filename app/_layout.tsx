import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

export default function RootLayout() {

  return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaProvider>
  );
}