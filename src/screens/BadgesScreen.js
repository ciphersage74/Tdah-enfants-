import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { BADGES } from '../constants/badgeData';
import { useActiveProfile } from '../hooks/useActiveProfile';

export default function BadgesScreen({ navigation }) {
  const profile = useActiveProfile();
  const earned = new Set(profile?.badges || []);
  const earnedCount = BADGES.filter((b) => earned.has(b.id)).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Badges</Text>
          <Text style={styles.sub}>{earnedCount} / {BADGES.length} débloqués</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(earnedCount / BADGES.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {BADGES.map((badge) => {
          const isEarned = earned.has(badge.id);
          return (
            <View key={badge.id} style={[styles.badgeCard, !isEarned && styles.badgeCardLocked]}>
              <Text style={[styles.badgeEmoji, !isEarned && styles.lockedEmoji]}>{badge.emoji}</Text>
              <Text style={[styles.badgeLabel, !isEarned && styles.lockedText]}>{badge.label}</Text>
              <Text style={[styles.badgeDesc, !isEarned && styles.lockedDesc]}>{badge.desc}</Text>
              {isEarned && <View style={styles.earnedDot} />}
            </View>
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  back: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  sub: { fontSize: 13, color: COLORS.textSecondary },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  badgeCard: {
    width: '30%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    minHeight: 110,
    justifyContent: 'center',
  },
  badgeCardLocked: { backgroundColor: COLORS.background, shadowOpacity: 0 },
  badgeEmoji: { fontSize: 30 },
  lockedEmoji: { opacity: 0.25 },
  badgeLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  lockedText: { color: COLORS.textMuted },
  badgeDesc: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 14 },
  lockedDesc: { color: COLORS.textMuted },
  earnedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
});
