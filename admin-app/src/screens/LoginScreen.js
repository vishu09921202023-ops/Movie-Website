import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Animated, Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';
import { colors, shadows } from '../utils/theme';
import AnimatedBackground from '../components/AnimatedBackground';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const input1Slide = useRef(new Animated.Value(40)).current;
  const input1Opacity = useRef(new Animated.Value(0)).current;
  const input2Slide = useRef(new Animated.Value(40)).current;
  const input2Opacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.8)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardSlide, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.stagger(150, [
        Animated.parallel([
          Animated.timing(input1Slide, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(input1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(input2Slide, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(input2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(btnScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
          Animated.timing(btnOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const data = await api.login(username, password);
      if (data.token) {
        await AsyncStorage.setItem('admin_token', data.token);
        onLogin(data.token);
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server. Make sure the backend is running and the API URL is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View style={[styles.logoArea, { transform: [{ scale: logoScale }, { rotate: spin }] }]}>
          <View style={styles.logoBg}>
            <Text style={styles.logoText}>VN</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: titleOpacity, alignItems: 'center', marginBottom: 32 }}>
          <Text style={styles.title}>VN Movies HD</Text>
          <Text style={styles.subtitle}>Admin Control Center</Text>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>SECURE LOGIN</Text>
            <View style={styles.dividerLine} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
          <View style={styles.cardAccent} />

          <Animated.View style={{ opacity: input1Opacity, transform: [{ translateX: input1Slide }] }}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>USERNAME</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput style={styles.input} value={username} onChangeText={setUsername}
                  placeholder="Enter username" placeholderTextColor={colors.textDim} autoCapitalize="none" />
              </View>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: input2Opacity, transform: [{ translateX: input2Slide }] }}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput style={styles.input} value={password} onChangeText={setPassword}
                  placeholder="Enter password" placeholderTextColor={colors.textDim} secureTextEntry />
              </View>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: btnOpacity, transform: [{ scale: Animated.multiply(btnScale, pressAnim) }] }}>
            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}
              onPressIn={() => Animated.spring(pressAnim, { toValue: 0.95, friction: 8, useNativeDriver: true }).start()}
              onPressOut={() => Animated.spring(pressAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start()}
              activeOpacity={0.9}>
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>{loading ? '⏳ Signing in...' : '🚀 Sign In'}</Text>
              </View>
              <Animated.View style={[styles.btnGlow, { opacity: glowAnim }]} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.Text style={[styles.footer, { opacity: titleOpacity }]}>
          Powered by VN Movies HD Engine
        </Animated.Text>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 16 },
  logoBg: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', ...shadows.glow(colors.accent),
  },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 28, letterSpacing: -1 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 4, fontWeight: '500' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  card: {
    backgroundColor: 'rgba(14,14,26,0.85)', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadows.lg,
  },
  cardAccent: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    backgroundColor: colors.accent, opacity: 0.6,
  },
  inputGroup: { marginBottom: 20 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 1.5 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  inputIcon: { fontSize: 16, paddingLeft: 14 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, color: colors.text, fontSize: 15 },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  btnInner: { backgroundColor: colors.accent, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
  btnGlow: {
    position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 20,
    backgroundColor: colors.accent, borderRadius: 10,
  },
  footer: { color: colors.textDim, fontSize: 11, textAlign: 'center', marginTop: 24, fontWeight: '500' },
});
