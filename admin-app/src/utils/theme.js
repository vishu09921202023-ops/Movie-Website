import { Animated, Easing } from 'react-native';

export const colors = {
  bg: '#04040a',
  bgGradientStart: '#06060e',
  bgGradientEnd: '#0a0614',
  surface: '#0e0e1a',
  surfaceLight: '#161628',
  surfaceHover: '#1a1a32',
  card: '#0f0f1e',
  cardHighlight: '#141430',
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.1)',
  borderAccent: 'rgba(229,9,20,0.2)',
  accent: '#e50914',
  accentLight: '#ff3040',
  accentDark: '#b80710',
  accentGlow: 'rgba(229,9,20,0.15)',
  accentGlowStrong: 'rgba(229,9,20,0.3)',
  text: '#f0f0f5',
  textSecondary: '#9ca3af',
  textMuted: '#5a5f72',
  textDim: '#3a3f52',
  success: '#10b981',
  successLight: 'rgba(16,185,129,0.12)',
  warning: '#f59e0b',
  warningLight: 'rgba(245,158,11,0.12)',
  danger: '#ef4444',
  dangerLight: 'rgba(239,68,68,0.12)',
  info: '#3b82f6',
  infoLight: 'rgba(59,130,246,0.12)',
  purple: '#8b5cf6',
  purpleLight: 'rgba(139,92,246,0.12)',
  cyan: '#06b6d4',
  cyanLight: 'rgba(6,182,212,0.12)',
  pink: '#ec4899',
  pinkLight: 'rgba(236,72,153,0.12)',
  orange: '#f97316',
  orangeLight: 'rgba(249,115,22,0.12)',
  gold: '#eab308',
  goldLight: 'rgba(234,179,8,0.12)',
  neon: '#00ff88',
  neonLight: 'rgba(0,255,136,0.08)',
};

export const CATEGORY_CONFIG = {
  movie: { emoji: '🎬', label: 'Movies', color: colors.accent, bg: colors.accentGlow, icon: '🎬' },
  series: { emoji: '📺', label: 'Web Series', color: colors.info, bg: colors.infoLight, icon: '📺' },
  anime: { emoji: '⛩️', label: 'Anime', color: colors.purple, bg: colors.purpleLight, icon: '⛩️' },
  kdrama: { emoji: '🇰🇷', label: 'K-Drama', color: colors.pink, bg: colors.pinkLight, icon: '🇰🇷' },
  documentary: { emoji: '🎥', label: 'Documentary', color: colors.cyan, bg: colors.cyanLight, icon: '🎥' },
  wwe: { emoji: '🤼', label: 'WWE', color: colors.orange, bg: colors.orangeLight, icon: '🤼' },
};

// Animation presets for premium feel
export const animations = {
  // Fade in with slide up
  fadeInUp: (animValue, delay = 0, duration = 600) => {
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  },

  // Scale bounce in
  bounceIn: (animValue, delay = 0) => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(animValue, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  },

  // Pulse glow effect
  pulseGlow: (animValue) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0.3, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  },

  // Shimmer loading effect
  shimmer: (animValue) => {
    Animated.loop(
      Animated.timing(animValue, { toValue: 1, duration: 1500, easing: Easing.linear, useNativeDriver: true })
    ).start();
  },

  // Float up and down
  float: (animValue) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: -8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  },

  // Rotate continuously
  rotate: (animValue) => {
    Animated.loop(
      Animated.timing(animValue, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  },

  // Scale press effect
  pressIn: (animValue) => {
    Animated.spring(animValue, { toValue: 0.95, friction: 8, useNativeDriver: true }).start();
  },
  pressOut: (animValue) => {
    Animated.spring(animValue, { toValue: 1, friction: 8, useNativeDriver: true }).start();
  },
};

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  glow: (color = colors.accent) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
};
