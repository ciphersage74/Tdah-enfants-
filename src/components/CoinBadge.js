import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function CoinBadge({ amount, size = 'md' }) {
  const isLarge = size === 'lg';
  return (
    <View style={[styles.badge, isLarge && styles.badgeLarge]}>
      <Text style={[styles.emoji, isLarge && styles.emojiLarge]}>🪙</Text>
      <Text style={[styles.text, isLarge && styles.textLarge]}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldLight + '33',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold,
    gap: 4,
  },
  badgeLarge: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
  },
  emoji: { fontSize: 14 },
  emojiLarge: { fontSize: 22 },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.goldDark,
  },
  textLarge: {
    fontSize: 22,
  },
});
