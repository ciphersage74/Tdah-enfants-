# FocusHéros — Guide de déploiement Play Store

## Prérequis
- Node.js 18+
- Expo CLI : `npm install -g expo-cli eas-cli`
- Compte Expo : https://expo.dev (gratuit)
- Compte Google Play Developer : 25 € une seule fois

## 1. Installation locale

```bash
npm install
expo start          # tester sur téléphone via Expo Go
expo start --android  # tester sur émulateur Android
```

## 2. Créer les assets visuels (assets/)

Voir `assets/README.md` — 4 fichiers PNG à créer.

## 3. Configurer EAS Build

```bash
eas login           # se connecter à expo.dev
eas build:configure # génère eas.json (déjà présent)
```

Dans `app.json`, remplace `REPLACE_WITH_YOUR_EAS_PROJECT_ID`
par l'ID de ton projet Expo.

## 4. Build Android (.aab pour Play Store)

```bash
eas build --platform android --profile production
```
Le build se fait dans le cloud (~10 min). Tu reçois un lien pour télécharger le `.aab`.

## 5. Publier sur Google Play

1. Crée ton app sur https://play.google.com/console
2. Remplis la fiche : titre "FocusHéros", catégorie "Éducation"
3. Upload le `.aab` dans "Production" ou "Test interne" d'abord
4. Remplis politique de confidentialité (obligatoire pour les apps enfants)
5. Déclaration COPPA : cibler "Parents" (pas directement les enfants)

## 6. Politique de confidentialité

Obligatoire. Génère-en une sur https://privacypolicygenerator.info
L'app ne collecte aucune donnée (tout est local) — c'est ton argument fort.

## 7. Intégration IAP réelle (RevenueCat)

Remplace le mock dans `PaywallScreen.js` :

```bash
npm install react-native-purchases
```

Dans `PaywallScreen.js`, remplace `handleSubscribe` :
```js
import Purchases from 'react-native-purchases';
// await Purchases.configure({ apiKey: 'YOUR_REVENUECAT_KEY' });
// const offerings = await Purchases.getOfferings();
// await Purchases.purchasePackage(offerings.current.monthly);
```

RevenueCat gère tout : Google Play Billing, renouvellements, restauration.
Gratuit jusqu'à 2 500 $/mois de revenus.

## Tarification recommandée

- Gratuit : Routine du matin (acquisition)
- Premium mensuel : 9,99 €/mois
- Premium annuel : 49,99 €/an (mettre en avant — meilleure marge)
- Essai gratuit : 7 jours (améliore la conversion de 40%)
