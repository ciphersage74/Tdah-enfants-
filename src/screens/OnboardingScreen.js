import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, ScrollView, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, AVATAR_THEMES, AVATAR_LABELS, BOY_AVATARS, GIRL_AVATARS, GRADIENTS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import HeroAvatar from '../components/HeroAvatar';

const STEPS = ['name', 'gender', 'age', 'avatar', 'pin', 'recovery'];

const makeRecoveryCode = () => String(Math.floor(10000000 + Math.random() * 90000000));

export default function OnboardingScreen({ navigation }) {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [gender, setGender] = useState('boy');
  const [childAge, setChildAge] = useState(8);
  const [avatarId, setAvatarId] = useState('superhero');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');
  const [recoveryCode] = useState(makeRecoveryCode);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goNext = () => {
    if (STEPS[step] === 'gender') {
      setAvatarId(gender === 'boy' ? BOY_AVATARS[0] : GIRL_AVATARS[0]);
    }
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep((s) => s + 1);
  };

  const handleValidatePin = () => {
    if (pin.length !== 4) { setPinError('Code à 4 chiffres requis'); return; }
    if (pin !== pinConfirm) { setPinError('Les codes ne correspondent pas'); return; }
    goNext();
  };

  const handleFinish = () => {
    completeOnboarding(childName.trim(), childAge, avatarId, pin, gender, recoveryCode);
    navigation.replace('Home');
  };

  const handleEmailRecoveryCode = async () => {
    const subject = encodeURIComponent('FocusHéros — Code de secours');
    const body = encodeURIComponent(
      `Code de secours FocusHéros : ${recoveryCode}\n\n` +
      'Ce code permet de réinitialiser le code parent si vous l\'oubliez.\n' +
      'Conservez cet email précieusement.'
    );
    try {
      await Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
    } catch (_) {
      Alert.alert(
        'Aucune application email',
        `Impossible d'ouvrir une app email sur ce téléphone.\n\nNotez le code à la main : ${recoveryCode}\n\nIl restera aussi visible dans Mode Parent → Config.`
      );
    }
  };

  const renderStep = () => {
    const genderAvatars = gender === 'boy' ? BOY_AVATARS : GIRL_AVATARS;

    switch (STEPS[step]) {
      case 'name':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.bigEmoji}>👋</Text>
            <Text style={styles.title}>Bienvenue !</Text>
            <Text style={styles.sub}>Comment s'appelle le héros ?</Text>
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={childName}
              onChangeText={setChildName}
              autoFocus
              maxLength={20}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={[styles.btn, !childName.trim() && styles.btnOff]}
              onPress={goNext}
              disabled={!childName.trim()}
            >
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'gender':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.bigEmoji}>🌟</Text>
            <Text style={styles.title}>{childName}, c'est…</Text>
            <Text style={styles.sub}>Les héros disponibles seront différents !</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderCard, gender === 'boy' && styles.genderCardBoyOn]}
                onPress={() => setGender('boy')}
              >
                <Text style={styles.genderEmoji}>👦</Text>
                <Text style={[styles.genderLabel, gender === 'boy' && styles.genderLabelOn]}>Un garçon</Text>
                {gender === 'boy' && <Text style={styles.genderCheck}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderCard, gender === 'girl' && styles.genderCardGirlOn]}
                onPress={() => setGender('girl')}
              >
                <Text style={styles.genderEmoji}>👧</Text>
                <Text style={[styles.genderLabel, gender === 'girl' && styles.genderLabelOn]}>Une fille</Text>
                {gender === 'girl' && <Text style={styles.genderCheck}>✓</Text>}
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.btn} onPress={goNext}>
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
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'avatar':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.title}>
              Choisis {gender === 'girl' ? 'ton héroïne' : 'ton héros'} !
            </Text>
            <Text style={styles.sub}>{childName} part en aventure</Text>
            <View style={styles.avatarGrid}>
              {genderAvatars.map((id) => {
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
            <TouchableOpacity style={styles.btn} onPress={goNext}>
              <Text style={styles.btnText}>
                C'est {gender === 'girl' ? 'cette héroïne' : 'ce héros'} ! →
              </Text>
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
              placeholder="Code à 4 chiffres"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={pin}
              onChangeText={(t) => { setPin(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Confirmer le code"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={pinConfirm}
              onChangeText={(t) => { setPinConfirm(t.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />
            {!!pinError && <Text style={styles.error}>{pinError}</Text>}
            <TouchableOpacity
              style={[styles.btn, pin.length < 4 && styles.btnOff]}
              onPress={handleValidatePin}
              disabled={pin.length < 4}
            >
              <Text style={styles.btnText}>Continuer →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'recovery':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.bigEmoji}>🆘</Text>
            <Text style={styles.title}>Code de secours</Text>
            <Text style={styles.sub}>
              Si vous oubliez votre code parent, ce code permettra d'en créer un nouveau.{'\n'}
              <Text style={{ fontWeight: '800' }}>Notez-le maintenant</Text> — il ne sera plus
              affiché qu'à l'intérieur du mode parent.
            </Text>
            <View style={styles.recoveryBox}>
              <Text style={styles.recoveryCodeText}>{recoveryCode}</Text>
            </View>
            <TouchableOpacity style={styles.emailBtn} onPress={handleEmailRecoveryCode}>
              <Text style={styles.emailBtnText}>📧 Me l'envoyer par email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={handleFinish}>
              <Text style={styles.btnText}>J'ai noté mon code, c'est parti 🚀</Text>
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
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.dot, i <= step ? styles.dotOn : null]} />
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
  dot: { height: 6, width: 20, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotOn: { backgroundColor: COLORS.white, width: 32 },
  stepContent: { alignItems: 'center' },
  bigEmoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.white, textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 16,
    fontSize: 18, color: COLORS.white, width: '100%',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', textAlign: 'center',
  },
  btn: {
    backgroundColor: COLORS.white, borderRadius: 14, paddingVertical: 16,
    width: '100%', alignItems: 'center', marginTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  btnOff: { opacity: 0.35 },
  btnText: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  agePicker: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 8, width: '100%' },
  agePill: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  agePillOn: { backgroundColor: COLORS.white },
  agePillText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  agePillTextOn: { color: COLORS.primary },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginBottom: 8, width: '100%' },
  avatarOpt: {
    alignItems: 'center', padding: 12, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 4, borderColor: 'transparent', width: 130,
  },
  avatarLabel: { marginTop: 8, fontSize: 14, fontWeight: '700', color: COLORS.white },
  error: { color: '#FCA5A5', fontSize: 13, marginTop: 6, textAlign: 'center' },
  // Gender
  genderRow: { flexDirection: 'row', gap: 16, marginBottom: 8, width: '100%' },
  genderCard: {
    flex: 1, alignItems: 'center', padding: 24, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 3, borderColor: 'transparent', gap: 8,
  },
  genderCardBoyOn:  { borderColor: '#93C5FD', backgroundColor: 'rgba(59,130,246,0.25)' },
  genderCardGirlOn: { borderColor: '#F9A8D4', backgroundColor: 'rgba(236,72,153,0.25)' },
  genderEmoji: { fontSize: 52 },
  genderLabel: { fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },
  genderLabelOn: { color: COLORS.white },
  genderCheck: { fontSize: 18, color: COLORS.white, fontWeight: '900' },
  // Recovery code
  recoveryBox: {
    backgroundColor: COLORS.white, borderRadius: 16, paddingVertical: 18,
    width: '100%', alignItems: 'center', marginBottom: 12,
  },
  recoveryCodeText: {
    fontSize: 32, fontWeight: '900', color: COLORS.primary, letterSpacing: 6,
  },
  emailBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 14,
    width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  emailBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
