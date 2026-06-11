import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../constants/colors';
import { ROUTINES } from '../constants/routineData';
import { useAppStore } from '../store/useAppStore';

export default function QuestScreen({ navigation, route }) {
  const { routineId } = route.params;
  const { customTasks, earnRewards, completeRoutine } = useAppStore();

  const routine = ROUTINES[routineId];
  const tasks = customTasks[routineId] || routine.defaultTasks;

  const [taskIndex, setTaskIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  const currentTask = tasks[taskIndex];
  const isLast = taskIndex === tasks.length - 1;
  const progress = (taskIndex + 1) / tasks.length;

  const animateIn = useCallback(() => {
    slideAnim.setValue(60);
    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }).start();
  }, [slideAnim]);

  useEffect(() => { animateIn(); }, [taskIndex, animateIn]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    if (timerActive) return;
    setTimeLeft(currentTask.duration);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDone = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, tension: 200, friction: 5, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 5, useNativeDriver: true }),
    ]).start();

    const earned = totalCoinsEarned + currentTask.coins;
    setTotalCoinsEarned(earned);

    if (isLast) {
      const bonus = routine.bonusCoins;
      const finalCoins = earned + bonus;
      const { leveledUp, newLevel } = earnRewards(finalCoins, tasks.reduce((s, t) => s + t.xp, 0) + routine.bonusXp);
      completeRoutine(routineId);
      navigation.replace('Celebration', {
        routineId,
        coinsEarned: finalCoins,
        leveledUp,
        newLevel,
        childName: useAppStore.getState().childName,
      });
    } else {
      setTimeLeft(null);
      setTaskIndex((i) => i + 1);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Passer cette mission ?',
      'Tu ne gagneras pas les pièces pour cette tâche.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Passer',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimerActive(false);
            setTimeLeft(null);
            if (isLast) {
              navigation.goBack();
            } else {
              setTaskIndex((i) => i + 1);
            }
          },
        },
      ]
    );
  };

  const gradient = GRADIENTS[routine.gradientKey] || GRADIENTS.primary;
  const timerProgress = timeLeft !== null ? timeLeft / currentTask.duration : 0;

  return (
    <LinearGradient colors={gradient} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressBarWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{taskIndex + 1} / {tasks.length}</Text>
          </View>
          <View style={styles.coinPreview}>
            <Text style={styles.coinPreviewText}>🪙 +{currentTask.coins}</Text>
          </View>
        </View>

        {/* Task card */}
        <Animated.View style={[styles.taskCard, { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
          <Text style={styles.taskEmoji}>{currentTask.emoji}</Text>
          <Text style={styles.taskName}>{currentTask.name}</Text>

          {/* Timer section */}
          {timeLeft !== null ? (
            <View style={styles.timerBox}>
              <Text style={[styles.timerText, timeLeft === 0 && styles.timerDone]}>
                {timeLeft === 0 ? '✅ Temps écoulé !' : formatTime(timeLeft)}
              </Text>
              <View style={styles.timerTrack}>
                <View style={[styles.timerFill, { width: `${timerProgress * 100}%` }]} />
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.timerStartBtn} onPress={startTimer}>
              <Text style={styles.timerStartText}>⏱ Démarrer le timer ({formatTime(currentTask.duration)})</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Bottom buttons */}
        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnEmoji}>✅</Text>
            <Text style={styles.doneBtnText}>MISSION ACCOMPLIE !</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Passer cette tâche →</Text>
          </TouchableOpacity>
        </View>

        {/* Coins earned so far */}
        {totalCoinsEarned > 0 && (
          <View style={styles.earnedBar}>
            <Text style={styles.earnedText}>🪙 {totalCoinsEarned} pièces gagnées jusqu'ici</Text>
          </View>
        )}

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
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
  progressBarWrap: { flex: 1, gap: 4 },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'right',
  },
  coinPreview: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  coinPreviewText: { fontSize: 13, color: COLORS.white, fontWeight: '700' },

  taskCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  taskEmoji: { fontSize: 100, marginBottom: 24 },
  taskName: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 36,
  },
  timerBox: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.white,
    fontVariant: ['tabular-nums'],
  },
  timerDone: { color: '#BBF7D0' },
  timerTrack: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 5,
  },
  timerStartBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  timerStartText: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
  },

  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 12,
  },
  doneBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  doneBtnEmoji: { fontSize: 24 },
  doneBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  earnedBar: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  earnedText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
});
