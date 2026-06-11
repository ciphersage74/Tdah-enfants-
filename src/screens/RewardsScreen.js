import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';

const EMOJI_PRESETS = ['🎬', '🍕', '🎮', '🧸', '🎡', '📚', '🏊', '🎂', '🚗', '⚽'];

export default function RewardsScreen({ navigation, route }) {
  const isParentView = route.params?.parentView === true;
  const { addReward, claimReward, toggleRewardActive, deleteReward } = useAppStore();
  const profile = useActiveProfile();
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [emoji, setEmoji] = useState('🎬');
  const [adding, setAdding] = useState(false);

  if (!profile) return null;

  const rewards = (profile.rewards || []).filter((r) => isParentView || r.active);

  const handleAdd = () => {
    if (!name.trim() || !cost) return;
    addReward(name.trim(), emoji, parseInt(cost, 10));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName('');
    setCost('');
    setEmoji('🎬');
    setAdding(false);
  };

  const handleClaim = (reward) => {
    if (profile.coins < reward.cost) {
      Alert.alert(
        'Pas assez de pièces',
        `Il te faut encore ${reward.cost - profile.coins} pièces pour cette récompense.`
      );
      return;
    }
    Alert.alert(
      `Réclamer "${reward.name}" ?`,
      `Coût : ${reward.cost} pièces`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réclamer !',
          onPress: () => {
            claimReward(reward.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('🎉 Réclamé !', 'Montre ça à tes parents pour obtenir ta récompense !');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isParentView ? 'Gérer les récompenses' : 'Récompenses'}</Text>
        {!isParentView && (
          <View style={styles.coinPill}>
            <Text style={styles.coinText}>🪙 {profile.coins}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add form (parent only) */}
        {isParentView && (
          <>
            {adding ? (
              <View style={styles.addForm}>
                <Text style={styles.formTitle}>Nouvelle récompense</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiRow}>
                  {EMOJI_PRESETS.map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                      onPress={() => setEmoji(e)}
                    >
                      <Text style={styles.emojiPickerText}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TextInput
                  style={styles.input}
                  placeholder="Nom de la récompense (ex: Cinéma)"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={COLORS.textMuted}
                />
                <View style={styles.costRow}>
                  <Text style={styles.costLabel}>🪙 Coût en pièces :</Text>
                  <TextInput
                    style={[styles.input, styles.costInput]}
                    placeholder="ex: 200"
                    value={cost}
                    onChangeText={setCost}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={styles.formBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdding(false)}>
                    <Text style={styles.cancelBtnText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, (!name.trim() || !cost) && styles.saveBtnDisabled]}
                    onPress={handleAdd}
                    disabled={!name.trim() || !cost}
                  >
                    <Text style={styles.saveBtnText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
                <Text style={styles.addBtnText}>+ Créer une récompense</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Rewards list */}
        {rewards.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎁</Text>
            <Text style={styles.emptyTitle}>
              {isParentView ? 'Aucune récompense' : 'Pas encore de récompense'}
            </Text>
            <Text style={styles.emptyDesc}>
              {isParentView
                ? 'Créez des récompenses pour motiver votre enfant !'
                : 'Demande à tes parents d\'ajouter des récompenses !'}
            </Text>
          </View>
        ) : (
          rewards.map((reward) => (
            <View key={reward.id} style={[styles.rewardCard, !reward.active && styles.rewardCardInactive]}>
              <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
              <View style={styles.rewardInfo}>
                <Text style={[styles.rewardName, !reward.active && { color: COLORS.textMuted }]}>
                  {reward.name}
                </Text>
                <Text style={styles.rewardCost}>🪙 {reward.cost} pièces</Text>
                {reward.claimed && <Text style={styles.claimedTag}>✅ Réclamée</Text>}
              </View>
              {isParentView ? (
                <View style={styles.rewardActions}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, reward.active ? styles.toggleActive : styles.toggleInactive]}
                    onPress={() => toggleRewardActive(reward.id)}
                  >
                    <Text style={styles.toggleBtnText}>{reward.active ? 'On' : 'Off'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    Alert.alert('Supprimer ?', reward.name, [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Supprimer', style: 'destructive', onPress: () => deleteReward(reward.id) },
                    ]);
                  }}>
                    <Text style={styles.deleteBtn}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                !reward.claimed && (
                  <TouchableOpacity
                    style={[styles.claimBtn, profile.coins < reward.cost && styles.claimBtnDisabled]}
                    onPress={() => handleClaim(reward)}
                  >
                    <Text style={styles.claimBtnText}>
                      {profile.coins >= reward.cost ? 'Réclamer' : `Manque ${reward.cost - profile.coins}`}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  back: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  coinPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  coinText: { fontSize: 14, fontWeight: '700', color: '#B45309' },
  content: { padding: 16, gap: 10 },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 6,
  },
  addBtnText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
  addForm: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  emojiRow: { marginBottom: 4 },
  emojiBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 6,
  },
  emojiBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  emojiPickerText: { fontSize: 24 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  costLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  costInput: { flex: 1 },
  formBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  empty: { alignItems: 'center', padding: 40, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  emptyDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  rewardCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  rewardCardInactive: { opacity: 0.5 },
  rewardEmoji: { fontSize: 28 },
  rewardInfo: { flex: 1, gap: 2 },
  rewardName: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  rewardCost: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  claimedTag: { fontSize: 12, color: COLORS.success, fontWeight: '700' },
  rewardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toggleActive: { backgroundColor: COLORS.success },
  toggleInactive: { backgroundColor: COLORS.border },
  toggleBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  deleteBtn: { fontSize: 18 },
  claimBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  claimBtnDisabled: { backgroundColor: COLORS.border },
  claimBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
});
