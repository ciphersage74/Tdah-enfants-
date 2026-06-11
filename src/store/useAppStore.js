import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MORNING_TASKS, EVENING_TASKS, getLevelFromXp } from '../constants/routineData';

const STORAGE_KEY = '@focusheros_state';

const defaultState = {
  hasOnboarded: false,

  childName: '',
  childAge: 8,
  avatarId: 'hero',

  coins: 0,
  xp: 0,
  level: 1,
  streak: 0,
  lastCompletedDate: null,

  isPremium: false,

  parentPin: '1234',
  isParentMode: false,

  customTasks: {
    morning: MORNING_TASKS,
    evening: EVENING_TASKS,
  },

  history: {},
};

const persist = async (state) => {
  const toSave = { ...state };
  delete toSave.isParentMode;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (_) {}
};

export const useAppStore = create((set, get) => ({
  ...defaultState,

  loadState: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        set({ ...saved, isParentMode: false });
      }
    } catch (_) {}
  },

  completeOnboarding: (childName, childAge, avatarId, parentPin) => {
    const next = {
      ...get(),
      hasOnboarded: true,
      childName,
      childAge,
      avatarId,
      parentPin,
      coins: 20,
    };
    set(next);
    persist(next);
  },

  earnRewards: (coins, xp) => {
    const state = get();
    const newXp = state.xp + xp;
    const newCoins = state.coins + coins;
    const newLevel = getLevelFromXp(newXp);
    const leveledUp = newLevel > state.level;
    const next = { ...state, xp: newXp, coins: newCoins, level: newLevel };
    set(next);
    persist(next);
    return { leveledUp, newLevel };
  },

  completeRoutine: (routineId) => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const history = { ...state.history };
    if (!history[today]) history[today] = {};
    history[today][routineId] = { completed: true, completedAt: new Date().toISOString() };

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const streak =
      state.lastCompletedDate === yesterday || state.lastCompletedDate === today
        ? state.streak + (state.lastCompletedDate === yesterday ? 1 : 0)
        : 1;

    const next = { ...state, history, streak, lastCompletedDate: today };
    set(next);
    persist(next);
  },

  isRoutineCompletedToday: (routineId) => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    return !!state.history?.[today]?.[routineId]?.completed;
  },

  unlockPremium: () => {
    const next = { ...get(), isPremium: true };
    set(next);
    persist(next);
  },

  setParentMode: (active) => set({ isParentMode: active }),

  updateCustomTasks: (routineId, tasks) => {
    const state = get();
    const next = {
      ...state,
      customTasks: { ...state.customTasks, [routineId]: tasks },
    };
    set(next);
    persist(next);
  },

  getWeeklyStats: () => {
    const { history } = get();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      days.push({
        date: d,
        morning: !!history?.[d]?.morning?.completed,
        evening: !!history?.[d]?.evening?.completed,
      });
    }
    const completedDays = days.filter((d) => d.morning || d.evening).length;
    const completionRate = Math.round((completedDays / 7) * 100);
    return { days, completionRate };
  },

  resetAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ ...defaultState });
  },
}));
