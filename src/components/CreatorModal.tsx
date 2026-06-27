import { useState } from 'react';
import { X, Copy, Bot, FolderOpen, Share2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { CreatorProfile } from '../types';

export function CreatorModal({ creator, onClose, onCopyPlaybook, onCopyAgent, onInstallAgent }: { creator: CreatorProfile; onClose: () => void; onCopyPlaybook: () => void; onCopyAgent: () => void; onInstallAgent: () => void }) {
  const xUrl = `https://x.com/${creator.handle.replace('@', '')}`;
  const initials = creator.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  
  // State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedPlayId, setExpandedPlayId] = useState<string | null>(creator.plays[0]?.id || null);
  const [swipeTab, setSwipeTab] = useState<'hooks' | 'angles'>('hooks');
  const [apiSnippetTab, setApiSnippetTab] = useState<'js' | 'curl'>('js');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const triggerCopy = (fn: () => void, key: string) => {
    fn();
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const apiFetchSnippet = `// Fetch ${creator.name}'s playbook JSON
fetch('https://creatorplaybooks.netlify.app/api/creator?id=${creator.id}')
  .then(res => res.json())
  .then(playbook => console.log(playbook));`;

  const apiCurlSnippet = `curl https://creatorplaybooks.netlify.app/api/creator?id=${creator.id}`;

  return (
    <div 
      className="modal-backdrop creator-modal-backdrop" 
      onClick={onClose}
      style={{
        '--primary': creator.theme.primary,
        '--secondary': creator.theme.secondary,
        '--accent': creator.theme.accent,
      } as React.CSSProperties}
    >
      <div className="creator-modal" onClick={(e) => e.stopPropagation()} style={{ borderColor: 'rgba(var(--primary), 0.2)' }}>
        <button className="modal-close" onClick={onClose} title="Close modal"><X size={20} /></button>
        
        {/* Banner Section */}
        <div 
          className="creator-modal-hero" 
          style={{ 
            backgroundImage: creator.banner ? `url(${creator.banner})` : undefined, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: !creator.banner ? `linear-gradient(135deg, ${creator.theme.primary}40, ${creator.theme.accent}40)` : undefined
          }}
        >
          {/* Avatar Rendering */}
          {imgError || !creator.avatar ? (
            <div className="creator-modal-avatar" style={{ display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${creator.theme.primary}, ${creator.theme.accent})`, color: '#fff', fontSize: '2.2rem', fontWeight: 800 }}>
              {initials}
            </div>
          ) : (
            <img 
              src={creator.avatar} 
              alt={creator.name} 
              className="creator-modal-avatar" 
              onError={() => setImgError(true)} 
            />
          )}

          <div className="creator-modal-hero-info">
            <div className="creator-modal-name-row">
              <h2 style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{creator.name}</h2>
              <span className={`status-badge status-${creator.status}`}>{creator.status}</span>
            </div>
            <span className="creator-modal-handle" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)', fontWeight: 600 }}>{creator.handle}</span>
          </div>
        </div>

        <div className="creator-modal-body">
          {/* Bio */}
          <p className="creator-modal-bio">{creator.bio}</p>

          {/* Pillars */}
          <div className="creator-modal-tags" style={{ marginBottom: '24px' }}>
            {creator.pillars.slice(0, 4).map((p, i) => (
              <span key={i} className="badge badge-accent" style={{ background: `${creator.theme.primary}15`, color: creator.theme.primary, borderColor: `${creator.theme.primary}30` }}>
                {p.split(' — ')[0]}
              </span>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="creator-modal-stats">
            <div className="stat">
              <span className="value" style={{ color: creator.theme.primary }}>{creator.followersStr}</span>
              <span className="label">Followers</span>
            </div>
            <div className="stat">
              <span className="value" style={{ color: creator.theme.secondary }}>{creator.products.length}</span>
              <span className="label">Products</span>
            </div>
            <div className="stat">
              <span className="value" style={{ color: creator.theme.accent }}>{creator.plays.length}</span>
              <span className="label">Repeatable Plays</span>
            </div>
          </div>

          {/* Milestones Sub-stats */}
          {creator.milestones && creator.milestones.length > 0 && (
            <div className="creator-modal-section">
              <h6 style={{ marginBottom: '10px' }}>Key Milestones</h6>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {creator.milestones.map((m, i) => (
                  <div key={i} style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>{m.label}</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>{m.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div className="creator-modal-section">
            <h3>Products</h3>
            <div className="creator-modal-products" style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
              {creator.products.map((p) => (
                <a key={p.name} href={p.url} target="_blank" rel="noreferrer" className="creator-modal-product" style={{ transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="creator-modal-product-name">{p.name}</span>
                  <span className="creator-modal-product-desc" style={{ flex: 1, paddingRight: '12px' }}>{p.description}</span>
                  <ExternalLink size={14} style={{ color: creator.theme.accent }} />
                </a>
              ))}
            </div>
          </div>

          {/* Interactive Plays Accordion */}
          <div className="creator-modal-section">
            <h3>Repeatable plays</h3>
            <div className="creator-modal-plays" style={{ marginTop: '10px' }}>
              {creator.plays.map((p) => {
                const isExpanded = expandedPlayId === p.id;
                return (
                  <div 
                    key={p.id} 
                    className={`creator-modal-play ${isExpanded ? 'expanded' : ''}`} 
                    onClick={() => setExpandedPlayId(isExpanded ? null : p.id)}
                    style={{ borderColor: isExpanded ? creator.theme.primary : undefined }}
                  >
                    <div className="creator-modal-play-header">
                      <span className="play-emoji">{p.emoji}</span>
                      <strong className="h4" style={{ flex: 1 }}>{p.title}</strong>
                      <span className="play-frequency" style={{ color: creator.theme.accent, background: `${creator.theme.accent}15` }}>{p.frequency}</span>
                      {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--muted)' }} />}
                    </div>
                    {isExpanded && (
                      <div className="creator-modal-play-body" style={{ animation: 'fadeIn 0.25s ease' }}>
                        <p style={{ color: 'var(--ink-muted)', fontSize: '0.94rem', lineHeight: 1.6 }}>{p.description}</p>
                        <div className="play-action-box" style={{ borderLeftColor: creator.theme.primary }}>
                          <span style={{ fontSize: '0.74rem', color: creator.theme.primary, textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>Daily Action Challenge</span>
                          <span className="play-action" style={{ color: 'var(--ink)', fontWeight: 500, fontSize: '0.94rem' }}>{p.action}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Swipe File: Hook Book & Angles */}
          <div className="creator-modal-section">
            <h3>Swipe File</h3>
            <div className="api-tab-bar" style={{ marginTop: '10px' }}>
              <button 
                className={`api-tab ${swipeTab === 'hooks' ? 'active' : ''}`} 
                onClick={() => setSwipeTab('hooks')}
                style={{ background: swipeTab === 'hooks' ? creator.theme.primary : undefined }}
              >
                Hook Book ({creator.hooks.length})
              </button>
              <button 
                className={`api-tab ${swipeTab === 'angles' ? 'active' : ''}`} 
                onClick={() => setSwipeTab('angles')}
                style={{ background: swipeTab === 'angles' ? creator.theme.primary : undefined }}
              >
                Writing Angles ({creator.angles.length})
              </button>
            </div>
            <div className="creator-modal-api" style={{ padding: '12px', background: 'var(--surface-2)' }}>
              {swipeTab === 'hooks' ? (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {creator.hooks.map((hook, i) => (
                    <div 
                      key={i} 
                      className="api-endpoint-row" 
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                      onClick={() => copyText(hook, `hook-${i}`)}
                      title="Click to copy hook example"
                    >
                      <span style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', wordBreak: 'break-word', textAlign: 'left' }}>"{hook}"</span>
                      <span className="badge" style={{ color: copiedKey === `hook-${i}` ? 'var(--success)' : undefined, borderColor: copiedKey === `hook-${i}` ? 'var(--success)' : undefined, fontSize: '0.72rem', flexShrink: 0 }}>
                        {copiedKey === `hook-${i}` ? 'Copied!' : 'Copy'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {creator.angles.map((angle, i) => (
                    <div 
                      key={i} 
                      className="api-endpoint-row" 
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                      onClick={() => copyText(angle, `angle-${i}`)}
                      title="Click to copy angle strategy"
                    >
                      <span style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', wordBreak: 'break-word', textAlign: 'left' }}>{angle}</span>
                      <span className="badge" style={{ color: copiedKey === `angle-${i}` ? 'var(--success)' : undefined, borderColor: copiedKey === `angle-${i}` ? 'var(--success)' : undefined, fontSize: '0.72rem', flexShrink: 0 }}>
                        {copiedKey === `angle-${i}` ? 'Copied!' : 'Copy'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Proof of Work: Media Manifest Images */}
          {creator.media && creator.media.length > 0 && (
            <div className="creator-modal-section">
              <h3>Proof of Work</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--muted)', marginBottom: '10px' }}>Real screenshot artifacts from high-performing posts. Click to enlarge.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                {creator.media.map((imgUrl, i) => (
                  <div 
                    key={i} 
                    className="hover-zoom"
                    style={{ 
                      borderRadius: '12px', 
                      overflow: 'hidden', 
                      border: '1px solid rgba(255,255,255,0.06)', 
                      cursor: 'pointer', 
                      aspectRatio: '16/10',
                      background: 'var(--surface-2)'
                    }}
                    onClick={() => setLightboxImg(imgUrl)}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`${creator.name} Proof of Work ${i + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Developer API Reference Tab */}
          <div className="creator-modal-section">
            <h3>Developer API Playbook</h3>
            <div className="api-tab-bar" style={{ marginTop: '10px' }}>
              <button 
                className={`api-tab ${apiSnippetTab === 'js' ? 'active' : ''}`} 
                onClick={() => setApiSnippetTab('js')}
                style={{ background: apiSnippetTab === 'js' ? creator.theme.secondary : undefined }}
              >
                JavaScript Fetch
              </button>
              <button 
                className={`api-tab ${apiSnippetTab === 'curl' ? 'active' : ''}`} 
                onClick={() => setApiSnippetTab('curl')}
                style={{ background: apiSnippetTab === 'curl' ? creator.theme.secondary : undefined }}
              >
                cURL Command
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <pre className="code-block" style={{ fontSize: '0.8rem', background: 'var(--surface-3)', border: '1px solid rgba(255,255,255,0.08)', paddingRight: '85px', overflowX: 'auto' }}>
                <code>{apiSnippetTab === 'js' ? apiFetchSnippet : apiCurlSnippet}</code>
              </pre>
              <button 
                className="badge badge-accent" 
                style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', fontSize: '0.74rem' }}
                onClick={() => copyText(apiSnippetTab === 'js' ? apiFetchSnippet : apiCurlSnippet, 'api-code')}
              >
                {copiedKey === 'api-code' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="creator-modal-actions" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', marginTop: '24px' }}>
            <button className="btn btn-hot" onClick={() => triggerCopy(onCopyPlaybook, 'playbook')} style={{ background: creator.theme.primary }}>
              <Copy size={14} /> 
              {copiedKey === 'playbook' ? 'Copied!' : 'Copy Playbook MD'}
            </button>
            <button className="btn btn-secondary" onClick={() => triggerCopy(onCopyAgent, 'agent')}>
              <Bot size={14} style={{ color: creator.theme.accent }} /> 
              {copiedKey === 'agent' ? 'Copied!' : 'Copy Agent Prompt'}
            </button>
            <button className="btn btn-secondary" onClick={() => triggerCopy(onInstallAgent, 'install')}>
              <FolderOpen size={14} style={{ color: creator.theme.secondary }} /> 
              {copiedKey === 'install' ? 'Downloaded!' : 'Agent Kit (.zip)'}
            </button>
            <a href={xUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <Share2 size={14} style={{ color: '#1da1f2' }} /> 
              Follow on X
            </a>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Overlay */}
      {lightboxImg && (
        <div className="lightbox-backdrop" onClick={() => setLightboxImg(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxImg(null)} title="Close image"><X size={20} /></button>
            <img src={lightboxImg} alt="Enlarged Proof of Work" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
