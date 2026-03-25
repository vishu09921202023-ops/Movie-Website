import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors, animations, shadows } from '../utils/theme';

// Premium glass-morphism card with entrance animation
export function GlassCard({ children, style, delay = 0, onPress, glowColor, noPadding }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    animations.fadeInUp(fadeAnim, delay);
  }, []);

  const translateY = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const content = (
    <Animated.View
      style={[
        styles.glass,
        glowColor && { borderColor: glowColor + '25', ...shadows.glow(glowColor) },
        noPadding ? {} : styles.glassPadding,
        style,
        { opacity: fadeAnim, transform: [{ translateY }, { scale: scaleAnim }] },
      ]}
    >
      {glowColor && <View style={[styles.glowBar, { backgroundColor: glowColor }]} />}
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={() => animations.pressIn(scaleAnim)}
        onPressOut={() => animations.pressOut(scaleAnim)}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Animated stat card with number counter feel
export function StatCard({ emoji, label, value, color, delay = 0, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    animations.fadeInUp(fadeAnim, delay);
    animations.bounceIn(scaleAnim, delay);
  }, []);

  const translateY = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPressIn={() => animations.pressIn(pressAnim)}
      onPressOut={() => animations.pressOut(pressAnim)}
      onPress={onPress}
      style={{ width: '48%' }}
    >
      <Animated.View
        style={[
          styles.statCard,
          { borderColor: (color || colors.accent) + '20' },
          { opacity: fadeAnim, transform: [{ translateY }, { scale: Animated.multiply(scaleAnim, pressAnim) }] },
        ]}
      >
        <View style={styles.statCardInner}>
          <Animated.Text style={[styles.statEmoji, { transform: [{ scale: scaleAnim }] }]}>{emoji}</Animated.Text>
          <Animated.Text style={[styles.statValue, { color: color || colors.text }]}>{value ?? '—'}</Animated.Text>
          <Animated.Text style={styles.statLabel}>{label}</Animated.Text>
        </View>
        {/* Bottom accent line */}
        <View style={[styles.statAccentLine, { backgroundColor: color || colors.accent }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(14,14,26,0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.md,
  },
  glassPadding: {
    padding: 16,
  },
  glowBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.5,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.sm,
  },
  statCardInner: {
    padding: 14,
    alignItems: 'flex-start',
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statAccentLine: {
    height: 3,
    opacity: 0.3,
  },
});
