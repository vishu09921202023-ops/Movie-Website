import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors } from '../utils/theme';

export default function AnalyticsScreen({ route }) {
  const token = route.params?.token;
  const [overview, setOverview] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [overviewRes, topRes] = await Promise.all([
        api.getAnalyticsOverview(token),
        api.getTopMovies(token, 20),
      ]);
      if (overviewRes.data) setOverview(overviewRes.data);
      if (topRes.data) setTopMovies(topRes.data);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const StatRow = ({ label, value, color }) => (
    <View style={styles.statRow}>
      <Text style={styles.statRowLabel}>{label}</Text>
      <Text style={[styles.statRowValue, color && { color }]}>{value ?? '—'}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <Text style={styles.heading}>Analytics</Text>

      {overview && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overview</Text>
          <StatRow label="Total Views" value={overview.totalViews?.toLocaleString()} color={colors.info} />
          <StatRow label="Total Downloads" value={overview.totalDownloads?.toLocaleString()} color={colors.success} />
          <StatRow label="Today Views" value={overview.todayViews?.toLocaleString()} color={colors.accent} />
          <StatRow label="Today Downloads" value={overview.todayDownloads?.toLocaleString()} color={colors.warning} />
          <StatRow label="Total Movies" value={overview.totalMovies?.toLocaleString()} />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Movies by Engagement</Text>
        {topMovies.map((movie, i) => (
          <View key={movie._id || i} style={styles.topItem}>
            <Text style={styles.topRank}>#{i + 1}</Text>
            <View style={styles.topInfo}>
              <Text style={styles.topTitle} numberOfLines={1}>
                {movie.movieTitle || movie.title || 'Unknown'}
              </Text>
              <View style={styles.topBadges}>
                <View style={[styles.topBadge, { backgroundColor: colors.info + '20' }]}>
                  <Text style={[styles.topBadgeText, { color: colors.info }]}>
                    {movie.views || 0} views
                  </Text>
                </View>
                <View style={[styles.topBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.topBadgeText, { color: colors.success }]}>
                    {movie.downloads || 0} DL
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        {topMovies.length === 0 && (
          <Text style={styles.emptyText}>No analytics data yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 20 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 14 },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderColor: colors.border,
  },
  statRowLabel: { color: colors.textSecondary, fontSize: 14 },
  statRowValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  topItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderColor: colors.border,
  },
  topRank: { color: colors.accent, fontWeight: '800', fontSize: 14, width: 30 },
  topInfo: { flex: 1 },
  topTitle: { color: colors.text, fontWeight: '600', fontSize: 13, marginBottom: 4 },
  topBadges: { flexDirection: 'row', gap: 6 },
  topBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  topBadgeText: { fontSize: 10, fontWeight: '700' },
  emptyText: { color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
});
