import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { ROUTINES } from '../constants/routineData';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';
import HeroAvatar from '../components/HeroAvatar';
import CoinBadge from '../components/CoinBadge';
import XpBar from '../components/XpBar';
import RoutineCard from '../components/RoutineCard';
import BadgeToast from '../components/BadgeToast';

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];

export default function HomeScreen({ navigation }) {
  const {
    isPremium, isRoutineCompletedToday, isRoutineJokeredToday, restDays,
    getJokersLeft, useJoker,
  } = useAppStore();
  const profile = useActiveProfile();
  const [toastBadge, setToastBadge] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  if (!profile) return null;

  const now = new Date();
  const dateStr = `${DAYS_FR[now.getDay()]} ${now.getDate()} ${MONTHS_FR[now.getMonth()]}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon ap\'' : 'Bonsoir';
  const morningDone = isRoutineCompletedToday('morning');
  const eveningDone = isRoutineCompletedToday('evening');
  const isRestDay = (restDays || []).includes(now.getDay());

  const jokersLeft = getJokersLeft();
  const jokerTargets = [];
  if (!morningDone) jokerTargets.push({ id: 'morning', label: '☀️ Quête du matin' });
  if (isPremium && !eveningDone) jokerTargets.push({ id: 'evening', label: '🌙 Quête du soir' });
  const showJoker = !isRestDay && jokersLeft > 0 && jokerTargets.length > 0;

  const confirmJoker = (routineId, label) => {
    Alert.alert(
      '🃏 Utiliser un joker ?',
      `La ${label.slice(3).toLowerCase()} sera marquée comme passée.\n\nTa série de jours continue, mais tu ne gagnes pas de pièces. C'est OK, tout le monde a des jours difficiles !`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Utiliser mon joker', onPress: () => useJoker(routineId) },
      ]
    );
  };

  const handleJokerPress = () => {
    if (jokerTargets.length === 1) {
      confirmJoker(jokerTargets[0].id, jokerTargets[0].label);
    } else {
      Alert.alert('🃏 Joker', 'Pour quelle quête ?', [
        ...jokerTargets.map((t) => ({ text: t.label, onPress: () => confirmJoker(t.id, t.label) })),
        { text: 'Annuler', style: 'cancel' },
      ]);
    }
  };

  const handleRoutinePress = (routineId) => {
    const routine = ROUTINES[routineId];
    if (routine.premium && !isPremium) {
      // Barrière parentale obligatoire (programme Familles Google Play) :
      // jamais d'écran d'achat accessible directement à l'enfant
      Alert.alert(
        '🔒 Quête du Soir',
        'Cette quête fait partie de la version Premium.\nDemande à un parent de la débloquer !',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: '👤 Je suis un parent', onPress: () => navigation.navigate('ParentPin', { next: 'Paywall' }) },
        ]
      );
      return;
    }
    if (isRoutineCompletedToday(routineId)) return;
    navigation.navigate('Quest', { routineId });
  };

  const claimableRewards = (profile.rewards || []).filter(
    (r) => r.active && !r.claimed && profile.coins >= r.cost
  );
  const activeRewards = (profile.rewards || []).filter((r) => r.active && !r.claimed);

  return (
    <SafeAreaView style={styles.safe}>
      <BadgeToast badge={toastBadge} visible={toastVisible} onHide={() => setToastVisible(false)} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <HeroAvatar avatarId={profile.avatarId} size={64} equippedItems={profile.equippedItems || []} />
            <View style={styles.heroInfo}>
              <Text style={styles.greetingText}>{greeting} !</Text>
              <Text style={styles.heroName}>{profile.childName}</Text>
            </View>
            <CoinBadge amount={profile.coins} />
          </View>
          <XpBar xp={profile.xp} level={profile.level} />
          {profile.streak >= 2 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {profile.streak} jours de suite !</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Badges')}>
            <Text style={styles.actionEmoji}>🏆</Text>
            <Text style={styles.actionLabel}>Badges</Text>
            {profile.badges?.length > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{profile.badges.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Shop')}>
            <Text style={styles.actionEmoji}>🛍️</Text>
            <Text style={styles.actionLabel}>Boutique</Text>
            {profile.unlockedItems?.length > 0 && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>{profile.unlockedItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          {activeRewards.length > 0 && (
            <TouchableOpacity
              style={[styles.actionBtn, claimableRewards.length > 0 && styles.actionBtnReady]}
              onPress={() => navigation.navigate('Rewards')}
            >
              <Text style={styles.actionEmoji}>🎁</Text>
              <Text style={[styles.actionLabel, claimableRewards.length > 0 && styles.actionLabelReady]}>
                {claimableRewards.length > 0 ? 'RÉCLAMER !' : 'Récompenses'}
              </Text>
              {claimableRewards.length > 0 && (
                <View style={[styles.actionBadge, styles.actionBadgeReady]}>
                  <Text style={styles.actionBadgeText}>{claimableRewards.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Today label */}
        <Text style={styles.todayLabel}>Aujourd'hui — {dateStr}</Text>

        {/* Routines */}
        <RoutineCard
          routine={ROUTINES.morning}
          tasksCount={(profile.customTasks?.morning || ROUTINES.morning.defaultTasks).length}
          completedCount={morningDone ? (profile.customTasks?.morning || ROUTINES.morning.defaultTasks).length : 0}
          isCompleted={morningDone}
          jokered={isRoutineJokeredToday('morning')}
          locked={false}
          resting={isRestDay}
          onPress={() => handleRoutinePress('morning')}
        />
        <RoutineCard
          routine={ROUTINES.evening}
          tasksCount={(profile.customTasks?.evening || ROUTINES.evening.defaultTasks).length}
          completedCount={eveningDone ? (profile.customTasks?.evening || ROUTINES.evening.defaultTasks).length : 0}
          isCompleted={eveningDone}
          jokered={isRoutineJokeredToday('evening')}
          locked={!isPremium}
          resting={isRestDay}
          onPress={() => handleRoutinePress('evening')}
        />

        {/* Joker anti-frustration */}
        {showJoker && (
          <TouchableOpacity style={styles.jokerBtn} onPress={handleJokerPress}>
            <Text style={styles.jokerEmoji}>🃏</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.jokerTitle}>Journée difficile ?</Text>
              <Text style={styles.jokerSub}>
                Utilise un joker pour passer une quête sans casser ta série
                ({jokersLeft} restant{jokersLeft > 1 ? 's' : ''} cette semaine)
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Status */}
        <View style={[styles.statusBox, isRestDay && styles.statusBoxRest]}>
          {isRestDay && (
            <Text style={[styles.statusText, styles.statusTextRest]}>
              🌴  Bonne journée de repos, {profile.childName} ! Tu l'as bien mérité.
            </Text>
          )}
          {!isRestDay && !morningDone && <Text style={styles.statusText}>⚔️  Lance ta quête du matin !</Text>}
          {!isRestDay && morningDone && !eveningDone && isPremium && <Text style={styles.statusText}>🌟  Super ce matin ! La quête du soir t'attend.</Text>}
          {!isRestDay && morningDone && (!isPremium || eveningDone) && (
            <Text style={styles.statusText}>
              🏆  Journée accomplie ! Tu es {profile.gender === 'girl' ? 'une vraie héroïne' : 'un vrai héros'}.
            </Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.parentBtn} onPress={() => navigation.navigate('ParentPin')}>
        <Text style={styles.parentBtnText}>Mode Parent</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 8, gap: 12 },
  headerCard: {
    backgroundColor: COLORS.white, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    gap: 12,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroInfo: { flex: 1 },
  greetingText: { fontSize: 12, color: COLORS.textSecondary },
  heroName: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, marginTop: 1 },
  streakBadge: {
    backgroundColor: '#FEF3C7', borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 6, alignSelf: 'flex-start',
  },
  streakText: { fontSize: 13, fontWeight: '700', color: '#B45309' },

  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 14, padding: 12,
    alignItems: 'center', gap: 4, position: 'relative',
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  actionBtnReady: { borderColor: COLORS.gold, backgroundColor: '#FFFBEB' },
  actionEmoji: { fontSize: 22 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  actionLabelReady: { color: COLORS.goldDark },
  actionBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: COLORS.primary, width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  actionBadgeReady: { backgroundColor: COLORS.gold },
  actionBadgeText: { fontSize: 9, fontWeight: '900', color: COLORS.white },

  todayLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  jokerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFBEB', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#FDE68A', borderStyle: 'dashed',
  },
  jokerEmoji: { fontSize: 28 },
  jokerTitle: { fontSize: 14, fontWeight: '800', color: '#B45309' },
  jokerSub: { fontSize: 12, color: '#92400E', lineHeight: 16, marginTop: 2 },
  statusBox: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14 },
  statusBoxRest: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 14, color: COLORS.primary, fontWeight: '600', lineHeight: 20 },
  statusTextRest: { color: '#065F46' },
  parentBtn: {
    margin: 16, marginTop: 8, padding: 14, borderRadius: 12,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  parentBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
});
