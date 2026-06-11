import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/colors';

export default function RoutineCard({ routine, tasksCount, completedCount, isCompleted, isPremium, locked, resting, onPress }) {
  const gradient = GRADIENTS[routine.gradientKey] || GRADIENTS.primary;
  const progress = tasksCount > 0 ? completedCount / tasksCount : 0;

  const cardColors = resting ? ['#6EE7B7', '#10B981'] : locked ? ['#9CA3AF', '#6B7280'] : gradient;

  return (
    <TouchableOpacity onPress={resting ? undefined : onPress} activeOpacity={resting ? 1 : 0.85} style={styles.wrapper}>
      <LinearGradient colors={cardColors} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{resting ? '🌴' : routine.emoji}</Text>
          <View style={styles.titleArea}>
            <Text style={styles.name}>{routine.name}</Text>
            {resting ? (
              <View style={styles.restBadge}>
                <Text style={styles.restText}>Jour de repos</Text>
              </View>
            ) : locked ? (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>🔒 Premium</Text>
              </View>
            ) : isCompleted ? (
              <View style={styles.doneBadge}>
                <Text style={styles.doneText}>✅ Terminée !</Text>
              </View>
            ) : (
              <Text style={styles.sub}>{tasksCount} missions</Text>
            )}
          </View>
          {!locked && !isCompleted && !resting && (
            <View style={styles.playBtn}>
              <Text style={styles.playText}>▶</Text>
            </View>
          )}
        </View>

        {!locked && !isCompleted && !resting && tasksCount > 0 && (
          <View style={styles.progressArea}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{completedCount}/{tasksCount}</Text>
          </View>
        )}

        {locked && !resting && (
          <Text style={styles.lockDesc}>Débloque pour accéder à la routine du soir</Text>
        )}
        {resting && (
          <Text style={styles.lockDesc}>Profite de ta journée, les quêtes reprennent demain 🌟</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: { fontSize: 36 },
  titleArea: { flex: 1 },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: { fontSize: 16, color: COLORS.white },
  progressArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  restBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  restText: { fontSize: 12, color: COLORS.white, fontWeight: '700' },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  premiumText: { fontSize: 12, color: COLORS.white },
  doneBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  doneText: { fontSize: 12, color: COLORS.white, fontWeight: '700' },
  lockDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 10,
  },
});
