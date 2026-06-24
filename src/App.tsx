import { useEffect, useMemo, useState } from 'react';
import { Sparkles, TrendingUp, Users, ArrowRight, RefreshCw, Copy, Calendar, Trash2, Plus, UserCircle, Share2, ExternalLink, Zap, Wand2, Highlighter, Underline, Italic, Bold, LogIn, LogOut, Menu, X, Bot, FolderOpen, BookOpen, Lock, Flame, MessageSquare, Search, SlidersHorizontal, Tag } from 'lucide-react';
import type { BuilderProfile, ContentIdea, GrowthScore, CreatorProfile, ScheduledPost, UserProgress, Tab } from './types';
import { defaultBuilder, defaultProgress, levelFromXp, scoreProgress } from './lib/maya';
import { CREATORS } from './lib/creators';
import { downloadZip } from './lib/export';
import { useAuth } from './lib/auth';
import { MembersView } from './components/MembersView';

const CANONICAL_URL = 'https://hotappsummer-mayagrowth.netlify.app';

function generateIdeasForCreator(creator: CreatorProfile, count = 6): ContentIdea[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${Date.now()}-${i}`,
    format: ['post', 'thread', 'reply', 'quote', 'post', 'thread'][i % 6] as ContentIdea['format'],
    hook: creator.hooks[i % creator.hooks.length],
    angle: creator.angles[i % creator.angles.length],
    tags: [creator.tags[i % creator.tags.length], creator.tags[(i + 1) % creator.tags.length]],
  }));
}

function App() {
  const { user, profile, login, logout } = useAuth();
  const [tab, setTab] = useState<Tab | 'members'>('creators');
  const [activeCreator, setActiveCreator] = useState<CreatorProfile>(CREATORS[0]);
  const [modalCreator, setModalCreator] = useState<CreatorProfile | null>(null);
  const [showRemix, setShowRemix] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(defaultProgress());
  const [ideas, setIdeas] = useState<ContentIdea[]>(generateIdeasForCreator(CREATORS[0], 6));
  const [schedule, setSchedule] = useState<ScheduledPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newDay, setNewDay] = useState('Monday');
  const [me, setMe] = useState<BuilderProfile>(defaultBuilder());
  const [remix, setRemix] = useState<Set<string>>(new Set());

  const [showOriginStory, setShowOriginStory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setCategoryOpen(false); setTagOpen(false); }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) { setCategoryOpen(false); setTagOpen(false); }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, []);

  const filteredCreators = useMemo(() => {
    let list = CREATORS;
    if (selectedCategory) list = list.filter((c) => c.category === selectedCategory);
    if (selectedTag) list = list.filter((c) => c.tags.includes(selectedTag));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [searchQuery, selectedCategory, selectedTag]);

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    CREATORS.forEach((c) => c.tags.forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, []);

  const categories = useMemo(() => {
    const seen = new Map<string, number>();
    CREATORS.forEach((c) => seen.set(c.category, (seen.get(c.category) || 0) + 1));
    return Array.from(seen.entries()).sort((a, b) => b[1] - a[1]);
  }, []);

  const score = useMemo(() => scoreProgress(progress), [progress]);
  const level = useMemo(() => levelFromXp(progress.xp), [progress.xp]);

  useEffect(() => {
    const seenOnboarding = localStorage.getItem('creatorplaybooks_onboarding_seen');
    const seenOrigin = localStorage.getItem('creatorplaybooks_origin_seen');
    if (!seenOrigin) setShowOriginStory(true);
    else if (!seenOnboarding) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    document.body.className = ['app-shell', ...Array.from(remix).map((k) => 'remix-' + k)].join(' ');
    const t = activeCreator.theme;
    document.body.style.setProperty('--primary', t.primary);
    document.body.style.setProperty('--secondary', t.secondary);
    document.body.style.setProperty('--accent', t.accent);
    if (t.bg) document.body.style.setProperty('--bg', t.bg);
    else document.body.style.removeProperty('--bg');
    if (t.surface) document.body.style.setProperty('--surface', t.surface);
    else document.body.style.removeProperty('--surface');
    if (t.surface2) document.body.style.setProperty('--surface-2', t.surface2);
    else document.body.style.removeProperty('--surface-2');
  }, [remix, activeCreator]);

  useEffect(() => {
    setIdeas(generateIdeasForCreator(activeCreator, 6));
  }, [activeCreator]);

  const updateMe = (next: BuilderProfile) => setMe(next);

  const toggleRemix = (key: string) => {
    const next = new Set(remix);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setRemix(next);
  };

  const refreshIdeas = () => setIdeas(generateIdeasForCreator(activeCreator, 6));

  const addScheduled = () => {
    if (!newPost.trim()) return;
    setSchedule([...schedule, { id: Date.now().toString(), day: newDay, content: newPost, format: 'post' }]);
    setNewPost('');
  };

  const removeScheduled = (id: string) => setSchedule(schedule.filter((s) => s.id !== id));

  const openCreatorModal = (creator: CreatorProfile) => {
    setActiveCreator(creator);
    setModalCreator(creator);
  };

  const closeCreatorModal = () => setModalCreator(null);

  const copyPlaybookForCreator = (creator: CreatorProfile) => {
    const text = [`# ${creator.name} Growth Playbook`, '', ...creator.plays.map((p) => [`## ${p.emoji} ${p.title}`, p.description, `Action: ${p.action}`, `Frequency: ${p.frequency}`, ''].flat())].join('\n');
    navigator.clipboard.writeText(text);
  };

  const copyAgentPrompt = (creator: CreatorProfile) => {
    const prompt = `You are a growth strategist AI agent trained on the playbook of ${creator.name} (${creator.handle}).\n\nBio: ${creator.bio}\nPillars:\n${creator.pillars.map((p) => `- ${p}`).join('\n')}\n\nProducts:\n${creator.products.map((p) => `- ${p.name}: ${p.description} (${p.url})`).join('\n')}\n\nRepeatable plays:\n${creator.plays.map((p) => `${p.emoji} ${p.title}\n- ${p.description}\n- Action: ${p.action}\n- Frequency: ${p.frequency}`).join('\n\n')}\n\nHooks:\n${creator.hooks.join('\n')}\n\nAngles:\n${creator.angles.join('\n')}\n\nTags:\n${creator.tags.join(', ')}\n\nYour job: help me grow on X using this exact playbook. Suggest content ideas, schedule posts, and critique my drafts in the voice and strategy of ${creator.name}.`;
    navigator.clipboard.writeText(prompt);
  };

  const installAgentFolder = (creator: CreatorProfile) => {
    const bundle = buildExportBundle(creator, me, progress, score, schedule);
    downloadZip(bundle, `${creator.id}-agent-kit.zip`);
  };

  return (
    <div className={`app-shell ${showRemix ? 'remix-visible' : ''}`}>
      <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
        <a href="/" className="brand" title="CreatorPlaybooks home">
          <span className="brand-mark">✦</span>
          <span className="brand-text">
            <span className="brand-name">CreatorPlaybooks</span>
            <span className="brand-tag">by Maya + Neal</span>
          </span>
        </a>
        <button className="nav-menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <div className="links">
          <TabButton active={tab === 'creators'} onClick={() => { setTab('creators'); setMenuOpen(false); }} icon={<Sparkles size={14} />} label="Mentors" />
          <TabButton active={tab === 'dashboard'} onClick={() => { setTab('dashboard'); setMenuOpen(false); }} icon={<TrendingUp size={14} />} label="Dashboard" />
          <TabButton active={tab === 'members'} onClick={() => { setTab('members'); setMenuOpen(false); }} icon={<Users size={14} />} label="Members" />
          <TabButton active={tab === 'me'} onClick={() => { setTab('me'); setMenuOpen(false); }} icon={<UserCircle size={14} />} label="Me" />
          <TabButton active={tab === 'docs'} onClick={() => { setTab('docs'); setMenuOpen(false); }} icon={<BookOpen size={14} />} label="Docs" />
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <button className="nav-avatar" onClick={() => { setTab('members'); setMenuOpen(false); }} title="Open member profile">
                {profile?.avatar ? <img src={profile.avatar} alt={profile.name} /> : <div className="nav-avatar-fallback">{profile?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}</div>}
              </button>
              <button className="nav-logout" onClick={logout} title="Log out"><LogOut size={16} /></button>
            </>
          ) : (
            <button className="btn btn-hot btn-sm" onClick={login}><LogIn size={14} /> Sign in</button>
          )}
        </div>
      </nav>

      <main className="main">
        {tab === 'creators' && (
          <>
            <section className="hero-section hero-clean">
              <div className="hero-kicker">✨ Adopt Growth Frameworks</div>
              <h1 className="hero-headline">Grow on X like the <span className="text-gradient text-underline">best creators</span>.</h1>
              <p className="lead hero-lead">Real playbooks from indie hackers and Netlify shippers. Pick a mentor, copy their plays, and start shipping.</p>
              <div className="hero-actions">
                <button className="btn btn-hot btn-lg" onClick={() => document.getElementById('creators')?.scrollIntoView({ behavior: 'smooth' })}><Sparkles size={18} /> Browse mentors</button>
                <button className="btn btn-secondary btn-lg" onClick={() => setTab('dashboard')}><TrendingUp size={18} /> Open dashboard</button>
              </div>
              <div className="hero-meta">
                <span className="hero-stat"><strong>{CREATORS.length}</strong> creators</span>
                <span className="hero-stat"><strong>{CREATORS.reduce((a, c) => a + c.plays.length, 0)}</strong> growth plays</span>
                <span className="hero-stat"><strong>1</strong> AI-ready API</span>
              </div>
            </section>

            <section id="creators" className="creators-index">
              <div className="section-header">
                <h2 className="section-title">Pick your mentor</h2>
                <p className="section-subtitle">Click any card to open their full playbook, products, and agent-ready prompt.</p>
              </div>

              <div className="creators-filter-bar">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input type="text" placeholder="Search creators, handles, tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
                  {searchQuery && <button className="search-clear" onClick={() => setSearchQuery('')} title="Clear"><X size={14} /></button>}
                </div>
                <div className="filter-chips">
                  <div className="filter-dropdown">
                    <button className={`filter-chip ${selectedCategory ? 'active' : ''}`} onClick={() => setCategoryOpen((v) => !v)} title="Filter by category"><SlidersHorizontal size={13} /> Category</button>
                    {categoryOpen && (
                      <div className="filter-menu">
                        {categories.map(([cat, count]) => <button key={cat} className="filter-menu-item" onClick={() => { setSelectedCategory(cat); setCategoryOpen(false); }}>{cat} <span className="filter-menu-count">{count}</span></button>)}
                      </div>
                    )}
                  </div>
                  <div className="filter-dropdown">
                    <button className={`filter-chip ${selectedTag ? 'active' : ''}`} onClick={() => setTagOpen((v) => !v)} title="Filter by tag"><Tag size={13} /> Tag</button>
                    {tagOpen && (
                      <div className="filter-menu">
                        {allTags.slice(0, 12).map((t) => <button key={t} className="filter-menu-item" onClick={() => { setSelectedTag(t); setTagOpen(false); }}>{t} <span className="filter-menu-count">{CREATORS.filter((c) => c.tags.includes(t)).length}</span></button>)}
                      </div>
                    )}
                  </div>
                  {(selectedCategory || selectedTag || searchQuery) && (
                    <button className="filter-chip reset" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedTag(null); }}>Reset</button>
                  )}
                </div>
              </div>

              {(selectedCategory || selectedTag) && (
                <div className="active-filters">
                  {selectedCategory && <span className="active-filter">Category: {selectedCategory} <button onClick={() => setSelectedCategory(null)}><X size={12} /></button></span>}
                  {selectedTag && <span className="active-filter">Tag: {selectedTag} <button onClick={() => setSelectedTag(null)}><X size={12} /></button></span>}
                </div>
              )}

              {filteredCreators.length === 0 ? (
                <div className="creators-empty">
                  <div className="creators-empty-icon">🔭</div>
                  <h3>No creators match your filters</h3>
                  <p>Try clearing your search or filters to see the full directory.</p>
                  <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedTag(null); }}><RefreshCw size={14} /> Clear all filters</button>
                </div>
              ) : (
                <div className="creators-grid-clean">
                  {filteredCreators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} active={activeCreator.id === creator.id} onClick={() => openCreatorModal(creator)} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
        {tab === 'dashboard' && (user ? (
          <DashboardView progress={progress} setProgress={setProgress} score={score} level={level} ideas={ideas} refreshIdeas={refreshIdeas} schedule={schedule} addScheduled={addScheduled} removeScheduled={removeScheduled} newPost={newPost} setNewPost={setNewPost} newDay={newDay} setNewDay={setNewDay} activeCreator={activeCreator} openCreatorModal={openCreatorModal} me={me} />
        ) : <LoginGate message="Track your growth, log posts, and schedule content." cta="Sign in to view your dashboard" />)}
        {tab === 'me' && <MeView profile={me} setProfile={updateMe} />}
        {tab === 'docs' && (user ? <DocsView activeCreator={activeCreator} /> : <LoginGate message="Read the docs and API reference." cta="Sign in to view docs" />)}
        {tab === 'members' && (user ? <MembersView /> : <LoginGate message="Join the member directory, vote on creators, and submit new ones." cta="Sign in to view members" />)}
        {showOriginStory && <OriginStoryModal close={() => { localStorage.setItem('creatorplaybooks_origin_seen', '1'); setShowOriginStory(false); setShowOnboarding(true); }} />}
        {showOnboarding && <OnboardingModal step={onboardingStep} setStep={setOnboardingStep} close={() => { localStorage.setItem('creatorplaybooks_onboarding_seen', '1'); setShowOnboarding(false); }} setTab={setTab} />}
        {modalCreator && <CreatorModal creator={modalCreator} onClose={closeCreatorModal} onCopyPlaybook={() => copyPlaybookForCreator(modalCreator)} onCopyAgent={() => copyAgentPrompt(modalCreator)} onInstallAgent={() => installAgentFolder(modalCreator)} />}
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="footer-brand-link" title="CreatorPlaybooks home"><span className="brand-mark">✦</span><span className="footer-brand-name">CreatorPlaybooks</span></a>
            <p className="footer-desc">Real growth playbooks from indie hackers and Netlify shippers. Built for builders who want to grow on X without guessing.</p>
            <div className="footer-social">
              <a href="https://x.com/NealFrazierTech" target="_blank" rel="noreferrer">@NealFrazierTech</a>
              <a href="https://x.com/buildwithmaya" target="_blank" rel="noreferrer">@buildwithmaya</a>
              <a href="https://hotappsummer.netlify.app" target="_blank" rel="noreferrer">#HotAppSummer</a>
              <a href={`${CANONICAL_URL}/api/creators`} target="_blank" rel="noreferrer">API</a>
            </div>
          </div>
          <div className="footer-api-col">
            <strong>Agent-ready API</strong>
            <p className="footer-hint">Pull any creator playbook as JSON. Use it in agents, n8n, Cursor, or your own apps.</p>
            <div className="footer-api-links">
              <a href={`${CANONICAL_URL}/api/creators`} target="_blank" rel="noreferrer">All creators →</a>
              <a href={`${CANONICAL_URL}/api/creator?id=${activeCreator.id}`} target="_blank" rel="noreferrer">{activeCreator.name} playbook →</a>
            </div>
          </div>
          <div className="footer-built">
            <strong>Built with</strong>
            <div className="footer-badges">
              <a href="https://nousresearch.com" target="_blank" rel="noreferrer" className="footer-badge" title="Nous Research — Hermes agent"><span className="footer-badge-dot" style={{ background: '#ec4899' }} /> Nous Hermes</a>
              <a href="https://join.netlify.com/d8a2zdtel9gy-w6zrwt" target="_blank" rel="noreferrer" className="footer-badge" title="Deploy on Netlify"><span className="footer-badge-dot" style={{ background: '#22d3ee' }} /> Netlify</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} CreatorPlaybooks — grow in public.</span></div>
      </footer>
      <div className="remix-pad" title="Creative remix controls">
        <button className={remix.has('bold') ? 'active' : ''} onClick={() => toggleRemix('bold')} title="Bold text"><Bold size={16} /></button>
        <button className={remix.has('italic') ? 'active' : ''} onClick={() => toggleRemix('italic')} title="Italic text"><Italic size={16} /></button>
        <button className={remix.has('underline') ? 'active' : ''} onClick={() => toggleRemix('underline')} title="Underline headings"><Underline size={16} /></button>
        <button className={remix.has('highlight') ? 'active' : ''} onClick={() => toggleRemix('highlight')} title="Highlight paragraphs"><Highlighter size={16} /></button>
        <button className={remix.has('big') ? 'active' : ''} onClick={() => toggleRemix('big')} title="Bigger typography"><Zap size={16} /></button>
        <button className={remix.has('spacy') ? 'active' : ''} onClick={() => toggleRemix('spacy')} title="More breathing room"><Wand2 size={16} /></button>
        <button className={remix.has('neon') ? 'active' : ''} onClick={() => toggleRemix('neon')} title="Neon glow"><Sparkles size={16} /></button>
      </div>
      <button className={`remix-toggle ${showRemix ? 'active' : ''}`} onClick={() => setShowRemix(!showRemix)} title={showRemix ? 'Hide remix bar' : 'Show remix bar'}><Wand2 size={18} /></button>
    </div>
  );
}


