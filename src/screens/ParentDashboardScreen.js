import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { ROUTINES } from '../constants/routineData';
import HeroAvatar from '../components/HeroAvatar';

const TABS = ['📊 Stats', '⚙️ Config', '⭐ Abonnement'];
const DAYS_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function ParentDashboardScreen({ navigation }) {
  const {
    childName, childAge, avatarId, coins, xp, level, streak,
    isPremium, customTasks, updateCustomTasks, setParentMode, getWeeklyStats,
  } = useAppStore();
  const [tab, setTab] = useState(0);

  const stats = getWeeklyStats();

  const handleClose = () => {
    setParentMode(false);
    navigation.navigate('Home');
  };

  const toggleTask = (routineId, taskId) => {
    const tasks = customTasks[routineId];
    if (tasks.find((t) => t.id === taskId)) {
      if (tasks.length <= 2) {
        Alert.alert('Minimum 2 tâches', 'La routine doit garder au moins 2 tâches.');
        return;
      }
      updateCustomTasks(routineId, tasks.filter((t) => t.id !== taskId));
    } else {
      const allTasks = ROUTINES[routineId].defaultTasks;
      const toAdd = allTasks.find((t) => t.id === taskId);
      if (toAdd) updateCustomTasks(routineId, [...tasks, toAdd]);
    }
  };

  const renderStats = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Child info */}
      <View style={styles.card}>
        <View style={styles.row}>
          <HeroAvatar avatarId={avatarId} size={60} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.cardTitle}>{childName}, {childAge} ans</Text>
            <Text style={styles.cardSub}>Niveau {level} • {coins} pièces • {xp} XP</Text>
            {streak >= 2 && <Text style={styles.streak}>🔥 {streak} jours de suite !</Text>}
          </View>
        </View>
      </View>

      {/* Weekly overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cette semaine</Text>
        <Text style={[styles.bigStat, { color: COLORS.primary }]}>{stats.completionRate}%</Text>
        <Text style={styles.cardSub}>de complétion</Text>

        <View style={styles.weekGrid}>
          {stats.days.map((day, i) => {
            const d = new Date(day.date);
            const dayLabel = DAYS_SHORT[d.getDay()];
            const hasMorning = day.morning;
            const hasEvening = day.evening;
            return (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dayDot, hasMorning ? styles.dayDotDone : styles.dayDotEmpty]}>
                  <Text style={styles.dayDotText}>☀️</Text>
                </View>
                {isPremium && (
                  <View style={[styles.dayDot, hasEvening ? styles.dayDotDone : styles.dayDotEmpty]}>
                    <Text style={styles.dayDotText}>🌙</Text>
                  </View>
                )}
                <Text style={styles.dayLabel}>{dayLabel}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Tips */}
      <View style={[styles.card, { backgroundColor: '#EDE9FE' }]}>
        <Text style={styles.cardTitle}>💡 Conseil du jour</Text>
        <Text style={styles.tipText}>
          Pour les enfants TDAH, les récompenses immédiates sont plus efficaces que les promesses à long terme.
          Célébrez chaque petite victoire avec enthousiasme !
        </Text>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderConfig = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {Object.values(ROUTINES).map((routine) => {
        const isLocked = routine.premium && !isPremium;
        const activeTasks = customTasks[routine.id] || [];
        const activeIds = new Set(activeTasks.map((t) => t.id));
        return (
          <View key={routine.id} style={styles.card}>
            <View style={styles.row}>
              <Text style={{ fontSize: 24 }}>{routine.emoji}</Text>
              <Text style={styles.cardTitle}>{routine.name}</Text>
              {isLocked && <Text style={styles.lockBadge}>🔒</Text>}
            </View>
            {isLocked ? (
              <Text style={styles.lockNote}>Premium requis pour modifier cette routine</Text>
            ) : (
              routine.defaultTasks.map((task) => (
                <View key={task.id} style={styles.taskRow}>
                  <Text style={styles.taskEmoji}>{task.emoji}</Text>
                  <Text style={styles.taskName}>{task.name}</Text>
                  <Switch
                    value={activeIds.has(task.id)}
                    onValueChange={() => toggleTask(routine.id, task.id)}
                    trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                    thumbColor={activeIds.has(task.id) ? COLORS.primary : COLORS.textMuted}
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

  const renderSubscription = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {isPremium ? (
        <View style={[styles.card, { backgroundColor: '#D1FAE5' }]}>
          <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>⭐</Text>
          <Text style={[styles.cardTitle, { textAlign: 'center', color: '#065F46' }]}>
            Abonnement Premium actif
          </Text>
          <Text style={[styles.cardSub, { textAlign: 'center', color: '#059669' }]}>
            Toutes les fonctionnalités sont débloquées
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { textAlign: 'center', marginBottom: 8 }]}>
              Version gratuite active
            </Text>
            <Text style={[styles.cardSub, { textAlign: 'center', marginBottom: 16 }]}>
              Tu utilises la routine du matin gratuite
            </Text>
            <TouchableOpacity
              style={styles.premiumBtn}
              onPress={() => navigation.navigate('Paywall')}
            >
              <Text style={styles.premiumBtnText}>⭐ Passer à Premium</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ce que tu débloques</Text>
            {['🌙 Routine du soir', '📊 Stats avancées', '⚙️ Tâches personnalisables', '📋 Rapport hebdomadaire', '🔔 Rappels intelligents'].map((f, i) => (
              <Text key={i} style={styles.featureItem}>{f}</Text>
            ))}
          </View>
        </>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mode Parent</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Text style={styles.closeText}>✕ Fermer</Text>
        </TouchableOpacity>
      </View>

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

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {tab === 0 && renderStats()}
        {tab === 1 && renderConfig()}
        {tab === 2 && renderSubscription()}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSub: { fontSize: 13, color: COLORS.textSecondary },
  streak: { fontSize: 13, color: '#D97706', fontWeight: '700' },
  bigStat: { fontSize: 56, fontWeight: '900', textAlign: 'center', marginVertical: 4 },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dayCol: { alignItems: 'center', gap: 4 },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotDone: { backgroundColor: COLORS.successLight },
  dayDotEmpty: { backgroundColor: COLORS.border },
  dayDotText: { fontSize: 14 },
  dayLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  tipText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginTop: 8 },
  lockBadge: { fontSize: 16, marginLeft: 'auto' },
  lockNote: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic' },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  taskEmoji: { fontSize: 20, width: 28 },
  taskName: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  premiumBtn: {
    backgroundColor: COLORS.premium,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  premiumBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  featureItem: { fontSize: 14, color: COLORS.textPrimary, paddingVertical: 6, fontWeight: '500' },
});
