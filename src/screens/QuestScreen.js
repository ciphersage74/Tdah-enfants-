import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../constants/colors';
import { ROUTINES } from '../constants/routineData';
import { getShopItemById } from '../constants/shopData';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';
import { playDing } from '../utils/sounds';
import BadgeToast from '../components/BadgeToast';
import CompanionCheer from '../components/CompanionCheer';
import ElasticBanner from '../components/ElasticBanner';

export default function QuestScreen({ navigation, route }) {
  const { routineId } = route.params || {};
  const {
    earnRewards, completeRoutine, recordTaskDone, checkAndAwardBadges,
    parentApprovalRequired, parentPin,
  } = useAppStore();
  const profile = useActiveProfile();

  // Compagnon équipé (boutique) qui célèbre chaque tâche — étoile par défaut
  const companionEmoji =
    (profile?.equippedItems || [])
      .map(getShopItemById)
      .find((i) => i?.category === 'companions')?.emoji || '⭐';

  const routine = ROUTINES[routineId];
  // Freeze tasks at mount so profile switches don't break the session.
  // Une liste custom vide ou invalide retombe sur les tâches par défaut.
  const [tasks] = useState(() => {
    const custom = profile?.customTasks?.[routineId];
    return Array.isArray(custom) && custom.length > 0 ? custom : (routine?.defaultTasks || []);
  });

  const [taskIndex, setTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [toastBadge, setToastBadge] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [cheerTrigger, setCheerTrigger] = useState(0);
  const [approvalVisible, setApprovalVisible] = useState(false);
  const [approvalPin, setApprovalPin] = useState('');
  const [approvalError, setApprovalError] = useState('');

  const slideY = useRef(new Animated.Value(40)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const busyRef = useRef(false);
  // Durée réellement lancée (peut être compressée par le temps élastique)
  const startedDurationRef = useRef(0);

  const currentTask = tasks[taskIndex];
  const isLast = taskIndex === tasks.length - 1;

  // ── Temps élastique (optionnel) ──────────────────────────────────
  // Heure de fin configurée par le parent, figée au montage. Ignorée si
  // invalide ou déjà (presque) dépassée : dans ce cas, routine classique.
  const [endDate] = useState(() => {
    const t = useAppStore.getState().routineEndTimes?.[routineId];
    if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(t || '')) return null;
    const [h, m] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime() - Date.now() > 2 * 60 * 1000 ? d : null;
  });
  const endLabel = endDate
    ? `${endDate.getHours()}h${String(endDate.getMinutes()).padStart(2, '0')}`
    : '';
  const remainingTaskSeconds = tasks
    .slice(taskIndex)
    .reduce((s, t) => s + (t.duration || 0), 0);

  // Si l'enfant est en retard sur l'heure de fin, les minuteurs restants
  // se compressent proportionnellement (minimum 30 s, jamais punitif)
  const elasticDuration = (base) => {
    if (!endDate) return base;
    const secondsLeft = Math.max(0, (endDate.getTime() - Date.now()) / 1000);
    if (remainingTaskSeconds <= 0 || secondsLeft >= remainingTaskSeconds) return base;
    return Math.max(30, Math.round(base * (secondsLeft / remainingTaskSeconds)));
  };

  useEffect(() => {
    slideY.setValue(40);
    fadeIn.setValue(0);
    setTimerExpired(false);
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [taskIndex]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Effets de fin de timer hors de l'updater setState (qui doit rester pur)
  useEffect(() => {
    if (timeLeft === 0 && timerRunning) {
      clearInterval(timerRef.current);
      setTimerRunning(false);
      setTimerExpired(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [timeLeft, timerRunning]);

  // Écran atteint sans routine valide (deep link, params manquants) → retour
  useEffect(() => {
    if (!routine || tasks.length === 0) navigation.goBack();
  }, []);

  const startTimer = () => {
    if (timerRunning) return;
    const duration = elasticDuration(currentTask.duration);
    startedDurationRef.current = duration;
    setTimerExpired(false);
    setTimeLeft(duration);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);
  };

  const addExtraTime = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startedDurationRef.current = 120;
    setTimerExpired(false);
    setTimeLeft(120);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const pulseDoneBtn = () => {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.94, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, tension: 300, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  // Valide la tâche courante et attribue les récompenses.
  // Pour la dernière tâche, n'est appelé qu'APRÈS validation parentale éventuelle.
  const grantTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playDing();
    pulseDoneBtn();
    setCheerTrigger((c) => c + 1);
    recordTaskDone();

    const earned = totalCoins + (currentTask.coins || 0);
    setTotalCoins(earned);

    if (isLast) {
      try {
        const finalCoins = earned + routine.bonusCoins;
        const totalXp = tasks.reduce((s, t) => s + (t.xp || 0), 0) + routine.bonusXp;
        const { leveledUp, newLevel } = earnRewards(finalCoins, totalXp);
        completeRoutine(routineId);
        const newBadges = checkAndAwardBadges();
        // Temps d'avance sur l'heure de fin = temps libre gagné, montré à la célébration
        const freeMinutes = endDate
          ? Math.floor(Math.max(0, (endDate.getTime() - Date.now()) / 1000) / 60)
          : 0;
        navigation.replace('Celebration', { routineId, coinsEarned: finalCoins, leveledUp, newLevel, freeMinutes,
          newBadges: newBadges.map(({ id, emoji, label }) => ({ id, emoji, label })) });
      } finally {
        busyRef.current = false;
      }
    } else {
      // Check badges mid-session
      const newBadges = checkAndAwardBadges();
      if (newBadges.length > 0) {
        setToastBadge(newBadges[0]);
        setToastVisible(true);
      }
      setTimeLeft(null);
      setTimerRunning(false);
      setTimerExpired(false);
      setTaskIndex((i) => i + 1);
      busyRef.current = false;
    }
  };

  const handleDone = () => {
    if (!currentTask) return;
    // Anti double-tap : sinon pièces/XP comptées deux fois et index hors limites
    if (busyRef.current) return;
    busyRef.current = true;

    if (timerRef.current) { clearInterval(timerRef.current); setTimerRunning(false); }

    // Anti-triche optionnel : le parent valide la fin de quête avec son code
    if (isLast && parentApprovalRequired) {
      setApprovalPin('');
      setApprovalError('');
      setApprovalVisible(true);
      // busyRef reste true tant que la modale est ouverte
      return;
    }
    grantTask();
  };

  const handleApprovalSubmit = () => {
    if (approvalPin === String(parentPin)) {
      setApprovalVisible(false);
      grantTask();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setApprovalError('Code incorrect');
      setApprovalPin('');
    }
  };

  const handleApprovalCancel = () => {
    setApprovalVisible(false);
    busyRef.current = false;
  };

  const handleSkip = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    const title = isLast ? 'Abandonner la quête ?' : 'Passer cette tâche ?';
    const message = isLast
      ? (totalCoins > 0
          ? `Tu vas abandonner la quête et perdre les ${totalCoins} pièces accumulées.`
          : 'Tu vas abandonner la quête sans récompenses.')
      : 'Tu ne gagneras pas de pièces pour cette tâche.';
    Alert.alert(title, message, [
      {
        text: 'Annuler',
        style: 'cancel',
        onPress: () => { busyRef.current = false; },
      },
      {
        text: isLast ? 'Abandonner' : 'Passer',
        style: 'destructive',
        onPress: () => {
          if (timerRef.current) { clearInterval(timerRef.current); setTimerRunning(false); }
          setTimeLeft(null);
          setTimerExpired(false);
          if (isLast) {
            navigation.goBack();
          } else {
            setTaskIndex((i) => i + 1);
            busyRef.current = false;
          }
        },
      },
    ]);
  };

  if (!routine || !currentTask) return null;

  const progress = (taskIndex + 1) / tasks.length;
  const gradient = GRADIENTS[routine.gradientKey] || GRADIENTS.primary;
  const timerRatio = timeLeft !== null && startedDurationRef.current > 0 ? timeLeft / startedDurationRef.current : 0;

  return (
    <LinearGradient colors={gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <BadgeToast badge={toastBadge} visible={toastVisible} onHide={() => setToastVisible(false)} />
        <CompanionCheer trigger={cheerTrigger} emoji={companionEmoji} />

        {/* Top */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{taskIndex + 1}/{tasks.length}</Text>
          </View>
          <View style={styles.coinChip}>
            <Text style={styles.coinChipText}>🪙 +{currentTask.coins}</Text>
          </View>
        </View>

        {/* Temps élastique : visible seulement si le parent a fixé une heure de fin */}
        {endDate && (
          <ElasticBanner
            endDate={endDate.getTime()}
            remainingTaskSeconds={remainingTaskSeconds}
            endLabel={endLabel}
          />
        )}

        {/* Task */}
        <Animated.View style={[styles.taskArea, { opacity: fadeIn, transform: [{ translateY: slideY }] }]}>
          <Text style={styles.taskEmoji}>{currentTask.emoji}</Text>
          <Text style={styles.taskName}>{currentTask.name}</Text>

          {timerExpired ? (
            <View style={styles.expiredBlock}>
              <Text style={styles.expiredDisplay}>⏰ Temps écoulé !</Text>
              <Text style={styles.expiredSub}>Tu as fini ou il te faut plus de temps ?</Text>
              <TouchableOpacity style={styles.addTimeBtn} onPress={addExtraTime}>
                <Text style={styles.addTimeBtnIcon}>⏱</Text>
                <Text style={styles.addTimeBtnText}>+2 minutes</Text>
              </TouchableOpacity>
            </View>
          ) : timeLeft !== null ? (
            <View style={styles.timerBlock}>
              <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
              <View style={styles.timerTrack}>
                <View style={[styles.timerFill, { width: `${timerRatio * 100}%` }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.timerBtn} onPress={startTimer}>
              <Text style={styles.timerBtnIcon}>▶</Text>
              <Text style={styles.timerBtnLabel}>Commencer</Text>
              <Text style={styles.timerBtnDuration}>{formatTime(elasticDuration(currentTask.duration))}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          {totalCoins > 0 && (
            <Text style={styles.runningCoins}>🪙 {totalCoins} pièces gagnées</Text>
          )}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity style={[styles.doneBtn, timerExpired && styles.doneBtnExpired]} onPress={handleDone}>
              <Text style={[styles.doneBtnText, timerExpired && styles.doneBtnExpiredText]}>
                {timerExpired ? '✓  OUI, J\'AI TERMINÉ !' : 'MISSION ACCOMPLIE ✓'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Passer cette tâche</Text>
          </TouchableOpacity>
        </View>

        {/* Validation parentale de fin de quête (optionnelle, activée par le parent) */}
        <Modal
          visible={approvalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleApprovalCancel}
        >
          <View style={styles.approvalOverlay}>
            <View style={styles.approvalCard}>
              <Text style={styles.approvalEmoji}>👤</Text>
              <Text style={styles.approvalTitle}>Validation parent</Text>
              <Text style={styles.approvalSub}>
                Demande à un parent de vérifier ta quête et d'entrer son code !
              </Text>
              <TextInput
                style={styles.approvalInput}
                value={approvalPin}
                onChangeText={(t) => { setApprovalPin(t.replace(/\D/g, '').slice(0, 4)); setApprovalError(''); }}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                placeholder="• • • •"
                placeholderTextColor={COLORS.textMuted}
                autoFocus
              />
              {!!approvalError && <Text style={styles.approvalError}>{approvalError}</Text>}
              <TouchableOpacity
                style={[styles.approvalBtn, approvalPin.length < 4 && { opacity: 0.4 }]}
                onPress={handleApprovalSubmit}
                disabled={approvalPin.length < 4}
              >
                <Text style={styles.approvalBtnText}>Valider la quête ✓</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleApprovalCancel} style={styles.approvalCancel}>
                <Text style={styles.approvalCancelText}>Plus tard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: COLORS.white, fontWeight: '700' },
  progressWrap: { flex: 1, gap: 3 },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 3 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textAlign: 'right' },
  coinChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  coinChipText: { fontSize: 13, color: COLORS.white, fontWeight: '700' },

  taskArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  taskEmoji: { fontSize: 96, marginBottom: 20 },
  taskName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 28,
  },
  timerBlock: { width: '100%', alignItems: 'center', gap: 10 },
  timerDisplay: { fontSize: 44, fontWeight: '900', color: COLORS.white, fontVariant: ['tabular-nums'] },
  timerDone: { color: '#BBF7D0' },
  timerTrack: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 4 },
  timerBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
  },
  timerBtnIcon: { fontSize: 28, color: COLORS.white },
  timerBtnLabel: { fontSize: 20, fontWeight: '900', color: COLORS.white, letterSpacing: 0.5 },
  timerBtnDuration: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  actions: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  runningCoins: { textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  doneBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  doneBtnText: { fontSize: 18, fontWeight: '900', color: COLORS.primary, letterSpacing: 0.5 },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },

  expiredBlock: {
    width: '100%', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 22, padding: 24,
  },
  expiredDisplay: { fontSize: 36, fontWeight: '900', color: COLORS.white },
  expiredSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontWeight: '600' },
  addTimeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16,
  },
  addTimeBtnIcon: { fontSize: 22 },
  addTimeBtnText: { fontSize: 17, fontWeight: '900', color: COLORS.white },

  doneBtnExpired: { backgroundColor: '#D1FAE5', shadowColor: '#10B981' },
  doneBtnExpiredText: { color: '#065F46' },

  approvalOverlay: {
    flex: 1, backgroundColor: 'rgba(30,27,75,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: 28,
  },
  approvalCard: {
    backgroundColor: COLORS.white, borderRadius: 24, padding: 24,
    alignItems: 'center', width: '100%', maxWidth: 340,
  },
  approvalEmoji: { fontSize: 40, marginBottom: 8 },
  approvalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 6 },
  approvalSub: {
    fontSize: 13, color: COLORS.textSecondary, textAlign: 'center',
    lineHeight: 19, marginBottom: 16,
  },
  approvalInput: {
    backgroundColor: COLORS.background, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    fontSize: 24, fontWeight: '900', color: COLORS.textPrimary,
    textAlign: 'center', letterSpacing: 8,
    paddingVertical: 12, width: 160,
  },
  approvalError: { fontSize: 13, color: COLORS.danger, marginTop: 8 },
  approvalBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginTop: 16,
  },
  approvalBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
  approvalCancel: { paddingVertical: 12 },
  approvalCancelText: { fontSize: 13, color: COLORS.textSecondary },
});
