import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
  const { isPremium, profiles, isRoutineCompletedToday } = useAppStore();
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

  const handleRoutinePress = (routineId) => {
    const routine = ROUTINES[routineId];
    if (routine.premium && !isPremium) { navigation.navigate('Paywall'); return; }
    if (isRoutineCompletedToday(routineId)) return;
    navigation.navigate('Quest', { routineId });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <BadgeToast
        badge={toastBadge}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <HeroAvatar
              avatarId={profile.avatarId}
              size={64}
              equippedItems={profile.equippedItems || []}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.greetingText}>{greeting} !</Text>
              <Text style={styles.heroName}>{profile.childName}</Text>
            </View>
            <CoinBadge amount={profile.coins} />
          </View>

          <View style={styles.headerBottom}>
            <XpBar xp={profile.xp} level={profile.level} />
          </View>

          {/* Streak */}
          {profile.streak >= 2 && (
            <View style={styles.streakRow}>
              <Text style={styles.streakText}>🔥 {profile.streak} jours de suite !</Text>
            </View>
          )}
        </View>

        {/* Multi-profile switcher */}
        {profiles.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.profileSwitcher}
            contentContainerStyle={styles.profileSwitcherContent}
          >
            {profiles.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.profilePill, p.id === profile.id && styles.profilePillActive]}
                onPress={() => {
                  useAppStore.getState().switchProfile(p.id);
                }}
              >
                <Text style={styles.profilePillEmoji}>
                  {p.avatarId === 'dragon' ? '🐉' : p.avatarId === 'hero' ? '🦸' : p.avatarId === 'wizard' ? '🧙' : '🦊'}
                </Text>
                <Text style={[styles.profilePillName, p.id === profile.id && styles.profilePillNameActive]}>
                  {p.childName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Date + actions */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Aujourd'hui — {dateStr}</Text>
          <View style={styles.iconActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Badges')}>
              <Text style={styles.iconBtnText}>🏆</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.iconBtnText}>🛍️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Routines */}
        <RoutineCard
          routine={ROUTINES.morning}
          tasksCount={(profile.customTasks?.morning || ROUTINES.morning.defaultTasks).length}
          completedCount={morningDone ? (profile.customTasks?.morning || ROUTINES.morning.defaultTasks).length : 0}
          isCompleted={morningDone}
          locked={false}
          onPress={() => handleRoutinePress('morning')}
        />
        <RoutineCard
          routine={ROUTINES.evening}
          tasksCount={(profile.customTasks?.evening || ROUTINES.evening.defaultTasks).length}
          completedCount={eveningDone ? (profile.customTasks?.evening || ROUTINES.evening.defaultTasks).length : 0}
          isCompleted={eveningDone}
          locked={!isPremium}
          onPress={() => handleRoutinePress('evening')}
        />

        {/* Rewards banner */}
        {(profile.rewards || []).filter((r) => r.active && !r.claimed).length > 0 && (
          <TouchableOpacity style={styles.rewardBanner} onPress={() => navigation.navigate('Rewards')}>
            <Text style={styles.rewardBannerEmoji}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardBannerTitle}>Récompenses disponibles</Text>
              <Text style={styles.rewardBannerSub}>
                {(profile.rewards || []).filter((r) => r.active && !r.claimed).length} récompense(s) à débloquer
              </Text>
            </View>
            <Text style={styles.rewardBannerArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Status message */}
        <View style={styles.statusBox}>
          {!morningDone ? (
            <>
              <Text style={styles.statusEmoji}>⚔️</Text>
              <Text style={styles.statusText}>Lance ta quête du matin pour commencer !</Text>
            </>
          ) : morningDone && (!eveningDone && isPremium) ? (
            <>
              <Text style={styles.statusEmoji}>🌟</Text>
              <Text style={styles.statusText}>Super ce matin ! La quête du soir t'attend.</Text>
            </>
          ) : (
            <>
              <Text style={styles.statusEmoji}>🏆</Text>
              <Text style={styles.statusText}>Journée accomplie ! Tu es un vrai héros.</Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Parent button */}
      <TouchableOpacity style={styles.parentBtn} onPress={() => navigation.navigate('ParentPin')}>
        <Text style={styles.parentBtnText}>Mode Parent</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 8, gap: 12 },

  headerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerInfo: { flex: 1 },
  greetingText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  heroName: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, marginTop: 1 },
  headerBottom: {},
  streakRow: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  streakText: { fontSize: 13, fontWeight: '700', color: '#B45309' },

  profileSwitcher: { marginTop: -4 },
  profileSwitcherContent: { gap: 8, paddingVertical: 4 },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  profilePillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  profilePillEmoji: { fontSize: 16 },
  profilePillName: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  profilePillNameActive: { color: COLORS.primary },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  iconActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBtnText: { fontSize: 18 },

  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rewardBannerEmoji: { fontSize: 24 },
  rewardBannerTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  rewardBannerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  rewardBannerArrow: { fontSize: 22, color: COLORS.textMuted, fontWeight: '300' },

  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
  },
  statusEmoji: { fontSize: 24 },
  statusText: { fontSize: 14, color: COLORS.primary, fontWeight: '600', flex: 1, lineHeight: 20 },

  parentBtn: {
    margin: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  parentBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
});
