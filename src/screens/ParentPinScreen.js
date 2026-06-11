import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function ParentPinScreen({ navigation }) {
  const { parentPin, setParentMode } = useAppStore();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleKey = (key) => {
    if (key === '') return;
    Haptics.selectionAsync();
    if (key === '⌫') {
      setInput((s) => s.slice(0, -1));
      setError(false);
      return;
    }
    if (input.length >= 4) return;
    const next = input + key;
    setInput(next);
    if (next.length === 4) {
      if (next === parentPin) {
        setParentMode(true);
        navigation.replace('ParentDashboard');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(true);
        setShake(true);
        setTimeout(() => { setInput(''); setShake(false); }, 600);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕ Fermer</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>🔐</Text>
        <Text style={styles.title}>Mode Parent</Text>
        <Text style={styles.subtitle}>Entrez votre code à 4 chiffres</Text>

        {/* Dots */}
        <View style={[styles.dotsRow, shake && styles.shake]}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i < input.length && styles.dotFilled, error && styles.dotError]} />
          ))}
        </View>

        {error && <Text style={styles.errorText}>Code incorrect, réessayez</Text>}

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
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  shake: {},
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
});
