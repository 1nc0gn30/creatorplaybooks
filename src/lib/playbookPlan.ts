export type StepBasis = 'source' | 'suggestion';

export interface PlanStep {
  id: string;
  phaseId: string;
  phaseTitle: string;
  title: string;
  detail: string;
  deliverable: string;
  checkpoint: string;
  basis: StepBasis;
  sourceUrl?: string;
  minutes: number;
  /** Shown only when the goal is at least this many days. */
  minDays: 7 | 14 | 30 | 60 | 90;
}

export function assignDates(count: number, startISO: string, days: number): string[] {
  const start = parseISODate(startISO);
  const span = Math.max(1, days);
  return Array.from({ length: count }, (_, i) => {
    const offset = count <= 1 ? 0 : Math.round((i * (span - 1)) / (count - 1));
    return formatISODate(addDays(start, offset));
  });
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((n) => Number(n));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function todayISO(): string {
  return formatISODate(new Date());
}

export const GOAL_LENGTHS = [7, 14, 30, 60, 90] as const;
