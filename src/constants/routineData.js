export const MORNING_TASKS = [
  { id: 'wake',      name: 'Je me lève',              emoji: '⏰', duration: 60,   coins: 5,  xp: 5  },
  { id: 'toilet',    name: 'Je vais aux toilettes',   emoji: '🚽', duration: 120,  coins: 5,  xp: 5  },
  { id: 'wash',      name: 'Je me lave le visage',    emoji: '🧼', duration: 120,  coins: 8,  xp: 8  },
  { id: 'teeth',     name: 'Je brosse mes dents',     emoji: '🦷', duration: 120,  coins: 10, xp: 10 },
  { id: 'dressed',   name: "Je m'habille",            emoji: '👕', duration: 300,  coins: 15, xp: 15 },
  { id: 'breakfast', name: 'Petit-déjeuner',          emoji: '🥣', duration: 600,  coins: 10, xp: 10 },
  { id: 'bag',       name: 'Je prépare mon sac',      emoji: '🎒', duration: 180,  coins: 15, xp: 15 },
  { id: 'shoes',     name: 'Je mets mes chaussures',  emoji: '👟', duration: 120,  coins: 8,  xp: 8  },
];

export const EVENING_TASKS = [
  { id: 'snack',      name: 'Le goûter',                   emoji: '🍎', duration: 900,  coins: 5,  xp: 5  },
  { id: 'homework',   name: 'Les devoirs',                 emoji: '📚', duration: 2400, coins: 30, xp: 30 },
  { id: 'freetime',   name: 'Temps libre',                 emoji: '🎮', duration: 1800, coins: 5,  xp: 5  },
  { id: 'shower',     name: 'La douche',                   emoji: '🚿', duration: 600,  coins: 15, xp: 15 },
  { id: 'pyjamas',    name: 'Je mets mon pyjama',          emoji: '😴', duration: 120,  coins: 10, xp: 10 },
  { id: 'teeth_ev',   name: 'Dents du soir',               emoji: '🦷', duration: 120,  coins: 10, xp: 10 },
  { id: 'bag_tm',     name: 'Sac pour demain',             emoji: '🎒', duration: 300,  coins: 15, xp: 15 },
  { id: 'reading',    name: 'Lecture / temps calme',       emoji: '📖', duration: 1200, coins: 10, xp: 10 },
];

export const ROUTINES = {
  morning: {
    id: 'morning',
    name: 'Quête du Matin',
    emoji: '☀️',
    premium: false,
    gradientKey: 'morning',
    defaultTasks: MORNING_TASKS,
    bonusCoins: 50,
    bonusXp: 50,
  },
  evening: {
    id: 'evening',
    name: 'Quête du Soir',
    emoji: '🌙',
    premium: true,
    gradientKey: 'evening',
    defaultTasks: EVENING_TASKS,
    bonusCoins: 75,
    bonusXp: 75,
  },
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

export const getLevelFromXp = (xp) => {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
};

export const getXpForNextLevel = (level) => {
  return LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
};

export const PREMIUM_FEATURES = [
  { emoji: '🌙', title: 'Routine du soir', desc: 'Douche, devoirs, coucher sans crise' },
  { emoji: '📊', title: 'Tableau de bord complet', desc: 'Stats hebdo, points de blocage, streaks' },
  { emoji: '⚙️', title: 'Routines personnalisables', desc: 'Ajoute / supprime des tâches' },
  { emoji: '📄', title: 'Rapport PDF praticien', desc: '30 jours de suivi à partager avec le pédiatre ou psy' },
  { emoji: '🔔', title: 'Rappels intelligents', desc: 'Notifications à heure personnalisée' },
];
