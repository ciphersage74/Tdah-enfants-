import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS } from '../constants/colors';
import { ROUTINES } from '../constants/routineData';
import { getMoodById } from '../constants/moodData';
import { buildPractitionerReport, getAvailableMonths } from '../utils/reportGenerator';
import { exportBackup, importBackup } from '../utils/backup';
import { maybeAskForRating } from '../utils/rating';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { useNotifications } from '../hooks/useNotifications';
import HeroAvatar from '../components/HeroAvatar';

const TASK_EMOJIS = ['⭐', '🌟', '📝', '🎯', '💊', '🧹', '🛏️', '🎵', '📱', '🐕', '🌿', '🏃', '🍽️', '🧺', '👕', '🤝', '🎨', '📚', '🧴', '🌙'];
const TASK_DURATIONS = [
  { value: 60, label: '1 min' }, { value: 120, label: '2 min' },
  { value: 300, label: '5 min' }, { value: 600, label: '10 min' },
  { value: 900, label: '15 min' }, { value: 1800, label: '30 min' },
];
const WEEK_DAYS = [
  { label: 'L', full: 'Lun', value: 1 },
  { label: 'M', full: 'Mar', value: 2 },
  { label: 'M', full: 'Mer', value: 3 },
  { label: 'J', full: 'Jeu', value: 4 },
  { label: 'V', full: 'Ven', value: 5 },
  { label: 'S', full: 'Sam', value: 6 },
  { label: 'D', full: 'Dim', value: 0 },
];

