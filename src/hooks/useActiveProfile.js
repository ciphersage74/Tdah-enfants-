import { useAppStore } from '../store/useAppStore';
import { shallow } from 'zustand/shallow';

// Shallow equality évite un re-render sur chaque mutation du store
// sans rapport avec le profil (ex. isParentMode, notifMorningEnabled…)
export const useActiveProfile = () =>
  useAppStore(
    (s) => ({
      childName: s.childName,
      childAge: s.childAge,
      gender: s.gender,
      avatarId: s.avatarId,
      coins: s.coins,
      xp: s.xp,
      level: s.level,
      streak: s.streak,
      totalTasksDone: s.totalTasksDone,
      totalRoutinesDone: s.totalRoutinesDone,
      totalCoinsEarned: s.totalCoinsEarned,
      unlockedItems: s.unlockedItems,
      equippedItems: s.equippedItems,
      badges: s.badges,
      customTasks: s.customTasks,
      history: s.history,
      rewards: s.rewards,
    }),
    shallow,
  );
