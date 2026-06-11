import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MORNING_TASKS, EVENING_TASKS, getLevelFromXp } from '../constants/routineData';
import { BADGES } from '../constants/badgeData';

const STORAGE_KEY = '@focusheros_v2';

const makeProfile = (childName, childAge, avatarId, id = Date.now().toString()) => ({
  id,
  childName,
  childAge,
  avatarId,
  coins: 20,
  xp: 0,
  level: 1,
  streak: 0,
  lastCompletedDate: null,
  totalTasksDone: 0,
  totalRoutinesDone: 0,
  totalCoinsEarned: 20,
  unlockedItems: [],
  equippedItems: [],
  badges: [],
  customTasks: {
    morning: MORNING_TASKS,
    evening: EVENING_TASKS,
  },
  history: {},
  rewards: [],
});

const defaultState = {
  hasOnboarded: false,
  parentPin: '1234',
  isPremium: false,
  isParentMode: false,
  notifMorningEnabled: false,
  notifEveningEnabled: false,
  notifMorningTime: '07:30',
  notifEveningTime: '18:30',
  profiles: [],
  activeProfileId: null,
};

const save = async (state) => {
  const { isParentMode, ...toSave } = state;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (_) {}
};

export const useAppStore = create((set, get) => ({
  ...defaultState,

  // ─── Bootstrap ────────────────────────────────────────────────
  loadState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);

      // Migrate v1 (flat) → v2 (profiles[])
      if (saved.childName && !saved.profiles) {
        const profile = makeProfile(saved.childName, saved.childAge || 8, saved.avatarId || 'hero', 'profile_1');
        profile.coins = saved.coins || 20;
        profile.xp = saved.xp || 0;
        profile.level = saved.level || 1;
        profile.streak = saved.streak || 0;
        profile.lastCompletedDate = saved.lastCompletedDate || null;
        profile.totalCoinsEarned = saved.totalCoinsEarned || profile.coins;
        profile.history = saved.history || {};
        profile.customTasks = saved.customTasks || profile.customTasks;
        const migrated = {
          ...defaultState,
          ...saved,
          profiles: [profile],
          activeProfileId: 'profile_1',
          hasOnboarded: true,
        };
        delete migrated.childName;
        set({ ...migrated, isParentMode: false });
        save(migrated);
        return;
      }

      set({ ...saved, isParentMode: false });
    } catch (_) {}
  },

  // ─── Profiles ─────────────────────────────────────────────────
  addProfile: (childName, childAge, avatarId) => {
    const profile = makeProfile(childName, childAge, avatarId);
    const next = {
      ...get(),
      profiles: [...get().profiles, profile],
      activeProfileId: profile.id,
      hasOnboarded: true,
    };
    set(next);
    save(next);
    return profile.id;
  },

  switchProfile: (profileId) => {
    set({ activeProfileId: profileId, isParentMode: false });
  },

  deleteProfile: (profileId) => {
    const state = get();
    if (state.profiles.length <= 1) return;
    const profiles = state.profiles.filter((p) => p.id !== profileId);
    const activeProfileId =
      state.activeProfileId === profileId ? profiles[0].id : state.activeProfileId;
    const next = { ...state, profiles, activeProfileId };
    set(next);
    save(next);
  },

  getActiveProfile: () => {
    const { profiles, activeProfileId } = get();
    return profiles.find((p) => p.id === activeProfileId) || profiles[0];
  },

  updateProfile: (profileId, partial) => {
    const state = get();
    const profiles = state.profiles.map((p) =>
      p.id === profileId ? { ...p, ...partial } : p
    );
    const next = { ...state, profiles };
    set(next);
    save(next);
  },

  // ─── Gameplay ─────────────────────────────────────────────────
  earnRewards: (coins, xp) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return {};
    const newXp = profile.xp + xp;
    const newCoins = profile.coins + coins;
    const newLevel = getLevelFromXp(newXp);
    const leveledUp = newLevel > profile.level;
    const totalCoinsEarned = (profile.totalCoinsEarned || 0) + coins;
    state.updateProfile(profile.id, { xp: newXp, coins: newCoins, level: newLevel, totalCoinsEarned });
    return { leveledUp, newLevel };
  },

  completeRoutine: (routineId) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const history = { ...profile.history };
    if (!history[today]) history[today] = {};
    history[today][routineId] = { completed: true, completedAt: new Date().toISOString() };
    const streak =
      profile.lastCompletedDate === yesterday ? profile.streak + 1
      : profile.lastCompletedDate === today ? profile.streak
      : 1;
    const totalRoutinesDone = (profile.totalRoutinesDone || 0) + 1;
    state.updateProfile(profile.id, { history, streak, lastCompletedDate: today, totalRoutinesDone });
  },

  recordTaskDone: () => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return;
    state.updateProfile(profile.id, { totalTasksDone: (profile.totalTasksDone || 0) + 1 });
  },

  isRoutineCompletedToday: (routineId) => {
    const profile = get().getActiveProfile();
    if (!profile) return false;
    const today = new Date().toISOString().split('T')[0];
    return !!profile.history?.[today]?.[routineId]?.completed;
  },

  // ─── Badges ───────────────────────────────────────────────────
  checkAndAwardBadges: () => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return [];
    const earned = new Set(profile.badges);
    const newBadges = BADGES.filter((b) => !earned.has(b.id) && b.check(profile));
    if (newBadges.length === 0) return [];
    const badges = [...profile.badges, ...newBadges.map((b) => b.id)];
    state.updateProfile(profile.id, { badges });
    return newBadges;
  },

  // ─── Shop ─────────────────────────────────────────────────────
  buyShopItem: (itemId, price) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile || profile.coins < price) return false;
    if (profile.unlockedItems.includes(itemId)) return false;
    state.updateProfile(profile.id, {
      coins: profile.coins - price,
      unlockedItems: [...profile.unlockedItems, itemId],
    });
    return true;
  },

  toggleEquipItem: (itemId) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return;
    const equipped = profile.equippedItems.includes(itemId)
      ? profile.equippedItems.filter((i) => i !== itemId)
      : [...profile.equippedItems, itemId];
    state.updateProfile(profile.id, { equippedItems: equipped });
  },

  // ─── Rewards ──────────────────────────────────────────────────
  addReward: (name, emoji, cost) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return;
    const reward = { id: Date.now().toString(), name, emoji, cost, active: true };
    state.updateProfile(profile.id, { rewards: [...(profile.rewards || []), reward] });
  },

  claimReward: (rewardId) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return false;
    const reward = (profile.rewards || []).find((r) => r.id === rewardId);
    if (!reward || profile.coins < reward.cost) return false;
    const rewards = profile.rewards.map((r) =>
      r.id === rewardId ? { ...r, claimed: true, claimedAt: new Date().toISOString() } : r
    );
    state.updateProfile(profile.id, { coins: profile.coins - reward.cost, rewards });
    return true;
  },

  toggleRewardActive: (rewardId) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return;
    const rewards = (profile.rewards || []).map((r) =>
      r.id === rewardId ? { ...r, active: !r.active } : r
    );
    state.updateProfile(profile.id, { rewards });
  },

  deleteReward: (rewardId) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return;
    state.updateProfile(profile.id, {
      rewards: (profile.rewards || []).filter((r) => r.id !== rewardId),
    });
  },

  // ─── Config ───────────────────────────────────────────────────
  updateCustomTasks: (routineId, tasks) => {
    const state = get();
    const profile = state.getActiveProfile();
    if (!profile) return;
    state.updateProfile(profile.id, {
      customTasks: { ...profile.customTasks, [routineId]: tasks },
    });
  },

  setParentMode: (active) => set({ isParentMode: active }),

  unlockPremium: () => {
    const next = { ...get(), isPremium: true };
    set(next);
    save(next);
  },

  updateNotifSettings: (settings) => {
    const next = { ...get(), ...settings };
    set(next);
    save(next);
  },

  // ─── Stats ────────────────────────────────────────────────────
  getWeeklyStats: (profileId) => {
    const state = get();
    const profile = profileId
      ? state.profiles.find((p) => p.id === profileId)
      : state.getActiveProfile();
    if (!profile) return { days: [], completionRate: 0 };
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      days.push({
        date: d,
        morning: !!profile.history?.[d]?.morning?.completed,
        evening: !!profile.history?.[d]?.evening?.completed,
      });
    }
    const done = days.filter((d) => d.morning || d.evening).length;
    return { days, completionRate: Math.round((done / 7) * 100) };
  },

  resetAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ ...defaultState });
  },
}));
