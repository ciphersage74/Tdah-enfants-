import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from './src/store/useAppStore';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';
import { useNotifications } from './src/hooks/useNotifications';

function Root() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Onboarding');
  const loadState = useAppStore((s) => s.loadState);
  const { requestPermissions, applySchedule } = useNotifications();

  useEffect(() => {
    (async () => {
      try {
        await loadState();
        const { hasOnboarded } = useAppStore.getState();
        setInitialRoute(hasOnboarded ? 'Home' : 'Onboarding');
        if (hasOnboarded) {
          // Échec des notifications ≠ app bloquée sur le spinner
          try {
            const granted = await requestPermissions();
            if (granted) await applySchedule();
          } catch (_) {}
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  return <AppNavigator initialRoute={initialRoute} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Root />
    </GestureHandlerRootView>
  );
}
