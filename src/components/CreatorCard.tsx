import { useState } from 'react';
import type { CreatorProfile } from '../types';
export function CreatorCard({ creator, active, onClick }: { creator: CreatorProfile; active: boolean; onClick: () => void }) {
  const initials = creator.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      className={`creator-card-clean ${active ? 'active' : ''}`} 
      onClick={onClick} 
      title={`Open ${creator.name}'s playbook`}
      style={{
        '--card-primary': creator.theme.primary,
        '--card-secondary': creator.theme.secondary,
        '--card-accent': creator.theme.accent,
      } as React.CSSProperties}
    >
      <div className="creator-card-clean-banner" style={{ backgroundImage: creator.banner ? `url(${creator.banner})` : undefined }}>
        {!creator.banner && <div className="creator-card-clean-banner-fallback" style={{ background: `linear-gradient(135deg, var(--card-primary) 40%, var(--card-accent) 40%)` }} />}
      </div>
      {imgError || !creator.avatar ? (
        <div className="creator-card-clean-avatar avatar-fallback" style={{ background: `linear-gradient(135deg, var(--card-primary), var(--card-accent))` }}>
          {initials}
        </div>
      ) : (
        <img src={creator.avatar} alt={creator.name} className="creator-card-clean-avatar" loading="lazy" onError={() => setImgError(true)} />
      )}
      <div className="creator-card-clean-body">
        <div className="creator-card-clean-top">
          <div className="creator-card-clean-title">
            <h3 className="creator-card-clean-name">{creator.name}</h3>
            <span className="creator-card-clean-handle">{creator.handle}</span>
          </div>
          <span className={`status-badge status-${creator.status}`} style={{ background: `rgba(34, 197, 94, 0.15)`, color: `#4ade80`, borderColor: `rgba(74, 222, 128, 0.2)` }}>{creator.status}</span>
        </div>
        <p className="creator-card-clean-bio">{creator.bio.split('\n')[0]}</p>
        <div className="creator-card-clean-tags">
          {creator.tags.slice(0, 3).map((t) => <span key={t} className="tag-chip">{t}</span>)}
          {creator.tags.length > 3 && <span className="tag-chip tag-more" style={{ background: `rgba(236,72,153,0.1)`, borderColor: `rgba(236,72,153,0.25)`, color: `var(--primary)` }}>+{creator.tags.length - 3}</span>}
        </div>
        <div className="creator-card-clean-stats">
          <span><strong>{creator.followersStr}</strong> followers</span>
          <span><strong>{creator.products.length}</strong> products</span>
          <span><strong>{creator.plays.length}</strong> plays</span>
        </div>
      </div>
    </div>
  );
}
