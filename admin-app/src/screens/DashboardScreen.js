import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated, Easing, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors, CATEGORY_CONFIG, shadows } from '../utils/theme';
import { MiniBarChart } from '../components/Charts';
import AnimatedBackground from '../components/AnimatedBackground';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function DashboardScreen({ route, navigation }) {
  const token = route.params?.token;
  const [data, setData] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Entrance animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const catAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const topAnim = useRef(new Animated.Value(0)).current;
  const actAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const runEntrance = () => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.stagger(80, statsAnims.map(a =>
        Animated.spring(a, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true })
      )),
      Animated.timing(chartAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.stagger(60, catAnims.map(a =>
        Animated.spring(a, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true })
      )),
      Animated.timing(topAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(actAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await api.getFullAnalytics(token);
      if (res.data) {
        setData(res.data);
        const normalized = (res.data.topMovies || []).slice(0, 5).map(item => ({
          _id: item._id,
          title: item.movie?.[0]?.title || item.movie?.[0]?.cleanTitle || 'Unknown',
          downloads: item.count || 0,
        }));
        setTopMovies(normalized);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
  useEffect(() => { if (!loading) runEntrance(); }, [loading]);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const s = data?.stats || {};
  const cats = data?.categories || {};

  const statItems = [
    { emoji: '📦', label: 'Total Content', val: s.totalAll, color: colors.text, metric: 'totalContent' },
    { emoji: '👁️', label: 'Total Views', val: s.totalViews, color: colors.info, metric: 'totalViews' },
    { emoji: '⬇️', label: 'Downloads', val: s.totalDownloads, color: colors.success, metric: 'totalDownloads' },
    { emoji: '📅', label: 'Today Views', val: s.todayViews || 0, color: colors.warning, metric: 'todayViews' },
    { emoji: '🌐', label: 'Unique IPs', val: s.uniqueVisitors || 0, color: colors.purple, metric: 'uniqueIps' },
    { emoji: '📊', label: 'Today DLs', val: s.todayDownloads || 0, color: colors.orange, metric: 'todayDownloads' },
  ];

  if (loading) return (
    <View style={styles.center}>
      <AnimatedBackground intensity="minimal" />
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={{ color: colors.textMuted, marginTop: 12, fontWeight: '600' }}>Loading dashboard...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="minimal" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>

        <Animated.View style={[styles.headerRow, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <View>
            <Text style={styles.heading}>Dashboard</Text>
            <Text style={styles.sub}>VN Movies HD • Admin Control</Text>
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search', { token })}
            activeOpacity={0.7}>
            <Animated.Text style={{ fontSize: 18, opacity: glowAnim }}>🔍</Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.sectionHeader, { opacity: headerAnim }]}>
          <View style={styles.sectionLine} />
          <Text style={styles.sec}>OVERVIEW</Text>
          <View style={styles.sectionLine} />
        </Animated.View>

        <View style={styles.grid}>
          {statItems.map((item, i) => (
            <AnimatedTouchable key={i}
              style={[styles.stat, {
                opacity: statsAnims[i],
                transform: [
                  { scale: statsAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                  { translateY: statsAnims[i].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
                ],
              }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('InsightsDetail', { token, metric: item.metric })}>
              <View style={[styles.statGlow, { backgroundColor: item.color }]} />
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <Text style={[styles.statVal, { color: item.color }]}>{item.val ?? '—'}</Text>
              <Text style={styles.statLbl}>{item.label}</Text>
              <View style={[styles.statAccent, { backgroundColor: item.color }]} />
            </AnimatedTouchable>
          ))}
        </View>

        {(data?.dailyViews?.length > 0) && (
          <Animated.View style={[styles.card, {
            opacity: chartAnim,
            transform: [{ translateY: chartAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardT}>📈 Views (30 days)</Text>
              <View style={styles.liveDot} />
            </View>
            <MiniBarChart data={(data.dailyViews || []).slice(-7).map(d => d.count || 0)} height={60} color={colors.info} />
          </Animated.View>
        )}

        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View style={styles.sectionLine} />
          <Text style={styles.sec}>CATEGORIES</Text>
          <View style={styles.sectionLine} />
        </View>

        {Object.entries(CATEGORY_CONFIG).map(([type, cfg], idx) => {
          const c = cats[type] || {};
          const anim = catAnims[idx] || catAnims[0];
          return (
            <AnimatedTouchable key={type}
              style={[styles.catCard, {
                opacity: anim,
                transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
              }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CategoryDetail', { token, type, title: cfg.label })}>
              <View style={[styles.catIcon, { backgroundColor: cfg.color + '18' }]}>
                <Text style={{ fontSize: 22 }}>{cfg.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.catTitle}>{cfg.label}</Text>
                <Text style={styles.catSub}>{c.count || 0} items</Text>
              </View>
              <View style={styles.catStats}>
                <View style={styles.catStatBadge}>
                  <Text style={{ color: colors.info, fontSize: 10, fontWeight: '700' }}>👁 {c.views || 0}</Text>
                </View>
                <View style={styles.catStatBadge}>
                  <Text style={{ color: colors.success, fontSize: 10, fontWeight: '700' }}>⬇ {c.downloads || 0}</Text>
                </View>
              </View>
              <Text style={styles.catArrow}>›</Text>
            </AnimatedTouchable>
          );
        })}

        <Animated.View style={[styles.card, {
          opacity: topAnim,
          transform: [{ translateY: topAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardT}>🏆 Top Downloads</Text>
          </View>
          {topMovies.map((m, i) => (
            <TouchableOpacity key={m._id || i} style={styles.topRow} activeOpacity={0.7}
              onPress={() => navigation.navigate('MovieAnalytics', { token, movieId: m._id })}>
              <View style={[styles.rank, i === 0 && styles.rankGold]}>
                <Text style={[styles.rankT, i === 0 && { color: colors.gold }]}>#{i + 1}</Text>
              </View>
              <Text style={styles.topTitle} numberOfLines={1}>{m.title}</Text>
              <View style={styles.dlBadge}>
                <Text style={styles.dlBadgeText}>{m.downloads}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {topMovies.length === 0 && <Text style={styles.empty}>No data yet</Text>}
        </Animated.View>

        <Animated.View style={[styles.actRow, {
          opacity: actAnim,
          transform: [{ translateY: actAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }]}>
          <TouchableOpacity style={styles.actBtnPrimary} activeOpacity={0.8}
            onPress={() => navigation.navigate('MovieForm', { token })}>
            <Text style={styles.actText}>+ Add Content</Text>
            <Animated.View style={[styles.actBtnGlow, { opacity: glowAnim }]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actBtnSecondary} activeOpacity={0.8}
            onPress={() => navigation.navigate('Search', { token })}>
            <Text style={styles.actText}>🔍 Search</Text>
          </TouchableOpacity>
        </Animated.View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingTop: 50 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 3, fontWeight: '500', letterSpacing: 0.3 },
  searchBtn: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(14,14,26,0.8)', alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: colors.border, ...shadows.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 14, gap: 10 },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.border },
  sec: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 18, padding: 14, width: '47%',
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadows.md,
  },
  statGlow: { position: 'absolute', top: -20, right: -20, width: 60, height: 60, borderRadius: 30, opacity: 0.06 },
  statVal: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 6 },
  statLbl: { color: colors.textMuted, fontSize: 10, marginTop: 3, fontWeight: '600', letterSpacing: 0.3 },
  statAccent: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, borderRadius: 1, opacity: 0.3 },
  card: {
    backgroundColor: 'rgba(14,14,26,0.8)', borderRadius: 18, padding: 16, marginVertical: 10,
    borderWidth: 1, borderColor: colors.border, ...shadows.md, overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardT: { color: colors.text, fontSize: 15, fontWeight: '800' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  catCard: {
    backgroundColor: 'rgba(14,14,26,0.7)', borderRadius: 16, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', ...shadows.sm,
  },
  catIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  catTitle: { color: colors.text, fontWeight: '700', fontSize: 14 },
  catSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  catStats: { alignItems: 'flex-end', marginRight: 8, gap: 4 },
  catStatBadge: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catArrow: { color: colors.textMuted, fontSize: 22, fontWeight: '300' },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  rank: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.accent + '15', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rankGold: { backgroundColor: colors.gold + '20', ...shadows.glow(colors.gold) },
  rankT: { color: colors.accent, fontWeight: '800', fontSize: 11 },
  topTitle: { flex: 1, color: colors.text, fontSize: 13, fontWeight: '500' },
  dlBadge: { backgroundColor: colors.success + '18', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  dlBadgeText: { color: colors.success, fontWeight: '800', fontSize: 12 },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: 16 },
  actRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actBtnPrimary: {
    flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: colors.accent,
    overflow: 'hidden', ...shadows.glow(colors.accent),
  },
  actBtnSecondary: {
    flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', backgroundColor: colors.info,
    ...shadows.glow(colors.info),
  },
  actBtnGlow: {
    position: 'absolute', bottom: -5, left: '20%', right: '20%', height: 20,
    backgroundColor: colors.accent, borderRadius: 10,
  },
  actText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
});