const TABS = ['📊 Stats', '⚙️ Config', '🔔 Notifs', '🎁 Récompenses', '⭐ Abonnement'];
const DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function ParentDashboardScreen({ navigation }) {
  const {
    isPremium, updateCustomTasks, addCustomTask, removeCustomTask, setParentMode,
    getWeeklyStats, unlockPremium, restDays, updateRestDays, getJokersLeft,
    notifMorningEnabled, notifEveningEnabled, notifMorningTime, notifEveningTime,
    importState, ratingPromptCount, recordRatingPrompt,
  } = useAppStore();
  const profile = useActiveProfile();
  const { saveAndApply } = useNotifications();
  const [tab, setTab] = useState(0);
  const [notifSettings, setNotifSettings] = useState({
    notifMorningEnabled, notifEveningEnabled, notifMorningTime, notifEveningTime,
  });
  const [reportLoading, setReportLoading] = useState(null);
  const [addingTask, setAddingTask] = useState(null);
  const [newTaskEmoji, setNewTaskEmoji] = useState('⭐');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState(300);

  useEffect(() => {
    maybeAskForRating(profile?.totalRoutinesDone || 0, ratingPromptCount, recordRatingPrompt)
      .catch(() => {});
  }, []);

  const availableMonths = useMemo(
    () => getAvailableMonths(useAppStore.getState().history),
    [],
  );

  if (!profile) return null;

  const stats = getWeeklyStats();
  const handleClose = () => { setParentMode(false); navigation.navigate('Home'); };

  const handleAddCustomTask = (routineId) => {
    if (!newTaskName.trim()) return;
    addCustomTask(routineId, { name: newTaskName.trim(), emoji: newTaskEmoji, duration: newTaskDuration, coins: 10, xp: 10 });
    setAddingTask(null);
    setNewTaskName('');
  };

  const handleDeleteCustomTask = (routineId, taskId) => {
    Alert.alert('Supprimer ?', 'Supprimer cette tâche personnalisée ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeCustomTask(routineId, taskId) },
    ]);
  };

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
    try {
      await saveAndApply(notifSettings);
      Alert.alert('✓ Notifications enregistrées');
    } catch (_) {
      Alert.alert('Erreur', "Impossible de programmer les rappels. Vérifiez le format de l'heure (ex. 07:30).");
    }
  };

  const handleExportReport = async (year, month, label) => {
    if (!isPremium) {
      navigation.navigate('Paywall');
      return;
    }
    const key = `${year}-${month}`;
    setReportLoading(key);
    try {
      const html = buildPractitionerReport(useAppStore.getState(), year, month);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Rapport FocusHéros — ${profile.childName} — ${label}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('✓ Rapport généré', `PDF enregistré : ${uri}`);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de générer le rapport. Réessayez.');
    } finally {
      setReportLoading(null);
    }
  };

  const handleExportBackup = async () => {
    try {
      await exportBackup(useAppStore.getState());
    } catch (_) {
      Alert.alert('Erreur', "Impossible de créer la sauvegarde. Réessayez.");
    }
  };

  const handleImportBackup = () => {
    Alert.alert(
      '⚠️ Restaurer une sauvegarde',
      "Toutes les données actuelles (progression, pièces, historique…) seront remplacées par celles de la sauvegarde. Continuer ?",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Restaurer',
          style: 'destructive',
          onPress: async () => {
            const result = await importBackup();
            if (result.ok) {
              importState(result.data);
              Alert.alert('✓ Sauvegarde restaurée', `La progression de ${result.data.childName || 'votre enfant'} a été restaurée.`);
            } else if (result.error !== 'cancelled') {
              Alert.alert('Fichier invalide', "Ce fichier n'est pas une sauvegarde FocusHéros valide.");
            }
          },
        },
      ]
    );
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
                <Text style={{ fontSize: 11 }}>{d.morningJokered ? '🃏' : '☀️'}</Text>
              </View>
              {isPremium && (
                <View style={[styles.dayDot, d.evening ? styles.dayDone : styles.dayEmpty]}>
                  <Text style={{ fontSize: 11 }}>{d.eveningJokered ? '🃏' : '🌙'}</Text>
                </View>
              )}
              <Text style={{ fontSize: 14 }}>{d.mood ? getMoodById(d.mood)?.emoji : ' '}</Text>
              <Text style={styles.dayLabel}>{DAYS[new Date(d.date + 'T00:00:00').getDay()]}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.cardSub, { marginTop: 10, fontSize: 11 }]}>
          Ligne du bas : météo des émotions déclarée par {profile.childName} 🃏 = joker utilisé
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={{ fontSize: 26 }}>🃏</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Jokers anti-frustration</Text>
            <Text style={styles.cardSub}>
              {getJokersLeft()} joker{getJokersLeft() > 1 ? 's' : ''} restant{getJokersLeft() > 1 ? 's' : ''} cette semaine (2 max).
              Un joker permet à {profile.childName} de passer une journée difficile sans casser sa série — le droit à l'erreur fait partie de l'apprentissage.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.reportCard}>
        <View style={styles.reportCardHeader}>
          <Text style={{ fontSize: 22 }}>📄</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.reportTitle}>Rapports pour le praticien</Text>
            <Text style={styles.reportSub}>PDF mensuel à partager avant la consultation</Text>
          </View>
          {!isPremium && <View style={styles.lockPill}><Text style={styles.lockPillText}>🔒 Premium</Text></View>}
        </View>
        {availableMonths.map(({ year, month, label, isCurrent, dayCount }) => {
          const key = `${year}-${month}`;
          const isLoading = reportLoading === key;
          return (
            <TouchableOpacity
              key={key}
              style={styles.monthRow}
              onPress={() => handleExportReport(year, month, label)}
              disabled={isLoading}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.monthLabel}>{label}</Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>en cours</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.monthSub}>
                  {dayCount > 0 ? `${dayCount} jour${dayCount > 1 ? 's' : ''} enregistré${dayCount > 1 ? 's' : ''}` : 'Aucune donnée encore'}
                </Text>
              </View>
              <Text style={[styles.downloadBtn, isLoading && { opacity: 0.4 }]}>
                {isLoading ? '⏳' : '⬇️ PDF'}
              </Text>
            </TouchableOpacity>
          );
        })}
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

  const toggleRestDay = (dayValue) => {
    const current = restDays || [];
    const updated = current.includes(dayValue)
      ? current.filter((d) => d !== dayValue)
      : [...current, dayValue];
    updateRestDays(updated);
  };

  // ── Config ─────────────────────────────────────────────────────
  const renderConfig = () => {
    const activeRestDays = restDays || [];
    const restDayNames = WEEK_DAYS.filter((d) => activeRestDays.includes(d.value)).map((d) => d.full);

    return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌴 Jours de repos</Text>
        <Text style={[styles.cardSub, { marginBottom: 14 }]}>
          Les quêtes sont désactivées ces jours-là
        </Text>
        <View style={styles.restDayRow}>
          {WEEK_DAYS.map((day) => {
            const active = activeRestDays.includes(day.value);
            return (
              <TouchableOpacity
                key={day.value}
                style={[styles.restDayBtn, active && styles.restDayBtnOn]}
                onPress={() => toggleRestDay(day.value)}
              >
                <Text style={[styles.restDayLabel, active && styles.restDayLabelOn]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.cardSub, { marginTop: 10 }]}>
          {restDayNames.length === 0
            ? 'Aucun jour de repos configuré'
            : `Repos : ${restDayNames.join(', ')}`}
        </Text>
      </View>

      {Object.values(ROUTINES).map((routine) => {
        const locked = routine.premium && !isPremium;
        const activeTasks = profile.customTasks?.[routine.id] || routine.defaultTasks;
        const activeIds = new Set(activeTasks.map((t) => t.id));
        const customTasksList = activeTasks.filter((t) => t.id.startsWith('custom_'));
        const isAdding = addingTask === routine.id;

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
              <>
                {routine.defaultTasks.map((task) => (
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
                ))}

                {customTasksList.map((task) => (
                  <View key={task.id} style={[styles.taskRow, styles.customTaskRow]}>
                    <Text style={styles.taskEmoji}>{task.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskName, { color: COLORS.primary }]}>{task.name}</Text>
                      <Text style={{ fontSize: 10, color: COLORS.textMuted }}>Personnalisée</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteCustomTask(routine.id, task.id)} style={styles.deleteBtn}>
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {isAdding ? (
                  <View style={styles.addTaskForm}>
                    <Text style={[styles.cardSub, { marginBottom: 6 }]}>Choisir un emoji :</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 6, paddingBottom: 4 }}>
                        {TASK_EMOJIS.map((e) => (
                          <TouchableOpacity
                            key={e}
                            style={[styles.emojiPill, newTaskEmoji === e && styles.emojiPillOn]}
                            onPress={() => setNewTaskEmoji(e)}
                          >
                            <Text style={{ fontSize: 20 }}>{e}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                    <TextInput
                      style={styles.addTaskInput}
                      placeholder="Nom de la tâche…"
                      placeholderTextColor={COLORS.textMuted}
                      value={newTaskName}
                      onChangeText={setNewTaskName}
                      maxLength={30}
                      autoFocus
                    />
                    <Text style={[styles.cardSub, { marginBottom: 6 }]}>Durée estimée :</Text>
                    <View style={styles.durationRow}>
                      {TASK_DURATIONS.map((d) => (
                        <TouchableOpacity
                          key={d.value}
                          style={[styles.durationPill, newTaskDuration === d.value && styles.durationPillOn]}
                          onPress={() => setNewTaskDuration(d.value)}
                        >
                          <Text style={[styles.durationText, newTaskDuration === d.value && styles.durationTextOn]}>
                            {d.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.addFormBtns}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => { setAddingTask(null); setNewTaskName(''); }}
                      >
                        <Text style={styles.cancelBtnText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.confirmBtn, !newTaskName.trim() && { opacity: 0.4 }]}
                        onPress={() => handleAddCustomTask(routine.id)}
                        disabled={!newTaskName.trim()}
                      >
                        <Text style={styles.confirmBtnText}>Ajouter ✓</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addTaskBtn}
                    onPress={() => { setAddingTask(routine.id); setNewTaskEmoji('⭐'); setNewTaskName(''); setNewTaskDuration(300); }}
                  >
                    <Text style={styles.addTaskBtnText}>+ Ajouter une tâche</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        );
      })}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💾 Sauvegarde des données</Text>
        <Text style={[styles.cardSub, { marginBottom: 12 }]}>
          Toutes les données sont stockées sur ce téléphone uniquement. Exportez régulièrement une
          sauvegarde (Google Drive, email…) pour ne rien perdre en cas de changement ou perte du téléphone.
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.backupBtn} onPress={handleExportBackup}>
            <Text style={styles.backupBtnText}>⬆️ Exporter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.backupBtn, styles.backupBtnSecondary]} onPress={handleImportBackup}>
            <Text style={[styles.backupBtnText, { color: COLORS.primary }]}>⬇️ Restaurer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: '#FFF7ED' }]}>
        <Text style={[styles.cardTitle, { color: '#9A3412' }]}>🆘 Code de secours</Text>
        <Text style={[styles.cardSub, { color: '#B45309', marginBottom: 10 }]}>
          Si vous oubliez votre code parent, ce code à 8 chiffres permet d'en créer un nouveau.
          Notez-le quelque part en sécurité (hors de portée de votre enfant).
        </Text>
        <Text style={styles.recoveryCode}>{useAppStore.getState().recoveryCode || '—'}</Text>
      </View>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Privacy')}>
        <View style={styles.row}>
          <Text style={{ fontSize: 22 }}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Confidentialité</Text>
            <Text style={styles.cardSub}>Zéro donnée collectée — tout reste sur votre téléphone</Text>
          </View>
          <Text style={{ fontSize: 22, color: COLORS.textMuted }}>›</Text>
        </View>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
    );
  };

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
              '📄  Rapport PDF pour le praticien',
              '⚙️  Personnalisation des tâches du soir',
              '📊  Suivi complet de la journée',
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
  reportCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: COLORS.primary,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  reportCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  reportTitle: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  reportSub: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16, marginTop: 2 },
  monthRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  monthLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  monthSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  currentBadge: {
    backgroundColor: '#D1FAE5', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  currentBadgeText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  downloadBtn: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  backupBtn: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  backupBtnSecondary: {
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.primary,
  },
  backupBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  recoveryCode: {
    fontSize: 28, fontWeight: '900', color: '#9A3412', textAlign: 'center',
    letterSpacing: 4, backgroundColor: COLORS.white, borderRadius: 10, paddingVertical: 10,
  },
  featureItem: { paddingVertical: 9, borderTopWidth: 1, borderTopColor: COLORS.border },
  featureText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  restDayRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  restDayBtn: {
    flex: 1, aspectRatio: 1, borderRadius: 10, backgroundColor: COLORS.background,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  restDayBtnOn: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  restDayLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary },
  restDayLabelOn: { color: '#065F46' },
  customTaskRow: { backgroundColor: '#F5F3FF', borderRadius: 8, marginHorizontal: -4, paddingHorizontal: 4 },
  deleteBtn: { padding: 4 },
  addTaskBtn: {
    marginTop: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.primary,
    borderStyle: 'dashed', padding: 10, alignItems: 'center',
  },
  addTaskBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  addTaskForm: { marginTop: 12, gap: 10 },
  emojiPill: {
    padding: 6, borderRadius: 8, borderWidth: 1.5, borderColor: 'transparent',
    backgroundColor: COLORS.background,
  },
  emojiPillOn: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  addTaskInput: {
    backgroundColor: COLORS.background, borderRadius: 10, padding: 12,
    fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
  },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  durationPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: COLORS.background, borderWidth: 1.5, borderColor: COLORS.border,
  },
  durationPillOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  durationText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  durationTextOn: { color: COLORS.white },
  addFormBtns: { flexDirection: 'row', gap: 8 },
  cancelBtn: {
    flex: 1, padding: 10, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  confirmBtn: { flex: 2, padding: 10, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  confirmBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
});
