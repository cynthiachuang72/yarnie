import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { StoreProvider, useStore } from './src/store';
import { colors } from './src/theme';
import CounterScreen from './src/screens/CounterScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import PatternsScreen from './src/screens/PatternsScreen';
import StashScreen from './src/screens/StashScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.background, primary: colors.primary, card: colors.card },
};

const tabIcons: Record<string, string> = {
  Counter: '🔢',
  Projects: '🧶',
  Patterns: '📖',
  Stash: '🧺',
};

function Tabs() {
  const { ready } = useStore();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{tabIcons[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Counter" component={CounterScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Patterns" component={PatternsScreen} />
      <Tab.Screen name="Stash" component={StashScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="dark" />
          <Tabs />
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
