import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../utils/api';
import { colors } from '../utils/theme';

export default function MoviesScreen({ route, navigation }) {
  const token = route.params?.token;
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMovies = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.getMovies(token, p);
      if (res.data) {
        setMovies(res.data.movies || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setPage(p);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchMovies(1);
    }, [fetchMovies])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMovies(1);
    setRefreshing(false);
  };

  const handleDelete = (movie) => {
    Alert.alert('Delete Movie', `Delete "${movie.cleanTitle || movie.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteMovie(token, movie._id);
            fetchMovies(page);
          } catch (e) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const renderMovie = ({ item }) => (
    <View style={styles.movieCard}>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.badges}>
          {item.type && <Text style={styles.badge}>{item.type}</Text>}
          {item.releaseYear && <Text style={styles.badgeYear}>{item.releaseYear}</Text>}
          {item.qualities?.slice(0, 2).map((q) => (
            <Text key={q} style={styles.badgeQuality}>{q}</Text>
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('MovieForm', { token, movieId: item._id })}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Movies</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('MovieForm', { token })}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={movies}
        keyExtractor={(item) => item._id}
        renderItem={renderMovie}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={
          !loading && <Text style={styles.emptyText}>No movies found</Text>
        }
      />

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
            onPress={() => page > 1 && fetchMovies(page - 1)}
            disabled={page <= 1}
          >
            <Text style={styles.pageBtnText}>← Prev</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
            onPress={() => page < totalPages && fetchMovies(page + 1)}
            disabled={page >= totalPages}
          >
            <Text style={styles.pageBtnText}>Next →</Text>
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
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
  },
  heading: { color: colors.text, fontSize: 28, fontWeight: '800' },
  addBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 20, paddingTop: 0 },
  movieCard: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  movieInfo: { flex: 1, marginRight: 10 },
  movieTitle: { color: colors.text, fontWeight: '600', fontSize: 14, lineHeight: 20 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  badge: {
    backgroundColor: colors.accent + '25', color: colors.accent, fontSize: 10,
    fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden',
  },
  badgeYear: {
    backgroundColor: colors.info + '25', color: colors.info, fontSize: 10,
    fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden',
  },
  badgeQuality: {
    backgroundColor: colors.success + '25', color: colors.success, fontSize: 10,
    fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden',
  },
  actions: { gap: 6 },
  editBtn: {
    backgroundColor: colors.info + '20', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  editBtnText: { color: colors.info, fontWeight: '600', fontSize: 12 },
  deleteBtn: {
    backgroundColor: colors.danger + '20', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  deleteBtnText: { color: colors.danger, fontWeight: '600', fontSize: 12 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 15 },
  pagination: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16,
    paddingVertical: 12, borderTopWidth: 1, borderColor: colors.border,
  },
  pageBtn: { backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  pageInfo: { color: colors.textSecondary, fontSize: 13 },
});
