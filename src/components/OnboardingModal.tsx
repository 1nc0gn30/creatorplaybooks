import { Sparkles, Copy, Zap, ArrowRight } from 'lucide-react';
import type { Tab } from '../types';
export function OnboardingModal({ step, setStep, close, setTab }: { step: number; setStep: (n: number) => void; close: () => void; setTab: (t: Tab | 'members') => void }) {
  const steps = [
    { icon: <Sparkles size={20} />, title: 'Pick a mentor', body: 'Browse real playbooks from creators who have shipped and grown on X.', cta: 'Next' },
    { icon: <Copy size={20} />, title: 'Copy their plays', body: 'Each playbook breaks down into repeatable actions you can run today.', cta: 'Next' },
    { icon: <Zap size={20} />, title: 'Run your first play', body: 'Use the dashboard to schedule posts, track progress, and level up.', cta: 'Open dashboard' },
  ];
  const s = steps[step];
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
        <div className="onboarding-step-icon">{s.icon}</div>
        <h2 className="onboarding-step-title">{s.title}</h2>
        <p className="onboarding-step-body">{s.body}</p>
        <div className="onboarding-dots">
          {steps.map((_, i) => <span key={i} className={i === step ? 'active' : ''} />)}
        </div>
        <button className="btn btn-hot btn-lg" onClick={() => { if (step < steps.length - 1) setStep(step + 1); else { close(); setTab('dashboard'); } }}>{s.cta} <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
