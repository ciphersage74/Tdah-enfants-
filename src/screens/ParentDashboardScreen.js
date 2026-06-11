import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { ROUTINES } from '../constants/routineData';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { useNotifications } from '../hooks/useNotifications';
import HeroAvatar from '../components/HeroAvatar';

const TABS = ['Stats', 'Config', 'Notifs', 'Récompenses', 'Abonnement'];
const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function ParentDashboardScreen({ navigation }) {
  const {
    isPremium, profiles, customTasks: _, updateCustomTasks,
    setParentMode, getWeeklyStats, deleteProfile, unlockPremium,
    notifMorningEnabled, notifEveningEnabled, notifMorningTime, notifEveningTime,
  } = useAppStore();
  const profile = useActiveProfile();
  const { saveAndApply } = useNotifications();

  const [tab, setTab] = useState(0);
  const [notifSettings, setNotifSettings] = useState({
    notifMorningEnabled,
    notifEveningEnabled,
    notifMorningTime,
    notifEveningTime,
  });

  if (!profile) return null;

  const stats = getWeeklyStats();

  const handleClose = () => { setParentMode(false); navigation.navigate('Home'); };

  const handleSaveNotifs = async () => {
    await saveAndApply(notifSettings);
    Alert.alert('Notifications enregistrées', 'Les rappels ont été mis à jour.');
  };

  const toggleTask = (routineId, taskId) => {
    const tasks = profile.customTasks?.[routineId] || ROUTINES[routineId].defaultTasks;
    const activeIds = tasks.map((t) => t.id);
    if (activeIds.includes(taskId)) {
      if (tasks.length <= 2) { Alert.alert('Minimum 2 tâches requises'); return; }
      updateCustomTasks(routineId, tasks.filter((t) => t.id !== taskId));
    } else {
      const all = ROUTINES[routineId].defaultTasks;
      const toAdd = all.find((t) => t.id === taskId);
      if (toAdd) updateCustomTasks(routineId, [...tasks, toAdd]);
    }
  };

  const renderStats = () => {
    const p = profile;
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile selector */}
        {profiles.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {profiles.map((pr) => (
                <TouchableOpacity
                  key={pr.id}
                  style={[styles.profileChip, pr.id === p.id && styles.profileChipActive]}
                  onPress={() => useAppStore.getState().switchProfile(pr.id)}
                >
                  <Text style={{ fontSize: 16 }}>
                    {pr.avatarId === 'dragon' ? '🐉' : pr.avatarId === 'hero' ? '🦸' : pr.avatarId === 'wizard' ? '🧙' : '🦊'}
                  </Text>
                  <Text style={[styles.profileChipText, pr.id === p.id && styles.profileChipTextActive]}>
                    {pr.childName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Child info */}
        <View style={styles.card}>
          <View style={styles.row}>
            <HeroAvatar avatarId={p.avatarId} size={56} equippedItems={p.equippedItems || []} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{p.childName}, {p.childAge} ans</Text>
              <Text style={styles.cardSub}>Niveau {p.level} · {p.coins} 🪙 · {p.xp} XP</Text>
              {p.streak >= 2 && <Text style={styles.streak}>🔥 {p.streak} jours consécutifs</Text>}
            </View>
            {profiles.length > 1 && (
              <TouchableOpacity onPress={() => {
                Alert.alert('Supprimer ' + p.childName + ' ?', 'Toutes les données seront perdues.', [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => { deleteProfile(p.id); handleClose(); } },
                ]);
              }}>
                <Text style={{ fontSize: 18, color: COLORS.textMuted }}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Weekly chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cette semaine</Text>
          <Text style={[styles.bigStat, { color: COLORS.primary }]}>{stats.completionRate}%</Text>
          <Text style={styles.cardSub}>de completion</Text>
          <View style={styles.weekRow}>
            {stats.days.map((d, i) => (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dayDot, d.morning ? styles.dayDone : styles.dayEmpty]}>
                  <Text style={{ fontSize: 10 }}>☀️</Text>
                </View>
                {isPremium && (
                  <View style={[styles.dayDot, d.evening ? styles.dayDone : styles.dayEmpty]}>
                    <Text style={{ fontSize: 10 }}>🌙</Text>
                  </View>
                )}
                <Text style={styles.dayLabel}>{DAYS[new Date(d.date).getDay()]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Total stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{p.totalTasksDone || 0}</Text>
              <Text style={styles.statKey}>tâches</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{p.totalRoutinesDone || 0}</Text>
              <Text style={styles.statKey}>routines</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{p.badges?.length || 0}</Text>
              <Text style={styles.statKey}>badges</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{p.totalCoinsEarned || 0}</Text>
              <Text style={styles.statKey}>pièces gagnées</Text>
            </View>
          </View>
        </View>

        {profiles.length < (isPremium ? 4 : 2) && (
          <TouchableOpacity
            style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}
            onPress={() => navigation.navigate('Onboarding', { mode: 'add' })}
          >
            <Text style={{ fontSize: 28 }}>➕</Text>
            <View>
              <Text style={styles.cardTitle}>Ajouter un enfant</Text>
              <Text style={styles.cardSub}>Créer un profil pour un autre héros</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  };

  const renderConfig = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {Object.values(ROUTINES).map((routine) => {
        const locked = routine.premium && !isPremium;
        const tasks = profile.customTasks?.[routine.id] || routine.defaultTasks;
        const activeIds = new Set(tasks.map((t) => t.id));
        return (
          <View key={routine.id} style={styles.card}>
            <View style={[styles.row, { marginBottom: 4 }]}>
              <Text style={{ fontSize: 22 }}>{routine.emoji}</Text>
              <Text style={styles.cardTitle}>{routine.name}</Text>
              {locked && <Text style={styles.lockPill}>🔒 Premium</Text>}
            </View>
            {locked ? (
              <Text style={styles.cardSub}>Débloque Premium pour modifier</Text>
            ) : (
              routine.defaultTasks.map((task) => (
                <View key={task.id} style={styles.taskRow}>
                  <Text style={styles.taskEmoji}>{task.emoji}</Text>
                  <Text style={styles.taskName}>{task.name}</Text>
                  <Switch
                    value={activeIds.has(task.id)}
                    onValueChange={() => toggleTask(routine.id, task.id)}
                    trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                    thumbColor={activeIds.has(task.id) ? COLORS.primary : '#fff'}
                  />
                </View>
              ))
            )}
          </View>
        );
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderNotifs = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rappels automatiques</Text>
        <Text style={styles.cardSub}>Notification quotidienne pour démarrer la routine</Text>

        <View style={styles.notifRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifLabel}>☀️ Routine du matin</Text>
            <TextInput
              style={styles.timeInput}
              value={notifSettings.notifMorningTime}
              onChangeText={(v) => setNotifSettings((s) => ({ ...s, notifMorningTime: v }))}
              placeholder="07:30"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <Switch
            value={notifSettings.notifMorningEnabled}
            onValueChange={(v) => setNotifSettings((s) => ({ ...s, notifMorningEnabled: v }))}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={notifSettings.notifMorningEnabled ? COLORS.primary : '#fff'}
          />
        </View>

        <View style={[styles.notifRow, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifLabel}>🌙 Routine du soir</Text>
            <TextInput
              style={styles.timeInput}
              value={notifSettings.notifEveningTime}
              onChangeText={(v) => setNotifSettings((s) => ({ ...s, notifEveningTime: v }))}
              placeholder="18:30"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <Switch
            value={notifSettings.notifEveningEnabled}
            onValueChange={(v) => setNotifSettings((s) => ({ ...s, notifEveningEnabled: v }))}
            trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
            thumbColor={notifSettings.notifEveningEnabled ? COLORS.primary : '#fff'}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotifs}>
          <Text style={styles.saveBtnText}>Enregistrer les notifications</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: '#EDE9FE' }]}>
        <Text style={styles.cardTitle}>💡 Conseil</Text>
        <Text style={[styles.cardSub, { lineHeight: 20 }]}>
          Les enfants TDAH répondent mieux aux rappels visuels et sonores réguliers.
          Configurez les notifications 15 minutes avant le début réel de la routine.
        </Text>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderRewards = () => (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Rewards', { parentView: true })}
      >
        <View style={styles.row}>
          <Text style={{ fontSize: 28 }}>🎁</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Gérer les récompenses</Text>
            <Text style={styles.cardSub}>
              {(profile.rewards || []).length} récompense(s) configurée(s)
            </Text>
          </View>
          <Text style={{ fontSize: 20, color: COLORS.textMuted }}>›</Text>
        </View>
      </TouchableOpacity>
      <View style={[styles.card, { backgroundColor: '#F0FDF4' }]}>
        <Text style={[styles.cardTitle, { color: '#065F46' }]}>💡 Comment ça marche</Text>
        <Text style={[styles.cardSub, { lineHeight: 20, color: '#059669' }]}>
          {`Créez des récompenses réelles (ex: cinéma = 300 pièces). Votre enfant voit ses pièces s'accumuler et peut les échanger. Le cerveau TDAH répond bien aux récompenses tangibles à court terme.`}
        </Text>
      </View>
    </View>
  );

  const renderSubscription = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {isPremium ? (
        <View style={[styles.card, { backgroundColor: '#D1FAE5', alignItems: 'center', padding: 24 }]}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>⭐</Text>
          <Text style={[styles.cardTitle, { color: '#065F46', fontSize: 20 }]}>Premium actif</Text>
          <Text style={[styles.cardSub, { textAlign: 'center', color: '#059669' }]}>
            Toutes les fonctionnalités sont débloquées
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.premiumBtn} onPress={() => navigation.navigate('Paywall')}>
            <Text style={styles.premiumBtnText}>⭐  Passer à Premium</Text>
          </TouchableOpacity>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ce que vous déverrouillez</Text>
            {['🌙 Routine du soir', '👨‍👩‍👧‍👦 Jusqu\'à 4 profils', '📊 Stats complètes', '⚙️ Tâches personnalisées', '🔔 Notifications', '🎁 Récompenses illimitées'].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const tabRenderers = [renderStats, renderConfig, renderNotifs, renderRewards, renderSubscription];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mode Parent</Text>
        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.closeText}>Fermer ✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        <View style={styles.tabs}>
          {TABS.map((t, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.tab, tab === i && styles.tabActive]}
              onPress={() => setTab(i)}
            >
              <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
        {tabRenderers[tab]?.()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  closeText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  tabsScroll: { flexGrow: 0 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
    paddingBottom: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2, flex: 1 },
  cardSub: { fontSize: 13, color: COLORS.textSecondary },
  streak: { fontSize: 12, color: '#B45309', fontWeight: '700', marginTop: 2 },
  bigStat: { fontSize: 52, fontWeight: '900', textAlign: 'center', marginVertical: 4 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dayCol: { alignItems: 'center', gap: 4 },
  dayDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayDone: { backgroundColor: COLORS.successLight },
  dayEmpty: { backgroundColor: COLORS.border },
  dayLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  statBox: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '900', color: COLORS.primary },
  statKey: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' },
  profileChip: {
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
  profileChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  profileChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  profileChipTextActive: { color: COLORS.primary },
  lockPill: {
    fontSize: 11,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  taskEmoji: { fontSize: 18, width: 26 },
  taskName: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  timeInput: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 80,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  premiumBtn: {
    backgroundColor: COLORS.premium,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.premium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumBtnText: { fontSize: 16, fontWeight: '900', color: COLORS.white },
  featureItem: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.border },
  featureText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
});
