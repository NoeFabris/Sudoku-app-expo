import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { GameStateProvider } from '@/contexts/GameStateContext';
import { StatsProvider } from '@/contexts/StatsContext';

export default function RootLayout() {
  useFrameworkReady();
  return (
    <SettingsProvider>
      <GameStateProvider>
        <StatsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </StatsProvider>
      </GameStateProvider>
    </SettingsProvider>
  );
}