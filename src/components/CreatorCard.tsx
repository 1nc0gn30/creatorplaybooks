import { useState, useRef, useEffect } from 'react';
import type { CreatorProfile } from '../types';
import { HologramCanvas } from './HologramCanvas';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : '236, 72, 153';
}

function renderLivePreview(creatorId: string) {
  switch (creatorId) {
    case 'maya':
      return (
        <div className="mini-preview-ideapanda">
          <div className="mini-search-bar">🐼 search startup ideas...</div>
          <div className="mini-tag-row">
            <span className="mini-tag active">#SaaS</span>
            <span className="mini-tag">#AI</span>
            <span className="mini-tag">#NoCode</span>
          </div>
        </div>
      );
    case 'kp':
      return (
        <div className="mini-preview-aishippers">
          <div className="mini-badge-row">
            <span className="mini-cohort-badge">AI SHIPPERS</span>
            <span className="mini-live-pulse" />
          </div>
          <div className="mini-member-avatars">
            <div className="mini-avatar-c" style={{ background: '#ec4899' }}>M</div>
            <div className="mini-avatar-c" style={{ background: '#22d3ee' }}>K</div>
            <div className="mini-avatar-c" style={{ background: '#8b5cf6' }}>J</div>
            <span className="mini-cohort-count">+48 shippin'</span>
          </div>
        </div>
      );
    case 'gerrit':
      return (
        <div className="mini-preview-icons">
          <div className="mini-icon-grid">
            <div className="mini-icon-box">✦</div>
            <div className="mini-icon-box">⚡</div>
            <div className="mini-icon-box">📦</div>
            <div className="mini-icon-box">⚙️</div>
          </div>
          <span className="mini-preview-sub">Majesticons v2.4</span>
        </div>
      );
    case 'lynnzeng':
      return (
        <div className="mini-preview-picaisso">
          <div className="mini-prompt-box">/imagine cyberpunk panda...</div>
          <div className="mini-generate-btn">Render 3D</div>
        </div>
      );
    case 'jaibhagat':
      return (
        <div className="mini-preview-workshop">
          <div className="mini-console-line">$ run devrel-stream --live</div>
          <div className="mini-sound-wave">
            <span className="wave-bar" />
            <span className="wave-bar" />
            <span className="wave-bar" />
            <span className="wave-bar" />
            <span className="wave-bar" />
          </div>
        </div>
      );
    case 'nealfrazier':
      return (
        <div className="mini-preview-booking">
          <div className="mini-booking-btn">Book 90s Sprint ⏱️</div>
          <span className="mini-booking-desc">1 slot left this week</span>
        </div>
      );
    case 'ash_wesley_':
      return (
        <div className="mini-preview-aishippers">
          <div className="mini-cohort-badge">AI AMPLIFIED</div>
          <span className="mini-preview-sub">3 meetups organized</span>
        </div>
      );
    default:
      return (
        <div className="mini-preview-default">
          <div className="mini-code-line">npm run build</div>
          <div className="mini-code-line text-success">✓ template ready</div>
        </div>
      );
  }
}

export function CreatorCard({ creator, active, onClick, style, onHoverChange }: { creator: CreatorProfile; active: boolean; onClick: () => void; style?: React.CSSProperties; onHoverChange?: (hovered: boolean) => void }) {
  const initials = creator.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const [imgError, setImgError] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Periodic random holographic glitch scheduler
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const triggerGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200 + Math.random() * 200);
      
      const nextTime = 4000 + Math.random() * 8000; // 4-12 seconds
      timer = setTimeout(triggerGlitch, nextTime);
    };

    timer = setTimeout(triggerGlitch, 3000 + Math.random() * 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates (-0.5 to 0.5)
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;
    
    // Limit rotations to max 14 degrees
    const rotateX = -normY * 14;
    const rotateY = normX * 14;
    
    card.style.setProperty('--rx', `${rotateX}deg`);
    card.style.setProperty('--ry', `${rotateY}deg`);
    card.style.setProperty('--px', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--py', `${(y / rect.height) * 100}%`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHoverChange) {
      onHoverChange(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverChange) {
      onHoverChange(false);
    }
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--px', '50%');
    card.style.setProperty('--py', '50%');
  };

  const previewUrl = creator.products[0]?.url
    ? creator.products[0].url.replace('https://', '').replace('www.', '')
    : 'template.dev';

  return (
    <div 
      ref={cardRef}
      className={`hexagon-wrapper ${active ? 'wrapper-active' : ''}`}
      style={{
        '--card-primary': creator.theme.primary,
        '--card-primary-rgb': hexToRgb(creator.theme.primary),
        '--card-secondary': creator.theme.secondary || creator.theme.primary,
        '--card-accent': creator.theme.accent || creator.theme.primary,
        ...style
      } as React.CSSProperties}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={`creator-card-clean ${active ? 'active' : ''} ${glitchActive ? 'hologram-glitch-active' : ''}`} 
        title={`Open ${creator.name}'s playbook`}
      >
        {/* Verified Badge in top-right corner */}
        {creator.status === 'verified' && (
          <div className="creator-card-verified-badge" title="Verified Creator Playbook">
            <svg className="verified-badge-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        )}

        {/* Holographic 3D Three.js Container */}
        <div className="hologram-banner-container">
          <div className="hologram-blueprint" />
          <div className="hologram-scanline" />
          <div className="hologram-overlay" />
          <div className="hologram-glitch-overlay" />
          {isHovered && (
            <HologramCanvas 
              creatorId={creator.id}
              primaryColor={creator.theme.primary}
              secondaryColor={creator.theme.secondary || creator.theme.primary}
              accentColor={creator.theme.accent || creator.theme.primary}
            />
          )}
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
          </div>
          
          <p className="creator-card-clean-bio">{creator.bio.split('\n')[0]}</p>

          {/* Secondary Live Preview Window */}
          <div className="creator-card-preview-window">
            <div className="preview-window-header">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
              <span className="preview-window-url">{previewUrl}</span>
            </div>
            <div className="preview-window-body">
              {renderLivePreview(creator.id)}
            </div>
          </div>

          <div className="creator-card-clean-tags">
            {creator.tags.slice(0, 2).map((t) => <span key={t} className="tag-chip">{t}</span>)}
            {creator.tags.length > 2 && <span className="tag-chip tag-more" style={{ background: `rgba(236,72,153,0.1)`, borderColor: `rgba(236,72,153,0.25)`, color: `var(--primary)` }}>+{creator.tags.length - 2}</span>}
          </div>

          <div className="creator-card-clean-stats">
            <span><strong>{creator.followersStr}</strong> followers</span>
            <span><strong>{creator.products.length}</strong> products</span>
          </div>
        </div>
      </div>
    </div>
  );
}

