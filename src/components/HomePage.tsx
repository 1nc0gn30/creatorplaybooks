import type { CreatorProfile } from '../types';
import { Search, SlidersHorizontal, Tag, X } from 'lucide-react';
import { CATEGORIES } from '../lib/creators';
import { MENTOR_PLACES } from '../lib/places';
import { MentorDirectory } from './MentorDirectory';
import { HologramDirectory } from './HologramDirectory';
import { useMemo } from 'react';

export function HomePage({
  filteredCreators,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  categories,
  allTags,
  openCreatorModal,
  activeCreator,
  totalPlays,
  modalCreatorId,
  creatorCount,
}: {
  filteredCreators: CreatorProfile[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (t: string | null) => void;
  categories: [string, number][];
  allTags: string[];
  openCreatorModal: (c: CreatorProfile) => void;
  activeCreator: CreatorProfile;
  totalPlays: number;
  modalCreatorId: string | null;
  creatorCount: number;
}) {


  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    categories.forEach(([k, v]) => map.set(k, v));
    return map;
  }, [categories]);

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedTag ? 1 : 0) + (searchQuery ? 1 : 0);

  const placeLine = MENTOR_PLACES.map((p) => p.label).join(', ');

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-kicker">Checked 11 Nov 2026 · {creatorCount} mentors · {MENTOR_PLACES.length} places</p>
          <h1 className="home-headline">
            <span className="home-headline-line">Notes from builders</span>
            <em>who do not all live in one city.</em>
          </h1>
          <p className="home-subhead">
            CreatorPlaybooks is a reading list. The people in it post from Austin, Dubai, Barcelona, Bengaluru, Singapore, Atlanta, and the other places named on their profiles. Each page says what they are doing now, and where that sentence came from.
          </p>
          <p className="place-sr">{placeLine}</p>
          <ul className="place-list" aria-hidden="true">
            {MENTOR_PLACES.map((place) => (
              <li key={place.label}>
                <strong>{place.label}</strong>
                <span>{place.who}</span>
              </li>
            ))}
          </ul>
          <div className="home-hero-actions">
            <button type="button" className="home-btn home-btn-primary" onClick={() => document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' })}>
              Open the directory
            </button>
            <button type="button" className="home-btn home-btn-secondary" onClick={() => document.getElementById('api-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Read the API
            </button>
          </div>
          <div className="home-stats-bar">
            <div className="home-stat">
              <span className="home-stat-num">{creatorCount}</span>
              <span className="home-stat-label">mentors</span>
            </div>
            <div className="home-stat-sep" />
            <div className="home-stat">
              <span className="home-stat-num">{totalPlays}</span>
              <span className="home-stat-label">plays</span>
            </div>
            <div className="home-stat-sep" />
            <div className="home-stat">
              <span className="home-stat-num">{MENTOR_PLACES.length}</span>
              <span className="home-stat-label">places</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-how">
        <div className="home-section-header">
          <h2 className="home-section-title">Three steps, none of them magic.</h2>
        </div>
        <div className="home-steps">
          <div className="home-step">
            <h3>1. Read one page</h3>
            <p>Pick a person whose work you actually want. The page lists products, plays, and the URLs those claims came from.</p>
          </div>
          <div className="home-step">
            <h3>2. Take one play</h3>
            <p>A play is a habit you can try this week: a format, a cadence, a place to publish. The wording is ours. The example is theirs.</p>
          </div>
          <div className="home-step">
            <h3>3. Write your version</h3>
            <p>The dashboard can hold a draft and a day of the week. It does not post for you.</p>
          </div>
        </div>
      </section>

      <section className="home-credit">
        <p>
          Published by <a href="https://nealfrazier.tech">Neal Frazier Tech</a>.
          The format was inspired by <a href="https://x.com/buildwithmaya">@buildwithmaya</a>.
          Facts on each page were checked on 11 Nov 2026. If a number is money, it is the person’s own figure, not an audit.
        </p>
      </section>

      {/* Directory */}
      <section className="home-section home-directory" id="directory">
        <div className="home-section-header">
          <h2 className="home-section-title">The directory</h2>
        </div>
        <HologramDirectory creators={filteredCreators} onOpen={openCreatorModal} activeId={modalCreatorId} />

        <div className="home-filter-bar">
          <div className="home-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, handle, or tag"
              aria-label="Search mentors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && <button className="home-search-clear" onClick={() => setSearchQuery('')}><X size={14} /></button>}
          </div>
          <div className="home-filter-group">
            <div className="home-dropdown">
              <button className={`home-filter-chip ${selectedCategory ? 'active' : ''}`}>
                <SlidersHorizontal size={14} />
                Category
                {selectedCategory && <span className="home-filter-badge">1</span>}
              </button>
              <div className="home-dropdown-menu">
                <button className="home-dropdown-item" onClick={() => setSelectedCategory(null)}>
                  All categories <span className="home-dropdown-count">{creatorCount}</span>
                </button>
                {CATEGORIES.map((cat) => (
                  <button key={cat.id} className="home-dropdown-item" onClick={() => setSelectedCategory(cat.id)}>
                    {cat.label}
                    <span className="home-dropdown-count">{categoryCounts.get(cat.id) ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="home-dropdown">
              <button className={`home-filter-chip ${selectedTag ? 'active' : ''}`}>
                <Tag size={14} />
                Tag
                {selectedTag && <span className="home-filter-badge">1</span>}
              </button>
              <div className="home-dropdown-menu">
                <button className="home-dropdown-item" onClick={() => setSelectedTag(null)}>
                  All tags <span className="home-dropdown-count">{allTags.length}</span>
                </button>
                {allTags.slice(0, 16).map((t) => (
                  <button key={t} className="home-dropdown-item" onClick={() => setSelectedTag(t)}>
                    #{t}
                  </button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button className="home-filter-chip reset" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedTag(null); }}>
                Reset
              </button>
            )}
          </div>
        </div>

        {selectedCategory && (
          <div className="home-category-hero" style={{ background: `linear-gradient(135deg, ${activeCreator.theme.primary}15, ${activeCreator.theme.accent}15)` }}>
            <div className="home-category-hero-text">
              <strong>{CATEGORIES.find(c => c.id === selectedCategory)?.label}</strong>
              <span>{CATEGORIES.find(c => c.id === selectedCategory)?.description}</span>
            </div>
            <button type="button" onClick={() => setSelectedCategory(null)} aria-label="Clear category"><X size={14} /></button>
          </div>
        )}

        {filteredCreators.length === 0 ? (
          <div className="home-empty">
            <h3>No mentors match</h3>
            <p>Clear the search or the filters and the full list comes back.</p>
            <button type="button" className="home-btn home-btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedTag(null); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <MentorDirectory creators={filteredCreators} activeId={modalCreatorId} onOpen={openCreatorModal} />
        )}
      </section>

      {/* API teaser */}
      <section className="home-section home-api" id="api-section">
        <div className="home-api-card">
          <div className="home-api-left">
            <h2 className="home-section-title">The same notes, as JSON.</h2>
            <p className="home-section-subtitle">One request returns a mentor. Another returns the list. Use them in an editor or a script. They are the same words as the pages.</p>
            <div className="home-api-actions">
              <a href="/api/creators" target="_blank" rel="noreferrer" className="home-btn home-btn-primary">
                All mentors
              </a>
              <a href="/api/creator?id=maya&expand=all" target="_blank" rel="noreferrer" className="home-btn home-btn-secondary">
                Maya, as JSON
              </a>
            </div>
          </div>
          <div className="home-api-code">
            <pre><code>{`GET /api/creator?id=maya
{
  "name": "Maya",
  "handle": "@buildwithmaya",
  "plays": [
    { "title": "Build in public", ... },
    { "title": "Distribution first", ... }
  ]
}`}</code></pre>
          </div>
        </div>
      </section>
    </div>
  );
}
