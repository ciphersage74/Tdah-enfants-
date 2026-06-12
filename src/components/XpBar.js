import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { LEVEL_THRESHOLDS, getXpForNextLevel } from '../constants/routineData';

export default function XpBar({ xp, level }) {
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXp = getXpForNextLevel(level);
  const span = nextLevelXp - currentLevelXp;
  // Au niveau max, span vaut 0 → barre pleine plutôt que NaN%
  const progress = span > 0 ? Math.min(Math.max((xp - currentLevelXp) / span, 0), 1) : 1;

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.levelText}>Niv. {level}</Text>
        <Text style={styles.xpText}>{xp} / {nextLevelXp} XP</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  xpText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});
