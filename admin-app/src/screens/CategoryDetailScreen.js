import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput, ActivityIndicator, Animated, Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors, CATEGORY_CONFIG } from '../utils/theme';
import AnimatedBackground from '../components/AnimatedBackground';

function AnimatedItemCard({ item, index, onPress, onEdit, onDelete, cfg }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay: index * 50, tension: 80, friction: 12, useNativeDriver: true }).start();
  }, []);

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, tension: 200, friction: 10, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start();

  const typeColor = CATEGORY_CONFIG[item.type]?.color || colors.accent;

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }, { scale: scaleAnim }],
    }}>
      <TouchableOpacity activeOpacity={0.85} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
        <View style={styles.itemCard}>
          <View style={[styles.typeBar, { backgroundColor: typeColor }]} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.badges}>
              <Text style={[styles.badge, { backgroundColor: typeColor + '20', color: typeColor }]}>
                {CATEGORY_CONFIG[item.type]?.emoji || '📁'} {item.type}
              </Text>
              {item.releaseYear && (
                <Text style={[styles.badge, { backgroundColor: 'rgba(59,130,246,0.12)', color: colors.info }]}>{item.releaseYear}</Text>
              )}
            </View>
            <View style={styles.miniStats}>
              <Text style={styles.miniStat}>👁 {item.views || 0}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.delBtn} onPress={onDelete}>
              <Text style={styles.delText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CategoryDetailScreen({ route, navigation }) {
  const { token, type, title } = route.params;
  const cfg = CATEGORY_CONFIG[type] || { emoji: '📁', label: title, color: colors.accent };
  const isAll = type === 'all';

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catStats, setCatStats] = useState(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.spring(statsAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
      Animated.spring(searchAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchData = useCallback(async (p = 1, q = '') => {
    try {
      setLoading(true);
      if (isAll) {
        const res = await api.getMovies(token, p);
        if (res.data) {
          setItems(res.data.movies || []);
          setTotalPages(res.data.pagination?.pages || 1);
          setTotal(res.data.pagination?.total || 0);
          setPage(p);
        }
      } else {
        const res = await api.getCategoryContent(token, type, p, q);
        if (res.data) {
          setItems(res.data.items || []);
          setTotalPages(res.data.pagination?.pages || 1);
          setTotal(res.data.pagination?.total || 0);
          setPage(p);
        }
      }
      const analytics = await api.getFullAnalytics(token);
      if (analytics.data?.categories && !isAll) {
        setCatStats(analytics.data.categories[type] || {});
      } else if (analytics.data?.stats) {
        setCatStats({ count: analytics.data.stats.totalAll, views: analytics.data.stats.totalViews, downloads: analytics.data.stats.totalDownloads });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, type, isAll]);

  useFocusEffect(useCallback(() => { fetchData(1, ''); }, [fetchData]));
  const onRefresh = async () => { setRefreshing(true); await fetchData(1, search); setRefreshing(false); };

  const handleSearch = () => fetchData(1, search);
  const handleDelete = (item) => {
    Alert.alert('Delete', `Delete "${item.cleanTitle || item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.deleteMovie(token, item._id); fetchData(page, search); }
        catch { Alert.alert('Error', 'Failed to delete'); }
      }},
    ]);
  };

  const renderItem = ({ item, index }) => (
    <AnimatedItemCard item={item} index={index} cfg={cfg}
      onPress={() => navigation.navigate('MovieAnalytics', { token, movieId: item._id })}
      onEdit={() => navigation.navigate('MovieForm', { token, movieId: item._id })}
      onDelete={() => handleDelete(item)} />
  );

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="minimal" />

      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>{cfg.emoji} {cfg.label}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('MovieForm', { token })}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </Animated.View>

      {catStats && (
        <Animated.View style={[styles.statsRow, {
          opacity: statsAnim,
          transform: [{ translateY: statsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <View style={[styles.miniCard, { borderColor: 'rgba(229,9,20,0.2)' }]}>
            <Text style={styles.miniEmoji}>🎬</Text>
            <Text style={styles.miniVal}>{catStats.count ?? total}</Text>
            <Text style={styles.miniLbl}>Total</Text>
            <View style={[styles.miniAccent, { backgroundColor: colors.accent }]} />
          </View>
          <View style={[styles.miniCard, { borderColor: 'rgba(59,130,246,0.2)' }]}>
            <Text style={styles.miniEmoji}>👁</Text>
            <Text style={[styles.miniVal, { color: colors.info }]}>{catStats.views || 0}</Text>
            <Text style={styles.miniLbl}>Views</Text>
            <View style={[styles.miniAccent, { backgroundColor: colors.info }]} />
          </View>
          <View style={[styles.miniCard, { borderColor: 'rgba(34,197,94,0.2)' }]}>
            <Text style={styles.miniEmoji}>⬇️</Text>
            <Text style={[styles.miniVal, { color: colors.success }]}>{catStats.downloads || 0}</Text>
            <Text style={styles.miniLbl}>Downloads</Text>
            <View style={[styles.miniAccent, { backgroundColor: colors.success }]} />
          </View>
        </Animated.View>
      )}

      <Animated.View style={[styles.searchRow, {
        opacity: searchAnim,
        transform: [{ translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }]}>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch}
          placeholder={`Search ${cfg.label}...`} placeholderTextColor={colors.textMuted}
          onSubmitEditing={handleSearch} returnKeyType="search" />
        <TouchableOpacity style={styles.searchGo} onPress={handleSearch}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>🔍</Text>
        </TouchableOpacity>
      </Animated.View>

      {loading && items.length === 0 ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList data={items} keyExtractor={(item) => item._id} renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>No items found</Text>
            </View>
          } />
      )}

      {totalPages > 1 && (
        <View style={styles.pageRow}>
          <TouchableOpacity style={[styles.pageBtn, page <= 1 && { opacity: 0.3 }]} disabled={page <= 1} onPress={() => fetchData(page - 1, search)}>
            <Text style={styles.pageTxt}>← Prev</Text>
          </TouchableOpacity>
          <View style={styles.pageNumWrap}>
            <Text style={styles.pageCurrent}>{page}</Text>
            <Text style={styles.pageTotal}>/ {totalPages}</Text>
          </View>
          <TouchableOpacity style={[styles.pageBtn, page >= totalPages && { opacity: 0.3 }]} disabled={page >= totalPages} onPress={() => fetchData(page + 1, search)}>
            <Text style={styles.pageTxt}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 10,
  },
  backBtn: {
    paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  backText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  heading: { color: colors.text, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  addBtn: {
    backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  addText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  miniCard: {
    flex: 1, backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 14, padding: 12,
    borderWidth: 1, alignItems: 'center', overflow: 'hidden',
  },
  miniEmoji: { fontSize: 16, marginBottom: 4 },
  miniVal: { color: colors.text, fontSize: 20, fontWeight: '900' },
  miniLbl: { color: colors.textMuted, fontSize: 10, marginTop: 2, fontWeight: '600', letterSpacing: 0.5 },
  miniAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, color: colors.text, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    fontSize: 14, fontWeight: '500',
  },
  searchGo: {
    backgroundColor: colors.accent, borderRadius: 12, width: 48, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3,
  },
  loaderWrap: { alignItems: 'center', marginTop: 60 },
  loadingText: { color: colors.textMuted, marginTop: 10, fontSize: 13, fontWeight: '600' },
  list: { padding: 16, paddingTop: 0 },
  itemCard: {
    flexDirection: 'row', backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 14,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', overflow: 'hidden',
  },
  typeBar: { width: 4, height: 44, borderRadius: 2, marginRight: 12 },
  itemInfo: { flex: 1, marginRight: 8 },
  itemTitle: { color: colors.text, fontWeight: '700', fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 },
  badge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  miniStats: { flexDirection: 'row', gap: 8, marginTop: 5 },
  miniStat: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  actions: { gap: 6 },
  editBtn: {
    backgroundColor: 'rgba(59,130,246,0.12)', borderRadius: 10, padding: 8,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(59,130,246,0.1)',
  },
  editText: { fontSize: 14 },
  delBtn: {
    backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 10, padding: 8,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.1)',
  },
  delText: { fontSize: 14 },
  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: 16, fontWeight: '700' },
  pageRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14,
    paddingVertical: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(14,14,26,0.8)',
  },
  pageBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  pageTxt: { color: colors.text, fontWeight: '700', fontSize: 13 },
  pageNumWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  pageCurrent: { color: colors.accent, fontSize: 22, fontWeight: '900' },
  pageTotal: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
