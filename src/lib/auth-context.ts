import { createContext, useContext } from 'react';
import type { MemberProfile } from './member-types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  jwt: (force?: boolean) => Promise<string>;
}

export interface AuthContextValue {
  user: AuthUser | null;
  profile: MemberProfile | null;
  isReady: boolean;
  login: () => void;
  logout: () => void;
  openInvite: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<MemberProfile>) => Promise<void>;
  votes: Record<string, any>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isReady: false,
  login: () => {},
  logout: () => {},
  openInvite: () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
  votes: {},
});

export function useAuth() {
  return useContext(AuthContext);
}
