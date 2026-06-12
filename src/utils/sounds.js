import { Audio } from 'expo-av';
import { useAppStore } from '../store/useAppStore';

// Sons courts synthétisés (assets locaux, aucun téléchargement).
// Tout est best-effort : un échec audio ne doit JAMAIS faire planter l'app.
const sounds = {};
let loadPromise = null;

export const loadSounds = () => {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      const [ding, fanfare] = await Promise.all([
        Audio.Sound.createAsync(require('../../assets/sounds/ding.wav'), { volume: 0.7 }),
        Audio.Sound.createAsync(require('../../assets/sounds/fanfare.wav'), { volume: 0.85 }),
      ]);
      sounds.ding = ding.sound;
      sounds.fanfare = fanfare.sound;
    } catch (_) {
      // Audio indisponible (permissions, hardware…) → app silencieuse mais fonctionnelle
    }
  })();
  return loadPromise;
};

const play = async (key) => {
  try {
    // Réglable par le parent (Mode Parent → Notifs) ; undefined = activé
    if (useAppStore.getState().soundsEnabled === false) return;
    await loadSounds();
    await sounds[key]?.replayAsync();
  } catch (_) {}
};

export const playDing = () => play('ding');
export const playFanfare = () => play('fanfare');
