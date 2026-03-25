import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors, CATEGORY_CONFIG, shadows } from '../utils/theme';
import { MiniBarChart, ProgressBar } from '../components/Charts';
import AnimatedBackground from '../components/AnimatedBackground';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnalyticsScreen({ route, navigation }) {
  const token = route.params?.token;
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const ovAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const todayAnims = useRef([0, 1].map(() => new Animated.Value(0))).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const catAnim = useRef(new Animated.Value(0)).current;
  const topAnim = useRef(new Animated.Value(0)).current;

  const runEntrance = () => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.stagger(100, ovAnims.map(a =>
        Animated.spring(a, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true })
      )),
      Animated.stagger(80, todayAnims.map(a =>
        Animated.spring(a, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true })
      )),
      Animated.timing(chartAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(catAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(topAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getFullAnalytics(token);
      if (res.data) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
  useEffect(() => { if (!loading && data) runEntrance(); }, [loading]);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  if (loading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <AnimatedBackground intensity="minimal" />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textMuted, marginTop: 12 }}>Loading analytics...</Text>
      </View>
    );
  }

  const s = data?.stats || {};
  const cats = data?.categories || {};
  const catKeys = ['movie', 'series', 'anime', 'kdrama', 'documentary'];
  const dailyViews = (data?.dailyViews || []).map(d => d.count);
  const dailyDls = (data?.dailyDownloads || []).map(d => d.count);
  const topMovies = data?.topMovies || [];

  const ovItems = [
    { emoji: '👁', val: s.totalViews || 0, label: 'Views', color: colors.info },
    { emoji: '⬇️', val: s.totalDownloads || 0, label: 'Downloads', color: colors.success },
    { emoji: '👤', val: s.uniqueVisitors || 0, label: 'Unique IPs', color: colors.pink },
  ];

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="minimal" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>

        <Animated.View style={[styles.headingRow, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }]}>
          <Text style={styles.heading}>📈 Analytics</Text>
          <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>Live</Text></View>
        </Animated.View>

        <View style={styles.overviewRow}>
          {ovItems.map((item, i) => (
            <AnimatedTouchable key={i}
              style={[styles.ov, {
                opacity: ovAnims[i],
                transform: [
                  { scale: ovAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
                  { translateY: ovAnims[i].interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) },
                ],
              }]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('InsightsDetail', { token, metric: item.label === 'Views' ? 'totalViews' : item.label === 'Downloads' ? 'totalDownloads' : 'uniqueIps' })}>
              <View style={[styles.ovGlow, { backgroundColor: item.color }]} />
              <Text style={styles.ovEmoji}>{item.emoji}</Text>
              <Text style={[styles.ovVal, { color: item.color }]}>{item.val}</Text>
              <Text style={styles.ovLbl}>{item.label}</Text>
              <View style={[styles.ovAccent, { backgroundColor: item.color }]} />
            </AnimatedTouchable>
          ))}
        </View>

        <View style={styles.todayRow}>
          {[
            { val: s.todayViews || 0, label: 'Today Views', color: colors.purple },
            { val: s.todayDownloads || 0, label: 'Today DLs', color: colors.cyan },
          ].map((item, i) => (
            <Animated.View key={i} style={[styles.todayCard, {
              opacity: todayAnims[i],
              transform: [{ scale: todayAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
            }]}>
              <Text style={{ color: item.color, fontWeight: '900', fontSize: 26 }}>{item.val}</Text>
              <Text style={styles.todayLbl}>{item.label}</Text>
              <View style={[styles.todayAccent, { backgroundColor: item.color }]} />
            </Animated.View>
          ))}
        </View>

        {dailyViews.length > 0 && (
          <Animated.View style={[styles.section, {
            opacity: chartAnim,
            transform: [{ translateY: chartAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📊 30-Day Views Trend</Text>
            </View>
            <MiniBarChart data={dailyViews} color={colors.info} height={90} />
          </Animated.View>
        )}

        {dailyDls.length > 0 && (
          <Animated.View style={[styles.section, {
            opacity: chartAnim,
            transform: [{ translateY: chartAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📥 30-Day Downloads Trend</Text>
            </View>
            <MiniBarChart data={dailyDls} color={colors.success} height={90} />
          </Animated.View>
        )}

        <Animated.View style={[styles.section, { opacity: catAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📂 Views by Category</Text>
          </View>
          {catKeys.map(key => {
            const cfg = CATEGORY_CONFIG[key] || {};
            const c = cats[key] || {};
            const maxV = Math.max(...catKeys.map(k => (cats[k]?.views || 0)), 1);
            return (
              <TouchableOpacity key={key} activeOpacity={0.7}
                onPress={() => navigation.navigate('CategoryDetail', { token, type: key, title: cfg.label })}>
                <ProgressBar label={`${cfg.emoji} ${cfg.label}`} value={c.views || 0} max={maxV} color={cfg.color} />
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: catAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⬇️ Downloads by Category</Text>
          </View>
          {catKeys.map(key => {
            const cfg = CATEGORY_CONFIG[key] || {};
            const c = cats[key] || {};
            const maxD = Math.max(...catKeys.map(k => (cats[k]?.downloads || 0)), 1);
            return (
              <TouchableOpacity key={key} activeOpacity={0.7}
                onPress={() => navigation.navigate('CategoryDetail', { token, type: key, title: cfg.label })}>
                <ProgressBar label={`${cfg.emoji} ${cfg.label}`} value={c.downloads || 0} max={maxD} color={cfg.color} />
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <Animated.View style={[styles.section, { opacity: topAnim }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 Top Movies by Downloads</Text>
          </View>
          {topMovies.slice(0, 15).map((item, i) => {
            const movieData = item.movie?.[0];
            const movieId = item._id;
            return (
              <TouchableOpacity key={movieId || i} style={styles.topItem} activeOpacity={0.7}
                onPress={() => movieId && navigation.navigate('MovieAnalytics', { token, movieId })}>
                <View style={[styles.topRankBadge, i < 3 && { backgroundColor: [colors.gold, colors.textSecondary, colors.orange][i] + '20' }]}>
                  <Text style={[styles.topRank, i < 3 && { color: [colors.gold, colors.textSecondary, colors.orange][i] }]}>#{i + 1}</Text>
                </View>
                <View style={styles.topInfo}>
                  <Text style={styles.topTitle} numberOfLines={1}>{movieData?.title || movieData?.cleanTitle || 'Unknown'}</Text>
                  <View style={styles.topBadges}>
                    <View style={[styles.topBadge, { backgroundColor: colors.success + '18' }]}>
                      <Text style={{ color: colors.success, fontSize: 10, fontWeight: '700' }}>{item.count || 0} downloads</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          {topMovies.length === 0 && <Text style={styles.emptyText}>No analytics data yet</Text>}
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingTop: 56 },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heading: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.3 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.success + '15', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  liveText: { color: colors.success, fontSize: 11, fontWeight: '700' },
  overviewRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  ov: {
    flex: 1, backgroundColor: 'rgba(14,14,26,0.8)', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', overflow: 'hidden', ...shadows.md,
  },
  ovGlow: { position: 'absolute', top: -15, right: -15, width: 50, height: 50, borderRadius: 25, opacity: 0.08 },
  ovEmoji: { fontSize: 22, marginBottom: 6 },
  ovVal: { fontSize: 22, fontWeight: '900' },
  ovLbl: { color: colors.textMuted, fontSize: 9, marginTop: 3, fontWeight: '600', letterSpacing: 0.5 },
  ovAccent: { position: 'absolute', bottom: 0, left: 12, right: 12, height: 2, borderRadius: 1, opacity: 0.3 },
  todayRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  todayCard: {
    flex: 1, backgroundColor: 'rgba(14,14,26,0.7)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', overflow: 'hidden', ...shadows.sm,
  },
  todayLbl: { color: colors.textMuted, fontSize: 10, marginTop: 4, fontWeight: '600' },
  todayAccent: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, borderRadius: 1, opacity: 0.25 },
  section: {
    backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border, ...shadows.sm,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  topItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  topRankBadge: { width: 32, height: 32, borderRadius: 9, backgroundColor: colors.accent + '12', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  topRank: { color: colors.accent, fontWeight: '900', fontSize: 12 },
  topInfo: { flex: 1 },
  topTitle: { color: colors.text, fontWeight: '600', fontSize: 13, marginBottom: 4 },
  topBadges: { flexDirection: 'row', gap: 6 },
  topBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  emptyText: { color: colors.textMuted, textAlign: 'center', paddingVertical: 16 },
});
