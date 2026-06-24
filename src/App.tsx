import { useEffect, useMemo, useState } from 'react';
import { Sparkles, TrendingUp, Users, RefreshCw, UserCircle, LogIn, LogOut, Menu, X, Zap, Wand2, Highlighter, Underline, Italic, Bold, BookOpen, Search, SlidersHorizontal, Tag } from 'lucide-react';
import type { BuilderProfile, ContentIdea, CreatorProfile, ScheduledPost, UserProgress, Tab } from './types';
import { defaultBuilder, defaultProgress, levelFromXp, scoreProgress } from './lib/maya';
import { CREATORS } from './lib/creators';
import { downloadZip } from './lib/export';
import { useAuth } from './lib/auth';
import { generateIdeasForCreator } from './lib/ideas';
import { buildExportBundle } from './lib/exportBundle';
import { MembersView } from './components/MembersView';
import { TabButton } from './components/TabButton';
import { CreatorCard } from './components/CreatorCard';
import { CreatorModal } from './components/CreatorModal';
import { OriginStoryModal } from './components/OriginStoryModal';
import { OnboardingModal } from './components/OnboardingModal';
import { DashboardView } from './components/DashboardView';
import { MeView } from './components/MeView';
import { DocsView } from './components/DocsView';
import { LoginGate } from './components/LoginGate';

const CANONICAL_URL = 'https://hotappsummer-mayagrowth.netlify.app';

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


export default App;
