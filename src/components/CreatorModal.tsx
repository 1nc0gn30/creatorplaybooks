import { useState } from 'react';
import { X, Copy, Bot, FolderOpen, Share2, ExternalLink } from 'lucide-react';
import type { CreatorProfile } from '../types';
export function CreatorModal({ creator, onClose, onCopyPlaybook, onCopyAgent, onInstallAgent }: { creator: CreatorProfile; onClose: () => void; onCopyPlaybook: () => void; onCopyAgent: () => void; onInstallAgent: () => void }) {
  const xUrl = `https://x.com/${creator.handle.replace('@', '')}`;
  const [copied, setCopied] = useState<string | null>(null);
  const trigger = (fn: () => void, key: string) => { fn(); setCopied(key); setTimeout(() => setCopied(null), 2000); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="creator-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <div className="creator-modal-hero" style={{ background: `linear-gradient(135deg, ${creator.theme.primary}40, ${creator.theme.accent}40)` }}>
          <div className="creator-modal-avatar" style={{ background: `linear-gradient(135deg, ${creator.theme.primary}, ${creator.theme.accent})` }}>{creator.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div className="creator-modal-title">
            <h2>{creator.name}</h2>
            <span>{creator.handle}</span>
          </div>
        </div>
        <div className="creator-modal-body">
          <p className="creator-modal-bio">{creator.bio}</p>
          <div className="creator-modal-pills">
            {creator.pillars.slice(0, 3).map((p, i) => <span key={i} className="insight-pill">{p}</span>)}
          </div>
          <div className="creator-modal-products">
            <h3>Products</h3>
            {creator.products.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="creator-modal-product">
                <span className="creator-modal-product-name">{p.name}</span>
                <span className="creator-modal-product-desc">{p.description}</span>
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
          <div className="creator-modal-plays">
            <h3>Repeatable plays</h3>
            {creator.plays.map((p) => (
              <div key={p.id} className="play-row">
                <span className="play-emoji">{p.emoji}</span>
                <div className="play-content">
                  <strong>{p.title}</strong>
                  <p>{p.description}</p>
                  <span className="play-action">{p.action}</span>
                </div>
                <span className="play-frequency">{p.frequency}</span>
              </div>
            ))}
          </div>
          <div className="creator-modal-actions">
            <button className="btn btn-hot" onClick={() => trigger(onCopyPlaybook, 'playbook')}><Copy size={14} /> {copied === 'playbook' ? 'Copied!' : 'Copy playbook'}</button>
            <button className="btn btn-secondary" onClick={() => trigger(onCopyAgent, 'agent')}><Bot size={14} /> {copied === 'agent' ? 'Copied!' : 'Copy agent prompt'}</button>
            <button className="btn btn-secondary" onClick={() => trigger(onInstallAgent, 'install')}><FolderOpen size={14} /> {copied === 'install' ? 'Downloaded!' : 'Agent kit (.zip)'}</button>
            <a href={xUrl} target="_blank" rel="noreferrer" className="btn btn-secondary"><Share2 size={14} /> Follow on X</a>
          </div>
        </div>
      </div>
    </div>
  );
}
