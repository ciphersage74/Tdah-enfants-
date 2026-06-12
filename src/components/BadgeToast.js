import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function BadgeToast({ badge, visible, onHide }) {
  const slideY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible || !badge) return;
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(slideY, { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]);
    anim.start(({ finished }) => { if (finished) onHide?.(); });
    return () => anim.stop();
  }, [visible, badge]);

  if (!badge) return null;

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: slideY }], opacity }]}>
      <Text style={styles.emoji}>{badge.emoji}</Text>
      <View>
        <Text style={styles.label}>Badge débloqué !</Text>
        <Text style={styles.name}>{badge.label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 100,
  },
  emoji: { fontSize: 28 },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  name: { fontSize: 16, color: COLORS.white, fontWeight: '800' },
});
