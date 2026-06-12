import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../constants/colors';
import { ROUTINES } from '../constants/routineData';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';
import BadgeToast from '../components/BadgeToast';

export default function QuestScreen({ navigation, route }) {
  const { routineId } = route.params || {};
  const { earnRewards, completeRoutine, recordTaskDone, checkAndAwardBadges } = useAppStore();
  const profile = useActiveProfile();

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
  const [totalCoins, setTotalCoins] = useState(0);
  const [toastBadge, setToastBadge] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const slideY = useRef(new Animated.Value(40)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const busyRef = useRef(false);

  const currentTask = tasks[taskIndex];
  const isLast = taskIndex === tasks.length - 1;

  useEffect(() => {
    slideY.setValue(40);
    fadeIn.setValue(0);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [timeLeft, timerRunning]);

  // Écran atteint sans routine valide (deep link, params manquants) → retour
  useEffect(() => {
    if (!routine || tasks.length === 0) navigation.goBack();
  }, []);

  const startTimer = () => {
    if (timerRunning) return;
    setTimeLeft(currentTask.duration);
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const pulseDoneBtn = () => {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.94, tension: 300, friction: 5, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, tension: 300, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const handleDone = async () => {
    if (!currentTask) return;
    // Anti double-tap : sinon pièces/XP comptées deux fois et index hors limites
    if (busyRef.current) return;
    busyRef.current = true;

    if (timerRef.current) { clearInterval(timerRef.current); setTimerRunning(false); }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pulseDoneBtn();
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
        navigation.replace('Celebration', { routineId, coinsEarned: finalCoins, leveledUp, newLevel, newBadges });
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
      setTaskIndex((i) => i + 1);
      busyRef.current = false;
    }
  };

  const handleSkip = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    const warnCoins = isLast && totalCoins > 0;
    Alert.alert(
      'Passer ?',
      warnCoins
        ? `Tu vas perdre les ${totalCoins} pièces accumulées cette session. Continue ?`
        : 'Pas de pièces pour cette tâche.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => { busyRef.current = false; },
        },
        {
          text: 'Passer',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) { clearInterval(timerRef.current); setTimerRunning(false); }
            setTimeLeft(null);
            if (isLast) {
              navigation.goBack();
            } else {
              setTaskIndex((i) => i + 1);
              busyRef.current = false;
            }
          },
        },
      ]
    );
  };

  if (!routine || !currentTask) return null;

  const progress = (taskIndex + 1) / tasks.length;
  const gradient = GRADIENTS[routine.gradientKey] || GRADIENTS.primary;
  const timerRatio = timeLeft !== null && currentTask.duration > 0 ? timeLeft / currentTask.duration : 0;

  return (
    <LinearGradient colors={gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <BadgeToast badge={toastBadge} visible={toastVisible} onHide={() => setToastVisible(false)} />

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

        {/* Task */}
        <Animated.View style={[styles.taskArea, { opacity: fadeIn, transform: [{ translateY: slideY }] }]}>
          <Text style={styles.taskEmoji}>{currentTask.emoji}</Text>
          <Text style={styles.taskName}>{currentTask.name}</Text>

          {timeLeft !== null ? (
            <View style={styles.timerBlock}>
              <Text style={[styles.timerDisplay, timeLeft === 0 && styles.timerDone]}>
                {timeLeft === 0 ? '✓ Temps !' : formatTime(timeLeft)}
              </Text>
              <View style={styles.timerTrack}>
                <View style={[styles.timerFill, { width: `${timerRatio * 100}%` }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.timerBtn} onPress={startTimer}>
              <Text style={styles.timerBtnIcon}>▶</Text>
              <Text style={styles.timerBtnLabel}>Commencer</Text>
              <Text style={styles.timerBtnDuration}>{formatTime(currentTask.duration)}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          {totalCoins > 0 && (
            <Text style={styles.runningCoins}>🪙 {totalCoins} pièces gagnées</Text>
          )}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>MISSION ACCOMPLIE ✓</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Passer cette tâche</Text>
          </TouchableOpacity>
        </View>
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
});
