import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, AVATAR_THEMES, GRADIENTS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import HeroAvatar from '../components/HeroAvatar';

const STEPS = ['name', 'age', 'avatar', 'pin'];

const AVATARS = Object.keys(AVATAR_THEMES);

export default function OnboardingScreen() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(8);
  const [avatarId, setAvatarId] = useState('hero');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep((s) => s + 1);
  };

  const handleFinish = () => {
    if (pin.length !== 4) { setPinError('Le code doit avoir 4 chiffres'); return; }
    if (pin !== pinConfirm) { setPinError('Les codes ne correspondent pas'); return; }
    completeOnboarding(childName.trim(), childAge, avatarId, pin);
  };

  const renderStep = () => {
    switch (STEPS[step]) {
      case 'name':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.bigEmoji}>👋</Text>
            <Text style={styles.title}>Bienvenue !</Text>
            <Text style={styles.subtitle}>Comment s'appelle ton héros ?</Text>
            <TextInput
              style={styles.input}
              placeholder="Prénom de l'enfant"
              placeholderTextColor={COLORS.textMuted}
              value={childName}
              onChangeText={setChildName}
              autoFocus
              maxLength={20}
            />
            <TouchableOpacity
              style={[styles.btn, !childName.trim() && styles.btnDisabled]}
              onPress={goNext}
              disabled={!childName.trim()}
            >
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'age':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.bigEmoji}>🎂</Text>
            <Text style={styles.title}>Quel âge a {childName} ?</Text>
            <View style={styles.agePicker}>
              {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((age) => (
                <TouchableOpacity
                  key={age}
                  style={[styles.agePill, childAge === age && styles.agePillSelected]}
                  onPress={() => setChildAge(age)}
                >
                  <Text style={[styles.agePillText, childAge === age && styles.agePillTextSelected]}>
                    {age} ans
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={goNext}>
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'avatar':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>Choisis ton héros !</Text>
            <Text style={styles.subtitle}>{childName} va partir en aventure</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((id) => {
                const theme = AVATAR_THEMES[id];
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.avatarOption, avatarId === id && { borderColor: theme.color, borderWidth: 4 }]}
                    onPress={() => setAvatarId(id)}
                  >
                    <HeroAvatar avatarId={id} size={80} showBorder={false} />
                    <Text style={styles.avatarName}>
                      {id === 'dragon' ? 'Dragon' : id === 'hero' ? 'Héros' : id === 'wizard' ? 'Sorcier' : 'Renard'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.btn} onPress={goNext}>
              <Text style={styles.btnText}>C'est parti ! →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'pin':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.bigEmoji}>🔐</Text>
            <Text style={styles.title}>Code parent</Text>
            <Text style={styles.subtitle}>Ce code protège le mode parent{'\n'}(stats, config, abonnement)</Text>
            <TextInput
              style={styles.input}
              placeholder="Code 4 chiffres"
              placeholderTextColor={COLORS.textMuted}
              value={pin}
              onChangeText={(t) => { setPin(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Confirmer le code"
              placeholderTextColor={COLORS.textMuted}
              value={pinConfirm}
              onChangeText={(t) => { setPinConfirm(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
            {!!pinError && <Text style={styles.errorText}>{pinError}</Text>}
            <TouchableOpacity
              style={[styles.btn, pin.length < 4 && styles.btnDisabled]}
              onPress={handleFinish}
              disabled={pin.length < 4}
            >
              <Text style={styles.btnText}>Créer mon compte 🚀</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.progressRow}>
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
              ))}
            </View>
            <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
              {renderStep()}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 20,
    paddingBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: { backgroundColor: COLORS.white },
  stepContent: { flex: 1, alignItems: 'center' },
  bigEmoji: { fontSize: 60, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: COLORS.white,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  agePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
    width: '100%',
  },
  agePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  agePillSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  agePillText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  agePillTextSelected: { color: COLORS.primary },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
    width: '100%',
  },
  avatarOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 4,
    borderColor: 'transparent',
    width: 120,
  },
  avatarName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
