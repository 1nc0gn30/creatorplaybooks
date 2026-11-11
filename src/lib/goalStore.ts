import type { PlanStep } from './playbookPlan';
import { assignDates, todayISO } from './playbookPlan';

const KEY = 'creatorplaybooks_goals_v1';

export interface StoredGoal {
  creatorId: string;
  creatorName: string;
  days: number;
  start: string;
  checks: Record<string, boolean>;
  updatedAt: string;
}

type Store = Record<string, StoredGoal>;

function readStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function loadGoal(creatorId: string): StoredGoal | null {
  return readStore()[creatorId] || null;
}

export function loadAllGoals(): StoredGoal[] {
  return Object.values(readStore());
}

export function saveGoal(goal: StoredGoal) {
  const store = readStore();
  store[goal.creatorId] = { ...goal, updatedAt: new Date().toISOString() };
  writeStore(store);
}

export function resetGoal(creatorId: string) {
  const store = readStore();
  delete store[creatorId];
  writeStore(store);
}

export function datedSteps(steps: PlanStep[], goal: StoredGoal) {
  const dates = assignDates(steps.length, goal.start, goal.days);
  return steps.map((step, i) => ({ ...step, date: dates[i] }));
}

export function completion(steps: PlanStep[], checks: Record<string, boolean>) {
  if (!steps.length) return 0;
  const done = steps.filter((s) => checks[s.id]).length;
  return Math.round((done / steps.length) * 100);
}

export function dayStreak(steps: { id: string; date: string }[], checks: Record<string, boolean>, today = todayISO()) {
  const byDate = new Map<string, string[]>();
  steps.forEach((s) => {
    const list = byDate.get(s.date) || [];
    list.push(s.id);
    byDate.set(s.date, list);
  });
  const dates = [...byDate.keys()].filter((d) => d <= today).sort();
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const ids = byDate.get(dates[i]) || [];
    if (ids.length && ids.every((id) => checks[id])) streak += 1;
    else if (dates[i] === today) continue;
    else break;
  }
  return streak;
}

function icsEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function toIcs(goal: StoredGoal, steps: PlanStep[]) {
  const dated = datedSteps(steps, goal);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const events = dated.map((step) => {
    const day = step.date.replace(/-/g, '');
    const body = [step.detail, '', `Deliverable: ${step.deliverable}`, `Checkpoint: ${step.checkpoint}`, step.basis === 'suggestion' ? 'This step is our suggestion, not their claim.' : ''].filter(Boolean).join('\n');
    return [
      'BEGIN:VEVENT',
      `UID:${goal.creatorId}-${step.id}@creatorplaybooks`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `SUMMARY:${icsEscape(`${goal.creatorName}: ${step.title}`)}`,
      `DESCRIPTION:${icsEscape(body)}`,
      'END:VEVENT',
    ].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Neal Frazier Tech//CreatorPlaybooks//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');
}

export function downloadIcs(filename: string, contents: string) {
  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
