import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Animated, Easing,
} from 'react-native';
import { api } from '../utils/api';
import { colors, shadows } from '../utils/theme';
import AnimatedBackground from '../components/AnimatedBackground';

const GENRES = ['Action','Adventure','Animation','Biography','Comedy','Crime','Documentary','Drama','Family','Fantasy','History','Horror','Mystery','Romance','Sci-Fi','Science Fiction','Thriller','War','Western'];
const TYPES = ['movie','series','anime','kdrama','documentary','wwe'];
const QUALITIES = ['480p','720p','1080p','2160p','60fps'];
const LANGUAGES = ['Hindi','English','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Punjabi','Japanese','Korean','Chinese','Thai','Spanish','French','German'];
const SOURCES = ['WEB-DL','WEBRip','BluRay','HDCAM','DVDRIP','HDTV'];
const OTT = ['netflix','amazon','hotstar','disney','apple','other'];

const InputField = ({ label, value, onChangeText, placeholder, multiline, keyboardType }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      placeholderTextColor={colors.textDim}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

const ChipSelector = ({ label, options, selected, onToggle }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.chips}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.chip, isSelected && styles.chipActive]}
            onPress={() => onToggle(opt)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default function MovieFormScreen({ route, navigation }) {
  const token = route.params?.token;
  const movieId = route.params?.movieId;
  const isEditing = !!movieId;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', cleanTitle: '', description: '', releaseYear: '', duration: '',
    posterUrl: '', backdropUrl: '', imdbRating: '', telegramUrl: '',
    type: 'movie', categories: [], source: '', ottPlatform: '', isFeatured: false, isAdult: false,
    genres: [], qualities: [], audioLanguages: [], tags: [],
    downloadLinks: [{ label: '', quality: '1080p', url: '', size: '' }],
    screenshots: [''],
  });
  const [tagInput, setTagInput] = useState('');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const saveBtnAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(formAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(saveBtnAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.4, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (isEditing) {
      loadMovie();
    }
  }, [movieId]);

  const loadMovie = async () => {
    try {
      const res = await api.getMovie(token, movieId);
      if (res.data) {
        const m = res.data;
        setForm({
          title: m.title || '', cleanTitle: m.cleanTitle || '', description: m.description || '',
          releaseYear: m.releaseYear?.toString() || '', duration: m.duration || '',
          posterUrl: m.posterUrl || '', backdropUrl: m.backdropUrl || '',
          imdbRating: m.imdbRating?.toString() || '', telegramUrl: m.telegramUrl || '',
          type: m.type || 'movie', categories: m.categories || [], source: m.source || '', ottPlatform: m.ottPlatform || '',
          isFeatured: m.isFeatured || false, isAdult: m.isAdult || false,
          genres: m.genres || [], qualities: m.qualities || [], audioLanguages: m.audioLanguages || [],
          tags: m.tags || [],
          downloadLinks: m.downloadLinks?.length ? m.downloadLinks : [{ label: '', quality: '1080p', url: '', size: '' }],
          screenshots: m.screenshots?.length ? m.screenshots : [''],
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load movie');
    }
  };

  const toggleArrayItem = (field, item) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter((x) => x !== item) : [...prev[field], item],
    }));
  };

  const updateDownloadLink = (index, key, value) => {
    const updated = [...form.downloadLinks];
    updated[index] = { ...updated[index], [key]: value };
    setForm({ ...form, downloadLinks: updated });
  };

  const addDownloadLink = () => {
    setForm({ ...form, downloadLinks: [...form.downloadLinks, { label: '', quality: '1080p', url: '', size: '' }] });
  };

  const removeDownloadLink = (index) => {
    if (form.downloadLinks.length <= 1) return;
    setForm({ ...form, downloadLinks: form.downloadLinks.filter((_, i) => i !== index) });
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });

  const handleSave = async () => {
    if (!form.title.trim()) { Alert.alert('Error', 'Title is required'); return; }
    setLoading(true);
    try {
      const cleanTitle = form.cleanTitle.trim() || form.title.trim();
      const payload = {
        title: form.title.trim(),
        cleanTitle,
        description: form.description || undefined,
        releaseYear: form.releaseYear ? parseInt(form.releaseYear) : undefined,
        duration: form.duration || undefined,
        imdbRating: form.imdbRating ? parseFloat(form.imdbRating) : undefined,
        posterUrl: form.posterUrl.trim() || undefined,
        backdropUrl: form.backdropUrl.trim() || undefined,
        telegramUrl: form.telegramUrl.trim() || undefined,
        type: form.categories.length ? form.categories[0] : (form.type || undefined),
        categories: form.categories.length ? form.categories : undefined,
        source: form.source || undefined,
        ottPlatform: form.ottPlatform || undefined,
        isFeatured: form.isFeatured,
        isAdult: form.isAdult,
        genres: form.genres.length ? form.genres : undefined,
        qualities: form.qualities.length ? form.qualities : undefined,
        audioLanguages: form.audioLanguages.length ? form.audioLanguages : undefined,
        tags: form.tags.length ? form.tags : undefined,
        screenshots: form.screenshots.filter((s) => s.trim()),
        downloadLinks: form.downloadLinks.filter((l) => l.url.trim()),
      };
      const res = isEditing
        ? await api.updateMovie(token, movieId, payload)
        : await api.createMovie(token, payload);
      if (res.data) {
        Alert.alert('Success', isEditing ? 'Movie updated' : 'Movie created');
        navigation.goBack();
      } else {
        Alert.alert('Error', res.error || 'Failed to save');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground intensity="minimal" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 0] }) }] }}>
          <View style={styles.headerCard}>
            <Text style={styles.headerEmoji}>{isEditing ? '✏️' : '🎬'}</Text>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Content' : 'Add New Content'}</Text>
            <Text style={styles.headerSub}>Fill in the details below</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: formAnim, transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Basic Info</Text>
            <InputField label="Title *" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <InputField label="Clean Title" value={form.cleanTitle} onChangeText={(v) => setForm({ ...form, cleanTitle: v })} />
            <InputField label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Details</Text>
            <InputField label="Release Year" value={form.releaseYear} onChangeText={(v) => setForm({ ...form, releaseYear: v })} keyboardType="numeric" />
            <InputField label="Duration" value={form.duration} onChangeText={(v) => setForm({ ...form, duration: v })} placeholder="e.g. 2h 15m" />
            <InputField label="IMDb Rating" value={form.imdbRating} onChangeText={(v) => setForm({ ...form, imdbRating: v })} keyboardType="decimal-pad" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🖼️ Media</Text>
            <InputField label="Poster URL" value={form.posterUrl} onChangeText={(v) => setForm({ ...form, posterUrl: v })} />
            <InputField label="Backdrop URL" value={form.backdropUrl} onChangeText={(v) => setForm({ ...form, backdropUrl: v })} />
            <InputField label="Telegram URL" value={form.telegramUrl} onChangeText={(v) => setForm({ ...form, telegramUrl: v })} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Classification</Text>
            <ChipSelector label="Categories (select multiple)" options={TYPES} selected={form.categories} onToggle={(t) => toggleArrayItem('categories', t)} />

            <View style={styles.field}>
              <Text style={styles.label}>Source</Text>
              <View style={styles.chips}>
                {SOURCES.map((s) => (
                  <TouchableOpacity key={s} style={[styles.chip, form.source === s && styles.chipActive]} onPress={() => setForm({ ...form, source: form.source === s ? '' : s })} activeOpacity={0.7}>
                    <Text style={[styles.chipText, form.source === s && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>OTT Platform</Text>
              <View style={styles.chips}>
                {OTT.map((o) => (
                  <TouchableOpacity key={o} style={[styles.chip, form.ottPlatform === o && styles.chipActive]} onPress={() => setForm({ ...form, ottPlatform: form.ottPlatform === o ? '' : o })} activeOpacity={0.7}>
                    <Text style={[styles.chipText, form.ottPlatform === o && styles.chipTextActive]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ChipSelector label="Genres" options={GENRES} selected={form.genres} onToggle={(g) => toggleArrayItem('genres', g)} />
            <ChipSelector label="Qualities" options={QUALITIES} selected={form.qualities} onToggle={(q) => toggleArrayItem('qualities', q)} />
            <ChipSelector label="Audio Languages" options={LANGUAGES} selected={form.audioLanguages} onToggle={(l) => toggleArrayItem('audioLanguages', l)} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏷️ Tags</Text>
            <View style={styles.tagRow}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={tagInput} onChangeText={setTagInput}
                placeholder="Add tag..." placeholderTextColor={colors.textDim} onSubmitEditing={addTag} />
              <TouchableOpacity style={styles.tagAddBtn} onPress={addTag} activeOpacity={0.8}>
                <Text style={styles.tagAddText}>+</Text>
              </TouchableOpacity>
            </View>
            {form.tags.length > 0 && (
              <View style={[styles.chips, { marginTop: 8 }]}>
                {form.tags.map((tag) => (
                  <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => removeTag(tag)} activeOpacity={0.7}>
                    <Text style={styles.tagChipText}>{tag} ×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Settings</Text>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleEmoji}>⭐</Text>
                <Text style={styles.toggleLabel}>Featured</Text>
              </View>
              <Switch value={form.isFeatured} onValueChange={(v) => setForm({ ...form, isFeatured: v })} trackColor={{ true: colors.accent, false: colors.border }} />
            </View>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleEmoji}>🔞</Text>
                <Text style={styles.toggleLabel}>Adult</Text>
              </View>
              <Switch value={form.isAdult} onValueChange={(v) => setForm({ ...form, isAdult: v })} trackColor={{ true: colors.accent, false: colors.border }} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⬇️ Download Links</Text>
            {form.downloadLinks.map((link, i) => (
              <View key={i} style={styles.dlCard}>
                <View style={styles.dlHeader}>
                  <Text style={styles.dlNum}>Link #{i + 1}</Text>
                  {form.downloadLinks.length > 1 && (
                    <TouchableOpacity style={styles.removeDlBtn} onPress={() => removeDownloadLink(i)} activeOpacity={0.7}>
                      <Text style={styles.removeDlText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.dlRow}>
                  <TextInput style={[styles.input, { flex: 1 }]} value={link.label} onChangeText={(v) => updateDownloadLink(i, 'label', v)} placeholder="Label" placeholderTextColor={colors.textDim} />
                  <TextInput style={[styles.input, { width: 80 }]} value={link.quality} onChangeText={(v) => updateDownloadLink(i, 'quality', v)} placeholder="Quality" placeholderTextColor={colors.textDim} />
                </View>
                <TextInput style={styles.input} value={link.url} onChangeText={(v) => updateDownloadLink(i, 'url', v)} placeholder="Download URL" placeholderTextColor={colors.textDim} />
                <TextInput style={styles.input} value={link.size} onChangeText={(v) => updateDownloadLink(i, 'size', v)} placeholder="Size (e.g. 1.4 GB)" placeholderTextColor={colors.textDim} />
              </View>
            ))}
            <TouchableOpacity style={styles.addDlBtn} onPress={addDownloadLink} activeOpacity={0.7}>
              <Text style={styles.addDlText}>+ Add Download Link</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Screenshots</Text>
            {form.screenshots.map((url, i) => (
              <View key={i} style={styles.dlRow}>
                <TextInput style={[styles.input, { flex: 1 }]} value={url}
                  onChangeText={(v) => { const u = [...form.screenshots]; u[i] = v; setForm({ ...form, screenshots: u }); }}
                  placeholder="Screenshot URL" placeholderTextColor={colors.textDim} />
                {form.screenshots.length > 1 && (
                  <TouchableOpacity style={styles.removeDlBtn} onPress={() => setForm({ ...form, screenshots: form.screenshots.filter((_, j) => j !== i) })} activeOpacity={0.7}>
                    <Text style={styles.removeDlText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addDlBtn} onPress={() => setForm({ ...form, screenshots: [...form.screenshots, ''] })} activeOpacity={0.7}>
              <Text style={styles.addDlText}>+ Add Screenshot</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: saveBtnAnim, transform: [{ scale: Animated.multiply(saveBtnAnim, pressAnim) }] }}>
          <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}
            onPressIn={() => Animated.spring(pressAnim, { toValue: 0.95, friction: 8, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(pressAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start()}
            activeOpacity={0.9}>
            <Text style={styles.saveBtnText}>{loading ? '⏳ Saving...' : (isEditing ? '✅ Update Movie' : '🚀 Create Movie')}</Text>
            <Animated.View style={[styles.saveBtnGlow, { opacity: glowAnim }]} />
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  headerCard: {
    backgroundColor: 'rgba(14,14,26,0.8)', borderRadius: 20, padding: 24, marginBottom: 16,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', ...shadows.md,
  },
  headerEmoji: { fontSize: 36, marginBottom: 8 },
  headerTitle: { color: colors.text, fontSize: 22, fontWeight: '900' },
  headerSub: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  section: {
    backgroundColor: 'rgba(14,14,26,0.7)', borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border, ...shadows.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 14, letterSpacing: 0.2 },
  field: { marginBottom: 14 },
  label: { color: colors.textMuted, fontSize: 11, fontWeight: '800', marginBottom: 6, letterSpacing: 1 },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 13, color: colors.text,
    fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: 'rgba(22,22,40,0.7)', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent + '20', borderColor: colors.accent, ...shadows.glow(colors.accent) },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: colors.accentLight, fontWeight: '700' },
  tagRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  tagAddBtn: {
    backgroundColor: colors.accent, width: 44, height: 44, borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', ...shadows.glow(colors.accent),
  },
  tagAddText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  tagChip: { backgroundColor: colors.accent + '15', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.accent + '25' },
  tagChipText: { color: colors.accentLight, fontSize: 12, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(22,22,40,0.5)', borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  toggleInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleEmoji: { fontSize: 18 },
  toggleLabel: { color: colors.text, fontWeight: '700', fontSize: 14 },
  dlCard: {
    backgroundColor: 'rgba(22,22,40,0.5)', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  dlHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dlNum: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  dlRow: { flexDirection: 'row', gap: 8 },
  removeDlBtn: { backgroundColor: colors.danger + '18', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: colors.danger + '25' },
  removeDlText: { color: colors.danger, fontWeight: '700', fontSize: 12 },
  addDlBtn: {
    borderWidth: 1, borderColor: colors.accent + '30', borderStyle: 'dashed', borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  addDlText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  saveBtn: {
    backgroundColor: colors.accent, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8,
    overflow: 'hidden', ...shadows.glow(colors.accent),
  },
  saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 0.3 },
  saveBtnGlow: {
    position: 'absolute', bottom: -5, left: '20%', right: '20%', height: 20,
    backgroundColor: colors.accent, borderRadius: 10,
  },
});
