import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Eye, Copy, Check, ArrowRight, Info, X } from 'lucide-react';
import type { CreatorProfile } from '../types';
import '../styles/flow.css';

interface PlaybookFlowProps {
  creators: CreatorProfile[];
  onOpenCreator: (creator: CreatorProfile) => void;
}

interface MockPost {
  creatorId: string;
  draft: string;
  likes: string;
  reposts: string;
  replies: string;
  views: string;
}

export function PlaybookFlow({ creators, onOpenCreator }: PlaybookFlowProps) {
  const [activeState, setActiveState] = useState<string>('final-post');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(true);

  // Map of mock posts based on the creators' real playbooks in creators.ts
  const mockPosts: Record<string, MockPost> = {
    maya: {
      creatorId: 'maya',
      draft: 'Build in public is not about showing perfect launches. It is about sharing your messy progress, screenshots of bugs, and raw numbers. Trust compounds when you are honest about the journey. 🛠️🐼 #buildinpublic',
      likes: '342',
      reposts: '45',
      replies: '18',
      views: '8.4K'
    },
    kp: {
      creatorId: 'kp',
      draft: 'Twitter DMs are the real LinkedIn. If you want to grow, stop shipping in a silo. Vibe code live, post updates daily, and co-create with other builders. Community is your distribution. 📡⚡ #netlify #aishippers',
      likes: '1.2K',
      reposts: '184',
      replies: '72',
      views: '42K'
    },
    gerrit: {
      creatorId: 'gerrit',
      draft: 'Why solo devs should ship a portfolio of small tools rather than one big startup. Astro + Tailwind + Netlify = 100/100 page speed, zero server maintenance, and passive SEO traffic. 🍌🎨 #solodev #seo',
      likes: '154',
      reposts: '22',
      replies: '12',
      views: '4.2K'
    },
    lynnzeng: {
      creatorId: 'lynnzeng',
      draft: 'Surreal brand remixes with AI generate 10x more discussion than generic graphics. Share the exact prompt, turn stills into 15s films, and sell the dream. 🎨🎬 #aishippers #midjourney',
      likes: '488',
      reposts: '76',
      replies: '34',
      views: '12.4K'
    },
    jaibhagat: {
      creatorId: 'jaibhagat',
      draft: "Engineers need to build personal brands. Stop hiding behind your IDE. Host live shows, show your AI dev-tool workflow, and share your students' wins. Wellness is your superpower. 🧘🌟 #devrel",
      likes: '230',
      reposts: '31',
      replies: '15',
      views: '6.8K'
    },
    nealfrazier: {
      creatorId: 'nealfrazier',
      draft: 'Redesign your booking funnel. If a visitor cannot book a service in 90 seconds, you are losing cash. Run 30-day sprints, offer clear pricing, and dominate local SEO. 🎯⏱️ #marketing',
      likes: '112',
      reposts: '14',
      replies: '8',
      views: '2.9K'
    },
    ash_wesley_: {
      creatorId: 'ash_wesley_',
      draft: 'Building AI tools on Netlify in public is the fastest way to get noticed. Join a cohort, share your tool stack, and host local builder meetups. Amplifying others amplifies you. 🔊🚀 #aishippers',
      likes: '96',
      reposts: '12',
      replies: '6',
      views: '1.8K'
    }
  };

  // Sync activeState if selected creator gets filtered out
  useEffect(() => {
    const ids = creators.map(c => c.id);
    if (activeState !== 'final-post' && !ids.includes(activeState)) {
      setActiveState('final-post');
    }
  }, [creators, activeState]);

  // ── DYNAMIC LAYOUT CALCULATION ──────────────────────────────
  const N = creators.length;
  const center = { x: 500, y: 310 };
  const rx = N <= 1 ? 0 : 360;
  const ry = N <= 1 ? 0 : 210;

  const coreCreators = creators.map((cr, idx) => {
    // Start at top (-90 degrees) and space evenly
    const angle = N <= 1 ? 0 : (idx / N) * 2 * Math.PI - Math.PI / 2;
    const x = center.x + rx * Math.cos(angle);
    const y = center.y + ry * Math.sin(angle);

    const post = mockPosts[cr.id] || {
      creatorId: cr.id,
      draft: cr.hooks?.[0] || (cr.plays?.[0] ? cr.plays[0].description : cr.bio),
      likes: String(Math.floor(cr.followers * 0.004) + 10),
      reposts: String(Math.floor(cr.followers * 0.0006) + 1),
      replies: String(Math.floor(cr.followers * 0.0003) + 1),
      views: cr.followers > 1000 ? `${(cr.followers * 0.12 / 1000).toFixed(1)}K` : String(Math.floor(cr.followers * 0.12))
    };

    return {
      id: cr.id,
      defaultName: cr.name,
      xPos: `${(x / 1000) * 100}%`,
      yPos: `${(y / 650) * 100}%`,
      vX: x,
      vY: y,
      profile: cr,
      post,
      isSecondary: false
    };
  });

  // ── DYNAMIC CONNECTIONS CALCULATION ─────────────────────────
  const connections: { id: string; from: string; to: string; path: string; color: string; gradientId: string }[] = [];
  if (N > 1) {
    for (let i = 0; i < N; i++) {
      const nextIdx = (i + 1) % N;
      const fromNode = coreCreators[i];
      const toNode = coreCreators[nextIdx];

      // Draw curved bezier path
      const mx = (fromNode.vX + toNode.vX) / 2;
      const my = (fromNode.vY + toNode.vY) / 2;
      const dx = toNode.vX - fromNode.vX;
      const dy = toNode.vY - fromNode.vY;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = len > 0 ? -dy / len : 0;
      const ny = len > 0 ? dx / len : 0;
      const offset = 40; // curve strength
      const cx = mx + nx * offset;
      const cy = my + ny * offset;

      connections.push({
        id: `${fromNode.id}-${toNode.id}`,
        from: fromNode.id,
        to: toNode.id,
        path: `M ${fromNode.vX} ${fromNode.vY} Q ${cx} ${cy} ${toNode.vX} ${toNode.vY}`,
        color: fromNode.profile.theme.primary,
        gradientId: `grad-${fromNode.id}-${toNode.id}`
      });

      // Add cross link web connection for larger circles
      if (N > 3) {
        const crossIdx = (i + 2) % N;
        const crossNode = coreCreators[crossIdx];
        connections.push({
          id: `${fromNode.id}-${crossNode.id}`,
          from: fromNode.id,
          to: crossNode.id,
          path: `M ${fromNode.vX} ${fromNode.vY} L ${crossNode.vX} ${crossNode.vY}`,
          color: fromNode.profile.theme.accent || '#8b5cf6',
          gradientId: `grad-${fromNode.id}-${crossNode.id}`
        });
      }
    }
  }

  const handleCopyDraft = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPillClass = (id: string) => {
    if (id === 'final-post') {
      return activeState === 'final-post' ? 'flow-nav-pill special-pill active' : 'flow-nav-pill special-pill';
    }
    return activeState === id ? 'flow-nav-pill active' : 'flow-nav-pill';
  };

  const isCreatorActive = (creatorId: string) => {
    if (activeState === 'final-post') return true;
    return activeState === creatorId;
  };

  const isCreatorInactive = (creatorId: string) => {
    if (activeState === 'final-post') return false;
    return activeState !== creatorId;
  };

  const getConnectionOpacity = (conn: typeof connections[0]) => {
    if (activeState === 'final-post') return 0.75;
    if (activeState === conn.from || activeState === conn.to) return 1;
    return 0.15;
  };

  const getConnectionStrokeWidth = (conn: typeof connections[0]) => {
    if (activeState === 'final-post') return 2.5;
    if (activeState === conn.from || activeState === conn.to) return 4;
    return 1.5;
  };

  return (
    <div className="flow-container">
      {/* Background effects */}
      <div className="flow-background-grid" />
      <div className="flow-glow-orb flow-glow-orb-pink" />
      <div className="flow-glow-orb flow-glow-orb-cyan" />

      {/* Dynamic Info Overlay */}
      {showInfo && (
        <div className="flow-info-overlay">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="flow-info-title">
              <Info size={16} style={{ color: 'var(--accent)' }} />
              Interactive Playbook Network Flow
            </div>
            <div className="flow-info-text">
              This graph displays how content ideas and repeatable playbooks inspire and flow between creators in the shipping community. Click a creator's card to trace their connections, view their post draft, or open their full growth playbook.
            </div>
          </div>
          <button className="flow-info-close" onClick={() => setShowInfo(false)} aria-label="Close message">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main flow board */}
      <div className="flow-canvas">
        {creators.length === 0 ? (
          <div style={{ display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#7c7c8d', gap: '12px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>No mentors found</div>
            <div style={{ fontSize: '0.9rem' }}>Try clearing or adjusting your search filters on the Mentors tab.</div>
          </div>
        ) : (
          <>
            {/* SVG connection lines layer */}
            <svg className="flow-connections-svg" viewBox="0 0 1000 650" fill="none">
              <defs>
                <filter id="svg-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                {connections.map(conn => (
                  <linearGradient key={conn.id} id={conn.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={conn.color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={conn.color === '#a6a6b2' ? '#ec4899' : '#8b5cf6'} stopOpacity="0.8" />
                  </linearGradient>
                ))}
              </defs>

              {connections.map(conn => {
                const opacity = getConnectionOpacity(conn);
                const strokeWidth = getConnectionStrokeWidth(conn);
                const isHighlighted = activeState !== 'final-post' && (activeState === conn.from || activeState === conn.to);
                
                return (
                  <g key={conn.id} style={{ transition: 'opacity 0.4s ease' }}>
                    {isHighlighted && (
                      <path
                        d={conn.path}
                        stroke={`url(#${conn.gradientId})`}
                        strokeWidth={strokeWidth + 4}
                        opacity="0.3"
                        filter="url(#svg-neon-glow)"
                        className="flow-connection-path"
                      />
                    )}

                    <path
                      d={conn.path}
                      stroke={`url(#${conn.gradientId})`}
                      strokeWidth={strokeWidth}
                      opacity={opacity}
                      className="flow-connection-path"
                    />

                    <path
                      d={conn.path}
                      stroke={conn.color === '#a6a6b2' ? '#22d3ee' : '#ffffff'}
                      strokeWidth={strokeWidth * 0.8}
                      opacity={opacity * 0.85}
                      className="flow-connection-path flow-connection-glow"
                      filter={isHighlighted ? "url(#svg-neon-glow)" : undefined}
                    />

                    {isHighlighted && (
                      <circle r="4" fill="#ffffff" className="flow-sparkle">
                        <animateMotion dur="2.5s" repeatCount="indefinite" path={conn.path} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Creator hex cards positioned absolute */}
            {coreCreators.map(node => {
              const initials = node.profile?.name ? node.profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : node.defaultName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
              const avatar = node.profile?.avatar;
              const name = node.profile?.name || node.defaultName;
              const handle = node.profile?.handle || `@${node.id}`;
              const isActive = isCreatorActive(node.id);
              const isInactive = isCreatorInactive(node.id);
              const themeColor = node.profile?.theme.primary || '#ec4899';
              
              return (
                <div
                  key={node.id}
                  className={`hex-card-wrapper ${node.isSecondary ? 'secondary-node' : ''} ${isActive ? 'active' : ''} ${isInactive ? 'inactive' : ''}`}
                  style={{
                    left: node.xPos,
                    top: node.yPos,
                    '--card-stroke-active': themeColor,
                    '--capsule-bg': `${themeColor}04`,
                    '--capsule-border': `${themeColor}1a`,
                    '--capsule-bg-active': `${themeColor}09`,
                    '--capsule-border-active': `${themeColor}33`,
                  } as React.CSSProperties}
                  onClick={() => setActiveState(node.id)}
                >
                  {/* Flat-topped rounded hexagon SVG Background */}
                  <svg className="hex-card-svg-bg" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id={`grad-card-${node.id}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgba(18, 18, 28, 0.72)" />
                        <stop offset="100%" stopColor="rgba(8, 8, 12, 0.55)" />
                      </linearGradient>
                    </defs>
                    <path
                      className="hex-card-bg-path"
                      d="M 80 10 L 240 10 Q 255 10, 262 22 L 310 110 Q 318 120, 310 130 L 262 218 Q 255 230, 240 230 L 80 230 Q 65 230, 58 218 L 10 130 Q 2 120, 10 110 L 58 22 Q 65 10, 80 10 Z"
                      fill={`url(#grad-card-${node.id})`}
                      stroke={isActive ? themeColor : "rgba(255,255,255,0.06)"}
                      strokeWidth={isActive ? "2" : "1.2"}
                    />
                  </svg>

                  {/* Card Content HTML overlay */}
                  <div className="hex-card-content">
                    <div className="hex-card-header">
                      <div className="hex-card-avatar-wrapper">
                        {avatar ? (
                          <img src={avatar} alt={name} className="hex-card-avatar" />
                        ) : (
                          <div className="hex-card-avatar-fallback" style={{ background: `linear-gradient(135deg, ${themeColor}, #8b5cf6)` }}>
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="hex-card-info">
                        <h3 className="hex-card-name">{name}</h3>
                        <span className="hex-card-handle">{handle}</span>
                      </div>
                    </div>

                    <div className="hex-card-post-capsule">
                      {node.post.draft}
                    </div>

                     <div className="hex-card-footer">
                       <div className="hex-card-actions">
                         <button className="hex-card-action-btn btn-replies" title="Replies">
                           <MessageCircle size={13} />
                           <span>{node.post.replies}</span>
                         </button>
                         <button className="hex-card-action-btn btn-reposts" title="Reposts">
                           <Repeat2 size={13} />
                           <span>{node.post.reposts}</span>
                         </button>
                         <button className="hex-card-action-btn btn-likes" title="Likes">
                           <Heart size={13} />
                           <span>{node.post.likes}</span>
                         </button>
                         {!node.isSecondary && (
                           <button className="hex-card-action-btn btn-views" title="Views">
                             <Eye size={13} />
                             <span>{node.post.views}</span>
                           </button>
                         )}
                       </div>
                       
                       {node.profile ? (
                         <button
                           className="hex-card-details-trigger"
                           style={{
                             '--accent-tint': `${themeColor}15`,
                             '--accent-border': `${themeColor}33`,
                             '--accent-hover': themeColor
                           } as React.CSSProperties}
                           onClick={(e) => {
                             e.stopPropagation();
                             onOpenCreator(node.profile!);
                           }}
                         >
                           <span>Playbook</span>
                           <ArrowRight size={11} />
                         </button>
                       ) : (
                         <button
                           className="hex-card-action-btn"
                           onClick={(e) => {
                             e.stopPropagation();
                             handleCopyDraft(node.post.draft, node.id);
                           }}
                           title="Copy draft post"
                         >
                           {copiedId === node.id ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                         </button>
                       )}
                     </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom control pill bar */}
      {creators.length > 0 && (
        <div className="flow-bottom-bar">
          <button
            className={getPillClass('final-post')}
            onClick={() => setActiveState('final-post')}
          >
            Final X Post
          </button>
          {coreCreators.map(c => (
            <button
              key={c.id}
              className={getPillClass(c.id)}
              onClick={() => setActiveState(c.id)}
            >
              {c.profile?.name.split(' ')[0] || c.defaultName.split(' ')[0]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
