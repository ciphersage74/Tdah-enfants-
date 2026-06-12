import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AVATAR_THEMES, AVATAR_ANCHORS } from '../constants/colors';
import { getShopItemById } from '../constants/shopData';

const AVATAR_IMAGES = {
  princess:  require('../../assets/avatars/princess.png'),
  fairy:     require('../../assets/avatars/fairy.png'),
  mermaid:   require('../../assets/avatars/mermaid.png'),
  witch:     require('../../assets/avatars/witch.png'),
  superhero: require('../../assets/avatars/superhero.png'),
  dragon:    require('../../assets/avatars/dragon.png'),
  ninja:     require('../../assets/avatars/ninja.png'),
  astronaut: require('../../assets/avatars/astronaut.png'),
  // Legacy avatar ids from v1/v2 migrations
  hero:      require('../../assets/avatars/superhero.png'),
  wizard:    require('../../assets/avatars/witch.png'),
  fox:       require('../../assets/avatars/ninja.png'),
};

// Layers 512×512 transparents, déjà positionnés sur le canevas.
// Items sans image (emoji fallback) : graduation, galaxy.
const ITEM_IMAGES = {
  // ── Chapeaux ─────────────────────────────────────────
  party:      require('../../assets/items/hat_party.png'),
  cowboy:     require('../../assets/items/hat_cowboy.png'),
  tophat:     require('../../assets/items/hat_tophat.png'),
  crown:      require('../../assets/items/hat_crown.png'),
  // graduation: pas encore d'image → emoji fallback
  helm:       require('../../assets/items/hat_helm.png'),
  witch:      require('../../assets/items/hat_witch.png'),
  tiara:      require('../../assets/items/hat_tiara.png'),
  santahat:   require('../../assets/items/hat_santa.png'),
  // ── Armes ────────────────────────────────────────────
  wand:       require('../../assets/items/weapon_wand.png'),
  shield:     require('../../assets/items/weapon_shield.png'),
  sword:      require('../../assets/items/weapon_sword.png'),
  bow:        require('../../assets/items/weapon_bow.png'),
  axe:        require('../../assets/items/weapon_axe.png'),
  trident:    require('../../assets/items/weapon_trident.png'),
  lightsaber: require('../../assets/items/weapon_lightsaber.png'),
  // ── Magie (affichée derrière le personnage) ──────────
  sparkles:   require('../../assets/items/magic_sparkles.png'),
  lightning:  require('../../assets/items/magic_lightning.png'),
  fire:       require('../../assets/items/magic_fire.png'),
  moon:       require('../../assets/items/magic_moon.png'),
  comet:      require('../../assets/items/magic_comet.png'),
  rainbow:    require('../../assets/items/magic_rainbow.png'),
  star_gold:  require('../../assets/items/magic_star_gold.png'),
  gem:        require('../../assets/items/magic_gem.png'),
  // galaxy: image avec damier incrusté → emoji fallback en attendant un ré-export
  // ── Compagnons ───────────────────────────────────────
  cat:        require('../../assets/items/companion_cat.png'),
  rabbit:     require('../../assets/items/companion_rabbit.png'),
  butterfly:  require('../../assets/items/companion_butterfly.png'),
  fox_friend: require('../../assets/items/companion_fox.png'),
  owl:        require('../../assets/items/companion_owl.png'),
  eagle:      require('../../assets/items/companion_eagle.png'),
  wolf:       require('../../assets/items/companion_wolf.png'),
  phoenix:    require('../../assets/items/companion_phoenix.png'),
  dragon:     require('../../assets/items/companion_dragon_item.png'),
  unicorn:    require('../../assets/items/companion_unicorn.png'),
};

const ZERO_ANCHORS = {
  hatOffsetX: 0, hatOffsetY: 0,
  weaponOffsetX: 0, weaponOffsetY: 0,
  companionOffsetX: 0, companionOffsetY: 0,
};

