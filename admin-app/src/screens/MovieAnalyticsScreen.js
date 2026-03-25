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

export default function MovieAnalyticsScreen({ route, navigation }) {
  const { token, movieId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getMovieAnalytics(token, movieId);
      if (res.data) setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token, movieId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  if (loading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <AnimatedBackground intensity="minimal" />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ color: colors.textMuted, marginTop: 12, fontWeight: '600' }}>Loading analytics...</Text>
      </View>
    );
  }

  if (!data?.movie) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <AnimatedBackground intensity="minimal" />
        <Text style={{ color: colors.textMuted, fontSize: 42, marginBottom: 12 }}>🎬</Text>
        <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '700' }}>Movie not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackBtn}>
          <Text style={{ color: colors.accent, fontWeight: '700' }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { movie, analytics } = data;
  const cfg = CATEGORY_CONFIG[movie.type] || { emoji: '📁', label: movie.type, color: colors.accent };

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
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('MovieForm', { token, movieId: movie._id })}>
          <Text style={styles.editText}>✏️ Edit</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>

        <AnimatedSection delay={0}>
          <Text style={styles.title}>{movie.title}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.typeBadge, { backgroundColor: cfg.color + '20', color: cfg.color }]}>
              {cfg.emoji} {cfg.label}
            </Text>
            {movie.releaseYear && <Text style={styles.yearBadge}>{movie.releaseYear}</Text>}
            {movie.quality && <Text style={styles.qualityBadge}>{movie.quality}</Text>}
          </View>
        </AnimatedSection>

        <AnimatedSection delay={100} style={styles.overviewRow}>
          <View style={[styles.statCard, { borderColor: 'rgba(59,130,246,0.2)' }]}>
            <Text style={styles.statEmoji}>👁</Text>
            <Text style={[styles.statVal, { color: colors.info }]}>{analytics.totalViews}</Text>
            <Text style={styles.statLbl}>Total Views</Text>
            <View style={[styles.statAccent, { backgroundColor: colors.info }]} />
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(139,92,246,0.2)' }]}>
            <Text style={styles.statEmoji}>👤</Text>
            <Text style={[styles.statVal, { color: colors.purple }]}>{analytics.uniqueViewers}</Text>
            <Text style={styles.statLbl}>Unique Viewers</Text>
            <View style={[styles.statAccent, { backgroundColor: colors.purple }]} />
          </View>
          <View style={[styles.statCard, { borderColor: 'rgba(34,197,94,0.2)' }]}>
            <Text style={styles.statEmoji}>⬇️</Text>
            <Text style={[styles.statVal, { color: colors.success }]}>{analytics.totalDownloads}</Text>
            <Text style={styles.statLbl}>Downloads</Text>
            <View style={[styles.statAccent, { backgroundColor: colors.success }]} />
          </View>
        </AnimatedSection>

        <AnimatedSection delay={200} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 7-Day Views Trend</Text>
          </View>
          {analytics.dailyViews && analytics.dailyViews.length > 0 ? (
            <>
              <MiniBarChart data={analytics.dailyViews.map(d => d.count)} color={colors.info} height={90} />
              <View style={styles.dayLabels}>
                {analytics.dailyViews.slice(-7).map((d, i) => {
                  const date = new Date(d.date);
                  return <Text key={i} style={styles.dayLbl}>{date.getDate()}/{date.getMonth() + 1}</Text>;
                })}
              </View>
            </>
          ) : (
            <View style={styles.noDataWrap}>
              <Text style={styles.noDataEmoji}>📭</Text>
              <Text style={styles.noData}>No view data yet</Text>
            </View>
          )}
        </AnimatedSection>

        <AnimatedSection delay={300} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📥 7-Day Downloads Trend</Text>
          </View>
          {analytics.dailyDownloads && analytics.dailyDownloads.length > 0 ? (
            <MiniBarChart data={analytics.dailyDownloads.map(d => d.count)} color={colors.success} height={90} />
          ) : (
            <View style={styles.noDataWrap}>
              <Text style={styles.noDataEmoji}>📭</Text>
              <Text style={styles.noData}>No download data yet</Text>
            </View>
          )}
        </AnimatedSection>

        {analytics.byQuality && analytics.byQuality.length > 0 && (
          <AnimatedSection delay={400} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎬 Downloads by Quality</Text>
            </View>
            {analytics.byQuality.map((q, i) => (
              <ProgressBar key={i} label={q._id || 'Unknown'} value={q.count}
                max={Math.max(...analytics.byQuality.map(x => x.count), 1)}
                color={[colors.accent, colors.info, colors.purple, colors.cyan, colors.pink][i % 5]} />
            ))}
          </AnimatedSection>
        )}

        <AnimatedSection delay={500} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ℹ️ Movie Info</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoRow label="Genre" value={(Array.isArray(movie.genres) ? movie.genres : []).join(', ') || '—'} />
            <InfoRow label="Language" value={movie.language || '—'} />
            <InfoRow label="Quality" value={movie.quality || '—'} />
            <InfoRow label="DB Views" value={String(movie.views || 0)} />
            <InfoRow label="Slug" value={movie.slug || '—'} />
          </View>
        </AnimatedSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
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
  editBtn: {
    backgroundColor: 'rgba(59,130,246,0.12)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.15)',
  },
  editText: { color: colors.info, fontWeight: '800', fontSize: 13 },
  goBackBtn: {
    marginTop: 16, backgroundColor: 'rgba(229,9,20,0.12)', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(229,9,20,0.15)',
  },
  scroll: { padding: 16 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900', lineHeight: 28, marginBottom: 10, letterSpacing: 0.3 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' },
  typeBadge: {
    fontSize: 11, fontWeight: '800', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, overflow: 'hidden',
    letterSpacing: 0.5,
  },
  yearBadge: {
    color: colors.textSecondary, fontSize: 12, fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden',
  },
  qualityBadge: {
    color: colors.gold, fontSize: 12, fontWeight: '700',
    backgroundColor: 'rgba(255,215,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden',
  },
  overviewRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 16, padding: 14,
    borderWidth: 1, alignItems: 'center', overflow: 'hidden',
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statVal: { fontSize: 24, fontWeight: '900' },
  statLbl: { color: colors.textMuted, fontSize: 10, marginTop: 3, fontWeight: '600', letterSpacing: 0.5 },
  statAccent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2 },
  section: {
    backgroundColor: 'rgba(14,14,26,0.75)', borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  noDataWrap: { alignItems: 'center', paddingVertical: 20 },
  noDataEmoji: { fontSize: 28, marginBottom: 6 },
  noData: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  dayLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 2 },
  dayLbl: { color: colors.textMuted, fontSize: 9, fontWeight: '600' },
  infoGrid: { gap: 2 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  infoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { color: colors.text, fontSize: 12, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});
