import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MORNING_TASKS, EVENING_TASKS, getLevelFromXp } from '../constants/routineData';
import { BADGES } from '../constants/badgeData';
import { getShopItemById } from '../constants/shopData';

const STORAGE_KEY = '@focusheros_v3';

const defaultState = {
  hasOnboarded: false,
  childName: '',
  childAge: 8,
  gender: 'boy',
  avatarId: 'hero',
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
  customTasks: { morning: MORNING_TASKS, evening: EVENING_TASKS },
  history: {},
  rewards: [],
  parentPin: '1234',
  isPremium: false,
  isParentMode: false,
  notifMorningEnabled: false,
  notifEveningEnabled: false,
  notifMorningTime: '07:30',
  notifEveningTime: '18:30',
  restDays: [],
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
      // Check v3 (current flat format)
      const rawV3 = await AsyncStorage.getItem(STORAGE_KEY);
      if (rawV3) {
        set({ ...JSON.parse(rawV3), isParentMode: false });
        return;
      }
      // Migrate from v2 (profiles[])
      const rawV2 = await AsyncStorage.getItem('@focusheros_v2');
      if (rawV2) {
        const v2 = JSON.parse(rawV2);
        const p = v2.profiles?.[0];
        if (p) {
          const migrated = {
            ...defaultState,
            hasOnboarded: true,
            childName: p.childName || '',
            childAge: p.childAge || 8,
            avatarId: p.avatarId || 'hero',
            coins: p.coins || 20,
            xp: p.xp || 0,
            level: p.level || 1,
            streak: p.streak || 0,
            lastCompletedDate: p.lastCompletedDate || null,
            totalTasksDone: p.totalTasksDone || 0,
            totalRoutinesDone: p.totalRoutinesDone || 0,
            totalCoinsEarned: p.totalCoinsEarned || 20,
            unlockedItems: p.unlockedItems || [],
            equippedItems: p.equippedItems || [],
            badges: p.badges || [],
            customTasks: p.customTasks || defaultState.customTasks,
            history: p.history || {},
            rewards: p.rewards || [],
            parentPin: v2.parentPin || '1234',
            isPremium: v2.isPremium || false,
            notifMorningEnabled: v2.notifMorningEnabled || false,
            notifEveningEnabled: v2.notifEveningEnabled || false,
            notifMorningTime: v2.notifMorningTime || '07:30',
            notifEveningTime: v2.notifEveningTime || '18:30',
          };
          set({ ...migrated, isParentMode: false });
          save(migrated);
        }
        return;
      }
      // Migrate from v1 (original flat)
      const rawV1 = await AsyncStorage.getItem('@focusheros_state');
      if (rawV1) {
        const v1 = JSON.parse(rawV1);
        const migrated = { ...defaultState, ...v1, isParentMode: false };
        set(migrated);
        save(migrated);
      }
    } catch (_) {}
  },

  // ─── Onboarding ───────────────────────────────────────────────
  completeOnboarding: (childName, childAge, avatarId, parentPin, gender = 'boy') => {
    const next = { ...get(), hasOnboarded: true, childName, childAge, avatarId, parentPin, gender };
    set(next);
    save(next);
  },

  // ─── Gameplay ─────────────────────────────────────────────────
  earnRewards: (coins, xp) => {
    const s = get();
    const newXp = s.xp + xp;
    const newCoins = s.coins + coins;
    const newLevel = getLevelFromXp(newXp);
    const leveledUp = newLevel > s.level;
    const totalCoinsEarned = s.totalCoinsEarned + coins;
    const next = { ...s, xp: newXp, coins: newCoins, level: newLevel, totalCoinsEarned };
    set(next);
    save(next);
    return { leveledUp, newLevel };
  },

  completeRoutine: (routineId) => {
    const s = get();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const history = { ...s.history };
    if (!history[today]) history[today] = {};
    history[today][routineId] = { completed: true, completedAt: new Date().toISOString() };
    const streak =
      s.lastCompletedDate === yesterday ? s.streak + 1
      : s.lastCompletedDate === today ? s.streak
      : 1;
    const totalRoutinesDone = s.totalRoutinesDone + 1;
    const next = { ...s, history, streak, lastCompletedDate: today, totalRoutinesDone };
    set(next);
    save(next);
  },

  recordTaskDone: () => {
    const s = get();
    const next = { ...s, totalTasksDone: s.totalTasksDone + 1 };
    set(next);
    save(next);
  },

  isRoutineCompletedToday: (routineId) => {
    const today = new Date().toISOString().split('T')[0];
    return !!get().history?.[today]?.[routineId]?.completed;
  },

  // ─── Badges ───────────────────────────────────────────────────
  checkAndAwardBadges: () => {
    const s = get();
    const earned = new Set(s.badges);
    const newBadges = BADGES.filter((b) => !earned.has(b.id) && b.check(s));
    if (newBadges.length === 0) return [];
    const next = { ...s, badges: [...s.badges, ...newBadges.map((b) => b.id)] };
    set(next);
    save(next);
    return newBadges;
  },

  // ─── Shop ─────────────────────────────────────────────────────
  buyShopItem: (itemId, price) => {
    const s = get();
    if (s.coins < price || s.unlockedItems.includes(itemId)) return false;
    const next = { ...s, coins: s.coins - price, unlockedItems: [...s.unlockedItems, itemId] };
    set(next);
    save(next);
    return true;
  },

  toggleEquipItem: (itemId) => {
    const s = get();
    const item = getShopItemById(itemId);
    if (!item) return;
    let equipped = [...s.equippedItems];
    if (equipped.includes(itemId)) {
      equipped = equipped.filter((i) => i !== itemId);
    } else {
      // One item per position slot
      equipped = equipped.filter((i) => {
        const existing = getShopItemById(i);
        return existing?.position !== item.position;
      });
      equipped.push(itemId);
    }
    const next = { ...s, equippedItems: equipped };
    set(next);
    save(next);
  },

  // ─── Rewards ──────────────────────────────────────────────────
  addReward: (name, emoji, cost) => {
    const s = get();
    const reward = { id: Date.now().toString(), name, emoji, cost, active: true, claimed: false };
    const next = { ...s, rewards: [...s.rewards, reward] };
    set(next);
    save(next);
  },

  claimReward: (rewardId) => {
    const s = get();
    const reward = s.rewards.find((r) => r.id === rewardId);
    if (!reward || s.coins < reward.cost) return false;
    const rewards = s.rewards.map((r) =>
      r.id === rewardId ? { ...r, claimed: true, claimedAt: new Date().toISOString() } : r
    );
    const next = { ...s, coins: s.coins - reward.cost, rewards };
    set(next);
    save(next);
    return true;
  },

  toggleRewardActive: (rewardId) => {
    const s = get();
    const rewards = s.rewards.map((r) =>
      r.id === rewardId ? { ...r, active: !r.active } : r
    );
    const next = { ...s, rewards };
    set(next);
    save(next);
  },

  deleteReward: (rewardId) => {
    const s = get();
    const next = { ...s, rewards: s.rewards.filter((r) => r.id !== rewardId) };
    set(next);
    save(next);
  },

  // ─── Config ───────────────────────────────────────────────────
  updateCustomTasks: (routineId, tasks) => {
    const s = get();
    const next = { ...s, customTasks: { ...s.customTasks, [routineId]: tasks } };
    set(next);
    save(next);
  },

  addCustomTask: (routineId, task) => {
    const s = get();
    const current = s.customTasks?.[routineId] ?? [];
    const newTask = { ...task, id: `custom_${Date.now()}` };
    const next = { ...s, customTasks: { ...s.customTasks, [routineId]: [...current, newTask] } };
    set(next);
    save(next);
  },

  removeCustomTask: (routineId, taskId) => {
    const s = get();
    const current = s.customTasks?.[routineId] ?? [];
    const updated = current.filter((t) => t.id !== taskId);
    if (updated.length < 2) return false;
    const next = { ...s, customTasks: { ...s.customTasks, [routineId]: updated } };
    set(next);
    save(next);
    return true;
  },

  updateRestDays: (days) => {
    const next = { ...get(), restDays: days };
    set(next);
    save(next);
  },

  setParentMode: (v) => set({ isParentMode: v }),

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
  getWeeklyStats: () => {
    const { history, isPremium } = get();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      days.push({
        date: d,
        morning: !!history?.[d]?.morning?.completed,
        evening: !!history?.[d]?.evening?.completed,
      });
    }
    const done = days.filter((d) => d.morning || d.evening).length;
    return { days, completionRate: Math.round((done / 7) * 100) };
  },

  resetAll: async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, '@focusheros_v2', '@focusheros_state']);
    set({ ...defaultState });
  },
}));
