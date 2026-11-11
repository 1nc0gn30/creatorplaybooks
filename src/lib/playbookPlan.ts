import type { CreatorProfile } from '../types';

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
}

/** Turn the sourced plays into a phased practice plan. Suggestions are labeled. */
export function buildPlan(creator: CreatorProfile): PlanStep[] {
  const steps: PlanStep[] = [];
  creator.plays.forEach((play, index) => {
    const phaseTitle = `Phase ${index + 1}. ${play.title}`;
    const source = play.sourceUrl;
    steps.push({
      id: `${play.id}-study`,
      phaseId: play.id,
      phaseTitle,
      title: 'Study the public example',
      detail: play.example
        ? play.example
        : play.description,
      deliverable: `A short note naming what ${creator.name} published and the URL you opened.`,
      checkpoint: 'You can point to the source without adding a number that is not on that page.',
      basis: 'source',
      sourceUrl: source,
    });
    steps.push({
      id: `${play.id}-do`,
      phaseId: play.id,
      phaseTitle,
      title: 'Do the play',
      detail: play.action || play.description,
      deliverable: play.frequency
        ? `One finished piece on the cadence they use: ${play.frequency}.`
        : 'One finished piece you can show someone.',
      checkpoint: 'The piece matches the format in the play, and any revenue figure you repeat is marked as theirs.',
      basis: 'source',
      sourceUrl: source,
    });
    steps.push({
      id: `${play.id}-own`,
      phaseId: play.id,
      phaseTitle,
      title: 'Write your own version',
      detail: `Suggestion, not a claim about ${creator.name}: use the same format on your work. Do not paste their post or their numbers.`,
      deliverable: 'A draft in your voice, with your link, ready to edit before you publish.',
      checkpoint: 'A reader can tell the example from your draft.',
      basis: 'suggestion',
    });
  });

  steps.push({
    id: `${creator.id}-review`,
    phaseId: `${creator.id}-review`,
    phaseTitle: 'Last phase. Review',
    title: 'Check the sources again',
    detail: `Suggestion: reread the source list on this page. If a product link fails, drop it. Keep self-reported money labeled as self-reported.`,
    deliverable: 'A list of what you shipped during the goal, and what you left out on purpose.',
    checkpoint: 'Nothing in your notes is presented as their revenue, quote, or launch unless the source says so.',
    basis: 'suggestion',
  });

  return steps;
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
