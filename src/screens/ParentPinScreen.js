import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

// mode: 'enter' (code normal) | 'recovery' (code de secours) | 'newpin' | 'confirm'
export default function ParentPinScreen({ navigation }) {
  const { parentPin, recoveryCode, setParentMode, setParentPin } = useAppStore();
  const [mode, setMode] = useState('enter');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [newPin, setNewPin] = useState('');
  const failTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(failTimerRef.current), []);

  const enterDashboard = () => {
    setParentMode(true);
    navigation.replace('ParentDashboard');
  };

  const fail = (msg) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setError(msg);
    failTimerRef.current = setTimeout(() => setInput(''), 500);
  };

  const handleComplete = (value) => {
    if (mode === 'enter') {
      if (value === parentPin) enterDashboard();
      else fail('Code incorrect, réessayez');
    } else if (mode === 'recovery') {
      if (value === recoveryCode) {
        setInput('');
        setError('');
        setMode('newpin');
      } else {
        fail('Code de secours incorrect');
      }
    } else if (mode === 'newpin') {
      setNewPin(value);
      setInput('');
      setMode('confirm');
    } else if (mode === 'confirm') {
      if (value === newPin) {
        setParentPin(value);
        enterDashboard();
      } else {
        setInput('');
        setNewPin('');
        setMode('newpin');
        fail('Les codes ne correspondent pas');
      }
    }
  };

  const handleKey = (key) => {
    if (key === '') return;
    Haptics.selectionAsync();
    if (key === '⌫') {
      setInput((s) => s.slice(0, -1));
      setError('');
      return;
    }
    const maxLen = mode === 'recovery' ? 8 : 4;
    if (input.length >= maxLen) return;
    const next = input + key;
    setInput(next);
    setError('');
    if (next.length === maxLen) handleComplete(next);
  };

  const startReset = () => {
    setInput('');
    setError('');
    setMode('recovery');
  };

  const TITLES = {
    enter:    { emoji: '🔐', title: 'Mode Parent',     sub: 'Entrez votre code à 4 chiffres' },
    recovery: { emoji: '🆘', title: 'Code de secours', sub: 'Entrez le code à 8 chiffres donné\nà la création du compte' },
    newpin:   { emoji: '🆕', title: 'Nouveau code',    sub: 'Choisissez un nouveau code à 4 chiffres' },
    confirm:  { emoji: '✅', title: 'Confirmation',    sub: 'Entrez le même code une seconde fois' },
  };
  const t = TITLES[mode];
  const dotCount = mode === 'recovery' ? 8 : 4;

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => (mode === 'enter' ? navigation.goBack() : (setMode('enter'), setInput(''), setError('')))}
      >
        <Text style={styles.closeText}>{mode === 'enter' ? '✕ Fermer' : '‹ Retour'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>{t.emoji}</Text>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.sub}</Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {Array.from({ length: dotCount }).map((_, i) => (
            <View key={i} style={[styles.dot, i < input.length && styles.dotFilled, !!error && styles.dotError]} />
          ))}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYS.map((key, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.key, key === '' && styles.keyEmpty]}
              onPress={() => handleKey(key)}
              disabled={key === ''}
            >
              <Text style={[styles.keyText, key === '⌫' && styles.keyBackspace]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {mode === 'enter' && (
          <TouchableOpacity onPress={startReset} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Code oublié ?</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  closeBtn: {
    padding: 20,
    paddingBottom: 0,
  },
  closeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 36,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
  },
  dotError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.danger,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.danger,
    marginBottom: 16,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 264,
    gap: 12,
    marginTop: 16,
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  keyBackspace: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  forgotBtn: { marginTop: 24, padding: 8 },
  forgotText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
