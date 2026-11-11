import { Lock, LogIn, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { useAuth } from '../lib/auth';

export function LoginGate({ message, cta }: { message: string; cta: string }) {
  const { login } = useAuth();
  return (
    <div className="page login-gate-page">
      <div className="login-gate">
        <div className="login-gate-icon"><Lock size={32} /></div>
        <div className="login-gate-badge">
          <span className="pulse-dot" />
          Members Only
        </div>
        <h2>This page needs an account</h2>
        <p>{message}</p>

        <div className="login-gate-perks">
          <div className="login-gate-perk">
            <div className="login-gate-perk-icon pink"><TrendingUp size={16} /></div>
            <div>
              <strong>A simple log</strong>
              <span>Posts this week, a streak, and a score from those counts</span>
            </div>
          </div>
          <div className="login-gate-perk">
            <div className="login-gate-perk-icon cyan"><Zap size={16} /></div>
            <div>
              <strong>Schedule content</strong>
              <span>Draft posts for the week and log what you ship</span>
            </div>
          </div>
          <div className="login-gate-perk">
            <div className="login-gate-perk-icon purple"><Users size={16} /></div>
            <div>
              <strong>Votes</strong>
              <span>Mark a playbook helpful, or flag a fact that looks wrong</span>
            </div>
          </div>
          <div className="login-gate-perk">
            <div className="login-gate-perk-icon amber"><Sparkles size={16} /></div>
            <div>
              <strong>Your name and links</strong>
              <span>A profile, larger type, and higher contrast if you want them</span>
            </div>
          </div>
        </div>

        <button className="btn btn-hot btn-lg" onClick={login}>
          <LogIn size={18} /> {cta}
        </button>

        <div className="login-gate-hint">
          <span className="pulse-dot" />
          Sign in with email or GitHub. The mentor pages stay public.
        </div>
      </div>
    </div>
  );
}