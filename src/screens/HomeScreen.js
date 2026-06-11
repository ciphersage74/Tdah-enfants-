import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { ROUTINES } from '../constants/routineData';
import { useAppStore } from '../store/useAppStore';
import HeroAvatar from '../components/HeroAvatar';
import CoinBadge from '../components/CoinBadge';
import XpBar from '../components/XpBar';
import RoutineCard from '../components/RoutineCard';

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

export default function HomeScreen({ navigation }) {
  const { childName, avatarId, coins, xp, level, streak, isPremium, customTasks, isRoutineCompletedToday } = useAppStore();

  const now = new Date();
  const dateStr = `${DAYS_FR[now.getDay()]} ${now.getDate()} ${MONTHS_FR[now.getMonth()]}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  const morningDone = isRoutineCompletedToday('morning');
  const eveningDone = isRoutineCompletedToday('evening');

  const handleRoutinePress = (routineId) => {
    const routine = ROUTINES[routineId];
    if (routine.premium && !isPremium) {
      navigation.navigate('Paywall');
      return;
    }
    if (isRoutineCompletedToday(routineId)) return;
    navigation.navigate('Quest', { routineId });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.heroSection}>
            <HeroAvatar avatarId={avatarId} size={72} />
            <View style={styles.heroInfo}>
              <Text style={styles.greeting}>{greeting} !</Text>
              <Text style={styles.heroName}>{childName}</Text>
              <CoinBadge amount={coins} />
            </View>
            {streak >= 2 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakNum}>{streak}</Text>
              </View>
            )}
          </View>
          <View style={styles.xpSection}>
            <XpBar xp={xp} level={level} />
          </View>
        </View>

        {/* Today */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aujourd'hui</Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        <View style={styles.routines}>
          <RoutineCard
            routine={ROUTINES.morning}
            tasksCount={customTasks.morning.length}
            completedCount={morningDone ? customTasks.morning.length : 0}
            isCompleted={morningDone}
            locked={false}
            onPress={() => handleRoutinePress('morning')}
          />
          <RoutineCard
            routine={ROUTINES.evening}
            tasksCount={customTasks.evening.length}
            completedCount={eveningDone ? customTasks.evening.length : 0}
            isCompleted={eveningDone}
            locked={!isPremium}
            onPress={() => handleRoutinePress('evening')}
          />
        </View>

        {/* Motivation */}
        {!morningDone && (
          <View style={styles.motivationBox}>
            <Text style={styles.motivationEmoji}>⚔️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.motivationTitle}>Mission du jour !</Text>
              <Text style={styles.motivationText}>
                Complète ta routine du matin pour gagner des pièces et de l'XP !
              </Text>
            </View>
          </View>
        )}
        {morningDone && !eveningDone && isPremium && (
          <View style={[styles.motivationBox, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.motivationEmoji}>🌟</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.motivationTitle, { color: '#1E40AF' }]}>Super ce matin !</Text>
              <Text style={[styles.motivationText, { color: '#3B82F6' }]}>
                Ce soir, il reste la quête du soir à compléter !
              </Text>
            </View>
          </View>
        )}
        {morningDone && (eveningDone || !isPremium) && (
          <View style={[styles.motivationBox, { backgroundColor: COLORS.successLight }]}>
            <Text style={styles.motivationEmoji}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.motivationTitle, { color: '#065F46' }]}>Journée accomplie !</Text>
              <Text style={[styles.motivationText, { color: '#059669' }]}>
                Tu as tout réussi aujourd'hui. Tu es un vrai héros !
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Parent button */}
      <TouchableOpacity style={styles.parentBtn} onPress={() => navigation.navigate('ParentPin')}>
        <Text style={styles.parentBtnText}>👨‍👩‍👧 Mode Parent</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  header: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  heroInfo: { flex: 1, gap: 4 },
  greeting: { fontSize: 13, color: COLORS.textSecondary },
  heroName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  streakEmoji: { fontSize: 20 },
  streakNum: { fontSize: 16, fontWeight: '900', color: '#D97706' },
  xpSection: { marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  routines: { paddingHorizontal: 16 },
  motivationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    margin: 16,
    marginTop: 4,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  motivationEmoji: { fontSize: 28 },
  motivationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  motivationText: {
    fontSize: 13,
    color: COLORS.primaryLight,
    lineHeight: 18,
  },
  parentBtn: {
    margin: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  parentBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});
