import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import HeroAvatar from '../components/HeroAvatar';

const { width, height } = Dimensions.get('window');
const PARTICLE_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A8E063', '#FF9FF3', '#FFEAA7'];
const PARTICLE_COUNT = 24;

function Particle({ delay }) {
  const x = useRef(new Animated.Value(Math.random() * width)).current;
  const y = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
  const size = 8 + Math.random() * 10;
  const isCircle = Math.random() > 0.5;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(y, { toValue: height + 20, duration: 2500 + Math.random() * 1500, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 720, duration: 2000, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 720], outputRange: ['0deg', '720deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        transform: [{ rotate: spin }],
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: isCircle ? size / 2 : 2,
      }}
    />
  );
}

export default function CelebrationScreen({ navigation, route }) {
  const { coinsEarned, leveledUp, newLevel, routineId } = route.params;
  const { childName, avatarId, level } = useAppStore();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();

    if (leveledUp) {
      const t = setTimeout(() => setShowLevelUp(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const routineNames = { morning: 'du Matin', evening: 'du Soir' };
  const suffix = routineNames[routineId] || '';

  return (
    <LinearGradient colors={GRADIENTS.celebration} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>

        {/* Confetti */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <Particle key={i} delay={i * 80} />
          ))}
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.congrats}>🎉 BRAVO !</Text>
          <HeroAvatar avatarId={avatarId} size={100} />
          <Text style={styles.heroName}>{childName}</Text>
          <Text style={styles.subTitle}>Quête {suffix} accomplie !</Text>

          {/* Rewards */}
          <View style={styles.rewardBox}>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardEmoji}>🪙</Text>
              <Text style={styles.rewardValue}>+{coinsEarned}</Text>
              <Text style={styles.rewardLabel}>pièces gagnées</Text>
            </View>
          </View>

          {showLevelUp && (
            <View style={styles.levelUpBox}>
              <Text style={styles.levelUpText}>⭐ NIVEAU {newLevel} !</Text>
              <Text style={styles.levelUpSub}>Tu as passé un niveau !</Text>
            </View>
          )}
        </Animated.View>

        {/* Button */}
        <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.continueBtnText}>Continuer l'aventure →</Text>
        </TouchableOpacity>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 24 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  congrats: {
    fontSize: 44,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
  },
  heroName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 12,
  },
  subTitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    textAlign: 'center',
  },
  rewardBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rewardEmoji: { fontSize: 32 },
  rewardValue: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.gold,
  },
  rewardLabel: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '600',
  },
  levelUpBox: {
    backgroundColor: COLORS.gold,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  levelUpText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
  },
  levelUpSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  continueBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
});
