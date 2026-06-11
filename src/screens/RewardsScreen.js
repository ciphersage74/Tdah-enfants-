import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';

const { width } = Dimensions.get('window');

const QUICK_TEMPLATES = [
  { name: 'Cinéma', emoji: '🎬', cost: 300 },
  { name: 'Pizza', emoji: '🍕', cost: 200 },
  { name: 'Jeu vidéo', emoji: '🎮', cost: 400 },
  { name: 'Parc d\'attraction', emoji: '🎡', cost: 600 },
  { name: 'Restaurant', emoji: '🍔', cost: 250 },
  { name: 'Jouet surprise', emoji: '🧸', cost: 350 },
  { name: 'Soirée film', emoji: '🍿', cost: 150 },
  { name: 'Activité sport', emoji: '⚽', cost: 300 },
];

function RewardCard({ reward, coins, onClaim, isParentView, onToggle, onDelete }) {
  const progress = Math.min(coins / reward.cost, 1);
  const canClaim = coins >= reward.cost && !reward.claimed;
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!canClaim) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [canClaim]);

  if (reward.claimed) {
    return (
      <View style={[styles.rewardCard, styles.rewardCardClaimed]}>
        <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
        <View style={styles.rewardBody}>
          <Text style={styles.rewardName}>{reward.name}</Text>
          <Text style={styles.claimedText}>✅ Réclamée — montre à tes parents !</Text>
        </View>
        {isParentView && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!reward.active && !isParentView) return null;

  return (
    <Animated.View style={{ transform: [{ scale: canClaim ? glowAnim : 1 }] }}>
      <View style={[styles.rewardCard, canClaim && styles.rewardCardReady, !reward.active && styles.rewardCardInactive]}>
        {canClaim && <View style={styles.readyBadge}><Text style={styles.readyBadgeText}>PRÊT !</Text></View>}

        <View style={styles.rewardTop}>
          <View style={[styles.emojiCircle, canClaim && styles.emojiCircleReady]}>
            <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
          </View>
          <View style={styles.rewardBody}>
            <Text style={styles.rewardName}>{reward.name}</Text>
            <Text style={styles.rewardCostText}>
              {canClaim ? `${reward.cost} 🪙 atteint !` : `${reward.cost} 🪙 nécessaires`}
            </Text>
          </View>
          {isParentView && (
            <View style={styles.parentActions}>
              <TouchableOpacity
                style={[styles.toggleBtn, reward.active ? styles.toggleOn : styles.toggleOff]}
                onPress={onToggle}
              >
                <Text style={styles.toggleBtnText}>{reward.active ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
                canClaim && styles.progressFillReady,
              ]}
            />
          </View>
          <Text style={[styles.progressText, canClaim && styles.progressTextReady]}>
            {canClaim ? `${coins} / ${reward.cost}` : `${Math.max(0, reward.cost - coins)} 🪙 encore`}
          </Text>
        </View>

        {/* Claim button */}
        {!isParentView && canClaim && (
          <TouchableOpacity style={styles.claimBtn} onPress={() => onClaim(reward)}>
            <LinearGradient colors={GRADIENTS.morning} style={styles.claimGradient}>
              <Text style={styles.claimBtnText}>🎉  RÉCLAMER MA RÉCOMPENSE</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

export default function RewardsScreen({ navigation, route }) {
  const isParentView = route.params?.parentView === true;
  const { addReward, claimReward, toggleRewardActive, deleteReward } = useAppStore();
  const profile = useActiveProfile();

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [emoji, setEmoji] = useState('🎬');

  if (!profile) return null;

  const activeRewards = (profile.rewards || []).filter((r) => isParentView || r.active);

  const handleAdd = () => {
    if (!name.trim() || !cost || parseInt(cost) < 10) return;
    addReward(name.trim(), emoji, parseInt(cost, 10));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName(''); setCost(''); setEmoji('🎬'); setAdding(false);
  };

  const handleTemplate = (t) => {
    setName(t.name); setEmoji(t.emoji); setCost(String(t.cost));
  };

  const handleClaim = (reward) => {
    Alert.alert(
      `${reward.emoji}  Réclamer "${reward.name}" ?`,
      `Coût : ${reward.cost} pièces\nSolde restant : ${profile.coins - reward.cost} pièces`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '🎉 Réclamer !',
          onPress: () => {
            claimReward(reward.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              '🎉 Félicitations !',
              `Tu as réclamé "${reward.name}" ! Montre ça à tes parents.`
            );
          },
        },
      ]
    );
  };

  const handleDelete = (rewardId, name) => {
    Alert.alert('Supprimer cette récompense ?', name, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteReward(rewardId) },
    ]);
  };

  const claimable = activeRewards.filter((r) => !r.claimed && r.active && profile.coins >= r.cost);
  const inProgress = activeRewards.filter((r) => !r.claimed && r.active && profile.coins < r.cost);
  const claimed = activeRewards.filter((r) => r.claimed);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{isParentView ? 'Gérer les récompenses' : 'Mes récompenses'}</Text>
          {!isParentView && <Text style={styles.coinSub}>🪙 {profile.coins} pièces disponibles</Text>}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Parent: Add button */}
        {isParentView && !adding && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
            <Text style={styles.addBtnText}>+ Créer une récompense</Text>
          </TouchableOpacity>
        )}

        {/* Add form */}
        {isParentView && adding && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Nouvelle récompense</Text>

            {/* Templates */}
            <Text style={styles.formSub}>Modèles rapides :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {QUICK_TEMPLATES.map((t) => (
                  <TouchableOpacity key={t.name} style={styles.templateBtn} onPress={() => handleTemplate(t)}>
                    <Text style={styles.templateEmoji}>{t.emoji}</Text>
                    <Text style={styles.templateName}>{t.name}</Text>
                    <Text style={styles.templateCost}>{t.cost} 🪙</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Emoji picker */}
            <Text style={styles.formSub}>Icône :</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['🎬', '🍕', '🎮', '🧸', '🎡', '🍔', '🍿', '⚽', '🎂', '🚗', '🏖️', '🛍️', '🎁', '🌟'].map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                    onPress={() => setEmoji(e)}
                  >
                    <Text style={{ fontSize: 22 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Nom de la récompense"
              value={name}
              onChangeText={setName}
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Coût en pièces :</Text>
              <TextInput
                style={[styles.input, styles.costInput]}
                placeholder="ex: 300"
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAdding(false); setName(''); setCost(''); }}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!name.trim() || !cost) && { opacity: 0.4 }]}
                onPress={handleAdd}
                disabled={!name.trim() || !cost}
              >
                <Text style={styles.saveBtnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Child view: tip */}
        {!isParentView && activeRewards.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🎁</Text>
            <Text style={styles.emptyTitle}>Pas encore de récompenses</Text>
            <Text style={styles.emptyDesc}>
              Demande à tes parents d'ajouter des récompenses dans le mode parent !
            </Text>
          </View>
        )}

        {/* Claimable now */}
        {claimable.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>🟢 Prêtes à réclamer</Text>
            {claimable.map((r) => (
              <RewardCard
                key={r.id} reward={r} coins={profile.coins}
                onClaim={handleClaim} isParentView={isParentView}
                onToggle={() => toggleRewardActive(r.id)}
                onDelete={() => handleDelete(r.id, r.name)}
              />
            ))}
          </>
        )}

        {/* In progress */}
        {inProgress.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>⏳ En cours</Text>
            {inProgress.map((r) => (
              <RewardCard
                key={r.id} reward={r} coins={profile.coins}
                onClaim={handleClaim} isParentView={isParentView}
                onToggle={() => toggleRewardActive(r.id)}
                onDelete={() => handleDelete(r.id, r.name)}
              />
            ))}
          </>
        )}

        {/* Claimed */}
        {claimed.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>✅ Réclamées</Text>
            {claimed.map((r) => (
              <RewardCard
                key={r.id} reward={r} coins={profile.coins}
                onClaim={handleClaim} isParentView={isParentView}
                onToggle={() => toggleRewardActive(r.id)}
                onDelete={() => handleDelete(r.id, r.name)}
              />
            ))}
          </>
        )}

        {/* Parent advice */}
        {isParentView && (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Conseil</Text>
            <Text style={styles.tipText}>
              Les récompenses tangibles et à court terme sont particulièrement efficaces pour les cerveaux TDAH.
              Proposez des paliers réalistes (1-2 semaines de routines régulières).
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  backText: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  coinSub: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginTop: 1 },

  content: { padding: 16, gap: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary, marginTop: 4 },

  addBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 4,
  },
  addBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.white },

  addForm: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  formTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary },
  formSub: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  templateBtn: {
    alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 10, width: 80,
  },
  templateEmoji: { fontSize: 22 },
  templateName: { fontSize: 10, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginTop: 2 },
  templateCost: { fontSize: 10, color: COLORS.textSecondary, marginTop: 1 },
  emojiBtn: {
    padding: 6, borderRadius: 10, borderWidth: 2, borderColor: 'transparent',
  },
  emojiBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  input: {
    backgroundColor: COLORS.background, borderRadius: 12, padding: 12,
    fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
  },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  costLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, flex: 1 },
  costInput: { flex: 1 },
  formBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, padding: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  saveBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  // Reward card
  rewardCard: {
    backgroundColor: COLORS.white, borderRadius: 18, padding: 16,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    gap: 12, position: 'relative', overflow: 'hidden',
  },
  rewardCardReady: {
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  rewardCardInactive: { opacity: 0.5 },
  rewardCardClaimed: { backgroundColor: COLORS.successLight, borderColor: COLORS.success },
  readyBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 12, paddingVertical: 4,
    borderBottomLeftRadius: 14,
  },
  readyBadgeText: { fontSize: 11, fontWeight: '900', color: COLORS.white },
  rewardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
  },
  emojiCircleReady: { backgroundColor: '#FEF3C7' },
  rewardEmoji: { fontSize: 26 },
  rewardBody: { flex: 1 },
  rewardName: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  rewardCostText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  claimedText: { fontSize: 12, color: COLORS.success, fontWeight: '700', marginTop: 2 },
  parentActions: { flexDirection: 'column', alignItems: 'flex-end', gap: 8 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  toggleOn: { backgroundColor: COLORS.success },
  toggleOff: { backgroundColor: COLORS.border },
  toggleBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  deleteBtn: {},
  deleteBtnText: { fontSize: 18 },

  progressWrap: { gap: 6 },
  progressTrack: {
    height: 10, backgroundColor: COLORS.surface, borderRadius: 5, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 5 },
  progressFillReady: { backgroundColor: COLORS.gold },
  progressText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textAlign: 'right' },
  progressTextReady: { color: COLORS.goldDark, fontWeight: '800' },

  claimBtn: { borderRadius: 14, overflow: 'hidden' },
  claimGradient: { paddingVertical: 14, alignItems: 'center' },
  claimBtnText: { fontSize: 15, fontWeight: '900', color: COLORS.white },

  emptyBox: { alignItems: 'center', padding: 40, gap: 8 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  emptyDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  tipBox: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginTop: 8,
  },
  tipTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginBottom: 6 },
  tipText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
});
