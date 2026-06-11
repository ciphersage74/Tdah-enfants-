import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
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
};

// Uncomment each line as you add the image file in assets/items/.
// All files must be 400×400 transparent PNG matching the character template.
const ITEM_IMAGES = {
  // ── Chapeaux ─────────────────────────────────────────
  // party:      require('../../assets/items/hat_party.png'),
  // cowboy:     require('../../assets/items/hat_cowboy.png'),
  // tophat:     require('../../assets/items/hat_tophat.png'),
  // crown:      require('../../assets/items/hat_crown.png'),
  // graduation: require('../../assets/items/hat_graduation.png'),
  // helm:       require('../../assets/items/hat_helm.png'),
  // witch_hat:  require('../../assets/items/hat_witch.png'),
  // tiara:      require('../../assets/items/hat_tiara.png'),
  // santahat:   require('../../assets/items/hat_santa.png'),
  // ── Armes ────────────────────────────────────────────
  // wand:       require('../../assets/items/weapon_wand.png'),
  // shield:     require('../../assets/items/weapon_shield.png'),
  // sword:      require('../../assets/items/weapon_sword.png'),
  // bow:        require('../../assets/items/weapon_bow.png'),
  // axe:        require('../../assets/items/weapon_axe.png'),
  // trident:    require('../../assets/items/weapon_trident.png'),
  // lightsaber: require('../../assets/items/weapon_lightsaber.png'),
  // ── Magie ────────────────────────────────────────────
  // sparkles:   require('../../assets/items/magic_sparkles.png'),
  // lightning:  require('../../assets/items/magic_lightning.png'),
  // fire:       require('../../assets/items/magic_fire.png'),
  // moon:       require('../../assets/items/magic_moon.png'),
  // comet:      require('../../assets/items/magic_comet.png'),
  // rainbow:    require('../../assets/items/magic_rainbow.png'),
  // star_gold:  require('../../assets/items/magic_star_gold.png'),
  // gem:        require('../../assets/items/magic_gem.png'),
  // galaxy:     require('../../assets/items/magic_galaxy.png'),
  // ── Compagnons ───────────────────────────────────────
  // cat:        require('../../assets/items/companion_cat.png'),
  // rabbit:     require('../../assets/items/companion_rabbit.png'),
  // butterfly:  require('../../assets/items/companion_butterfly.png'),
  // fox_friend: require('../../assets/items/companion_fox.png'),
  // owl:        require('../../assets/items/companion_owl.png'),
  // eagle:      require('../../assets/items/companion_eagle.png'),
  // wolf:       require('../../assets/items/companion_wolf.png'),
  // phoenix:    require('../../assets/items/companion_phoenix.png'),
  // dragon:     require('../../assets/items/companion_dragon_item.png'),
  // unicorn:    require('../../assets/items/companion_unicorn.png'),
};

export default function HeroAvatar({ avatarId = 'superhero', size = 80, showBorder = true, equippedItems = [] }) {
  const theme   = AVATAR_THEMES[avatarId] || AVATAR_THEMES.superhero;
  const anchors = AVATAR_ANCHORS[avatarId] || { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 };
  const scale   = size / 400;

  const hatItem       = equippedItems.map(getShopItemById).find((i) => i?.category === 'hats');
  const weaponItem    = equippedItems.map(getShopItemById).find((i) => i?.category === 'weapons');
  const magicItem     = equippedItems.map(getShopItemById).find((i) => i?.category === 'magic');
  const companionItem = equippedItems.map(getShopItemById).find((i) => i?.category === 'companions');

  const borderWidth = showBorder ? Math.max(2, size * 0.04) : 0;

  return (
    <View style={[
      styles.wrapper,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth,
        borderColor: theme.color,
        backgroundColor: theme.bg,
      },
    ]}>
      {/* Base character */}
      <Image
        source={AVATAR_IMAGES[avatarId]}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />

      {/* Magic aura — rendered first so it stays behind hat/weapon */}
      {magicItem && ITEM_IMAGES[magicItem.id] && (
        <Image
          source={ITEM_IMAGES[magicItem.id]}
          style={[StyleSheet.absoluteFill, { opacity: 0.92 }]}
          resizeMode="contain"
        />
      )}

      {/* Hat — hatOffsetY shifts up (−) or down (+) if head isn't at template position */}
      {hatItem && ITEM_IMAGES[hatItem.id] && (
        <Image
          source={ITEM_IMAGES[hatItem.id]}
          style={[StyleSheet.absoluteFill, { top: anchors.hatOffsetY * scale }]}
          resizeMode="contain"
        />
      )}

      {/* Weapon */}
      {weaponItem && ITEM_IMAGES[weaponItem.id] && (
        <Image
          source={ITEM_IMAGES[weaponItem.id]}
          style={[
            StyleSheet.absoluteFill,
            { left: anchors.weaponOffsetX * scale, top: anchors.weaponOffsetY * scale },
          ]}
          resizeMode="contain"
        />
      )}

      {/* Companion */}
      {companionItem && ITEM_IMAGES[companionItem.id] && (
        <Image
          source={ITEM_IMAGES[companionItem.id]}
          style={[
            StyleSheet.absoluteFill,
            { left: anchors.companionOffsetX * scale, top: anchors.companionOffsetY * scale },
          ]}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
});
