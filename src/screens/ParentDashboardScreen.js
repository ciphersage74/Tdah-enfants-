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

const TABS = ['📊 Stats', '⚙️ Config', '🔔 Notifs', '🎁 Récompenses', '⭐ Abonnement'];
const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function ParentDashboardScreen({ navigation }) {
  const {
    isPremium, updateCustomTasks, setParentMode,
    getWeeklyStats, unlockPremium,
    notifMorningEnabled, notifEveningEnabled, notifMorningTime, notifEveningTime,
  } = useAppStore();
  const profile = useActiveProfile();
  const { saveAndApply } = useNotifications();
  const [tab, setTab] = useState(0);
  const [notifSettings, setNotifSettings] = useState({
    notifMorningEnabled, notifEveningEnabled, notifMorningTime, notifEveningTime,
  });

  if (!profile) return null;

  const stats = getWeeklyStats();
  const handleClose = () => { setParentMode(false); navigation.navigate('Home'); };

  const toggleTask = (routineId, taskId) => {
    const tasks = profile.customTasks?.[routineId] || ROUTINES[routineId].defaultTasks;
    const activeIds = tasks.map((t) => t.id);
    if (activeIds.includes(taskId)) {
      if (tasks.length <= 2) { Alert.alert('Minimum 2 tâches requises'); return; }
      updateCustomTasks(routineId, tasks.filter((t) => t.id !== taskId));
    } else {
      const toAdd = ROUTINES[routineId].defaultTasks.find((t) => t.id === taskId);
      if (toAdd) updateCustomTasks(routineId, [...tasks, toAdd]);
    }
  };

  const handleSaveNotifs = async () => {
    await saveAndApply(notifSettings);
    Alert.alert('✓ Notifications enregistrées');
  };

  // ── Stats ──────────────────────────────────────────────────────
  const renderStats = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.row}>
          <HeroAvatar avatarId={profile.avatarId} size={56} equippedItems={profile.equippedItems || []} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{profile.childName}, {profile.childAge} ans</Text>
            <Text style={styles.cardSub}>Niveau {profile.level}  ·  {profile.coins} 🪙  ·  {profile.xp} XP</Text>
            {profile.streak >= 2 && (
              <Text style={styles.streakLabel}>🔥 {profile.streak} jours consécutifs</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Semaine en cours</Text>
        <Text style={[styles.bigStat, { color: COLORS.primary }]}>{stats.completionRate}%</Text>
        <Text style={styles.cardSub}>de complétion</Text>
        <View style={styles.weekRow}>
          {stats.days.map((d, i) => (
            <View key={i} style={styles.dayCol}>
              <View style={[styles.dayDot, d.morning ? styles.dayDone : styles.dayEmpty]}>
                <Text style={{ fontSize: 11 }}>☀️</Text>
              </View>
              {isPremium && (
                <View style={[styles.dayDot, d.evening ? styles.dayDone : styles.dayEmpty]}>
                  <Text style={{ fontSize: 11 }}>🌙</Text>
                </View>
              )}
              <Text style={styles.dayLabel}>{DAYS[new Date(d.date).getDay()]}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.statsGrid}>
        {[
          { value: profile.totalTasksDone || 0, label: 'tâches', emoji: '✅' },
          { value: profile.totalRoutinesDone || 0, label: 'routines', emoji: '🎯' },
          { value: profile.badges?.length || 0, label: 'badges', emoji: '🏆' },
          { value: profile.unlockedItems?.length || 0, label: 'accessoires', emoji: '🛍️' },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statEmoji}>{s.emoji}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: '#EDE9FE' }]}>
        <Text style={[styles.cardTitle, { color: COLORS.primary }]}>💡 Conseil du jour</Text>
        <Text style={[styles.cardSub, { lineHeight: 20 }]}>
          Les enfants TDAH progressent mieux avec des routines visuelles, des récompenses immédiates
          et un cadre bienveillant plutôt que punitif. Chaque tâche complétée est une vraie victoire !
        </Text>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  // ── Config ─────────────────────────────────────────────────────
  const renderConfig = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {Object.values(ROUTINES).map((routine) => {
        const locked = routine.premium && !isPremium;
        const tasks = profile.customTasks?.[routine.id] || routine.defaultTasks;
        const activeIds = new Set(tasks.map((t) => t.id));
        return (
          <View key={routine.id} style={styles.card}>
            <View style={[styles.row, { marginBottom: 8 }]}>
              <Text style={{ fontSize: 22 }}>{routine.emoji}</Text>
              <Text style={styles.cardTitle}>{routine.name}</Text>
              {locked && <View style={styles.lockPill}><Text style={styles.lockPillText}>🔒 Premium</Text></View>}
            </View>
            {locked ? (
              <Text style={styles.cardSub}>Débloquez Premium pour personnaliser</Text>
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

  // ── Notifs ─────────────────────────────────────────────────────
  const renderNotifs = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rappels quotidiens</Text>
        <Text style={[styles.cardSub, { marginBottom: 16 }]}>
          Notification au bon moment pour que votre enfant ne rate pas sa routine
        </Text>

        {[
          {
            label: '☀️ Routine du matin',
            key: 'notifMorningEnabled',
            timeKey: 'notifMorningTime',
            placeholder: '07:30',
          },
          {
            label: '🌙 Routine du soir',
            key: 'notifEveningEnabled',
            timeKey: 'notifEveningTime',
            placeholder: '18:30',
          },
        ].map((n) => (
          <View key={n.key} style={styles.notifRow}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.notifLabel}>{n.label}</Text>
              <TextInput
                style={[styles.timeInput, !notifSettings[n.key] && { opacity: 0.4 }]}
                value={notifSettings[n.timeKey]}
                onChangeText={(v) => setNotifSettings((s) => ({ ...s, [n.timeKey]: v }))}
                placeholder={n.placeholder}
                placeholderTextColor={COLORS.textMuted}
                editable={notifSettings[n.key]}
              />
            </View>
            <Switch
              value={notifSettings[n.key]}
              onValueChange={(v) => setNotifSettings((s) => ({ ...s, [n.key]: v }))}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={notifSettings[n.key] ? COLORS.primary : '#fff'}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotifs}>
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  // ── Récompenses ────────────────────────────────────────────────
  const renderRewards = () => (
    <View style={{ flex: 1, paddingBottom: 20 }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Rewards', { parentView: true })}
      >
        <View style={styles.row}>
          <Text style={{ fontSize: 28 }}>🎁</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Gérer les récompenses</Text>
            <Text style={styles.cardSub}>
              {(profile.rewards || []).filter((r) => !r.claimed).length} active(s) ·{' '}
              {(profile.rewards || []).filter((r) => r.claimed).length} réclamée(s)
            </Text>
          </View>
          <Text style={{ fontSize: 22, color: COLORS.textMuted }}>›</Text>
        </View>
      </TouchableOpacity>
      <View style={[styles.card, { backgroundColor: '#F0FDF4' }]}>
        <Text style={[styles.cardTitle, { color: '#065F46' }]}>💡 Pourquoi ça marche</Text>
        <Text style={[styles.cardSub, { lineHeight: 20, color: '#059669' }]}>
          Les récompenses concrètes et à court terme sont particulièrement efficaces pour les cerveaux TDAH.
          Proposez des paliers réalistes (200-400 pièces = 1-2 semaines de régularité).
          La prévisibilité réduit l'anxiété et augmente la motivation.
        </Text>
      </View>
    </View>
  );

  // ── Abonnement ─────────────────────────────────────────────────
  const renderSubscription = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {isPremium ? (
        <View style={[styles.card, { backgroundColor: '#D1FAE5', alignItems: 'center', padding: 28 }]}>
          <Text style={{ fontSize: 44, marginBottom: 8 }}>⭐</Text>
          <Text style={[styles.cardTitle, { color: '#065F46', fontSize: 20, textAlign: 'center' }]}>Premium actif</Text>
          <Text style={[styles.cardSub, { textAlign: 'center', color: '#059669', lineHeight: 20 }]}>
            Toutes les fonctionnalités sont débloquées.{'\n'}Merci pour votre confiance !
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.premiumCta}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Text style={styles.premiumCtaText}>⭐  Passer à Premium</Text>
          </TouchableOpacity>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ce que vous déverrouillez :</Text>
            {[
              '🌙  Routine du soir complète',
              '⚙️  Personnalisation des tâches',
              '🔔  Notifications quotidiennes',
              '📊  Statistiques avancées',
              '🎁  Récompenses illimitées',
            ].map((f, i) => (
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

  const tabs = [renderStats, renderConfig, renderNotifs, renderRewards, renderSubscription];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mode Parent</Text>
        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.closeText}>Fermer  ✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 8 }}>
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

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
        {tabs[tab]?.()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  closeText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  tabsRow: { flexGrow: 0 },
  tab: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, flex: 1, marginBottom: 2 },
  cardSub: { fontSize: 13, color: COLORS.textSecondary },
  streakLabel: { fontSize: 12, color: '#B45309', fontWeight: '700', marginTop: 2 },
  bigStat: { fontSize: 52, fontWeight: '900', textAlign: 'center', marginVertical: 4 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dayCol: { alignItems: 'center', gap: 4 },
  dayDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayDone: { backgroundColor: COLORS.successLight },
  dayEmpty: { backgroundColor: COLORS.border },
  dayLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 14, padding: 12,
    alignItems: 'center', gap: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statEmoji: { fontSize: 18 },
  statValue: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'center' },
  lockPill: {
    backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  lockPillText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10,
  },
  taskEmoji: { fontSize: 18, width: 26 },
  taskName: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  notifLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  timeInput: {
    backgroundColor: COLORS.background, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border, width: 80,
  },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  premiumCta: {
    backgroundColor: COLORS.premium, borderRadius: 14, padding: 18, alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.premium, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  premiumCtaText: { fontSize: 17, fontWeight: '900', color: COLORS.white },
  featureItem: { paddingVertical: 9, borderTopWidth: 1, borderTopColor: COLORS.border },
  featureText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
});
