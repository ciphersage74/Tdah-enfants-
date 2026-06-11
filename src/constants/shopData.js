export const SHOP_ITEMS = [
  { id: 'crown',   label: 'Couronne',      emoji: '👑', price: 80,  position: 'top',   requiredLevel: 1 },
  { id: 'cowboy',  label: 'Chapeau',       emoji: '🤠', price: 60,  position: 'top',   requiredLevel: 1 },
  { id: 'wizard',  label: 'Chapeau Mage',  emoji: '🎩', price: 70,  position: 'top',   requiredLevel: 2 },
  { id: 'glasses', label: 'Lunettes',      emoji: '😎', price: 50,  position: 'face',  requiredLevel: 1 },
  { id: 'shield',  label: 'Bouclier',      emoji: '🛡️', price: 120, position: 'right', requiredLevel: 3 },
  { id: 'sword',   label: 'Épée',          emoji: '⚔️', price: 150, position: 'right', requiredLevel: 3 },
  { id: 'cape',    label: 'Cape héros',    emoji: '🦸', price: 200, position: 'back',  requiredLevel: 4 },
  { id: 'star',    label: 'Étoile dorée',  emoji: '⭐', price: 300, position: 'top',   requiredLevel: 5 },
  { id: 'fire',    label: 'Flamme',        emoji: '🔥', price: 180, position: 'right', requiredLevel: 4 },
  { id: 'gem',     label: 'Diamant',       emoji: '💎', price: 400, position: 'top',   requiredLevel: 7 },
];

export const getShopItemById = (id) => SHOP_ITEMS.find((i) => i.id === id);
