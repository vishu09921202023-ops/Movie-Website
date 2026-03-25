import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, Animated, Easing } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MoviesScreen from './src/screens/MoviesScreen';
import MovieFormScreen from './src/screens/MovieFormScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SiteLinksScreen from './src/screens/SiteLinksScreen';
import CategoryDetailScreen from './src/screens/CategoryDetailScreen';
import MovieAnalyticsScreen from './src/screens/MovieAnalyticsScreen';
import SearchScreen from './src/screens/SearchScreen';
import InsightsDetailScreen from './src/screens/InsightsDetailScreen';
import { colors, shadows } from './src/utils/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused }) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const glowAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: focused ? 1.15 : 0.9, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [focused]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 2 }}>
      <Animated.Text style={{ fontSize: 22, transform: [{ scale: scaleAnim }] }}>{name}</Animated.Text>
      <Animated.View style={{
        width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.accent, marginTop: 3,
        opacity: glowAnim, transform: [{ scaleX: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }],
        ...shadows.glow(colors.accent),
      }} />
    </View>
  );
};

function MainTabs({ route }) {
  const { token } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(8,8,18,0.95)',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          ...shadows.md,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
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
    // Validate stored token on startup by making a test API call
    AsyncStorage.getItem('admin_token').then(async (t) => {
      if (t) {
        try {
          // Quick validation: try hitting an authenticated endpoint
          const res = await fetch(`${require('./src/utils/api').API_BASE_URL}/admin/analytics`, {
            headers: { Authorization: `Bearer ${t}` },
          });
          if (res.status === 401) {
            // Token expired/invalid — clear it
            await AsyncStorage.removeItem('admin_token');
          } else {
            setToken(t);
          }
        } catch {
          // Network error — still allow offline login attempt with saved token
          setToken(t);
        }
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 36, marginBottom: 12 }}>🎬</Text>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '900' }}>VN Movies HD</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>Loading...</Text>
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
            headerStyle: { backgroundColor: 'rgba(8,8,18,0.95)' },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '800', fontSize: 16 },
            headerShadowVisible: false,
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
              <Stack.Screen
                name="CategoryDetail"
                component={CategoryDetailScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="MovieAnalytics"
                component={MovieAnalyticsScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="InsightsDetail"
                component={InsightsDetailScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
