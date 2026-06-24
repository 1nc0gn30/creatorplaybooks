import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../lib/auth';
import type {  } from '../types';
export function LoginGate({ message, cta }: { message: string; cta: string }) {
  const { login } = useAuth();
  return (
    <div className="page login-gate-page">
      <div className="login-gate">
        <div className="login-gate-icon"><Lock size={32} /></div>
        <h2>Members only</h2>
        <p>{message}</p>
        <button className="btn btn-hot btn-lg" onClick={login}><LogIn size={18} /> {cta}</button>
      </div>
    </div>
  );
}
