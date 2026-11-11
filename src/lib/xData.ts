import { useEffect, useState, useCallback } from 'react';

export interface XProfile {
  id: string;
  handle: string;
  name: string;
  bio: string;
  avatar: string | null;
  banner: string | null;
  followers: number;
  following: number;
  posts: number;
  verified: boolean;
  verifiedType: string | null;
  url: string;
  location: string | null;
  tweets?: XTweet[];
}

export interface XTweet {
  id: string;
  text: string;
  createdAt: string;
  metrics: {
    retweet_count?: number;
    reply_count?: number;
    like_count?: number;
    quote_count?: number;
    impression_count?: number;
  };
  media: { url: string; type: string; width?: number; height?: number }[];
  isRetweet: boolean;
  isReply: boolean;
}

const TTL_MS = 15 * 60 * 1000; // 15 min live cache
const version = 3;
let xUnavailable = false;

function cacheKey(handle: string) { return `x_profile_v${version}_${handle}`; }

function getCached(handle: string): XProfile | null {
  try {
    const raw = localStorage.getItem(cacheKey(handle));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.__cachedAt || 0) > TTL_MS) return null;
    return parsed;
  } catch { return null; }
}

function setCached(handle: string, data: XProfile) {
  try {
    localStorage.setItem(cacheKey(handle), JSON.stringify({ ...data, __cachedAt: Date.now() }));
  } catch { /* ignore */ }
}

export async function fetchXProfile(handle: string, includeTweets = true): Promise<XProfile | null> {
  if (xUnavailable) return null;
  const cached = getCached(handle);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/x?handle=${encodeURIComponent(handle)}&tweets=${includeTweets}`);
    if (!res.ok) {
      xUnavailable = true;
      return null;
    }
    const data = await res.json();
    if (data?.unavailable || !data?.handle) {
      xUnavailable = true;
      return null;
    }
    setCached(handle, data);
    return data;
  } catch {
    xUnavailable = true;
    return null;
  }
}

export function useXProfile(handle: string, includeTweets = true) {
  const [profile, setProfile] = useState<XProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromFallback, setFromFallback] = useState(false);

  const load = useCallback(async () => {
    if (!handle) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setFromFallback(false);

    const data = await fetchXProfile(handle, includeTweets);
    if (data) {
      setProfile(data);
      setFromFallback(false);
    } else {
      setProfile(null);
      setError(null);
    }
    setLoading(false);
  }, [handle, includeTweets]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => {
    // Clear cache and reload
    try { localStorage.removeItem(cacheKey(handle)); } catch {}
    load();
  }, [handle, load]);

  return { profile, loading, error, fromFallback, refresh };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export function clearXCache(handle?: string) {
  try {
    if (handle) {
      localStorage.removeItem(cacheKey(handle));
    } else {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(`x_profile_v${version}_`))
        .forEach((k) => localStorage.removeItem(k));
    }
  } catch { /* ignore */ }
}
