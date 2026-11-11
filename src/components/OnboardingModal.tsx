import { X, ArrowRight } from 'lucide-react';
import type { Tab } from '../types';

export function OnboardingModal({ step, setStep, close, setTab }: { step: number; setStep: (n: number) => void; close: () => void; setTab: (t: Tab | 'members') => void }) {
  const steps = [
    { icon: '1', title: 'Pick a mentor', body: 'Open a page. Read the products, the plays, and the sources at the bottom.', cta: 'Next' },
    { icon: '2', title: 'Copy one play', body: 'The hooks are original lines in that person’s cadence. They are not their posts. Rewrite them before you publish.', cta: 'Next' },
    { icon: '3', title: 'Keep a draft', body: 'The dashboard holds text and a day of the week. It does not post to X.', cta: 'Open the log' },
  ];
  const s = steps[step];

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close} title="Skip onboarding"><X size={20} /></button>
        
        {/* Step Indicator Dots */}
        <div className="modal-step">
          {steps.map((_, i) => (
            <span 
              key={i} 
              className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} 
            />
          ))}
        </div>

        {/* Icon */}
        <div className="modal-icon">{s.icon}</div>

        {/* Title & Body */}
        <h2>{s.title}</h2>
        <p className="text-muted" style={{ minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.92rem', margin: '10px 0 20px' }}>
          {s.body}
        </p>

        {/* Actions */}
        <div className="modal-actions" style={{ marginTop: '10px' }}>
          <button 
            className="btn btn-hot btn-lg" 
            onClick={() => { 
              if (step < steps.length - 1) {
                setStep(step + 1); 
              } else { 
                close(); 
                setTab('dashboard'); 
              } 
            }}
          >
            {s.cta} <ArrowRight size={18} />
          </button>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
          <button className="btn-link" onClick={close}>Skip and browse</button>
        </div>
      </div>
    </div>
  );
}
