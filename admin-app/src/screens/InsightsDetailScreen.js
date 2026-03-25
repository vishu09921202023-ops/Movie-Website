import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Animated, Easing,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors, CATEGORY_CONFIG } from '../utils/theme';
import { MiniBarChart, ProgressBar } from '../components/Charts';
import AnimatedBackground from '../components/AnimatedBackground';

function AnimatedSection({ children, delay = 0, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay, tension: 70, friction: 12, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={[style, {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [25, 0] }) }],
    }]}>
      {children}
    </Animated.View>
  );
}

export default function InsightsDetailScreen({ route, navigation }) {
  const { token, metric } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const mainCardAnim = useRef(new Animated.Value(0)).current;
  const mainCardScale = useRef(new Animated.Value(0.85)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const METRIC_META = {
    totalViews: { title: 'Total Views', emoji: '👁', color: colors.info },
    totalDownloads: { title: 'Total Downloads', emoji: '⬇️', color: colors.success },
    todayViews: { title: "Today's Views", emoji: '📊', color: colors.purple },
    todayDownloads: { title: "Today's Downloads", emoji: '📥', color: colors.cyan },
    uniqueIps: { title: 'Unique Visitors', emoji: '👤', color: colors.pink },
    totalContent: { title: 'Total Content', emoji: '🎬', color: colors.accent },
  };

  const meta = METRIC_META[metric] || { title: metric, emoji: '📊', color: colors.accent };

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(mainCardAnim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
        Animated.spring(mainCardScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getFullAnalytics(token);
      if (res.data) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  if (loading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <AnimatedBackground intensity="minimal" />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontWeight: '600' }}>Loading insights...</Text>
      </View>
    );
  }

  const s = data?.stats || {};
  const cats = data?.categories || {};

  const getMainValue = () => {
    switch (metric) {
      case 'totalViews': return s.totalViews || 0;
      case 'totalDownloads': return s.totalDownloads || 0;
      case 'todayViews': return s.todayViews || 0;
      case 'todayDownloads': return s.todayDownloads || 0;
      case 'uniqueIps': return s.uniqueVisitors || 0;
      case 'totalContent': return s.totalAll || 0;
      default: return 0;
    }
  };

  const catKeys = ['movie', 'series', 'anime', 'kdrama', 'documentary'];
  const getCatValue = (catKey) => {
    const c = cats[catKey] || {};
    switch (metric) {
      case 'totalViews': case 'todayViews': return c.views || 0;
      case 'totalDownloads': case 'todayDownloads': return c.downloads || 0;
      case 'totalContent': return c.count || 0;
      case 'uniqueIps': return c.views || 0;
      default: return 0;
    }
  };

  const maxCatVal = Math.max(...catKeys.map(k => getCatValue(k)), 1);

  const trendField = (metric === 'totalDownloads' || metric === 'todayDownloads') ? 'dailyDownloads' : 'dailyViews';
  const trendData = (data?.[trendField] || []).map(d => d.count);

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
        <Text style={styles.heading}>{meta.emoji} {meta.title}</Text>
        <View style={{ width: 50 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>

        <Animated.View style={[styles.mainCard, { borderColor: meta.color + '30' }, {
          opacity: mainCardAnim,
          transform: [{ scale: mainCardScale }],
        }]}>
          <Animated.View style={[styles.mainGlowBg, { backgroundColor: meta.color, opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.08] }) }]} />
          <Text style={styles.mainEmoji}>{meta.emoji}</Text>
          <Text style={[styles.mainVal, { color: meta.color }]}>{getMainValue().toLocaleString()}</Text>
          <Text style={styles.mainLabel}>{meta.title}</Text>
          <View style={[styles.mainAccent, { backgroundColor: meta.color }]} />
        </Animated.View>

        {trendData.length > 0 && (
          <AnimatedSection delay={200} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📈 30-Day Trend</Text>
            </View>
            <MiniBarChart data={trendData} color={meta.color} height={100} />
          </AnimatedSection>
        )}

        <AnimatedSection delay={300} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📂 By Category</Text>
          </View>
          {catKeys.map((key) => {
            const cfg = CATEGORY_CONFIG[key] || {};
            const val = getCatValue(key);
            return (
              <TouchableOpacity key={key} activeOpacity={0.7}
                onPress={() => navigation.navigate('CategoryDetail', { token, type: key, title: cfg.label || key })}>
                <ProgressBar label={`${cfg.emoji || ''} ${cfg.label || key}`} value={val} max={maxCatVal} color={cfg.color || colors.accent} />
              </TouchableOpacity>
            );
          })}
        </AnimatedSection>

        <AnimatedSection delay={400} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Quick Stats</Text>
          </View>
          <View style={styles.quickGrid}>
            <QuickStat label="Total Content" value={s.totalAll || 0} icon="🎬" color={colors.accent} />
            <QuickStat label="Total Views" value={s.totalViews || 0} icon="👁" color={colors.info} />
            <QuickStat label="Total Downloads" value={s.totalDownloads || 0} icon="⬇️" color={colors.success} />
            <QuickStat label="Today Views" value={s.todayViews || 0} icon="📊" color={colors.purple} />
            <QuickStat label="Today DLs" value={s.todayDownloads || 0} icon="📥" color={colors.cyan} />
            <QuickStat label="Unique IPs" value={s.uniqueVisitors || 0} icon="👤" color={colors.pink} />
          </View>
        </AnimatedSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function QuickStat({ label, value, icon, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }).start();
  }, []);

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, tension: 200, friction: 10, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start();

  return (
    <Animated.View style={[styles.qStat, {
      opacity: anim,
      transform: [{ scale: Animated.multiply(anim, scaleAnim) }],
    }]}>
      <TouchableOpacity activeOpacity={0.8} onPressIn={onPressIn} onPressOut={onPressOut} style={styles.qStatInner}>
        <Text style={styles.qIcon}>{icon}</Text>
        <Text style={[styles.qVal, { color: color || colors.text }]}>{value}</Text>
        <Text style={styles.qLbl}>{label}</Text>
        <View style={[styles.qAccent, { backgroundColor: color || colors.accent }]} />
      </TouchableOpacity>
    </Animated.View>
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
  scroll: { padding: 16 },
  mainCard: {
    backgroundColor: 'rgba(14,14,26,0.8)', borderRadius: 22, padding: 34, alignItems: 'center',
    borderWidth: 1.5, marginBottom: 22, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  mainGlowBg: {
    position: 'absolute', top: -40, left: -40, right: -40, bottom: -40,
    borderRadius: 60,
  },
  mainEmoji: { fontSize: 48, marginBottom: 10 },
  mainVal: { fontSize: 50, fontWeight: '900', letterSpacing: 1 },
  mainLabel: { color: colors.textMuted, fontSize: 15, marginTop: 6, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  mainAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
  section: {
    backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qStat: { width: '47%' },
  qStatInner: {
    backgroundColor: 'rgba(4,4,10,0.6)', borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', overflow: 'hidden',
  },
  qIcon: { fontSize: 20, marginBottom: 6 },
  qVal: { fontSize: 20, fontWeight: '900' },
  qLbl: { color: colors.textMuted, fontSize: 10, marginTop: 3, fontWeight: '600', letterSpacing: 0.5 },
  qAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
});
