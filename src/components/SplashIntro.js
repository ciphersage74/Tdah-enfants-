import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

// Durée minimale d'affichage pour que l'animation soit visible même
// si le chargement de l'état est instantané
const MIN_DISPLAY_MS = 1800;

export default function SplashIntro({ ready, onDone }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(1)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const mountedAt = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    const entry = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]);
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(haloScale, { toValue: 1.12, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(haloScale, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    entry.start();
    pulse.start();
    return () => { entry.stop(); pulse.stop(); };
  }, []);

  // Quand l'app est prête ET la durée minimale écoulée → fondu de sortie
  useEffect(() => {
    if (!ready || doneRef.current) return;
    const elapsed = Date.now() - mountedAt.current;
    const t = setTimeout(() => {
      doneRef.current = true;
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true })
        .start(({ finished }) => { if (finished) onDone?.(); });
    }, Math.max(MIN_DISPLAY_MS - elapsed, 0));
    return () => clearTimeout(t);
  }, [ready]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.wrap, { opacity: screenOpacity }]} pointerEvents="none">
      <LinearGradient colors={['#6C3AE8', '#4C1D95']} style={[StyleSheet.absoluteFill, styles.center]}>
        <Animated.View style={[styles.halo, { transform: [{ scale: haloScale }] }]} />
        <Animated.View style={[styles.logoCircle, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <Text style={styles.logoEmoji}>⭐</Text>
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
          FocusHéros
        </Animated.Text>
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Chaque jour, une nouvelle victoire
        </Animated.Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 100, elevation: 100 },
  center: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoEmoji: { fontSize: 64 },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
});
