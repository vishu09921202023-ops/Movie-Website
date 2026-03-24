import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors } from '../utils/theme';

const PRESET_COLORS = ['#e50914', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function SiteLinksScreen({ route }) {
  const token = route.params?.token;
  const [links, setLinks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', url: '', color: '#e50914', row: 1, order: 0 });

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

  const renderLink = ({ item }) => (
    <View style={styles.linkCard}>
      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
      <View style={styles.linkInfo}>
        <Text style={styles.linkLabel}>{item.label}</Text>
        <Text style={styles.linkUrl} numberOfLines={1}>{item.url}</Text>
        <Text style={styles.linkMeta}>Row {item.row} • Order {item.order}</Text>
      </View>
      <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item)}>
        <Text style={styles.delBtnText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Site Links</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.formCard}>
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
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={form.row.toString()}
              onChangeText={(v) => setForm({ ...form, row: v })}
              placeholder="Row"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={form.order.toString()}
              onChangeText={(v) => setForm({ ...form, order: v })}
              placeholder="Order"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>Create Link</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={links}
        keyExtractor={(item) => item._id}
        renderItem={renderLink}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No site links yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800' },
  addBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  formCard: {
    backgroundColor: colors.surface, marginHorizontal: 20, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 10, padding: 12, color: colors.text,
    fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 10,
  },
  colorRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  colorOption: { width: 32, height: 32, borderRadius: 8 },
  colorSelected: { borderWidth: 2, borderColor: '#fff' },
  rowFields: { flexDirection: 'row', gap: 10 },
  createBtn: { backgroundColor: colors.accent, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 4 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 20, paddingTop: 0 },
  linkCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  linkInfo: { flex: 1 },
  linkLabel: { color: colors.text, fontWeight: '600', fontSize: 14 },
  linkUrl: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  linkMeta: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  delBtn: {
    backgroundColor: colors.danger + '20', width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  delBtnText: { color: colors.danger, fontWeight: '700', fontSize: 16 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