export default function HeroAvatar({ avatarId = 'superhero', size = 80, showBorder = true, equippedItems = [] }) {
  const theme   = AVATAR_THEMES[avatarId] || AVATAR_THEMES.superhero;
  const anchors = AVATAR_ANCHORS[avatarId] || ZERO_ANCHORS;
  // Layers et anchors sont définis sur un canevas 512×512.
  const scale   = size / 512;

  const findByCategory = (cat) =>
    equippedItems.map(getShopItemById).find((i) => i?.category === cat);

  const hatItem       = findByCategory('hats');
  const weaponItem    = findByCategory('weapons');
  const magicItem     = findByCategory('magic');
  const companionItem = findByCategory('companions');

  const borderWidth = showBorder ? Math.max(2, size * 0.04) : 0;
  const baseImage = AVATAR_IMAGES[avatarId];

  return (
    <View style={{ width: size, height: size }}>
      {/* Cercle : magie (derrière) + personnage, coupés au cercle */}
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.circle,
          {
            borderRadius: size / 2,
            borderWidth,
            borderColor: theme.color,
            backgroundColor: theme.bg,
          },
        ]}
      >
        {magicItem && ITEM_IMAGES[magicItem.id] && (
          <Image
            source={ITEM_IMAGES[magicItem.id]}
            style={[StyleSheet.absoluteFill, { width: size, height: size, opacity: 0.95 }]}
            resizeMode="contain"
          />
        )}
        {baseImage ? (
          <Image source={baseImage} style={{ width: size, height: size }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: size * 0.5 }}>{theme.emoji}</Text>
        )}
      </View>

      {/* Chapeau / arme / compagnon : non coupés, peuvent dépasser du cercle */}
      {hatItem && ITEM_IMAGES[hatItem.id] && (
        <Image
          source={ITEM_IMAGES[hatItem.id]}
          style={[styles.itemLayer, {
            width: size,
            height: size,
            left: anchors.hatOffsetX * scale,
            top: anchors.hatOffsetY * scale,
          }]}
          resizeMode="contain"
        />
      )}
      {weaponItem && ITEM_IMAGES[weaponItem.id] && (
        <Image
          source={ITEM_IMAGES[weaponItem.id]}
          style={[styles.itemLayer, {
            width: size,
            height: size,
            left: anchors.weaponOffsetX * scale,
            top: anchors.weaponOffsetY * scale,
          }]}
          resizeMode="contain"
        />
      )}
      {companionItem && ITEM_IMAGES[companionItem.id] && (
        <Image
          source={ITEM_IMAGES[companionItem.id]}
          style={[styles.itemLayer, {
            width: size,
            height: size,
            left: anchors.companionOffsetX * scale,
            top: anchors.companionOffsetY * scale,
          }]}
          resizeMode="contain"
        />
      )}

      {/* Emoji fallback pour les items sans image (graduation, galaxy) */}
      {!ITEM_IMAGES[hatItem?.id] && hatItem && (
        <Text style={[styles.itemEmoji, { fontSize: size * 0.34, top: -size * 0.14, alignSelf: 'center' }]}>
          {hatItem.emoji}
        </Text>
      )}
      {!ITEM_IMAGES[magicItem?.id] && magicItem && (
        <Text style={[styles.itemEmoji, { fontSize: size * 0.26, top: -size * 0.04, left: -size * 0.06 }]}>
          {magicItem.emoji}
        </Text>
      )}
      {!ITEM_IMAGES[weaponItem?.id] && weaponItem && (
        <Text style={[styles.itemEmoji, { fontSize: size * 0.3, bottom: -size * 0.02, right: -size * 0.08 }]}>
          {weaponItem.emoji}
        </Text>
      )}
      {!ITEM_IMAGES[companionItem?.id] && companionItem && (
        <Text style={[styles.itemEmoji, { fontSize: size * 0.28, bottom: -size * 0.04, left: -size * 0.08 }]}>
          {companionItem.emoji}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLayer: {
    position: 'absolute',
    zIndex: 2,
  },
  itemEmoji: {
    position: 'absolute',
    zIndex: 3,
  },
});
