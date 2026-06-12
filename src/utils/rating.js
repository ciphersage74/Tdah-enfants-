import * as StoreReview from 'expo-store-review';

// On propose la note après la 7e, 30e puis 100e routine accomplie :
// l'utilisateur est engagé et vient de vivre un moment positif.
// Android limite lui-même la fréquence d'affichage réelle de la popup.
const THRESHOLDS = [7, 30, 100];

export const maybeAskForRating = async (totalRoutinesDone, ratingPromptCount, recordRatingPrompt) => {
  const nextThreshold = THRESHOLDS[ratingPromptCount];
  if (!nextThreshold || totalRoutinesDone < nextThreshold) return;
  try {
    if (await StoreReview.hasAction()) {
      recordRatingPrompt();
      await StoreReview.requestReview();
    }
  } catch (_) {}
};
