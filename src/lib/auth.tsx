import { useEffect, useState, type ReactNode, useCallback } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import type { MemberProfile } from './member-types';
import { normalize, fetchMemberMe, saveMemberMe, fetchVotes } from './member-api';
import { AuthContext, type AuthUser } from './auth-context';

export type { AuthUser };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [votes, setVotes] = useState<Record<string, any>>({});
  const [isReady, setIsReady] = useState(false);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchMemberMe();
      setProfile(data);
      const allVotes = await fetchVotes();
      setVotes(allVotes);
    } catch (err) {
      console.error('Failed to load member profile', err);
    }
  }, [user]);

  const updateProfile = useCallback(async (patch: Partial<MemberProfile>) => {
    const next = await saveMemberMe(patch);
    setProfile(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const markReady = (current: ReturnType<typeof netlifyIdentity.currentUser> | null) => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        if (current) {
          setUser(normalize(current));
          fetchMemberMe().then((next) => { if (!cancelled) setProfile(next); }).catch(() => {});
          fetchVotes().then((next) => { if (!cancelled) setVotes(next); }).catch(() => {});
        }
        setIsReady(true);
      }, 0);
    };

    try {
      netlifyIdentity.init({
        container: '#netlify-identity-modal',
        locale: 'en',
      });
      markReady(netlifyIdentity.currentUser());

      netlifyIdentity.on('login', (u: any) => {
        const nu = normalize(u);
        setUser(nu);
        fetchMemberMe().then(setProfile).catch(() => {});
        fetchVotes().then(setVotes).catch(() => {});
        netlifyIdentity.close();
      });
      netlifyIdentity.on('logout', () => {
        setUser(null);
        setProfile(null);
        setVotes({});
      });
    } catch {
      markReady(null);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      try {
        netlifyIdentity.off('login');
        netlifyIdentity.off('logout');
      } catch {
        /* identity never started */
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isReady,
        login: () => netlifyIdentity.open('login'),
        logout: () => netlifyIdentity.logout(),
        openInvite: () => netlifyIdentity.open('signup'),
        refreshProfile,
        updateProfile,
        votes,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
