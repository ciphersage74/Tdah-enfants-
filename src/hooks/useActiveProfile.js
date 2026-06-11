import { useAppStore } from '../store/useAppStore';

// Returns a flat profile object from the store (single-profile architecture)
export const useActiveProfile = () =>
  useAppStore((s) => ({
    childName: s.childName,
    childAge: s.childAge,
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
  }));
