// Message d'encouragement différent chaque jour (déterministe : même message
// toute la journée, change le lendemain). {name} = prénom de l'enfant.
// Formulations neutres (garçon/fille) et adaptées TDAH : courtes et positives.
export const DAILY_MESSAGES = [
  'Prêt pour ta mission, {name} ?',
  'Aujourd\'hui, tu vas tout déchirer ! 💪',
  'Chaque petit pas compte, {name} !',
  'Une nouvelle aventure t\'attend ! ⚔️',
  'Tu as une force incroyable en toi !',
  '{name}, ta quête du jour est prête !',
  'Les champions se lèvent comme toi ! 🏆',
  'Un jour de plus pour devenir une légende !',
  'Ton avatar croit en toi, {name} !',
  'C\'est parti pour une super journée ! 🚀',
  'Petit à petit, tu deviens imbattable !',
  'Aujourd\'hui est TON jour, {name} !',
  'Même les plus grands héros commencent petit. 🌱',
  'Ta série compte sur toi ! 🔥',
  'Mission du jour : être au top !',
  '{name}, montre de quoi tu es capable !',
  'Les pièces t\'attendent, fonce ! 🪙',
  'Chaque tâche finie = une victoire !',
  'Tu as déjà fait tant de chemin, {name} !',
  'En route vers le niveau suivant ! ⭐',
  'Respire un bon coup… et c\'est parti !',
  'Aujourd\'hui, on fait de son mieux. 💜',
];

export const getDailyMessage = (name) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000);
  const msg = DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length] || DAILY_MESSAGES[0];
  return msg.replace('{name}', name || 'héros');
};
