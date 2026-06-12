import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { SHOP_CATEGORIES, SHOP_ITEMS, getItemsByCategory } from '../constants/shopData';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';
import HeroAvatar from '../components/HeroAvatar';

export default function ShopScreen({ navigation }) {
  const { buyShopItem, toggleEquipItem } = useAppStore();
  const profile = useActiveProfile();
  const [activeCat, setActiveCat] = useState('hats');

  if (!profile) return null;

  const unlocked = new Set(profile.unlockedItems || []);
  const equipped = new Set(profile.equippedItems || []);
  const items = getItemsByCategory(activeCat);
  const available = items.filter((i) => profile.level >= i.requiredLevel);
  const locked = items.filter((i) => profile.level < i.requiredLevel);

  const totalOwned = (profile.unlockedItems || []).length;
  const totalItems = SHOP_ITEMS.length;

  const handleBuy = (item) => {
    if (profile.coins < item.price) {
      Alert.alert(
        'Pas assez de pièces 🪙',
        `Il te faut ${item.price} pièces.\nTu en as ${profile.coins}.\nIl en manque ${item.price - profile.coins}.`
      );
      return;
    }
    Alert.alert(
      `${item.emoji}  Acheter "${item.label}" ?`,
      `Coût : ${item.price} 🪙\nSolde après : ${profile.coins - item.price} 🪙`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: `Acheter pour ${item.price} 🪙`,
          onPress: () => {
            const ok = buyShopItem(item.id, item.price);
            if (ok) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleEquip = (item) => {
    Haptics.selectionAsync();
    toggleEquipItem(item.id);
  };

  const renderItem = (item) => {
    const isOwned = unlocked.has(item.id);
    const isEquipped = equipped.has(item.id);
    const canBuy = profile.coins >= item.price;

    return (
      <View key={item.id} style={[styles.itemCard, isEquipped && styles.itemCardEquipped]}>
        {isEquipped && <View style={styles.equippedDot} />}
        <Text style={styles.itemEmoji}>{item.emoji}</Text>
        <Text style={styles.itemName} numberOfLines={2}>{item.label}</Text>

        {!isOwned ? (
          <TouchableOpacity
            style={[styles.buyBtn, !canBuy && styles.buyBtnCant]}
            onPress={() => handleBuy(item)}
          >
            <Text style={[styles.buyBtnText, !canBuy && styles.buyBtnTextCant]}>
              {item.price} 🪙
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.equipBtn, isEquipped && styles.unequipBtn]}
            onPress={() => handleEquip(item)}
          >
            <Text style={styles.equipBtnText}>{isEquipped ? '✓ Équipé' : 'Équiper'}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Boutique</Text>
        <View style={styles.coinPill}>
          <Text style={styles.coinText}>🪙 {profile.coins}</Text>
        </View>
      </View>

      {/* Avatar preview */}
      <View style={styles.previewCard}>
        <HeroAvatar avatarId={profile.avatarId} size={88} equippedItems={profile.equippedItems} />
        <View style={styles.previewInfo}>
          <Text style={styles.previewName}>{profile.childName}</Text>
          <Text style={styles.previewLevel}>Niveau {profile.level}</Text>
          <View style={styles.collectionPill}>
            <Text style={styles.collectionText}>{totalOwned}/{totalItems} accessoires</Text>
          </View>
        </View>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {SHOP_CATEGORIES.map((cat) => {
          const count = getItemsByCategory(cat.id).filter((i) => unlocked.has(i.id)).length;
          const total = getItemsByCategory(cat.id).length;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catTab, activeCat === cat.id && styles.catTabActive]}
              onPress={() => setActiveCat(cat.id)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, activeCat === cat.id && styles.catLabelActive]}>
                {cat.label}
              </Text>
              <Text style={[styles.catCount, activeCat === cat.id && styles.catCountActive]}>
                {count}/{total}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {available.length > 0 && (
          <View style={styles.grid}>
            {available.map(renderItem)}
          </View>
        )}

        {locked.length > 0 && (
          <>
            <View style={styles.lockedHeader}>
              <View style={styles.lockedLine} />
              <Text style={styles.lockedTitle}>🔒 Débloque en montant de niveau</Text>
              <View style={styles.lockedLine} />
            </View>
            <View style={styles.grid}>
              {locked.map((item) => (
                <View key={item.id} style={[styles.itemCard, styles.itemCardLocked]}>
                  <Text style={[styles.itemEmoji, { opacity: 0.2 }]}>{item.emoji}</Text>
                  <Text style={[styles.itemName, { color: COLORS.textMuted }]} numberOfLines={2}>
                    {item.label}
                  </Text>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelPillText}>Niv. {item.requiredLevel}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backText: { fontSize: 18, color: COLORS.textPrimary, fontWeight: '700' },
  title: { flex: 1, fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  coinPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  coinText: { fontSize: 15, fontWeight: '800', color: '#B45309' },

  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewInfo: { flex: 1, gap: 4 },
  previewName: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
  previewLevel: { fontSize: 13, color: COLORS.textSecondary },
  collectionPill: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  collectionText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  catScroll: { flexGrow: 0, marginBottom: 4 },
  catContent: { paddingHorizontal: 16, gap: 8 },
  catTab: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 80,
  },
  catTabActive: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  catEmoji: { fontSize: 20 },
  catLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, marginTop: 2 },
  catLabelActive: { color: COLORS.primary },
  catCount: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  catCountActive: { color: COLORS.primaryLight },

  content: { paddingHorizontal: 16, paddingTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },

  itemCard: {
    width: '30.5%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  itemCardEquipped: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  itemCardLocked: { backgroundColor: COLORS.background, shadowOpacity: 0 },
  equippedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  itemEmoji: { fontSize: 30 },
  itemName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 15,
  },

  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  buyBtnCant: { backgroundColor: COLORS.border },
  buyBtnText: { fontSize: 11, fontWeight: '800', color: COLORS.white },
  buyBtnTextCant: { color: COLORS.textMuted },

  equipBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  unequipBtn: { backgroundColor: COLORS.primaryLight },
  equipBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.white },

  lockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  lockedLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  lockedTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },

  levelPill: {
    backgroundColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  levelPillText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },
});
