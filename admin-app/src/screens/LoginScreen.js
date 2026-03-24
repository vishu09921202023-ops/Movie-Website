import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/api';
import { colors } from '../utils/theme';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.card}>
        <View style={styles.logoWrap}>
          <View style={styles.logoBg}>
            <Text style={styles.logoText}>VN</Text>
          </View>
          <Text style={styles.title}>VN Movies HD</Text>
          <Text style={styles.subtitle}>Admin Panel</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: colors.border },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoBg: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  inputGroup: { marginBottom: 18 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 14, color: colors.text,
    fontSize: 15, borderWidth: 1, borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
