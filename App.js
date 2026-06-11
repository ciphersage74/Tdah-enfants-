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
    loadState().then(async () => {
      const state = useAppStore.getState();
      const { hasOnboarded, profiles } = state;

      if (!hasOnboarded || profiles.length === 0) {
        setInitialRoute('Onboarding');
      } else if (profiles.length > 1) {
        setInitialRoute('ProfileSelect');
      } else {
        setInitialRoute('Home');
      }

      if (hasOnboarded) {
        const granted = await requestPermissions();
        if (granted) await applySchedule();
      }

      setReady(true);
    });
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
