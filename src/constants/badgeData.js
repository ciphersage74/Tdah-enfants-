export const BADGES = [
  {
    id: 'first_task',
    label: 'Premier Pas',
    desc: 'Complète ta 1ère tâche',
    emoji: '👣',
    check: (p) => p.totalTasksDone >= 1,
  },
  {
    id: 'first_routine',
    label: 'Héros du Matin',
    desc: 'Termine une routine complète',
    emoji: '☀️',
    check: (p) => p.totalRoutinesDone >= 1,
  },
  {
    id: 'streak_3',
    label: 'Flamme x3',
    desc: '3 jours de suite',
    emoji: '🔥',
    check: (p) => p.streak >= 3,
  },
  {
    id: 'streak_7',
    label: 'Flamme x7',
    desc: '7 jours de suite',
    emoji: '🔥🔥',
    check: (p) => p.streak >= 7,
  },
  {
    id: 'streak_30',
    label: 'Légende',
    desc: '30 jours de suite',
    emoji: '🏆',
    check: (p) => p.streak >= 30,
  },
  {
    id: 'tasks_10',
    label: 'Apprenti',
    desc: '10 tâches accomplies',
    emoji: '⚡',
    check: (p) => p.totalTasksDone >= 10,
  },
  {
    id: 'tasks_50',
    label: 'Expert',
    desc: '50 tâches accomplies',
    emoji: '💪',
    check: (p) => p.totalTasksDone >= 50,
  },
  {
    id: 'tasks_100',
    label: 'Maître',
    desc: '100 tâches accomplies',
    emoji: '👑',
    check: (p) => p.totalTasksDone >= 100,
  },
  {
    id: 'level_5',
    label: 'Guerrier',
    desc: 'Atteins le niveau 5',
    emoji: '⚔️',
    check: (p) => p.level >= 5,
  },
  {
    id: 'level_10',
    label: 'Champion',
    desc: 'Atteins le niveau 10',
    emoji: '🛡️',
    check: (p) => p.level >= 10,
  },
  {
    id: 'coins_100',
    label: 'Économe',
    desc: 'Gagne 100 pièces',
    emoji: '💰',
    check: (p) => p.totalCoinsEarned >= 100,
  },
  {
    id: 'coins_500',
    label: 'Riche !',
    desc: 'Gagne 500 pièces au total',
    emoji: '💎',
    check: (p) => p.totalCoinsEarned >= 500,
  },
  {
    id: 'first_purchase',
    label: 'Acheteur',
    desc: 'Achète ton 1er accessoire',
    emoji: '🛍️',
    check: (p) => p.unlockedItems.length >= 1,
  },
  {
    id: 'routines_10',
    label: 'Régulier',
    desc: '10 routines complètes',
    emoji: '🎯',
    check: (p) => p.totalRoutinesDone >= 10,
  },
  {
    id: 'perfect_week',
    label: 'Semaine Parfaite',
    desc: '7 jours sans rien manquer',
    emoji: '🌟',
    check: (p) => p.streak >= 7 && p.totalRoutinesDone >= 7,
  },

  // ── Séries longues ──────────────────────────────────────────────
  {
    id: 'streak_14',
    label: 'Deux Semaines !',
    desc: '14 jours de suite',
    emoji: '🌈',
    check: (p) => p.streak >= 14,
  },
  {
    id: 'streak_21',
    label: 'Trois Semaines',
    desc: '21 jours de suite',
    emoji: '⭐⭐',
    check: (p) => p.streak >= 21,
  },
  {
    id: 'streak_60',
    label: 'Invincible',
    desc: '60 jours de suite',
    emoji: '🦁',
    check: (p) => p.streak >= 60,
  },
  {
    id: 'streak_100',
    label: 'Centurion',
    desc: '100 jours de suite',
    emoji: '🏅',
    check: (p) => p.streak >= 100,
  },

  // ── Tâches ──────────────────────────────────────────────────────
  {
    id: 'tasks_25',
    label: 'Courageux',
    desc: '25 tâches accomplies',
    emoji: '🦊',
    check: (p) => p.totalTasksDone >= 25,
  },
  {
    id: 'tasks_200',
    label: 'Titan',
    desc: '200 tâches accomplies',
    emoji: '🌋',
    check: (p) => p.totalTasksDone >= 200,
  },
  {
    id: 'tasks_500',
    label: 'Légende Absolue',
    desc: '500 tâches accomplies',
    emoji: '🌠',
    check: (p) => p.totalTasksDone >= 500,
  },

  // ── Routines ────────────────────────────────────────────────────
  {
    id: 'routines_5',
    label: 'Habitué',
    desc: '5 routines complètes',
    emoji: '🎪',
    check: (p) => p.totalRoutinesDone >= 5,
  },
  {
    id: 'routines_20',
    label: 'Discipline',
    desc: '20 routines complètes',
    emoji: '🎖️',
    check: (p) => p.totalRoutinesDone >= 20,
  },
  {
    id: 'routines_50',
    label: 'Ninja des Quêtes',
    desc: '50 routines complètes',
    emoji: '🥷',
    check: (p) => p.totalRoutinesDone >= 50,
  },
  {
    id: 'routines_100',
    label: 'Centenaire',
    desc: '100 routines complètes',
    emoji: '💯',
    check: (p) => p.totalRoutinesDone >= 100,
  },

  // ── Niveaux ─────────────────────────────────────────────────────
  {
    id: 'level_3',
    label: 'En Route !',
    desc: 'Atteins le niveau 3',
    emoji: '🚀',
    check: (p) => p.level >= 3,
  },
  {
    id: 'level_15',
    label: 'Vétéran',
    desc: 'Atteins le niveau 15',
    emoji: '🎗️',
    check: (p) => p.level >= 15,
  },
  {
    id: 'level_20',
    label: 'Maître Suprême',
    desc: 'Atteins le niveau 20',
    emoji: '🌟🌟',
    check: (p) => p.level >= 20,
  },

  // ── Pièces ──────────────────────────────────────────────────────
  {
    id: 'coins_1000',
    label: 'Millionnaire',
    desc: 'Gagne 1 000 pièces au total',
    emoji: '🤑',
    check: (p) => p.totalCoinsEarned >= 1000,
  },
  {
    id: 'coins_2000',
    label: 'Banquier',
    desc: 'Gagne 2 000 pièces au total',
    emoji: '🏦',
    check: (p) => p.totalCoinsEarned >= 2000,
  },

  // ── Boutique ────────────────────────────────────────────────────
  {
    id: 'items_5',
    label: 'Collectionneur',
    desc: 'Possède 5 accessoires',
    emoji: '🎒',
    check: (p) => (p.unlockedItems?.length || 0) >= 5,
  },
  {
    id: 'items_10',
    label: 'Mode',
    desc: 'Possède 10 accessoires',
    emoji: '👗',
    check: (p) => (p.unlockedItems?.length || 0) >= 10,
  },
  {
    id: 'items_20',
    label: 'Garde-Robe Royale',
    desc: 'Possède 20 accessoires',
    emoji: '👑✨',
    check: (p) => (p.unlockedItems?.length || 0) >= 20,
  },

  // ── Badges ──────────────────────────────────────────────────────
  {
    id: 'badges_5',
    label: 'Chasseur',
    desc: 'Décroche 5 badges',
    emoji: '🏹',
    check: (p) => (p.badges?.length || 0) >= 5,
  },
  {
    id: 'badges_10',
    label: 'Chasseur Élite',
    desc: 'Décroche 10 badges',
    emoji: '🎯',
    check: (p) => (p.badges?.length || 0) >= 10,
  },
];

export const getBadgeById = (id) => BADGES.find((b) => b.id === id);
