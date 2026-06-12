import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Bandeau "temps élastique" : visible uniquement si le parent a configuré
// une heure de fin pour la routine. Ton toujours doux — jamais alarmant
// (l'urgence anxiogène est contre-productive pour les enfants TDAH).
export default function ElasticBanner({ endDate, remainingTaskSeconds, endLabel }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!endDate) return null;

  const secondsLeft = Math.max(0, Math.round((endDate - now) / 1000));
  const banked = secondsLeft - remainingTaskSeconds;
  const fmtMin = (s) => Math.max(1, Math.round(s / 60));

  let emoji, text, tint;
  if (secondsLeft === 0) {
    emoji = '🌈';
    text = 'Continue à ton rythme, tu y es presque !';
    tint = styles.tintNeutral;
  } else if (banked >= 60) {
    emoji = '🏦';
    text = `Temps d'avance : ${fmtMin(banked)} min · fin prévue ${endLabel}`;
    tint = styles.tintAhead;
  } else if (banked >= 0) {
    emoji = '🎯';
    text = `Pile dans les temps · fin prévue ${endLabel}`;
    tint = styles.tintNeutral;
  } else {
    emoji = '💨';
    text = `On accélère un peu, héros ! Fin prévue ${endLabel}`;
    tint = styles.tintBehind;
  }

  return (
    <View style={[styles.banner, tint]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tintAhead: { backgroundColor: 'rgba(16,185,129,0.35)' },
  tintNeutral: { backgroundColor: 'rgba(255,255,255,0.18)' },
  tintBehind: { backgroundColor: 'rgba(251,191,36,0.35)' },
  emoji: { fontSize: 16 },
  text: { flex: 1, fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
