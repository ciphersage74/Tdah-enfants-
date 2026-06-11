import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { SHOP_ITEMS } from '../constants/shopData';
import { useAppStore } from '../store/useAppStore';
import { useActiveProfile } from '../hooks/useActiveProfile';
import HeroAvatar from '../components/HeroAvatar';
import CoinBadge from '../components/CoinBadge';

export default function ShopScreen({ navigation }) {
  const { buyShopItem, toggleEquipItem } = useAppStore();
  const profile = useActiveProfile();

  if (!profile) return null;

  const unlocked = new Set(profile.unlockedItems || []);
  const equipped = new Set(profile.equippedItems || []);

  const handleBuy = (item) => {
    if (profile.coins < item.price) {
      Alert.alert('Pas assez de pièces', `Il te faut ${item.price} pièces. Tu en as ${profile.coins}.`);
      return;
    }
    Alert.alert(
      `Acheter ${item.label} ?`,
      `Coût : ${item.price} 🪙`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Acheter',
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

  const available = SHOP_ITEMS.filter((i) => profile.level >= i.requiredLevel);
  const locked = SHOP_ITEMS.filter((i) => profile.level < i.requiredLevel);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Boutique</Text>
        <CoinBadge amount={profile.coins} />
      </View>

      {/* Avatar preview */}
      <View style={styles.preview}>
        <HeroAvatar avatarId={profile.avatarId} size={80} equippedItems={profile.equippedItems || []} />
        <Text style={styles.previewLabel}>{profile.childName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Disponible</Text>
        <View style={styles.grid}>
          {available.map((item) => {
            const isOwned = unlocked.has(item.id);
            const isEquipped = equipped.has(item.id);
            return (
              <View key={item.id} style={[styles.itemCard, isEquipped && styles.itemCardEquipped]}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemName}>{item.label}</Text>
                {!isOwned ? (
                  <TouchableOpacity
                    style={[styles.buyBtn, profile.coins < item.price && styles.buyBtnDisabled]}
                    onPress={() => handleBuy(item)}
                  >
                    <Text style={styles.buyBtnText}>🪙 {item.price}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.equipBtn, isEquipped && styles.unequipBtn]}
                    onPress={() => handleEquip(item)}
                  >
                    <Text style={styles.equipBtnText}>{isEquipped ? 'Retirer' : 'Équiper'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {locked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🔒 Débloque en montant de niveau</Text>
            <View style={styles.grid}>
              {locked.map((item) => (
                <View key={item.id} style={[styles.itemCard, styles.itemCardLocked]}>
                  <Text style={[styles.itemEmoji, { opacity: 0.3 }]}>{item.emoji}</Text>
                  <Text style={[styles.itemName, { color: COLORS.textMuted }]}>{item.label}</Text>
                  <Text style={styles.lockLabel}>Niv. {item.requiredLevel}</Text>
                </View>
              ))}
            </View>
          </>
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
  preview: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  content: { paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  itemCard: {
    width: '30.5%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
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
  },
  itemCardEquipped: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  itemCardLocked: { backgroundColor: COLORS.background, shadowOpacity: 0 },
  itemEmoji: { fontSize: 28 },
  itemName: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buyBtnDisabled: { backgroundColor: COLORS.border },
  buyBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  equipBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  unequipBtn: { backgroundColor: COLORS.textMuted },
  equipBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  lockLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
});
