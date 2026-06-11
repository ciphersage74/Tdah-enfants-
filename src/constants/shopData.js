export const SHOP_CATEGORIES = [
  { id: 'hats',       label: 'Chapeaux',    emoji: '🎩' },
  { id: 'weapons',    label: 'Armes',       emoji: '⚔️' },
  { id: 'magic',      label: 'Magie',       emoji: '✨' },
  { id: 'companions', label: 'Compagnons',  emoji: '🐉' },
];

export const SHOP_ITEMS = [
  // ─── Chapeaux ────────────────────────────────────────────────
  { id: 'party',      label: 'Chapeau fête',      emoji: '🎉', price: 40,  position: 'top',   category: 'hats',       requiredLevel: 1 },
  { id: 'cowboy',     label: 'Cowboy',             emoji: '🤠', price: 60,  position: 'top',   category: 'hats',       requiredLevel: 1 },
  { id: 'tophat',     label: 'Chapeau haut-de-forme', emoji: '🎩', price: 70, position: 'top', category: 'hats',       requiredLevel: 2 },
  { id: 'crown',      label: 'Couronne',           emoji: '👑', price: 90,  position: 'top',   category: 'hats',       requiredLevel: 2 },
  { id: 'graduation', label: 'Toque de diplômé',   emoji: '🎓', price: 100, position: 'top',   category: 'hats',       requiredLevel: 3 },
  { id: 'helm',       label: 'Casque guerrier',    emoji: '⛑️', price: 120, position: 'top',   category: 'hats',       requiredLevel: 3 },
  { id: 'witch',      label: 'Chapeau sorcière',   emoji: '🪄', price: 130, position: 'top',   category: 'hats',       requiredLevel: 4 },
  { id: 'tiara',      label: 'Tiare de princesse', emoji: '💍', price: 160, position: 'top',   category: 'hats',       requiredLevel: 5 },
  { id: 'santahat',   label: 'Bonnet du Père Noël',emoji: '🎅', price: 150, position: 'top',   category: 'hats',       requiredLevel: 4 },

  // ─── Armes ───────────────────────────────────────────────────
  { id: 'wand',       label: 'Baguette magique',   emoji: '🪄', price: 80,  position: 'right', category: 'weapons',    requiredLevel: 2 },
  { id: 'shield',     label: 'Bouclier',           emoji: '🛡️', price: 100, position: 'right', category: 'weapons',    requiredLevel: 2 },
  { id: 'sword',      label: 'Épée légendaire',    emoji: '⚔️', price: 140, position: 'right', category: 'weapons',    requiredLevel: 3 },
  { id: 'bow',        label: 'Arc elfique',         emoji: '🏹', price: 160, position: 'right', category: 'weapons',    requiredLevel: 4 },
  { id: 'axe',        label: 'Hache de guerre',    emoji: '🪓', price: 170, position: 'right', category: 'weapons',    requiredLevel: 4 },
  { id: 'hammer',     label: 'Marteau de Thor',    emoji: '🔨', price: 200, position: 'right', category: 'weapons',    requiredLevel: 5 },
  { id: 'trident',    label: 'Trident du roi',     emoji: '🔱', price: 240, position: 'right', category: 'weapons',    requiredLevel: 6 },
  { id: 'lightsaber', label: 'Sabre laser',        emoji: '🗡️', price: 280, position: 'right', category: 'weapons',    requiredLevel: 7 },

  // ─── Magie ───────────────────────────────────────────────────
  { id: 'sparkles',   label: 'Étincelles',         emoji: '✨', price: 80,  position: 'top',   category: 'magic',      requiredLevel: 2 },
  { id: 'lightning',  label: 'Éclair',             emoji: '⚡', price: 120, position: 'right', category: 'magic',      requiredLevel: 3 },
  { id: 'fire',       label: 'Flamme',             emoji: '🔥', price: 140, position: 'right', category: 'magic',      requiredLevel: 3 },
  { id: 'moon',       label: 'Lune mystique',      emoji: '🌙', price: 150, position: 'top',   category: 'magic',      requiredLevel: 3 },
  { id: 'comet',      label: 'Comète',             emoji: '☄️', price: 180, position: 'top',   category: 'magic',      requiredLevel: 4 },
  { id: 'rainbow',    label: 'Arc-en-ciel',        emoji: '🌈', price: 220, position: 'top',   category: 'magic',      requiredLevel: 5 },
  { id: 'star_gold',  label: 'Étoile dorée',       emoji: '⭐', price: 280, position: 'top',   category: 'magic',      requiredLevel: 5 },
  { id: 'gem',        label: 'Diamant',            emoji: '💎', price: 400, position: 'top',   category: 'magic',      requiredLevel: 7 },
  { id: 'galaxy',     label: 'Galaxie',            emoji: '🌌', price: 500, position: 'top',   category: 'magic',      requiredLevel: 9 },

  // ─── Compagnons ──────────────────────────────────────────────
  { id: 'cat',        label: 'Petit chat',         emoji: '🐱', price: 100, position: 'right', category: 'companions', requiredLevel: 2 },
  { id: 'rabbit',     label: 'Lapin chanceux',     emoji: '🐰', price: 120, position: 'right', category: 'companions', requiredLevel: 2 },
  { id: 'butterfly',  label: 'Papillon',           emoji: '🦋', price: 150, position: 'right', category: 'companions', requiredLevel: 3 },
  { id: 'fox_friend', label: 'Renard fidèle',      emoji: '🦊', price: 200, position: 'right', category: 'companions', requiredLevel: 4 },
  { id: 'owl',        label: 'Hibou sage',         emoji: '🦉', price: 220, position: 'right', category: 'companions', requiredLevel: 4 },
  { id: 'eagle',      label: 'Aigle royal',        emoji: '🦅', price: 280, position: 'top',   category: 'companions', requiredLevel: 6 },
  { id: 'wolf',       label: 'Loup alpha',         emoji: '🐺', price: 320, position: 'right', category: 'companions', requiredLevel: 6 },
  { id: 'phoenix',    label: 'Phénix',             emoji: '🦜', price: 450, position: 'top',   category: 'companions', requiredLevel: 8 },
  { id: 'dragon',     label: 'Dragon légendaire',  emoji: '🐲', price: 600, position: 'right', category: 'companions', requiredLevel: 10 },
  { id: 'unicorn',    label: 'Licorne',            emoji: '🦄', price: 700, position: 'right', category: 'companions', requiredLevel: 10 },
];

export const getShopItemById = (id) => SHOP_ITEMS.find((i) => i.id === id);
export const getItemsByCategory = (cat) => SHOP_ITEMS.filter((i) => i.category === cat);
