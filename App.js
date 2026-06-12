import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from './src/store/useAppStore';
import AppNavigator from './src/navigation/AppNavigator';
import { useNotifications } from './src/hooks/useNotifications';
import { loadSounds } from './src/utils/sounds';
import SplashIntro from './src/components/SplashIntro';

function Root() {
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Onboarding');
  const loadState = useAppStore((s) => s.loadState);
  const { requestPermissions, applySchedule } = useNotifications();

  useEffect(() => {
    loadSounds(); // préchargement en parallèle, best-effort
    (async () => {
      try {
        await loadState();
        const { hasOnboarded } = useAppStore.getState();
        setInitialRoute(hasOnboarded ? 'Home' : 'Onboarding');
        if (hasOnboarded) {
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

  return (
    <View style={{ flex: 1 }}>
      {ready && <AppNavigator initialRoute={initialRoute} />}
      {!splashDone && <SplashIntro ready={ready} onDone={() => setSplashDone(true)} />}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Root />
    </GestureHandlerRootView>
  );
}
