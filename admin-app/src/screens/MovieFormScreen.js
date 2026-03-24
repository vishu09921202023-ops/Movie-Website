import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch,
} from 'react-native';
import { api } from '../utils/api';
import { colors } from '../utils/theme';

const GENRES = ['Action','Adventure','Animation','Biography','Comedy','Crime','Documentary','Drama','Family','Fantasy','History','Horror','Mystery','Romance','Sci-Fi','Science Fiction','Thriller','War','Western'];
const TYPES = ['movie','series','anime','kdrama','documentary','tvshow'];
const QUALITIES = ['480p','720p','1080p','2160p','60fps'];
const LANGUAGES = ['Hindi','English','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi','Punjabi','Japanese','Korean','Chinese','Thai','Spanish','French','German'];
const SOURCES = ['WEB-DL','WEBRip','BluRay','HDRip','DVDRip','HDTV','CAMRip'];
const OTT = ['netflix','amazon','hotstar','disney','apple','other'];

const InputField = ({ label, value, onChangeText, placeholder, multiline, keyboardType }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || label}
      placeholderTextColor={colors.textMuted}
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
    type: 'movie', source: '', ottPlatform: '', isFeatured: false, isAdult: false,
    genres: [], qualities: [], audioLanguages: [], tags: [],
    downloadLinks: [{ label: '', quality: '1080p', url: '', size: '' }],
    screenshots: [''],
  });
  const [tagInput, setTagInput] = useState('');

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
          type: m.type || 'movie', source: m.source || '', ottPlatform: m.ottPlatform || '',
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
      const payload = {
        ...form,
        releaseYear: form.releaseYear ? parseInt(form.releaseYear) : undefined,
        imdbRating: form.imdbRating ? parseFloat(form.imdbRating) : undefined,
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
      Alert.alert('Error', 'Failed to save movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <InputField label="Title *" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
      <InputField label="Clean Title" value={form.cleanTitle} onChangeText={(v) => setForm({ ...form, cleanTitle: v })} />
      <InputField label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
      <InputField label="Release Year" value={form.releaseYear} onChangeText={(v) => setForm({ ...form, releaseYear: v })} keyboardType="numeric" />
      <InputField label="Duration" value={form.duration} onChangeText={(v) => setForm({ ...form, duration: v })} placeholder="e.g. 2h 15m" />
      <InputField label="IMDb Rating" value={form.imdbRating} onChangeText={(v) => setForm({ ...form, imdbRating: v })} keyboardType="decimal-pad" />
      <InputField label="Poster URL" value={form.posterUrl} onChangeText={(v) => setForm({ ...form, posterUrl: v })} />
      <InputField label="Backdrop URL" value={form.backdropUrl} onChangeText={(v) => setForm({ ...form, backdropUrl: v })} />
      <InputField label="Telegram URL" value={form.telegramUrl} onChangeText={(v) => setForm({ ...form, telegramUrl: v })} />

      {/* Type selector */}
      <View style={styles.field}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chips}>
          {TYPES.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, form.type === t && styles.chipActive]} onPress={() => setForm({ ...form, type: t })}>
              <Text style={[styles.chipText, form.type === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Source */}
      <View style={styles.field}>
        <Text style={styles.label}>Source</Text>
        <View style={styles.chips}>
          {SOURCES.map((s) => (
            <TouchableOpacity key={s} style={[styles.chip, form.source === s && styles.chipActive]} onPress={() => setForm({ ...form, source: form.source === s ? '' : s })}>
              <Text style={[styles.chipText, form.source === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* OTT Platform */}
      <View style={styles.field}>
        <Text style={styles.label}>OTT Platform</Text>
        <View style={styles.chips}>
          {OTT.map((o) => (
            <TouchableOpacity key={o} style={[styles.chip, form.ottPlatform === o && styles.chipActive]} onPress={() => setForm({ ...form, ottPlatform: form.ottPlatform === o ? '' : o })}>
              <Text style={[styles.chipText, form.ottPlatform === o && styles.chipTextActive]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ChipSelector label="Genres" options={GENRES} selected={form.genres} onToggle={(g) => toggleArrayItem('genres', g)} />
      <ChipSelector label="Qualities" options={QUALITIES} selected={form.qualities} onToggle={(q) => toggleArrayItem('qualities', q)} />
      <ChipSelector label="Audio Languages" options={LANGUAGES} selected={form.audioLanguages} onToggle={(l) => toggleArrayItem('audioLanguages', l)} />

      {/* Tags */}
      <View style={styles.field}>
        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Add tag..."
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
            <Text style={styles.tagAddText}>+</Text>
          </TouchableOpacity>
        </View>
        {form.tags.length > 0 && (
          <View style={[styles.chips, { marginTop: 8 }]}>
            {form.tags.map((tag) => (
              <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => removeTag(tag)}>
                <Text style={styles.tagChipText}>{tag} ×</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Toggles */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Featured</Text>
        <Switch
          value={form.isFeatured}
          onValueChange={(v) => setForm({ ...form, isFeatured: v })}
          trackColor={{ true: colors.accent }}
        />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Adult</Text>
        <Switch
          value={form.isAdult}
          onValueChange={(v) => setForm({ ...form, isAdult: v })}
          trackColor={{ true: colors.accent }}
        />
      </View>

      {/* Download Links */}
      <Text style={[styles.label, { marginTop: 16 }]}>Download Links</Text>
      {form.downloadLinks.map((link, i) => (
        <View key={i} style={styles.dlCard}>
          <View style={styles.dlRow}>
            <TextInput style={[styles.input, { flex: 1 }]} value={link.label} onChangeText={(v) => updateDownloadLink(i, 'label', v)} placeholder="Label" placeholderTextColor={colors.textMuted} />
            <TextInput style={[styles.input, { width: 80 }]} value={link.quality} onChangeText={(v) => updateDownloadLink(i, 'quality', v)} placeholder="Quality" placeholderTextColor={colors.textMuted} />
          </View>
          <TextInput style={styles.input} value={link.url} onChangeText={(v) => updateDownloadLink(i, 'url', v)} placeholder="Download URL" placeholderTextColor={colors.textMuted} />
          <View style={styles.dlRow}>
            <TextInput style={[styles.input, { flex: 1 }]} value={link.size} onChangeText={(v) => updateDownloadLink(i, 'size', v)} placeholder="Size (e.g. 1.4 GB)" placeholderTextColor={colors.textMuted} />
            {form.downloadLinks.length > 1 && (
              <TouchableOpacity style={styles.removeDlBtn} onPress={() => removeDownloadLink(i)}>
                <Text style={styles.removeDlText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addDlBtn} onPress={addDownloadLink}>
        <Text style={styles.addDlText}>+ Add Download Link</Text>
      </TouchableOpacity>

      {/* Screenshots */}
      <Text style={[styles.label, { marginTop: 16 }]}>Screenshots</Text>
      {form.screenshots.map((url, i) => (
        <View key={i} style={styles.dlRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={url}
            onChangeText={(v) => {
              const updated = [...form.screenshots];
              updated[i] = v;
              setForm({ ...form, screenshots: updated });
            }}
            placeholder="Screenshot URL"
            placeholderTextColor={colors.textMuted}
          />
          {form.screenshots.length > 1 && (
            <TouchableOpacity style={styles.removeDlBtn} onPress={() => setForm({ ...form, screenshots: form.screenshots.filter((_, j) => j !== i) })}>
              <Text style={styles.removeDlText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addDlBtn} onPress={() => setForm({ ...form, screenshots: [...form.screenshots, ''] })}>
        <Text style={styles.addDlText}>+ Add Screenshot</Text>
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveBtnText}>{loading ? 'Saving...' : (isEditing ? 'Update Movie' : 'Create Movie')}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20 },
  field: { marginBottom: 16 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceLight, borderRadius: 10, padding: 12, color: colors.text,
    fontSize: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: colors.surfaceLight, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent + '25', borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: colors.accent },
  tagRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  tagAddBtn: { backgroundColor: colors.accent, width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tagAddText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  tagChip: { backgroundColor: colors.surfaceLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  tagChipText: { color: colors.textSecondary, fontSize: 12 },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  toggleLabel: { color: colors.text, fontWeight: '600', fontSize: 14 },
  dlCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  dlRow: { flexDirection: 'row', gap: 8 },
  removeDlBtn: { backgroundColor: colors.danger + '20', borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center', marginBottom: 8 },
  removeDlText: { color: colors.danger, fontWeight: '600', fontSize: 12 },
  addDlBtn: {
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 10,
    padding: 12, alignItems: 'center', marginBottom: 16,
  },
  addDlText: { color: colors.textSecondary, fontWeight: '600', fontSize: 13 },
  saveBtn: {
    backgroundColor: colors.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
