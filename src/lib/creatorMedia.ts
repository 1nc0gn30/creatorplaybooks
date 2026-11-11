import { useEffect, useState, useCallback } from 'react';
import type { CreatorProfile } from '../types';

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const version = 1;

export interface CreatorMediaState {
  media: string[];
  posts: { text: string; url?: string; createdAt?: string }[];
  avatar: string;
  banner: string;
  lastUpdated: number;
  source: 'bundled' | 'cached' | 'fetched';
}

function cacheKey(id: string) {
  return `cp_media_v${version}_${id}`;
}

export function getCachedCreatorMedia(id: string): CreatorMediaState | null {
  try {
    const raw = localStorage.getItem(cacheKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CreatorMediaState;
    if (Date.now() - parsed.lastUpdated > TTL_MS) return null;
    return { ...parsed, source: 'cached' };
  } catch {
    return null;
  }
}

function setCachedCreatorMedia(id: string, state: CreatorMediaState) {
  try {
    localStorage.setItem(cacheKey(id), JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function bundledMediaFor(creator: CreatorProfile): CreatorMediaState {
  return {
    media: creator.media,
    posts: [],
    avatar: creator.avatar,
    banner: creator.banner,
    lastUpdated: Date.now(),
    source: 'bundled',
  };
}

export async function refreshCreatorMedia(creator: CreatorProfile): Promise<CreatorMediaState> {
  const cached = getCachedCreatorMedia(creator.id);
  if (cached) return cached;
  const bundled = bundledMediaFor(creator);
  setCachedCreatorMedia(creator.id, bundled);
  return bundled;
}

export function clearCreatorMediaCache(id?: string) {
  try {
    if (id) {
      localStorage.removeItem(cacheKey(id));
    } else {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`cp_media_v${version}_`))
        .forEach((k) => localStorage.removeItem(k));
    }
  } catch {
    /* ignore */
  }
}

export function useCreatorMedia(creator: CreatorProfile) {
  const [state, setState] = useState<CreatorMediaState>(() => {
    const cached = getCachedCreatorMedia(creator.id);
    return cached ?? bundledMediaFor(creator);
  });
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await refreshCreatorMedia(creator);
      setState(next);
    } finally {
      setRefreshing(false);
    }
  }, [creator]);

  useEffect(() => {
    let mounted = true;
    refreshCreatorMedia(creator).then((next) => {
      if (mounted) setState(next);
    });
    return () => { mounted = false; };
  }, [creator.id]);

  return { ...state, refresh, refreshing };
}
