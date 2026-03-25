import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Floating particle component
const FloatingParticle = ({ delay, startX, size, duration, color }) => {
  const translateY = useRef(new Animated.Value(SCREEN_H + 50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateParticle = () => {
      translateY.setValue(SCREEN_H + 50);
      translateX.setValue(0);
      rotate.setValue(0);
      opacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: duration,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.6, duration: 1000, delay, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: duration - 2000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.timing(rotate, {
          toValue: 1,
          duration: duration,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateX, { toValue: 30, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(translateX, { toValue: -30, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          ])
        ),
      ]).start(() => animateParticle());
    };
    animateParticle();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          width: size,
          height: size * 0.75,
          borderColor: color,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
        },
      ]}
    >
      <View style={[styles.particlePlay, { borderLeftColor: color }]} />
    </Animated.View>
  );
};

// Glowing orb component
const GlowOrb = ({ size, color, startX, startY, delay }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateX, { toValue: 40, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -50, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.2, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateX, { toValue: -30, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 30, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.8, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          backgroundColor: color,
          left: startX,
          top: startY,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
};

// Scanning beam
const ScanBeam = ({ delay }) => {
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: SCREEN_H + 200, duration: 6000, easing: Easing.linear, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.15, duration: 1000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.15, duration: 4000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ]),
        ]),
        Animated.timing(translateY, { toValue: -200, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[styles.scanBeam, { opacity, transform: [{ translateY }] }]}
    />
  );
};

export default function AnimatedBackground({ intensity = 'full' }) {
  const minimal = intensity === 'minimal';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Gradient orbs */}
      <GlowOrb size={250} color="rgba(229,9,20,0.08)" startX={-50} startY={-30} delay={0} />
      <GlowOrb size={200} color="rgba(139,92,246,0.06)" startX={SCREEN_W - 100} startY={SCREEN_H * 0.3} delay={2000} />
      {!minimal && <GlowOrb size={180} color="rgba(59,130,246,0.05)" startX={SCREEN_W * 0.3} startY={SCREEN_H * 0.7} delay={4000} />}

      {/* Film particles */}
      <FloatingParticle delay={0} startX={SCREEN_W * 0.1} size={24} duration={15000} color="rgba(229,9,20,0.3)" />
      <FloatingParticle delay={3000} startX={SCREEN_W * 0.4} size={18} duration={18000} color="rgba(139,92,246,0.25)" />
      {!minimal && <FloatingParticle delay={6000} startX={SCREEN_W * 0.7} size={22} duration={16000} color="rgba(59,130,246,0.25)" />}
      {!minimal && <FloatingParticle delay={9000} startX={SCREEN_W * 0.85} size={16} duration={20000} color="rgba(229,9,20,0.2)" />}

      {/* Scan beams */}
      {!minimal && <ScanBeam delay={0} />}
      {!minimal && <ScanBeam delay={3000} />}

      {/* Grid overlay */}
      <View style={styles.grid} />
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 3,
  },
  particlePlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -4,
    marginLeft: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    borderWidth: 0,
  },
});
