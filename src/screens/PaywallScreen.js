import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/colors';
import { PREMIUM_FEATURES } from '../constants/routineData';
import { useAppStore } from '../store/useAppStore';

const PLANS = [
  { id: 'monthly', label: 'Mensuel', price: '9,99 €', period: '/mois', total: null, badge: null },
  { id: 'annual',  label: 'Annuel',  price: '49,99 €', period: '/an',  total: '= 4,16 €/mois', badge: '-58%' },
];

export default function PaywallScreen({ navigation }) {
  const { unlockPremium } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    /*
     * IAP Integration point — wire react-native-purchases (RevenueCat) here:
     * const offerings = await Purchases.getOfferings();
     * await Purchases.purchasePackage(selectedPackage);
     * unlockPremium() only after successful purchase confirmation.
     */
    Alert.alert(
      '🚀 Bientôt disponible',
      'Le paiement sécurisé sera activé lors du lancement sur le Play Store.',
      [{ text: 'OK' }]
    );
  };

  const handleDevUnlock = () => {
    unlockPremium();
    Alert.alert('🔧 Mode dev', 'Premium débloqué pour les tests.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleRestore = () => {
    Alert.alert('Restaurer les achats', 'Aucun achat précédent trouvé.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <LinearGradient colors={GRADIENTS.premium} style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>FocusHéros Premium</Text>
          <Text style={styles.heroSub}>Transforme chaque journée en aventure complète</Text>
        </LinearGradient>

        {/* Features */}
        <View style={styles.featuresBox}>
          {PREMIUM_FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={{ fontSize: 20 }}>{f.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Comment fonctionne l'essai — la transparence augmente la conversion */}
        <View style={styles.timelineBox}>
          <Text style={styles.timelineTitle}>Comment fonctionne l'essai gratuit</Text>
          {[
            { emoji: '🔓', day: "Aujourd'hui", desc: 'Tout est débloqué immédiatement. Profitez de chaque fonctionnalité.' },
            { emoji: '🔔', day: 'Jour 5', desc: "Rappel par notification avant la fin de l'essai. Aucune surprise." },
            { emoji: '⭐', day: 'Jour 7', desc: "L'abonnement démarre. Annulable à tout moment avant, sans frais." },
          ].map((s, i, arr) => (
            <View key={i} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot}><Text style={{ fontSize: 16 }}>{s.emoji}</Text></View>
                {i < arr.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={{ flex: 1, paddingBottom: i < arr.length - 1 ? 14 : 0 }}>
                <Text style={styles.timelineDay}>{s.day}</Text>
                <Text style={styles.timelineDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={styles.plansRow}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, selectedPlan === plan.id && styles.planCardSelected]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.badge && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}
              <Text style={[styles.planLabel, selectedPlan === plan.id && styles.planLabelSelected]}>
                {plan.label}
              </Text>
              <Text style={[styles.planPrice, selectedPlan === plan.id && styles.planPriceSelected]}>
                {plan.price}
              </Text>
              <Text style={[styles.planPeriod, selectedPlan === plan.id && styles.planPeriodSelected]}>
                {plan.period}
              </Text>
              {plan.total && (
                <Text style={[styles.planTotal, selectedPlan === plan.id && styles.planTotalSelected]}>
                  {plan.total}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaBtn} onPress={handleSubscribe}>
          <LinearGradient colors={GRADIENTS.premium} style={styles.ctaGradient}>
            <Text style={styles.ctaText}>🚀 Commencer mes 7 jours gratuits</Text>
            <Text style={styles.ctaSubText}>
              puis {selectedPlan === 'annual' ? '49,99 €/an' : '9,99 €/mois'} · sans engagement
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Réassurance — lever les freins à l'achat */}
        <View style={styles.trustRow}>
          {[
            { emoji: '🔒', label: 'Paiement sécurisé\nGoogle Play' },
            { emoji: '🔔', label: 'Rappel avant\nla fin de l\'essai' },
            { emoji: '✕', label: 'Annulation\nen 2 clics' },
          ].map((t, i) => (
            <View key={i} style={styles.trustItem}>
              <Text style={{ fontSize: 18 }}>{t.emoji}</Text>
              <Text style={styles.trustLabel}>{t.label}</Text>
            </View>
          ))}
        </View>

        {/* La gratuité du cœur de l'app rassure : pas de blocage, pas de désinstallation */}
        <View style={styles.freeForeverBox}>
          <Text style={styles.freeForeverText}>
            ☀️ La routine du matin, les badges et la boutique restent{' '}
            <Text style={{ fontWeight: '900' }}>100% gratuits pour toujours</Text>.
            Premium ajoute la routine du soir, les rapports PDF et la personnalisation complète.
          </Text>
        </View>

        {/* Comment résilier — la transparence évite les avis 1 étoile */}
        <TouchableOpacity
          style={styles.cancelInfoBox}
          onPress={() => Linking.openURL('https://play.google.com/store/account/subscriptions').catch(() => {})}
        >
          <Text style={styles.cancelInfoTitle}>Comment résilier ?</Text>
          <Text style={styles.cancelInfoText}>
            Google Play → Profil → Paiements et abonnements → Abonnements → FocusHéros → Résilier.
            Effet à la fin de la période en cours, aucun frais caché. Toucher ici pour ouvrir la page.
          </Text>
        </TouchableOpacity>

        {/* Visible uniquement en build de développement — absent du build production */}
        {__DEV__ && (
          <TouchableOpacity onPress={handleDevUnlock} style={styles.devBtn}>
            <Text style={styles.devBtnText}>🔧 Débloquer (mode test développeur)</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.legalText}>
          Résiliable à tout moment depuis Google Play. Après l'essai gratuit de 7 jours,{' '}
          {selectedPlan === 'annual' ? '49,99 €/an' : '9,99 €/mois'}.
          Conforme RGPD — aucune donnée de votre enfant ne quitte le téléphone.
        </Text>

        <TouchableOpacity onPress={handleRestore} style={{ alignItems: 'center', padding: 16 }}>
          <Text style={styles.restoreText}>Restaurer mes achats</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
  scroll: { paddingBottom: 40 },
  hero: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresBox: {
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  featureDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  plansRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: COLORS.premium,
    backgroundColor: '#FFF7ED',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  planBadgeText: { fontSize: 11, fontWeight: '900', color: COLORS.white },
  planLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  planLabelSelected: { color: COLORS.premium },
  planPrice: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  planPriceSelected: { color: COLORS.premium },
  planPeriod: { fontSize: 13, color: COLORS.textSecondary },
  planPeriodSelected: { color: COLORS.premium },
  planTotal: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  planTotalSelected: { color: COLORS.success, fontWeight: '700' },
  ctaBtn: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.premium,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnLoading: { opacity: 0.7 },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { fontSize: 16, fontWeight: '900', color: COLORS.white },
  ctaSubText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  timelineBox: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.white,
    borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  timelineTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 36 },
  timelineDot: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginVertical: 2 },
  timelineDay: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  timelineDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginTop: 1 },
  trustRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 14, gap: 8 },
  trustItem: { flex: 1, alignItems: 'center', gap: 4 },
  trustLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '600', lineHeight: 13 },
  freeForeverBox: {
    marginHorizontal: 16, marginTop: 14, backgroundColor: '#ECFDF5',
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#A7F3D0',
  },
  freeForeverText: { fontSize: 12, color: '#065F46', lineHeight: 18 },
  cancelInfoBox: {
    marginHorizontal: 16, marginTop: 10, backgroundColor: COLORS.white,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelInfoTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  cancelInfoText: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },
  legalText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 24,
    lineHeight: 16,
  },
  restoreText: { fontSize: 13, color: COLORS.textSecondary, textDecorationLine: 'underline' },
  devBtn: { alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  devBtnText: { fontSize: 11, color: COLORS.textMuted },
});
