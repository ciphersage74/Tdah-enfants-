export const MOODS = [
  { id: 'great', emoji: '😄', label: 'Super',   color: '#10B981', bg: '#D1FAE5' },
  { id: 'tired', emoji: '😴', label: 'Fatigué', color: '#6366F1', bg: '#E0E7FF' },
  { id: 'angry', emoji: '😤', label: 'Énervé',  color: '#EF4444', bg: '#FEE2E2' },
];

export const getMoodById = (id) => MOODS.find((m) => m.id === id);