function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button className={`tab ${active ? 'active' : ''}`} onClick={onClick} title={label}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function CreatorCard({ creator, active, onClick }: { creator: CreatorProfile; active: boolean; onClick: () => void }) {
  const initials = creator.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`creator-card-clean ${active ? 'active' : ''}`} onClick={onClick} title={`Open ${creator.name}'s playbook`}>
      <div className="creator-card-clean-banner" style={{ backgroundImage: creator.banner ? `url(${creator.banner})` : undefined }}>
        {!creator.banner && <div className="creator-card-clean-banner-fallback" style={{ background: `linear-gradient(135deg, ${creator.theme.primary}40, ${creator.theme.accent}40)` }} />}
      </div>
      {imgError || !creator.avatar ? (
        <div className="creator-card-clean-avatar avatar-fallback" style={{ background: `linear-gradient(135deg, ${creator.theme.primary}, ${creator.theme.accent})` }}>
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
          <span className={`status-badge status-${creator.status}`}>{creator.status}</span>
        </div>
        <p className="creator-card-clean-bio">{creator.bio.split('\n')[0]}</p>
        <div className="creator-card-clean-tags">
          {creator.tags.slice(0, 3).map((t) => <span key={t} className="tag-chip">{t}</span>)}
          {creator.tags.length > 3 && <span className="tag-chip tag-more">+{creator.tags.length - 3}</span>}
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

function CreatorModal({ creator, onClose, onCopyPlaybook, onCopyAgent, onInstallAgent }: { creator: CreatorProfile; onClose: () => void; onCopyPlaybook: () => void; onCopyAgent: () => void; onInstallAgent: () => void }) {
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

function OriginStoryModal({ close }: { close: () => void }) {
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

function OnboardingModal({ step, setStep, close, setTab }: { step: number; setStep: (n: number) => void; close: () => void; setTab: (t: Tab | 'members') => void }) {
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

function DashboardView({ progress, setProgress, score, level, ideas, refreshIdeas, schedule, addScheduled, removeScheduled, newPost, setNewPost, newDay, setNewDay, activeCreator }: any) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <h2 className="page-title">Growth dashboard</h2>
        <p className="page-subtitle">Track what matters and run your next play.</p>
      </div>
      <div className="dashboard-metrics">
        <div className="metric-card metric-score">
          <div className="score-ring-v2" data-value={score.overall}>
            <span className="score-number">{score.overall}</span>
            <span className="score-label">health</span>
          </div>
          <div className="metric-info">
            <strong>Level {level.level}: {level.title}</strong>
            <span>{level.next - progress.xp} XP to next level</span>
          </div>
        </div>
        <div className="metric-card"><TrendingUp size={20} className="metric-icon" /><strong>{progress.streak}</strong><span>day streak</span></div>
        <div className="metric-card"><Calendar size={20} className="metric-icon" /><strong>{progress.postsThisWeek}</strong><span>posts this week</span></div>
        <div className="metric-card"><MessageSquare size={20} className="metric-icon" /><strong>{progress.repliesToday}</strong><span>replies today</span></div>
        <div className="metric-card"><Zap size={20} className="metric-icon" /><strong>{progress.xp}</strong><span>total XP</span></div>
      </div>
      <div className="dashboard-actions">
        <button className="btn btn-hot" onClick={() => setProgress({ ...progress, postsThisWeek: progress.postsThisWeek + 1, xp: progress.xp + 12, lastPostDate: new Date().toISOString().slice(0, 10) })}><Plus size={14} /> Log a post</button>
        <button className="btn btn-secondary" onClick={() => setProgress({ ...progress, repliesToday: progress.repliesToday + 1, xp: progress.xp + 3 })}><MessageSquare size={14} /> Log reply</button>
        <button className="btn btn-secondary" onClick={() => setProgress({ ...progress, streak: progress.streak + 1, xp: progress.xp + 5 })}><Flame size={14} /> Extend streak</button>
      </div>
      <div className="dashboard-ideas">
        <div className="section-header-inline">
          <h3 className="section-title-small">Ideas from {activeCreator.name}</h3>
          <button className="btn btn-sm btn-secondary" onClick={refreshIdeas}><RefreshCw size={14} /> Refresh</button>
        </div>
        <div className="idea-cards">
          {ideas.map((idea: ContentIdea) => (
            <div key={idea.id} className="idea-card">
              <span className="idea-format">{idea.format}</span>
              <p className="idea-hook">{idea.hook}</p>
              <p className="idea-angle">{idea.angle}</p>
              <div className="idea-tags">{idea.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-scheduler">
        <h3 className="section-title-small">Content schedule</h3>
        <div className="schedule-inputs">
          <select value={newDay} onChange={(e) => setNewDay(e.target.value)}>{days.map((d) => <option key={d} value={d}>{d}</option>)}</select>
          <input type="text" placeholder="Draft your post..." value={newPost} onChange={(e) => setNewPost(e.target.value)} />
          <button className="btn btn-hot" onClick={addScheduled}><Plus size={14} /> Add</button>
        </div>
        <div className="schedule-board">
          {days.map((d) => (
            <div key={d} className="schedule-column">
              <strong>{d}</strong>
              {schedule.filter((s: ScheduledPost) => s.day === d).map((s: ScheduledPost) => (
                <div key={s.id} className="schedule-post">
                  <span>{s.content}</span>
                  <button onClick={() => removeScheduled(s.id)} title="Remove"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MeView({ profile, setProfile }: { profile: BuilderProfile; setProfile: (p: BuilderProfile) => void }) {
  return (
    <div className="page me-page">
      <div className="me-section">
        <h2 className="page-title">Builder profile</h2>
        <p className="page-subtitle">Who you are, what you ship, and where you are headed.</p>
        <div className="me-form">
          <label>Name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
          <label>Handle<input value={profile.handle} onChange={(e) => setProfile({ ...profile, handle: e.target.value })} /></label>
          <label>Project<input value={profile.project} onChange={(e) => setProfile({ ...profile, project: e.target.value })} /></label>
          <label>URL<input value={profile.url} onChange={(e) => setProfile({ ...profile, url: e.target.value })} /></label>
          <label>Bio<textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></label>
          <label>Goal<textarea value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} /></label>
          <div className="me-stats-inline">
            <span><strong>{profile.streak}</strong> streak</span>
            <span><strong>{profile.xp}</strong> XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocsView({ activeCreator }: { activeCreator: CreatorProfile }) {
  const endpoints = [
    { method: 'GET', path: '/api/creators', desc: 'All creators with full playbooks' },
    { method: 'GET', path: '/api/creator?id=' + activeCreator.id, desc: 'Single creator playbook' },
    { method: 'GET', path: '/api/playbook?creator=' + activeCreator.id, desc: 'Markdown playbook export' },
    { method: 'GET', path: '/api/ideas?creator=' + activeCreator.id + '&count=6', desc: 'AI-generated content ideas' },
    { method: 'GET', path: '/api/export?creator=' + activeCreator.id, desc: 'Agent-ready JSON bundle' },
  ];
  return (
    <div className="page docs-page">
      <h2 className="page-title">Docs & API</h2>
      <p className="page-subtitle">Everything is available as JSON for agents, automations, and custom UIs.</p>
      <div className="docs-grid">
        {endpoints.map((ep) => (
          <a key={ep.path} href={`${CANONICAL_URL}${ep.path}`} target="_blank" rel="noreferrer" className="docs-card">
            <span className="docs-method">{ep.method}</span>
            <code className="docs-path">{ep.path}</code>
            <p>{ep.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

function LoginGate({ message, cta }: { message: string; cta: string }) {
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

function buildExportBundle(creator: CreatorProfile, me: BuilderProfile, progress: UserProgress, score: GrowthScore, schedule: ScheduledPost[]) {
  const playbookMd = [`# ${creator.name} Growth Playbook`, '', `Source: ${CANONICAL_URL}/api/creator?id=${creator.id}`, '', ...creator.plays.map((p) => [`## ${p.emoji} ${p.title}`, p.description, '', `**Action:** ${p.action}`, `**Frequency:** ${p.frequency}`, ''].join('\n'))].join('\n');
  return {
    'concept.json': JSON.stringify({ name: me.project, handle: me.handle, goal: me.goal, url: me.url, mentor: creator.id }, null, 2),
    'schedule.json': JSON.stringify(schedule, null, 2),
    'builder.json': JSON.stringify(me, null, 2),
    'progress.json': JSON.stringify({ ...progress, score }, null, 2),
    'playbook.md': playbookMd,
    'README.md': `# ${me.project} agent kit\n\nMentor playbook: ${creator.name} (${creator.handle})\nGenerated by CreatorPlaybooks\n`,
    'index.html': `<!doctype html><html><head><meta charset="utf-8"><title>${me.project}</title></head><body><pre>${playbookMd}</pre></body></html>`,
  };
}

export default App;
