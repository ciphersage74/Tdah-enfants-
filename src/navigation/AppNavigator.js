import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileSelectScreen from '../screens/ProfileSelectScreen';
import HomeScreen from '../screens/HomeScreen';
import QuestScreen from '../screens/QuestScreen';
import CelebrationScreen from '../screens/CelebrationScreen';
import ParentPinScreen from '../screens/ParentPinScreen';
import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import PaywallScreen from '../screens/PaywallScreen';
import BadgesScreen from '../screens/BadgesScreen';
import ShopScreen from '../screens/ShopScreen';
import RewardsScreen from '../screens/RewardsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ initialRoute }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="ProfileSelect" component={ProfileSelectScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Quest"
          component={QuestScreen}
          options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
        />
        <Stack.Screen
          name="Celebration"
          component={CelebrationScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="ParentPin"
          component={ParentPinScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="ParentDashboard"
          component={ParentDashboardScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Badges" component={BadgesScreen} />
        <Stack.Screen
          name="Shop"
          component={ShopScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
