import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../constants/colors';
import { useActiveProfile } from '../hooks/useActiveProfile';
import HeroAvatar from '../components/HeroAvatar';

const { width, height } = Dimensions.get('window');
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#A8E063', '#C084FC', '#FBBF24'];

function Confetti() {
  const pieces = Array.from({ length: 20 });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((_, i) => {
        const x = useRef(new Animated.Value(Math.random() * width)).current;
        const y = useRef(new Animated.Value(-20)).current;
        const op = useRef(new Animated.Value(0)).current;
        const rot = useRef(new Animated.Value(0)).current;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const size = 7 + Math.random() * 9;
        useEffect(() => {
          Animated.sequence([
            Animated.delay(i * 100),
            Animated.parallel([
              Animated.timing(op, { toValue: 1, duration: 100, useNativeDriver: true }),
              Animated.timing(y, { toValue: height + 30, duration: 2200 + Math.random() * 1400, useNativeDriver: true }),
              Animated.timing(rot, { toValue: 540, duration: 2000, useNativeDriver: true }),
            ]),
            Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]).start();
        }, []);
        const spin = rot.interpolate({ inputRange: [0, 540], outputRange: ['0deg', '540deg'] });
        return (
          <Animated.View
            key={i}
            style={{ position: 'absolute', left: x, top: y, opacity: op, transform: [{ rotate: spin }], width: size, height: size, backgroundColor: color, borderRadius: Math.random() > 0.5 ? size / 2 : 1 }}
          />
        );
      })}
    </View>
  );
}

export default function CelebrationScreen({ navigation, route }) {
  const { coinsEarned, leveledUp, newLevel, newBadges = [], routineId } = route.params;
  const profile = useActiveProfile();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const routineName = { morning: 'du Matin', evening: 'du Soir' }[routineId] || '';

  return (
    <LinearGradient colors={GRADIENTS.celebration} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Confetti />

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.congrats}>BRAVO !</Text>

          <HeroAvatar
            avatarId={profile?.avatarId || 'hero'}
            size={100}
            equippedItems={profile?.equippedItems || []}
          />

          <Text style={styles.heroName}>{profile?.childName}</Text>
          <Text style={styles.routineName}>Quête {routineName} accomplie !</Text>

          <View style={styles.rewardRow}>
            <Text style={styles.rewardEmoji}>🪙</Text>
            <Text style={styles.rewardCoins}>+{coinsEarned}</Text>
            <Text style={styles.rewardLabel}>pièces</Text>
          </View>

          {leveledUp && (
            <View style={styles.levelUpBox}>
              <Text style={styles.levelUpText}>⭐  NIVEAU {newLevel} !</Text>
            </View>
          )}

          {newBadges.length > 0 && (
            <View style={styles.badgesBox}>
              <Text style={styles.badgesTitle}>Badge{newBadges.length > 1 ? 's' : ''} débloqué{newBadges.length > 1 ? 's' : ''} !</Text>
              <View style={styles.badgesList}>
                {newBadges.map((b) => (
                  <View key={b.id} style={styles.badgePill}>
                    <Text style={styles.badgePillEmoji}>{b.emoji}</Text>
                    <Text style={styles.badgePillLabel}>{b.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>

        <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.continueBtnText}>Continuer →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%' },
  congrats: { fontSize: 40, fontWeight: '900', color: COLORS.white },
  heroName: { fontSize: 26, fontWeight: '900', color: COLORS.white, marginTop: 8 },
  routineName: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  rewardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  rewardEmoji: { fontSize: 28 },
  rewardCoins: { fontSize: 44, fontWeight: '900', color: COLORS.gold },
  rewardLabel: { fontSize: 16, color: COLORS.white, fontWeight: '600' },
  levelUpBox: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 4,
  },
  levelUpText: { fontSize: 20, fontWeight: '900', color: COLORS.white },
  badgesBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    gap: 10,
  },
  badgesTitle: { fontSize: 14, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  badgesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  badgePillEmoji: { fontSize: 18 },
  badgePillLabel: { fontSize: 13, color: COLORS.white, fontWeight: '700' },
  continueBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  continueBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.primary },
});
