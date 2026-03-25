import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Animated, Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors } from '../utils/theme';
import AnimatedBackground from '../components/AnimatedBackground';

const PRESET_COLORS = ['#e50914', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

function AnimatedLinkCard({ item, index, onDelete }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay: index * 60, tension: 80, friction: 12, useNativeDriver: true }).start();
  }, []);

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, tension: 200, friction: 10, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start();

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }, { scale: scaleAnim }],
    }}>
      <TouchableOpacity activeOpacity={0.85} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={styles.linkCard}>
          <View style={[styles.colorBar, { backgroundColor: item.color }]} />
          <View style={styles.linkInfo}>
            <Text style={styles.linkLabel}>{item.label}</Text>
            <Text style={styles.linkUrl} numberOfLines={1}>{item.url}</Text>
            <View style={styles.linkMetaRow}>
              <Text style={styles.linkMeta}>Row {item.row}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.linkMeta}>Order {item.order}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.delBtn} onPress={() => onDelete(item)}>
            <Text style={styles.delBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SiteLinksScreen({ route }) {
  const token = route.params?.token;
  const [links, setLinks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', url: '', color: '#e50914', row: 1, order: 0 });

  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const btnGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(btnGlow, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(btnGlow, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (showForm) {
      formAnim.setValue(0);
      Animated.spring(formAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }).start();
    }
  }, [showForm]);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await api.getSiteLinks(token);
      if (res.data) setLinks(res.data);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchLinks();
    }, [fetchLinks])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLinks();
    setRefreshing(false);
  };

  const handleCreate = async () => {
    if (!form.label.trim() || !form.url.trim()) {
      Alert.alert('Error', 'Label and URL are required');
      return;
    }
    try {
      await api.createSiteLink(token, { ...form, row: parseInt(form.row) || 1, order: parseInt(form.order) || 0 });
      setShowForm(false);
      setForm({ label: '', url: '', color: '#e50914', row: 1, order: 0 });
      fetchLinks();
    } catch (e) {
      Alert.alert('Error', 'Failed to create link');
    }
  };

  const handleDelete = (link) => {
    Alert.alert('Delete Link', `Delete "${link.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteSiteLink(token, link._id);
            fetchLinks();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const renderLink = ({ item, index }) => (
    <AnimatedLinkCard item={item} index={index} onDelete={handleDelete} />
  );

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="minimal" />

      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
      }]}>
        <View>
          <Text style={styles.heading}>🔗 Site Links</Text>
          <Text style={styles.subHeading}>{links.length} link{links.length !== 1 ? 's' : ''} configured</Text>
        </View>
        <Animated.View style={{ opacity: btnGlow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }}>
          <TouchableOpacity style={[styles.addBtn, showForm && styles.addBtnCancel]} onPress={() => setShowForm(!showForm)}>
            <Text style={styles.addBtnText}>{showForm ? '✕ Cancel' : '+ Add Link'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {showForm && (
        <Animated.View style={[styles.formCard, {
          opacity: formAnim,
          transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
                       { scale: formAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
        }]}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>✨ New Link</Text>
          </View>
          <TextInput
            style={styles.input}
            value={form.label}
            onChangeText={(v) => setForm({ ...form, label: v })}
            placeholder="Label"
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            value={form.url}
            onChangeText={(v) => setForm({ ...form, url: v })}
            placeholder="URL (e.g. /browse or https://...)"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.colorLabel}>🎨 Color</Text>
          <View style={styles.colorRow}>
            {PRESET_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorOption, { backgroundColor: c }, form.color === c && styles.colorSelected]}
                onPress={() => setForm({ ...form, color: c })}
              />
            ))}
          </View>
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Row</Text>
              <TextInput
                style={styles.input}
                value={form.row.toString()}
                onChangeText={(v) => setForm({ ...form, row: v })}
                placeholder="Row"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Order</Text>
              <TextInput
                style={styles.input}
                value={form.order.toString()}
                onChangeText={(v) => setForm({ ...form, order: v })}
                placeholder="Order"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
            <Text style={styles.createBtnText}>🚀 Create Link</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <FlatList
        data={links}
        keyExtractor={(item) => item._id}
        renderItem={renderLink}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🔗</Text>
            <Text style={styles.emptyText}>No site links yet</Text>
            <Text style={styles.emptyHint}>Tap "+ Add Link" to create your first link</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  heading: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  subHeading: { color: colors.textMuted, fontSize: 12, marginTop: 2, letterSpacing: 0.5 },
  addBtn: {
    backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  addBtnCancel: { backgroundColor: 'rgba(255,255,255,0.1)' },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  formCard: {
    backgroundColor: 'rgba(14,14,26,0.8)', marginHorizontal: 20, borderRadius: 18, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: 'rgba(229,9,20,0.15)',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  formHeader: { marginBottom: 14 },
  formTitle: { color: colors.text, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  colorLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  fieldLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, color: colors.text,
    fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 10,
  },
  colorRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  colorOption: { width: 34, height: 34, borderRadius: 10 },
  colorSelected: { borderWidth: 2.5, borderColor: '#fff', shadowColor: '#fff', shadowOpacity: 0.4, shadowRadius: 6, elevation: 3 },
  rowFields: { flexDirection: 'row', gap: 12 },
  createBtn: {
    backgroundColor: colors.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 6,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
  },
  createBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
  list: { padding: 20, paddingTop: 4 },
  linkCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 16,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden',
  },
  colorBar: { width: 4, height: 40, borderRadius: 2, marginRight: 14 },
  linkInfo: { flex: 1 },
  linkLabel: { color: colors.text, fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },
  linkUrl: { color: colors.textSecondary, fontSize: 12, marginTop: 3, fontFamily: 'monospace' },
  linkMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, gap: 6 },
  linkMeta: { color: colors.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textMuted },
  delBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)', width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
  },
  delBtnText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  emptyHint: { color: colors.textMuted, textAlign: 'center', fontSize: 12, marginTop: 4, opacity: 0.6 },
});
