import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

const CHEERS = ['Bravo !', 'Super !', 'Génial !', 'Trop fort !', 'Champion !', 'Incroyable !', 'Yes !', 'Bien joué !'];

// Le compagnon équipé (ou une étoile) saute de joie à chaque tâche validée.
// Renforcement POSITIF uniquement — jamais de réaction triste/négative
// (les mécaniques de punition démotivent les enfants TDAH).
export default function CompanionCheer({ trigger, emoji = '⭐' }) {
  const scale = useRef(new Animated.Value(0)).current;
  const jumpY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [cheer, setCheer] = useState(CHEERS[0]);

  useEffect(() => {
    if (!trigger) return;
    setCheer(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
    scale.setValue(0);
    jumpY.setValue(0);
    opacity.setValue(0);
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 180, friction: 6, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
      // Deux petits sauts de joie
      Animated.timing(jumpY, { toValue: -20, duration: 160, useNativeDriver: true }),
      Animated.timing(jumpY, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(jumpY, { toValue: -12, duration: 130, useNativeDriver: true }),
      Animated.timing(jumpY, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [trigger]);

  if (!trigger) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, { opacity, transform: [{ scale }, { translateY: jumpY }] }]}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.cheer}>{cheer}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 50,
    elevation: 50,
  },
  emoji: {
    fontSize: 64,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  cheer: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
});
