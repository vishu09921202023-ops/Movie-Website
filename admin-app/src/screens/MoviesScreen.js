import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput, ActivityIndicator, Animated, Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors, CATEGORY_CONFIG, shadows } from '../utils/theme';
import AnimatedBackground from '../components/AnimatedBackground';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function MoviesScreen({ route, navigation }) {
  const token = route.params?.token;
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(searchAnim, { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(filterAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(listAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchMovies = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.getMovies(token, p);
      if (res.data) {
        setMovies(res.data.movies || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setPage(p);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchMovies(1); }, [fetchMovies]));

  const onRefresh = async () => { setRefreshing(true); await fetchMovies(1); setRefreshing(false); };

  const doSearch = async () => {
    if (!search.trim()) { fetchMovies(1); return; }
    try {
      setLoading(true);
      const res = await api.searchMovies(token, search.trim());
      if (res.data?.results) { setMovies(res.data.results); setTotalPages(1); setPage(1); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleDelete = (movie) => {
    Alert.alert('Delete Movie', `Delete "${movie.cleanTitle || movie.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.deleteMovie(token, movie._id); fetchMovies(page); }
        catch { Alert.alert('Error', 'Failed to delete'); }
      }},
    ]);
  };

  const renderMovie = ({ item, index }) => {
    const cfg = CATEGORY_CONFIG[item.type] || { emoji: '📁', color: colors.accent };
    return (
      <Animated.View style={[styles.movieCard, {
        opacity: listAnim,
        transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      }]}>
        <TouchableOpacity style={styles.movieInner} activeOpacity={0.7}
          onPress={() => navigation.navigate('MovieAnalytics', { token, movieId: item._id })}>
          <View style={[styles.movieTypeBar, { backgroundColor: cfg.color }]} />
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: cfg.color + '18' }]}>
                <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.emoji} {item.type}</Text>
              </View>
              {item.releaseYear && (
                <View style={[styles.badge, { backgroundColor: colors.info + '18' }]}>
                  <Text style={[styles.badgeText, { color: colors.info }]}>{item.releaseYear}</Text>
                </View>
              )}
              {item.qualities?.slice(0, 2).map((q) => (
                <View key={q} style={[styles.badge, { backgroundColor: colors.success + '18' }]}>
                  <Text style={[styles.badgeText, { color: colors.success }]}>{q}</Text>
                </View>
              ))}
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statBadge}>👁 {item.views || 0}</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}
              onPress={() => navigation.navigate('MovieForm', { token, movieId: item._id })}>
              <Text style={{ fontSize: 15 }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.7}
              onPress={() => handleDelete(item)}>
              <Text style={{ fontSize: 15 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="minimal" />

      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
      }]}>
        <View>
          <Text style={styles.heading}>🎬 Content</Text>
          <Text style={styles.headSub}>{movies.length} items</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}
          onPress={() => navigation.navigate('MovieForm', { token })}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.searchRow, {
        opacity: searchAnim,
        transform: [{ translateX: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
      }]}>
        <Animated.View style={[styles.searchWrap, {
          borderColor: searchFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.accent] }),
        }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch}
            placeholder="Search content..." placeholderTextColor={colors.textDim}
            onSubmitEditing={doSearch} returnKeyType="search"
            onFocus={() => Animated.timing(searchFocusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
            onBlur={() => Animated.timing(searchFocusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
          />
        </Animated.View>
        <TouchableOpacity style={styles.searchGo} onPress={doSearch} activeOpacity={0.8}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>GO</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.filterRow, {
        opacity: filterAnim,
        transform: [{ translateY: filterAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
      }]}>
        {[{ key: 'all', label: '📁 All' }, { key: 'movie', label: '🎬' }, { key: 'series', label: '📺' }, { key: 'anime', label: '🌸' }, { key: 'kdrama', label: '🇰🇷' }].map(f => (
          <TouchableOpacity key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            activeOpacity={0.7}
            onPress={() => {
              setActiveFilter(f.key);
              if (f.key === 'all') fetchMovies(1);
              else navigation.navigate('CategoryDetail', { token, type: f.key, title: CATEGORY_CONFIG[f.key]?.label || f.key });
            }}>
            <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {loading && movies.length === 0 && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: 12 }}>Loading content...</Text>
        </View>
      )}

      <FlatList data={movies} keyExtractor={(item) => item._id} renderItem={renderMovie}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={!loading && (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
            <Text style={styles.emptyText}>No content found</Text>
            <Text style={styles.emptySub}>Add some movies to get started</Text>
          </View>
        )} />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity style={[styles.pageBtn, page <= 1 && { opacity: 0.3 }]} disabled={page <= 1}
            onPress={() => fetchMovies(page - 1)} activeOpacity={0.7}>
            <Text style={styles.pageBtnText}>← Prev</Text>
          </TouchableOpacity>
          <View style={styles.pageCenter}>
            <Text style={styles.pageCurrent}>{page}</Text>
            <Text style={styles.pageOf}> / {totalPages}</Text>
          </View>
          <TouchableOpacity style={[styles.pageBtn, page >= totalPages && { opacity: 0.3 }]} disabled={page >= totalPages}
            onPress={() => fetchMovies(page + 1)} activeOpacity={0.7}>
            <Text style={styles.pageBtnText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 10 },
  heading: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.3 },
  headSub: { color: colors.textMuted, fontSize: 11, marginTop: 2, fontWeight: '500' },
  addBtn: {
    backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
    ...shadows.glow(colors.accent),
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14,14,26,0.8)',
    borderRadius: 14, borderWidth: 1, paddingLeft: 12, overflow: 'hidden',
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 12, color: colors.text, fontSize: 14 },
  searchGo: {
    backgroundColor: colors.accent, borderRadius: 12, width: 48, alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 10 },
  filterChip: {
    backgroundColor: 'rgba(14,14,26,0.6)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.accent + '20', borderColor: colors.accent },
  filterText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: colors.accent },
  list: { padding: 16, paddingTop: 0 },
  movieCard: { marginBottom: 10 },
  movieInner: {
    flexDirection: 'row', backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', overflow: 'hidden', ...shadows.sm,
  },
  movieTypeBar: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2 },
  movieInfo: { flex: 1, marginRight: 10, paddingLeft: 8 },
  movieTitle: { color: colors.text, fontWeight: '700', fontSize: 14, lineHeight: 19 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  badge: { borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  statBadge: { color: colors.textMuted, fontSize: 10 },
  actions: { gap: 8 },
  editBtn: {
    backgroundColor: colors.info + '15', borderRadius: 10, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: colors.info + '20',
  },
  deleteBtn: {
    backgroundColor: colors.danger + '15', borderRadius: 10, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: colors.danger + '20',
  },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  pagination: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 12,
    borderTopWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(14,14,26,0.9)',
  },
  pageBtn: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  pageBtnText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  pageCenter: { flexDirection: 'row', alignItems: 'baseline' },
  pageCurrent: { color: colors.accent, fontWeight: '900', fontSize: 18 },
  pageOf: { color: colors.textMuted, fontSize: 13 },
});
