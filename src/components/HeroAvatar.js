import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AVATAR_THEMES } from '../constants/colors';
import { getShopItemById } from '../constants/shopData';

export default function HeroAvatar({ avatarId = 'hero', size = 80, showBorder = true, equippedItems = [] }) {
  const theme = AVATAR_THEMES[avatarId] || AVATAR_THEMES.hero;
  const borderWidth = showBorder ? Math.max(2, size * 0.04) : 0;

  const topItem = equippedItems.map(getShopItemById).find((i) => i?.position === 'top');
  const rightItem = equippedItems.map(getShopItemById).find((i) => i?.position === 'right' || i?.position === 'back');
  const faceItem = equippedItems.map(getShopItemById).find((i) => i?.position === 'face');

  return (
    <View style={[styles.wrapper, { width: size * 1.4, height: size * 1.4 }]}>
      {topItem && (
        <Text style={[styles.overlayTop, { fontSize: size * 0.35, top: 0 }]}>{topItem.emoji}</Text>
      )}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.bg,
            borderWidth,
            borderColor: theme.color,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.48 }}>{theme.emoji}</Text>
        {faceItem && (
          <Text style={[styles.faceOverlay, { fontSize: size * 0.28 }]}>{faceItem.emoji}</Text>
        )}
      </View>
      {rightItem && (
        <Text style={[styles.overlayRight, { fontSize: size * 0.32, right: 0, bottom: size * 0.1 }]}>
          {rightItem.emoji}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 2,
  },
  overlayRight: {
    position: 'absolute',
    zIndex: 2,
  },
  faceOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
});
