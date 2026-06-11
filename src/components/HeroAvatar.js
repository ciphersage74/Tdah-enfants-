import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { AVATAR_THEMES } from '../constants/colors';
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

export default function HeroAvatar({ avatarId = 'superhero', size = 80, showBorder = true, equippedItems = [] }) {
  const theme = AVATAR_THEMES[avatarId] || AVATAR_THEMES.hero || AVATAR_THEMES.superhero;
  const borderWidth = showBorder ? Math.max(2, size * 0.04) : 0;

  const topItem  = equippedItems.map(getShopItemById).find((i) => i?.position === 'top');
  const rightItem = equippedItems.map(getShopItemById).find((i) => i?.position === 'right' || i?.position === 'back');
  const faceItem = equippedItems.map(getShopItemById).find((i) => i?.position === 'face');

  const imgSource = AVATAR_IMAGES[avatarId];

  return (
    <View style={[styles.wrapper, { width: size * 1.7, height: size * 1.6 }]}>
      {/* Hat sits ON the head — overlaps image top */}
      {topItem && (
        <Text style={[styles.hat, { fontSize: size * 0.45, top: 0 }]}>
          {topItem.emoji}
        </Text>
      )}

      {/* Avatar image or emoji fallback */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: theme.color,
            backgroundColor: theme.bg,
            marginTop: topItem ? size * 0.2 : size * 0.25,
            overflow: 'hidden',
          },
        ]}
      >
        {imgSource ? (
          <Image
            source={imgSource}
            style={{ width: size, height: size }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ fontSize: size * 0.48 }}>{theme.emoji}</Text>
        )}

        {/* Face overlay (glasses, mask...) */}
        {faceItem && (
          <Text style={[styles.faceOverlay, { fontSize: size * 0.32 }]}>
            {faceItem.emoji}
          </Text>
        )}
      </View>

      {/* Right item (weapon, companion...) */}
      {rightItem && (
        <Text style={[styles.rightItem, { fontSize: size * 0.42, right: 0, bottom: size * 0.1 }]}>
          {rightItem.emoji}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hat: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 3,
  },
  rightItem: {
    position: 'absolute',
    zIndex: 2,
  },
  faceOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});
