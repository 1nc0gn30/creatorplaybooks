import { useState, useEffect } from 'react';
import { Edit3, Save, ExternalLink, ThumbsUp, ThumbsDown, Plus, X, CheckCircle, Globe, Github, Sparkles, Download } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import type { MemberProfile } from '../lib/member-types';
import { fetchVotes } from '../lib/member-api';
import { CREATORS } from '../lib/creators';
import '../styles/auth-pages.css';

const STORAGE_PROFILE = 'creatorplaybooks_member_profile_v1';
const STORAGE_VOTES = 'creatorplaybooks_member_votes_v1';
const STORAGE_VOTE_TOTALS = 'creatorplaybooks_member_vote_totals_v1';
const STORAGE_NOMINATIONS = 'creatorplaybooks_member_nominations_v1';

interface LocalNomination {
  id: string;
  handle: string;
  name: string;
  category: string;
  reason: string;
  submittedAt: string;
}

type VoteSummary = { up: number; down: number; score: number };

function defaultLocalProfile(): MemberProfile {
  return {
    id: 'local-builder',
    email: '',
    name: 'Local Builder',
    handle: 'builder',
    bio: 'Studying public creator playbooks offline and shipping weekly deliverables.',
    avatar: '',
    banner: '',
    building: 'Open-access creator workflow',
    website: '',
    xHandle: '',
    github: '',
    likedPlaybooks: ['maya', 'kp'],
    admiredCreators: ['maya', 'karpathy'],
    votes: {},
    role: 'member',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function MembersView() {
  const { user, profile, updateProfile } = useAuth();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<MemberProfile>(() => loadJson(STORAGE_PROFILE, profile || defaultLocalProfile()));
  const [votes, setVotes] = useState<Record<string, VoteSummary>>(() => loadJson(STORAGE_VOTE_TOTALS, {}));
  const [myVotes, setMyVotes] = useState<Record<string, 'up' | 'down' | null>>(() => loadJson(STORAGE_VOTES, {}));
  const [nominations, setNominations] = useState<LocalNomination[]>(() => loadJson(STORAGE_NOMINATIONS, []));
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchVotes()
      .then((serverVotes) => {
        if (cancelled || !serverVotes || typeof serverVotes !== 'object') return;
        setVotes((prev) => {
          const merged: Record<string, VoteSummary> = { ...prev };
          for (const [id, entry] of Object.entries(serverVotes)) {
            const local = prev[id];
            if (!local || (entry.up + entry.down) > (local.up + local.down)) {
              merged[id] = entry;
            }
          }
          return merged;
        });
      })
      .catch(() => {
        /* stay 100% offline-first */
      });
    return () => { cancelled = true; };
  }, []);

  const initials = (form.name || 'LB').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const save = async () => {
    const next: MemberProfile = { ...form, updatedAt: new Date().toISOString() };
    setForm(next);
    try {
      localStorage.setItem(STORAGE_PROFILE, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    if (user) {
      await updateProfile({
        name: next.name,
        handle: next.handle,
        bio: next.bio,
        building: next.building,
        website: next.website,
        xHandle: next.xHandle,
        github: next.github,
        admiredCreators: next.admiredCreators,
        likedPlaybooks: next.likedPlaybooks,
      }).catch(() => {});
    }
    setEdit(false);
  };

  const toggleVote = (creatorId: string, direction: 'up' | 'down') => {
    const previous = myVotes[creatorId] || null;
    const nextDir = previous === direction ? null : direction;
    const nextMyVotes = { ...myVotes, [creatorId]: nextDir };
    setMyVotes(nextMyVotes);

    const cur = votes[creatorId] || { up: 0, down: 0, score: 0 };
    let up = cur.up;
    let down = cur.down;
    if (previous === 'up') up = Math.max(0, up - 1);
    if (previous === 'down') down = Math.max(0, down - 1);
    if (nextDir === 'up') up += 1;
    if (nextDir === 'down') down += 1;
    const nextTotals = { ...votes, [creatorId]: { up, down, score: up - down } };
    setVotes(nextTotals);

    try {
      localStorage.setItem(STORAGE_VOTES, JSON.stringify(nextMyVotes));
      localStorage.setItem(STORAGE_VOTE_TOTALS, JSON.stringify(nextTotals));
    } catch {
      /* ignore */
    }

    // Best-effort loopback sync if running against server.mjs
    fetch('/api/members?action=vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId, direction: nextDir }),
    }).catch(() => {});
  };

  const submitNomination = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const handle = String(fd.get('handle') || '').trim();
    const name = String(fd.get('name') || '').trim();
    const category = String(fd.get('category') || '').trim();
    const reason = String(fd.get('reason') || '').trim();
    if (!handle || !name || !category || !reason) return;

    const entry: LocalNomination = {
      id: `nom-${Date.now()}`,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      name,
      category,
      reason,
      submittedAt: new Date().toISOString(),
    };
    const nextNoms = [entry, ...nominations];
    setNominations(nextNoms);
    try {
      localStorage.setItem(STORAGE_NOMINATIONS, JSON.stringify(nextNoms));
    } catch {
      /* ignore */
    }
    setSubmitOk(true);
    e.currentTarget.reset();
    window.setTimeout(() => {
      setSubmitOk(false);
      setSubmitOpen(false);
    }, 1200);
  };

  const exportCommunityJson = () => {
    const payload = {
      schema: 'creatorplaybooks.members-local/v1.1',
      exportedAt: new Date().toISOString(),
      profile: form,
      myVotes,
      voteSummaries: votes,
      nominations,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creatorplaybooks-members-${form.handle || 'local'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const admired = form.admiredCreators || [];
  const liked = form.likedPlaybooks || [];

  return (
    <div className="page members-page">
      <div className="members-header">
        <div className="members-header-badge">
          <span className="pulse-dot" />
          Local-First Builder Hub · Zero Login Wall
        </div>
        <h2 className="page-title">Builder community workspace</h2>
        <p className="page-subtitle">Manage your local builder card, vote on all 35 playbooks, nominate new builders, and export your state as JSON — 100% offline in your browser.</p>
      </div>

      <section className="member-hero">
        <div className="member-banner" />
        <div className="member-avatar" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
          {form.avatar ? <img src={form.avatar} alt={form.name} /> : initials}
        </div>
        <div className="member-title">
          <h1>{form.name || 'Local Builder'}</h1>
          <span className="member-handle">@{form.handle || 'builder'}</span>
          <span className="member-role">
            <Sparkles size={10} style={{ display: 'inline' }} /> {user ? 'Synced Member' : 'Local-First Profile'}
          </span>
        </div>
        <div className="member-hero-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEdit((x) => !x)}>
            {edit ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit profile</>}
          </button>
          <button type="button" className="btn btn-hot btn-sm" onClick={exportCommunityJson}>
            <Download size={14} /> Export JSON
          </button>
        </div>
      </section>

      {edit ? (
        <section className="member-edit">
          <div className="field-group">
            <label htmlFor="member-name">Name</label>
            <input id="member-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field-group">
            <label htmlFor="member-handle">Handle</label>
            <input id="member-handle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value.replace(/[^a-z0-9_]/gi, '') })} />
          </div>
          <div className="field-group">
            <label htmlFor="member-bio">Bio</label>
            <textarea id="member-bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>
          <div className="field-group">
            <label htmlFor="member-building">What are you building?</label>
            <input id="member-building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} placeholder="e.g. local developer workstation" />
          </div>
          <div className="field-row">
            <div className="field-group">
              <label htmlFor="member-website">Website</label>
              <input id="member-website" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
            </div>
            <div className="field-group">
              <label htmlFor="member-xhandle">X handle</label>
              <input id="member-xhandle" value={form.xHandle || ''} onChange={(e) => setForm({ ...form, xHandle: e.target.value })} placeholder="@you" />
            </div>
          </div>
          <div className="field-actions">
            <button type="button" className="btn btn-hot" onClick={save}>
              <Save size={14} /> Save local profile
            </button>
          </div>
        </section>
      ) : (
        <section className="member-about">
          <p>{form.bio}</p>
          {form.building && (
            <div className="member-building">
              <strong>Building:</strong> {form.building}
            </div>
          )}
          <div className="member-links">
            {form.website && <a href={form.website} target="_blank" rel="noreferrer"><Globe size={14} /> Website</a>}
            {form.xHandle && <a href={`https://x.com/${form.xHandle.replace('@', '')}`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> X / Twitter</a>}
            {form.github && <a href={form.github} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>}
          </div>
        </section>
      )}

      <section className="member-votes">
        <div className="section-header">
          <h2>Playbook signal votes ({CREATORS.length} mentors)</h2>
          <p className="section-subtitle">Upvote a playbook you applied. Downvote if a source note needs re-verification. Saved locally in your browser.</p>
        </div>
        <div className="vote-list">
          {CREATORS.map((c) => {
            const summary = votes[c.id] || { up: 0, down: 0, score: 0 };
            const mine = myVotes[c.id];
            return (
              <div key={c.id} className="vote-row">
                <div className="vote-info">
                  <strong>{c.name}</strong>
                  <span className="vote-handle">{c.handle}</span>
                </div>
                <div className="vote-bar-wrap">
                  <span className="vote-score">{summary.score} pts</span>
                  {summary.up + summary.down > 0 ? (
                    <div className="vote-ratio-bar" title={`${Math.round((summary.up / (summary.up + summary.down)) * 100)}% positive feedback`}>
                      <div className="fill" style={{ width: `${(summary.up / (summary.up + summary.down)) * 100}%` }} />
                    </div>
                  ) : (
                    <div className="vote-ratio-bar empty" title="No feedback yet">
                      <div className="fill" style={{ width: '0%' }} />
                    </div>
                  )}
                </div>
                <div className="vote-actions">
                  <button
                    type="button"
                    className={mine === 'up' ? 'active' : ''}
                    onClick={() => toggleVote(c.id, 'up')}
                    title={`Upvote ${c.name}`}
                    aria-label={`Upvote ${c.name}`}
                  >
                    <ThumbsUp size={14} /> <span>{summary.up}</span>
                  </button>
                  <button
                    type="button"
                    className={mine === 'down' ? 'active down' : 'down'}
                    onClick={() => toggleVote(c.id, 'down')}
                    title={`Downvote ${c.name}`}
                    aria-label={`Downvote ${c.name}`}
                  >
                    <ThumbsDown size={14} /> <span>{summary.down}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="member-submit">
        <div className="section-header">
          <h2>Nominate a creator</h2>
          <p className="section-subtitle">Queue a builder nomination locally and export it to JSON for repository pull requests.</p>
        </div>
        {!submitOpen ? (
          <button type="button" className="btn btn-secondary" onClick={() => setSubmitOpen(true)}>
            <Plus size={16} /> Suggest creator
          </button>
        ) : (
          <form className="submit-form" onSubmit={submitNomination}>
            {submitOk ? (
              <div className="submit-ok">
                <CheckCircle size={18} /> Saved to your local nomination queue!
              </div>
            ) : (
              <>
                <div className="field-row">
                  <div className="field-group">
                    <label htmlFor="nom-handle">X handle</label>
                    <input id="nom-handle" name="handle" placeholder="@creator" required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="nom-name">Name</label>
                    <input id="nom-name" name="name" placeholder="Creator name" required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="nom-category">Category</label>
                    <select id="nom-category" name="category" required>
                      <option value="">Pick one...</option>
                      <option value="indie-hackers">Indie hackers</option>
                      <option value="netlify-shippers">Netlify shippers</option>
                      <option value="big-players">Big players</option>
                    </select>
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="nom-reason">Why should they be listed?</label>
                  <textarea id="nom-reason" name="reason" rows={3} placeholder="Share their playbook, product, or public shipping cadence..." required />
                </div>
                <div className="field-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setSubmitOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-hot">
                    <Plus size={14} /> Save nomination
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {nominations.length > 0 && (
          <div className="nomination-list">
            <h3>Saved local nominations ({nominations.length})</h3>
            <ul>
              {nominations.map((n) => (
                <li key={n.id}>
                  <strong>{n.name}</strong> ({n.handle}) · <span>{n.category}</span> — {n.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {(admired.length > 0 || liked.length > 0) && (
        <section className="member-faves">
          {admired.length > 0 && (
            <div className="member-fave-block">
              <h3>Featured mentors</h3>
              <div className="member-fave-chips">
                {admired.map((id) => {
                  const c = CREATORS.find((x) => x.id === id);
                  return c ? <span key={id} className="tag-chip">{c.name}</span> : null;
                })}
              </div>
            </div>
          )}
          {liked.length > 0 && (
            <div className="member-fave-block">
              <h3>Saved playbooks</h3>
              <div className="member-fave-chips">
                {liked.map((id) => {
                  const c = CREATORS.find((x) => x.id === id);
                  return c ? <span key={id} className="tag-chip">{c.name}</span> : null;
                })}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
