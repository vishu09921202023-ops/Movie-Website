import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Keyboard, Animated, Easing,
} from 'react-native';
import { api } from '../utils/api';
import { colors, CATEGORY_CONFIG, shadows } from '../utils/theme';
import AnimatedBackground from '../components/AnimatedBackground';

export default function SearchScreen({ route, navigation }) {
  const { token } = route.params;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;
  const searchFocusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(searchAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      resultAnim.setValue(0);
      Animated.timing(resultAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [results]);

  useEffect(() => {
    if (searched && results.length === 0) {
      emptyAnim.setValue(0);
      Animated.spring(emptyAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    }
  }, [searched, results]);

  const doSearch = useCallback(async (q) => {
    const trimmed = (q || '').trim();
    if (!trimmed) { setResults([]); setSearched(false); return; }
    try {
      setLoading(true);
      const res = await api.searchMovies(token, trimmed);
      if (res.data?.results) setResults(res.data.results);
      else setResults([]);
      setSearched(true);
    } catch { setResults([]); setSearched(true); }
    finally { setLoading(false); }
  }, [token]);

  const handleChange = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(text), 400);
  };

  const handleSubmit = () => { Keyboard.dismiss(); doSearch(query); };

  const renderItem = ({ item }) => {
    const cfg = CATEGORY_CONFIG[item.type] || { emoji: '📁', label: item.type, color: colors.accent };
    return (
      <Animated.View style={[styles.card, {
        opacity: resultAnim,
        transform: [{ translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }],
      }]}>
        <TouchableOpacity style={styles.cardInner} activeOpacity={0.7}
          onPress={() => navigation.navigate('MovieAnalytics', { token, movieId: item._id })}>
          <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: cfg.color + '18' }]}>
                <Text style={{ color: cfg.color, fontSize: 10, fontWeight: '700' }}>{cfg.emoji} {cfg.label}</Text>
              </View>
              {item.releaseYear && (
                <View style={styles.yearBadge}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '600' }}>{item.releaseYear}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.info }]}>{item.views ?? 0}</Text>
              <Text style={styles.statLbl}>Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.success }]}>{item.downloads ?? 0}</Text>
              <Text style={styles.statLbl}>DLs</Text>
            </View>
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
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }],
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>🔍 Search</Text>
        <View style={{ width: 50 }} />
      </Animated.View>

      <Animated.View style={[styles.searchRow, {
        opacity: searchAnim,
        transform: [{ scale: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
      }]}>
        <Animated.View style={[styles.inputWrap, {
          borderColor: searchFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.accent] }),
        }]}>
          <Text style={styles.inputIcon}>🔍</Text>
          <TextInput ref={inputRef} style={styles.input} value={query} onChangeText={handleChange}
            placeholder="Search movies, series, anime..." placeholderTextColor={colors.textDim}
            returnKeyType="search" onSubmitEditing={handleSubmit} autoFocus
            onFocus={() => Animated.timing(searchFocusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start()}
            onBlur={() => Animated.timing(searchFocusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start()}
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>

      {loading && (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginTop: 10, fontSize: 12 }}>Searching...</Text>
        </View>
      )}

      {!loading && searched && results.length === 0 && (
        <Animated.View style={[styles.emptyBox, {
          opacity: emptyAnim,
          transform: [{ scale: emptyAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
        }]}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
          <Text style={styles.emptySub}>Try different keywords</Text>
        </Animated.View>
      )}

      {!loading && !searched && (
        <Animated.View style={[styles.emptyBox, { opacity: searchAnim }]}>
          <Text style={styles.emptyEmoji}>💡</Text>
          <Text style={styles.emptyText}>Type to search</Text>
          <Text style={styles.emptySub}>Search by title, genre, or year</Text>
        </Animated.View>
      )}

      {results.length > 0 && (
        <>
          <Text style={styles.resultCount}>{results.length} result{results.length !== 1 ? 's' : ''}</Text>
          <FlatList data={results} keyExtractor={(item) => item._id} renderItem={renderItem}
            contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 8 },
  backBtn: { paddingVertical: 6, paddingRight: 8 },
  backText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  heading: { color: colors.text, fontSize: 20, fontWeight: '900' },
  searchRow: { paddingHorizontal: 16, marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(14,14,26,0.8)',
    borderRadius: 16, borderWidth: 1.5, overflow: 'hidden', ...shadows.sm,
  },
  inputIcon: { fontSize: 14, paddingLeft: 14 },
  input: { flex: 1, paddingHorizontal: 10, paddingVertical: 15, color: colors.text, fontSize: 15 },
  clearBtn: { padding: 10, paddingRight: 14 },
  clearText: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },
  resultCount: { color: colors.textMuted, fontSize: 12, paddingHorizontal: 16, marginBottom: 6, fontWeight: '700', letterSpacing: 0.5 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { marginBottom: 10 },
  cardInner: {
    flexDirection: 'row', backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadows.sm,
  },
  cardAccent: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2 },
  cardLeft: { flex: 1, marginRight: 12, paddingLeft: 6 },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 19, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  yearBadge: { backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  cardRight: { justifyContent: 'center', alignItems: 'flex-end', gap: 8 },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 17, fontWeight: '900' },
  statLbl: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyText: { color: colors.text, fontSize: 17, fontWeight: '800' },
  emptySub: { color: colors.textMuted, fontSize: 13, marginTop: 5 },
});
