import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AVATAR_THEMES } from '../constants/colors';

export default function HeroAvatar({ avatarId = 'hero', size = 80, showBorder = true }) {
  const theme = AVATAR_THEMES[avatarId] || AVATAR_THEMES.hero;
  const fontSize = size * 0.5;
  const borderWidth = showBorder ? size * 0.05 : 0;

  return (
    <View
      style={[
        styles.container,
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
      <Text style={{ fontSize }}>{theme.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
