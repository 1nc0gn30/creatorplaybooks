import { X, ArrowRight } from 'lucide-react';
import type {  } from '../types';
export function OriginStoryModal({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="story-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close}><X size={20} /></button>
        <div className="story-badge">Origin story</div>
        <h2 className="story-title">CreatorPlaybooks started as one question:</h2>
        <p className="story-body">Why do some indie hackers grow an audience while others ship silently?</p>
        <p className="story-body">We studied builders like <strong>Maya</strong> who ship in public, share playbooks, and turn followers into users. Then we turned those patterns into an agent-ready library of repeatable growth plays.</p>
        <p className="story-body">Pick a mentor. Copy their playbook. Adapt it to your project. Repeat.</p>
        <button className="btn btn-hot btn-lg" onClick={close}><ArrowRight size={18} /> I understand — let's go</button>
      </div>
    </div>
  );
}
