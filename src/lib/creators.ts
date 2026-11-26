import type { CreatorProfile } from '../types';
import dataset from '../../shared/creators.json';

export const CATEGORIES = dataset.categories as readonly {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly description: string;
}[];

export function getActiveCreators<T extends { id: string }>(creatorsList: T[]): T[] {
  return creatorsList;
}

export const ALL_CREATORS: CreatorProfile[] = dataset.creators as CreatorProfile[];
export const CREATORS: CreatorProfile[] = getActiveCreators(ALL_CREATORS);
