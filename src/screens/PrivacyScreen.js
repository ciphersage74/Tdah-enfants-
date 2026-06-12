import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

const SECTIONS = [
  {
    emoji: '🏠',
    title: 'Vos données restent chez vous',
    body: "FocusHéros fonctionne 100% en local sur votre appareil. Aucune donnée n'est envoyée sur Internet : pas de serveur, pas de compte, pas de connexion requise. Le prénom, l'âge, la progression et l'historique de votre enfant ne quittent jamais votre téléphone.",
  },
  {
    emoji: '🚫',
    title: 'Aucune collecte, aucun partage',
    body: "Nous ne collectons aucune donnée personnelle, aucune statistique d'utilisation, aucun identifiant publicitaire. Aucune donnée n'est vendue, partagée ou transmise à des tiers. L'application ne contient ni publicité ni traceur.",
  },
  {
    emoji: '👶',
    title: 'Conçue pour les enfants',
    body: "L'application est destinée aux enfants accompagnés de leurs parents. Conformément au RGPD et aux règles Google Play Familles, aucune information personnelle de l'enfant n'est collectée. Les achats et réglages sont protégés par un code parent.",
  },
  {
    emoji: '📄',
    title: 'Rapports PDF',
    body: "Les rapports destinés au praticien sont générés localement sur l'appareil. C'est vous qui choisissez de les partager (email, messagerie…) — l'application ne les transmet jamais d'elle-même.",
  },
  {
    emoji: '💾',
    title: 'Sauvegardes',
    body: "La fonction de sauvegarde crée un fichier que vous stockez où vous voulez (Google Drive, email…). Ce fichier reste sous votre contrôle exclusif. Supprimer l'application supprime toutes les données locales.",
  },
  {
    emoji: '🔔',
    title: 'Notifications',
    body: 'Les rappels de routines sont programmés localement sur le téléphone. Ils ne passent par aucun serveur et peuvent être désactivés à tout moment dans le Mode Parent.',
  },
  {
    emoji: '💳',
    title: 'Abonnement Premium',
    body: "Le paiement de l'abonnement est traité par Google Play. Nous n'avons jamais accès à vos informations bancaires. Vous pouvez résilier à tout moment depuis votre compte Google Play.",
  },
  {
    emoji: '✉️',
    title: 'Contact',
    body: 'Pour toute question sur la confidentialité : fievetdylan74100@gmail.com',
  },
];

export default function PrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Confidentialité</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>Fermer  ✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🛡️</Text>
          <Text style={styles.heroTitle}>Zéro donnée collectée.</Text>
          <Text style={styles.heroSub}>
            C'est simple : tout reste sur votre téléphone.
          </Text>
        </View>

        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
              <Text style={styles.cardTitle}>{s.title}</Text>
            </View>
            <Text style={styles.cardBody}>{s.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Politique de confidentialité — FocusHéros v1.0{'\n'}
          Dernière mise à jour : juin 2026
        </Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  closeText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  scroll: { paddingHorizontal: 16 },
  hero: {
    backgroundColor: '#D1FAE5', borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 12,
  },
  heroEmoji: { fontSize: 40, marginBottom: 8 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: '#065F46', marginBottom: 4 },
  heroSub: { fontSize: 14, color: '#059669', textAlign: 'center' },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, flex: 1 },
  cardBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  footer: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 16 },
});
