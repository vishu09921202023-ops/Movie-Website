import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors } from '../utils/theme';

const StatCard = ({ label, value, emoji }) => (
  <View style={styles.statCard}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value ?? '—'}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function DashboardScreen({ route, navigation }) {
  const token = route.params?.token;
  const [overview, setOverview] = useState(null);
  const [topMovies, setTopMovies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [overviewRes, topRes] = await Promise.all([
        api.getAnalyticsOverview(token),
        api.getTopMovies(token, 5),
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <Text style={styles.heading}>Dashboard</Text>
      <Text style={styles.subheading}>VN Movies HD Admin</Text>

      <View style={styles.statsGrid}>
        <StatCard emoji="🎬" label="Total Movies" value={overview?.totalMovies} />
        <StatCard emoji="👁" label="Total Views" value={overview?.totalViews} />
        <StatCard emoji="⬇️" label="Downloads" value={overview?.totalDownloads} />
        <StatCard emoji="📅" label="Today Views" value={overview?.todayViews} />
      </View>

      <Text style={styles.sectionTitle}>Top Movies</Text>
      {topMovies.map((movie, i) => (
        <View key={movie._id || i} style={styles.topItem}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>#{i + 1}</Text>
          </View>
          <View style={styles.topInfo}>
            <Text style={styles.topTitle} numberOfLines={1}>{movie.movieTitle || movie.title || 'Unknown'}</Text>
            <Text style={styles.topStats}>{movie.views || 0} views • {movie.downloads || 0} downloads</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.quickAction}
        onPress={() => navigation.navigate('Movies', { token })}
      >
        <Text style={styles.quickActionText}>📋 Manage Movies</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 60 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subheading: { color: colors.textSecondary, fontSize: 14, marginTop: 2, marginBottom: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16, width: '47%', borderWidth: 1, borderColor: colors.border,
  },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  topItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  rank: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: colors.accent + '20',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rankText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  topInfo: { flex: 1 },
  topTitle: { color: colors.text, fontWeight: '600', fontSize: 14 },
  topStats: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  quickAction: {
    backgroundColor: colors.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20,
  },
  quickActionText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
