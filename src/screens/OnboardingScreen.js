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

const AVATARS = Object.keys(AVATAR_THEMES);
const AVATAR_LABELS = { dragon: 'Dragon', hero: 'Héros', wizard: 'Sorcier', fox: 'Renard' };

export default function OnboardingScreen({ navigation, route }) {
  const isAdd = route.params?.mode === 'add';
  const { addProfile } = useAppStore();

  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(8);
  const [avatarId, setAvatarId] = useState('hero');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  const STEPS = isAdd ? ['name', 'age', 'avatar'] : ['name', 'age', 'avatar', 'pin'];
  const totalSteps = STEPS.length;

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep((s) => s + 1);
  };

  const handleFinish = () => {
    if (!isAdd) {
      if (pin.length !== 4) { setPinError('Code à 4 chiffres requis'); return; }
      if (pin !== pinConfirm) { setPinError('Les codes ne correspondent pas'); return; }
    }
    addProfile(childName.trim(), childAge, avatarId);
    if (isAdd) {
      navigation.replace('Home');
    } else {
      navigation.replace('Home');
    }
  };

  const renderStep = () => {
    switch (STEPS[step]) {
      case 'name':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.bigEmoji}>👋</Text>
            <Text style={styles.title}>{isAdd ? 'Nouveau héros' : 'Bienvenue !'}</Text>
            <Text style={styles.sub}>Comment s'appelle le héros ?</Text>
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={childName}
              onChangeText={setChildName}
              autoFocus
              maxLength={20}
            />
            <TouchableOpacity
              style={[styles.btn, !childName.trim() && styles.btnOff]}
              onPress={goNext}
              disabled={!childName.trim()}
            >
              <Text style={styles.btnText}>Continuer</Text>
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
                  style={[styles.agePill, childAge === age && styles.agePillOn]}
                  onPress={() => setChildAge(age)}
                >
                  <Text style={[styles.agePillText, childAge === age && styles.agePillTextOn]}>
                    {age}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={goNext}>
              <Text style={styles.btnText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        );

      case 'avatar':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>Choisis ton héros !</Text>
            <Text style={styles.sub}>{childName} part en aventure</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((id) => {
                const theme = AVATAR_THEMES[id];
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.avatarOpt, avatarId === id && { borderColor: theme.color, borderWidth: 4 }]}
                    onPress={() => setAvatarId(id)}
                  >
                    <HeroAvatar avatarId={id} size={72} showBorder={false} />
                    <Text style={styles.avatarLabel}>{AVATAR_LABELS[id]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.btn} onPress={isAdd ? handleFinish : goNext}>
              <Text style={styles.btnText}>{isAdd ? 'Créer ce héros 🚀' : 'Continuer'}</Text>
            </TouchableOpacity>
          </View>
        );

      case 'pin':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.bigEmoji}>🔐</Text>
            <Text style={styles.title}>Code parent</Text>
            <Text style={styles.sub}>Protège le mode parent{'\n'}(stats, config, abonnement)</Text>
            <TextInput
              style={styles.input}
              placeholder="Code 4 chiffres"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={pin}
              onChangeText={(t) => { setPin(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Confirmer le code"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={pinConfirm}
              onChangeText={(t) => { setPinConfirm(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
            {!!pinError && <Text style={styles.error}>{pinError}</Text>}
            <TouchableOpacity
              style={[styles.btn, pin.length < 4 && styles.btnOff]}
              onPress={handleFinish}
              disabled={pin.length < 4}
            >
              <Text style={styles.btnText}>C'est parti 🚀</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.dots}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <View key={i} style={[styles.dot, i <= step && styles.dotOn]} />
              ))}
            </View>
            <Animated.View style={{ opacity: fadeAnim }}>
              {renderStep()}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotOn: { backgroundColor: COLORS.white, width: 20 },
  stepContent: { alignItems: 'center' },
  bigEmoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.white, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 16,
    fontSize: 18,
    color: COLORS.white,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
  },
  btn: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  btnOff: { opacity: 0.35 },
  btnText: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  agePicker: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 8, width: '100%' },
  agePill: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  agePillOn: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  agePillText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  agePillTextOn: { color: COLORS.primary },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginBottom: 8, width: '100%' },
  avatarOpt: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 4,
    borderColor: 'transparent',
    width: 130,
  },
  avatarLabel: { marginTop: 8, fontSize: 14, fontWeight: '700', color: COLORS.white },
  error: { color: '#FCA5A5', fontSize: 13, marginTop: 6, textAlign: 'center' },
});
