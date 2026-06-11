import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import HeroAvatar from '../components/HeroAvatar';

export default function ProfileSelectScreen({ navigation }) {
  const { profiles, isPremium, switchProfile } = useAppStore();

  const handleSelect = (profileId) => {
    switchProfile(profileId);
    navigation.replace('Home');
  };

  const canAddProfile = isPremium ? profiles.length < 4 : profiles.length < 2;

  return (
    <LinearGradient colors={GRADIENTS.primary} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Qui joue aujourd'hui ?</Text>
        <Text style={styles.sub}>Choisissez votre héros</Text>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {profiles.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              style={styles.card}
              onPress={() => handleSelect(profile.id)}
              activeOpacity={0.85}
            >
              <HeroAvatar
                avatarId={profile.avatarId}
                size={72}
                equippedItems={profile.equippedItems || []}
              />
              <Text style={styles.cardName}>{profile.childName}</Text>
              <View style={styles.cardStats}>
                <Text style={styles.statText}>Niv. {profile.level}</Text>
                <Text style={styles.statDot}>·</Text>
                <Text style={styles.statText}>🔥 {profile.streak}j</Text>
              </View>
            </TouchableOpacity>
          ))}

          {canAddProfile && (
            <TouchableOpacity
              style={[styles.card, styles.addCard]}
              onPress={() => navigation.navigate('Onboarding', { mode: 'add' })}
            >
              <View style={styles.addIcon}>
                <Text style={styles.addPlus}>+</Text>
              </View>
              <Text style={styles.addText}>Ajouter un héros</Text>
            </TouchableOpacity>
          )}

          {!isPremium && profiles.length >= 2 && (
            <TouchableOpacity
              style={[styles.card, styles.premiumCard]}
              onPress={() => navigation.navigate('Paywall')}
            >
              <Text style={{ fontSize: 32 }}>⭐</Text>
              <Text style={styles.premiumText}>Jusqu'à 4 héros</Text>
              <Text style={styles.premiumSub}>Premium</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 24,
  },
  sub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: 150,
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.white,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  statDot: { color: 'rgba(255,255,255,0.5)' },
  addCard: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  addIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: { fontSize: 32, color: COLORS.white, fontWeight: '300' },
  addText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  premiumCard: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255,184,0,0.15)',
  },
  premiumText: { fontSize: 14, color: COLORS.gold, fontWeight: '800' },
  premiumSub: { fontSize: 11, color: 'rgba(255,184,0,0.7)' },
});
