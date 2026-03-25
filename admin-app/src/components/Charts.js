import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, shadows } from '../utils/theme';

// Animated bar chart with grow-from-bottom effect
export function MiniBarChart({ data = [], height = 60, color = colors.accent, label }) {
  const values = data.map(d => (typeof d === 'number' ? d : (d?.count || 0)));
  const max = Math.max(...values, 1);
  const barAnims = useRef(values.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(40, barAnims.map(anim =>
      Animated.timing(anim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false })
    )).start();
  }, [data.length]);

  return (
    <View style={styles.chartWrap}>
      {label && <Text style={styles.chartLabel}>{label}</Text>}
      <View style={[styles.barRow, { height }]}>
        {values.map((v, i) => {
          const targetH = (v / max) * height;
          const animH = (barAnims[i] || new Animated.Value(1)).interpolate({
            inputRange: [0, 1], outputRange: [0, targetH],
          });
          return (
            <View key={i} style={styles.barCol}>
              <Animated.View style={[styles.bar, {
                height: animH, backgroundColor: color,
                opacity: barAnims[i] || 1,
              }]}>
                <View style={[styles.barShine, { backgroundColor: color }]} />
              </Animated.View>
            </View>
          );
        })}
        {values.length === 0 && <Text style={styles.noData}>No data</Text>}
      </View>
    </View>
  );
}

// Animated horizontal progress bar
export function ProgressBar({ value = 0, max = 100, color = colors.accent, label, showValue = true }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: pct, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [pct]);

  const animWidth = fillAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        {showValue && <Text style={[styles.progressValue, { color }]}>{value}</Text>}
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: animWidth, backgroundColor: color }]}>
          <View style={[styles.progressShine, { backgroundColor: color }]} />
        </Animated.View>
      </View>
    </View>
  );
}

// Donut-style stat circle with glow
export function StatRing({ value, label, color = colors.accent, size = 70 }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.ring, {
      width: size, height: size, borderColor: color + '30',
      transform: [{ scale: scaleAnim }],
      ...shadows.glow(color),
    }]}>
      <Text style={[styles.ringValue, { color, fontSize: size * 0.22 }]}>{value ?? '—'}</Text>
      <Text style={[styles.ringLabel, { fontSize: size * 0.12 }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chartWrap: { marginVertical: 8 },
  chartLabel: { color: colors.textSecondary, fontSize: 11, marginBottom: 6, fontWeight: '700', letterSpacing: 0.5 },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { borderRadius: 4, width: '100%', minWidth: 4, overflow: 'hidden' },
  barShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, opacity: 0.5, borderRadius: 4 },
  noData: { color: colors.textMuted, fontSize: 11 },
  progressWrap: { marginVertical: 6 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  progressValue: { fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, overflow: 'hidden' },
  progressShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: 0.3, borderRadius: 4 },
  ring: {
    borderRadius: 999, borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  ringValue: { fontWeight: '900' },
  ringLabel: { color: colors.textMuted, marginTop: 1 },
});
