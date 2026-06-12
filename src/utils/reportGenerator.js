import { getMoodById } from '../constants/moodData';

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const fmtDate = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`;
};

// Clé de jour locale — les clés de history sont en heure locale, pas UTC
const localDay = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const cell = (entry) => {
  if (!entry?.completed) return '<td class="miss">—</td>';
  if (entry.jokered) return '<td class="joker">🃏 Joker</td>';
  return '<td class="done">✓ Faite</td>';
};

// Returns the list of months (most recent first) that have at least one history entry.
// Always includes current month even if empty.
export const getAvailableMonths = (history = {}) => {
  const monthSet = new Set();
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  monthSet.add(currentKey);
  Object.keys(history).forEach((dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) monthSet.add(`${parts[0]}-${parts[1]}`);
  });
  return Array.from(monthSet)
    .sort()
    .reverse()
    .map((key) => {
      const [y, m] = key.split('-').map(Number);
      const isCurrent = key === currentKey;
      // Count days with at least one entry in that month
      const dayCount = Object.keys(history).filter((d) => d.startsWith(key)).length;
      return { year: y, month: m - 1, label: `${MONTHS_FR[m - 1]} ${y}`, isCurrent, dayCount };
    });
};

// Builds the practitioner PDF report for a specific month.
// year: full year (2026), month: 0-indexed JS month (0=Jan).
// Defaults to current month.
export const buildPractitionerReport = (state, year, month) => {
  const {
    childName, childAge, history = {}, moodLog = {}, restDays = [],
    streak, level, totalTasksDone, totalRoutinesDone, jokersUsedDates = [], isPremium,
  } = state;

  const now = new Date();
  const targetYear  = year  ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth();
  const isCurrent   = targetYear === now.getFullYear() && targetMonth === now.getMonth();

  // Build every day of the target month (up to today if current month)
  const firstDay  = new Date(targetYear, targetMonth, 1);
  const lastDay   = isCurrent ? now : new Date(targetYear, targetMonth + 1, 0);
  const days = [];
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const iso = localDay(d);
    days.push({
      iso,
      weekday: d.getDay(),
      morning: history[iso]?.morning,
      evening: history[iso]?.evening,
      mood: moodLog[iso] || null,
      rest: (restDays || []).includes(d.getDay()),
    });
  }

  const activeDays  = days.filter((d) => !d.rest);
  const morningDone = activeDays.filter((d) => d.morning?.completed && !d.morning?.jokered).length;
  const eveningDone = activeDays.filter((d) => d.evening?.completed && !d.evening?.jokered).length;
  const morningRate = activeDays.length ? Math.round((morningDone / activeDays.length) * 100) : 0;
  const eveningRate = activeDays.length ? Math.round((eveningDone / activeDays.length) * 100) : 0;

  const jokersUsed = jokersUsedDates.filter((d) => {
    const [y, m] = String(d).split('-').map(Number);
    return y === targetYear && m - 1 === targetMonth;
  }).length;

  const moodCounts = { great: 0, tired: 0, angry: 0 };
  days.forEach((d) => { if (d.mood && moodCounts[d.mood] !== undefined) moodCounts[d.mood]++; });
  const moodTotal = moodCounts.great + moodCounts.tired + moodCounts.angry;

  const insights = [];
  ['tired', 'angry'].forEach((moodId) => {
    const afterMood = days.filter((d, i) => i > 0 && days[i - 1].mood === moodId && !d.rest);
    if (afterMood.length >= 3) {
      const ok   = afterMood.filter((d) => d.morning?.completed).length;
      const rate = Math.round((ok / afterMood.length) * 100);
      const mood = getMoodById(moodId);
      if (!mood) return;
      insights.push(`Lendemains de jours « ${mood.label} » : routine du matin réussie à ${rate}% (${ok}/${afterMood.length} jours).`);
    }
  });

  const moodRow = (moodId) => {
    const mood  = getMoodById(moodId);
    if (!mood) return '';
    const count = moodCounts[moodId] ?? 0;
    const pct   = moodTotal ? Math.round((count / moodTotal) * 100) : 0;
    return `
      <div class="mood-row">
        <span class="mood-emoji">${mood.emoji}</span>
        <span class="mood-label">${mood.label}</span>
        <div class="mood-bar-track"><div class="mood-bar" style="width:${pct}%;background:${mood.color}"></div></div>
        <span class="mood-pct">${pct}% (${count}j)</span>
      </div>`;
  };

  const tableRows = days.slice().reverse().map((d) => `
    <tr class="${d.rest ? 'rest' : ''}">
      <td class="date">${fmtDate(d.iso)}</td>
      ${d.rest
        ? '<td colspan="2" class="restcell">🌴 Jour de repos</td>'
        : `${cell(d.morning)}${isPremium ? cell(d.evening) : '<td class="miss">·</td>'}`}
      <td class="mood">${d.mood ? `${getMoodById(d.mood)?.emoji ?? ''} ${getMoodById(d.mood)?.label ?? ''}`.trim() || '—' : '—'}</td>
    </tr>`).join('');

  const periodLabel = isCurrent
    ? `${MONTHS_FR[targetMonth]} ${targetYear} (en cours — du 1er au ${lastDay.getDate()})`
    : `${MONTHS_FR[targetMonth]} ${targetYear} (mois complet — ${days.length} jours)`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1E1B4B; margin: 32px; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6C3AE8; padding-bottom: 14px; margin-bottom: 20px; }
  .logo { font-size: 22px; font-weight: 900; color: #6C3AE8; }
  .period { color: #6B7280; font-size: 12px; text-align: right; }
  h2 { font-size: 15px; color: #6C3AE8; margin: 22px 0 10px; }
  .kpis { display: flex; gap: 10px; }
  .kpi { flex: 1; background: #F5F3FF; border-radius: 10px; padding: 12px; text-align: center; }
  .kpi .val { font-size: 24px; font-weight: 900; color: #6C3AE8; }
  .kpi .lbl { font-size: 10px; color: #6B7280; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { text-align: left; font-size: 10px; color: #6B7280; text-transform: uppercase; padding: 6px 8px; border-bottom: 2px solid #E5E7EB; }
  td { padding: 5px 8px; border-bottom: 1px solid #F3F4F6; font-size: 12px; }
  td.date { color: #374151; }
  td.done { color: #059669; font-weight: 700; }
  td.joker { color: #D97706; font-weight: 700; }
  td.miss { color: #D1D5DB; }
  td.restcell { color: #059669; font-style: italic; }
  tr.rest { background: #F0FDF4; }
  .mood-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
  .mood-emoji { font-size: 18px; width: 26px; }
  .mood-label { width: 64px; font-weight: 600; }
  .mood-bar-track { flex: 1; height: 10px; background: #F3F4F6; border-radius: 5px; overflow: hidden; }
  .mood-bar { height: 100%; border-radius: 5px; }
  .mood-pct { width: 70px; text-align: right; color: #6B7280; font-size: 11px; }
  .insight { background: #FFF7ED; border-left: 3px solid #F97316; padding: 10px 12px; border-radius: 6px; margin-bottom: 8px; color: #9A3412; }
  .note { margin-top: 26px; padding-top: 12px; border-top: 1px solid #E5E7EB; font-size: 10px; color: #9CA3AF; line-height: 1.5; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">⭐ FocusHéros</div>
      <div style="font-size:16px;font-weight:800;margin-top:4px;">${childName}, ${childAge} ans</div>
    </div>
    <div class="period">
      Rapport de suivi des routines<br/>
      <b>${periodLabel}</b>
    </div>
  </div>

  <h2>Vue d'ensemble</h2>
  <div class="kpis">
    <div class="kpi"><div class="val">${morningRate}%</div><div class="lbl">Routine du matin</div></div>
    ${isPremium ? `<div class="kpi"><div class="val">${eveningRate}%</div><div class="lbl">Routine du soir</div></div>` : ''}
    <div class="kpi"><div class="val">${streak}</div><div class="lbl">Série actuelle (jours)</div></div>
    <div class="kpi"><div class="val">${jokersUsed}</div><div class="lbl">Jokers ce mois</div></div>
    <div class="kpi"><div class="val">${activeDays.length}</div><div class="lbl">Jours actifs</div></div>
  </div>

  ${moodTotal > 0 ? `
  <h2>Météo des émotions (déclarée par l'enfant)</h2>
  ${moodRow('great')}${moodRow('tired')}${moodRow('angry')}
  ` : ''}

  ${insights.length > 0 ? `
  <h2>Observations</h2>
  ${insights.map((i) => `<div class="insight">${i}</div>`).join('')}
  ` : ''}

  <h2>Détail jour par jour</h2>
  <table>
    <tr><th>Date</th><th>Matin</th>${isPremium ? '<th>Soir</th>' : '<th></th>'}<th>Humeur</th></tr>
    ${tableRows}
  </table>

  <div class="note">
    Rapport généré automatiquement par l'application FocusHéros (niveau ${level}, ${totalRoutinesDone} routines accomplies au total, ${totalTasksDone} tâches).
    Les données sont déclaratives et enregistrées localement sur l'appareil familial — aucune donnée n'est transmise à un serveur.
    Le « Joker » permet à l'enfant de passer une routine lors d'un jour difficile sans casser sa dynamique.
    Ce document est destiné à faciliter le dialogue avec le professionnel de santé et ne constitue pas un avis médical.
  </div>
</body>
</html>`;
};
