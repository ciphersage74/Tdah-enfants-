export const COLORS = {
  primary: '#6C3AE8',
  primaryLight: '#8B5CF6',
  primaryDark: '#4C1D95',

  gold: '#FFB800',
  goldLight: '#FFD60A',
  goldDark: '#D97706',

  success: '#10B981',
  successLight: '#D1FAE5',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  premium: '#F97316',
  premiumLight: '#FED7AA',

  background: '#F5F3FF',
  cardBg: '#FFFFFF',
  surface: '#EDE9FE',

  textPrimary: '#1E1B4B',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
};

export const GRADIENTS = {
  primary: ['#6C3AE8', '#8B5CF6'],
  morning: ['#F97316', '#FBBF24'],
  evening: ['#3B82F6', '#6366F1'],
  homework: ['#10B981', '#059669'],
  premium: ['#F97316', '#EF4444'],
  celebration: ['#6C3AE8', '#EC4899'],
};

export const AVATAR_THEMES = {
  // Legacy (backward compat)
  dragon: { emoji: '🐉', color: '#EF4444', bg: '#FEE2E2', gradient: ['#EF4444', '#DC2626'] },
  hero:   { emoji: '🦸', color: '#6C3AE8', bg: '#EDE9FE', gradient: ['#6C3AE8', '#8B5CF6'] },
  wizard: { emoji: '🧙', color: '#3B82F6', bg: '#DBEAFE', gradient: ['#3B82F6', '#6366F1'] },
  fox:    { emoji: '🦊', color: '#F97316', bg: '#FED7AA', gradient: ['#F97316', '#FBBF24'] },
  // Boy avatars
  superhero: { emoji: '🦸', color: '#3B82F6', bg: '#DBEAFE', gradient: ['#3B82F6', '#1D4ED8'] },
  ninja:     { emoji: '🥷', color: '#374151', bg: '#F3F4F6', gradient: ['#374151', '#111827'] },
  astronaut: { emoji: '🚀', color: '#06B6D4', bg: '#CFFAFE', gradient: ['#06B6D4', '#0E7490'] },
  // Girl avatars
  princess: { emoji: '👸', color: '#EC4899', bg: '#FCE7F3', gradient: ['#EC4899', '#DB2777'] },
  fairy:    { emoji: '🧚', color: '#A855F7', bg: '#F3E8FF', gradient: ['#A855F7', '#7C3AED'] },
  mermaid:  { emoji: '🧜', color: '#06B6D4', bg: '#CFFAFE', gradient: ['#06B6D4', '#0891B2'] },
  witch:    { emoji: '🧙', color: '#7C3AED', bg: '#EDE9FE', gradient: ['#7C3AED', '#5B21B6'] },
};

export const BOY_AVATARS  = ['superhero', 'dragon', 'ninja', 'astronaut'];
export const GIRL_AVATARS = ['princess', 'fairy', 'mermaid', 'witch'];

export const AVATAR_LABELS = {
  superhero: 'Super-Héros', dragon: 'Dragon', ninja: 'Ninja', astronaut: 'Astronaute',
  princess: 'Princesse', fairy: 'Fée', mermaid: 'Sirène', witch: 'Sorcière',
  hero: 'Héros', wizard: 'Sorcier', fox: 'Renard',
};

// Fine-tuning offsets (pixels) for item layers per character.
// Adjust visually after first build: negative = up/left, positive = down/right.
export const AVATAR_ANCHORS = {
  superhero: { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 },
  dragon:    { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 },
  ninja:     { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 },
  astronaut: { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 },
  princess:  { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 },
  fairy:     { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 },
  mermaid:   { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 },
  witch:     { hatOffsetY: 0, weaponOffsetX: 0, weaponOffsetY: 0, companionOffsetX: 0, companionOffsetY: 0 },
};
