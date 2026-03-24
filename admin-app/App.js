import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MoviesScreen from './src/screens/MoviesScreen';
import MovieFormScreen from './src/screens/MovieFormScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SiteLinksScreen from './src/screens/SiteLinksScreen';
import { colors } from './src/utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 20 }}>{name}</Text>
    {focused && (
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent, marginTop: 2 }} />
    )}
  </View>
);

function MainTabs({ route }) {
  const { token } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{ token }}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} /> }}
      />
      <Tab.Screen
        name="Movies"
        component={MoviesScreen}
        initialParams={{ token }}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="🎬" focused={focused} /> }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        initialParams={{ token }}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="📈" focused={focused} /> }}
      />
      <Tab.Screen
        name="Links"
        component={SiteLinksScreen}
        initialParams={{ token }}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="🔗" focused={focused} />, tabBarLabel: 'Site Links' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('admin_token').then((t) => {
      if (t) setToken(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  const navTheme = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, border: colors.border },
  };

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          {!token ? (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onLogin={setToken} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={MainTabs}
                initialParams={{ token }}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MovieForm"
                component={MovieFormScreen}
                initialParams={{ token }}
                options={({ route }) => ({
                  title: route.params?.movieId ? 'Edit Movie' : 'Add Movie',
                })}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
