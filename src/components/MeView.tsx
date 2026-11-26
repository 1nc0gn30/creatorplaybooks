import { useState } from 'react';
import type { BuilderProfile } from '../types';
import { User, Target, Link2, FileText, Eye, Accessibility, Palette } from 'lucide-react';
import { loadAllGoals } from '../lib/goalStore';
import '../styles/auth-pages.css';

export function MeView({ profile, setProfile }: { profile: BuilderProfile; setProfile: (p: BuilderProfile) => void }) {
  const initials = profile.name ? profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'B';

  return (
    <div className="page me-page">
      <div className="me-header">
        <div className="me-header-badge">
          <Palette size={12} />
          Builder Profile
        </div>
        <h2 className="page-title">Your details</h2>
        <p className="page-subtitle">Name, links, and reading preferences saved directly in this browser.</p>
      </div>

      <div className="me-grid-layout">
        <div className="me-left-col">
          {/* Form Card */}
          <div className="me-card me-form-card">
            <h3>
              <User size={18} style={{ color: 'var(--secondary)' }} />
              Edit Details
            </h3>
            <div className="me-form">
              <div className="me-form-row">
                <div className="me-field">
                  <label htmlFor="me-name">Name</label>
                  <input id="me-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="me-field">
                  <label htmlFor="me-handle">Handle</label>
                  <input id="me-handle" value={profile.handle} onChange={(e) => setProfile({ ...profile, handle: e.target.value })} placeholder="@handle" />
                </div>
              </div>
              <div className="me-form-row">
                <div className="me-field">
                  <label htmlFor="me-project">
                    <Target size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    Project Name
                  </label>
                  <input id="me-project" value={profile.project} onChange={(e) => setProfile({ ...profile, project: e.target.value })} />
                </div>
                <div className="me-field">
                  <label htmlFor="me-url">
                    <Link2 size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    URL
                  </label>
                  <input id="me-url" value={profile.url} onChange={(e) => setProfile({ ...profile, url: e.target.value })} placeholder="https://" />
                </div>
              </div>
              <div className="me-field">
                <label htmlFor="me-bio">
                  <FileText size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  Bio
                </label>
                <textarea id="me-bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
              </div>
              <div className="me-field">
                <label htmlFor="me-goal">Goal</label>
                <textarea id="me-goal" value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} rows={2} />
              </div>
            </div>
          </div>

          {/* Accessibility Settings Card */}
          <div className="me-card me-acc-card">
            <h3>
              <Accessibility size={18} style={{ color: 'var(--secondary)' }} />
              Accessibility Preferences
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label className="me-acc-toggle" htmlFor="me-acc-large">
                <input
                  id="me-acc-large"
                  type="checkbox"
                  className="me-acc-toggle-checkbox"
                  checked={!!profile.accessibilityPreferences?.largeText}
                  onChange={(e) => setProfile({
                    ...profile,
                    accessibilityPreferences: {
                      ...profile.accessibilityPreferences,
                      largeText: e.target.checked
                    }
                  })}
                />
                <div className="me-acc-toggle-info">
                  <strong>Large Typography</strong>
                  <span>Increase default typography sizes for readability</span>
                </div>
              </label>

              <label className="me-acc-toggle" htmlFor="me-acc-contrast">
                <input
                  id="me-acc-contrast"
                  type="checkbox"
                  className="me-acc-toggle-checkbox"
                  checked={!!profile.accessibilityPreferences?.highContrast}
                  onChange={(e) => setProfile({
                    ...profile,
                    accessibilityPreferences: {
                      ...profile.accessibilityPreferences,
                      highContrast: e.target.checked
                    }
                  })}
                />
                <div className="me-acc-toggle-info">
                  <strong>High Contrast Highlights</strong>
                  <span>Emphasize paragraphs and sections with clean contrast highlights</span>
                </div>
              </label>

              <label className="me-acc-toggle" htmlFor="me-acc-motion">
                <input
                  id="me-acc-motion"
                  type="checkbox"
                  className="me-acc-toggle-checkbox"
                  checked={!!profile.accessibilityPreferences?.reducedMotion}
                  onChange={(e) => setProfile({
                    ...profile,
                    accessibilityPreferences: {
                      ...profile.accessibilityPreferences,
                      reducedMotion: e.target.checked
                    }
                  })}
                />
                <div className="me-acc-toggle-info">
                  <strong>Reduced Motion</strong>
                  <span>Disable keyframe animation glows and dynamic visual drifts</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Contained Normal-Flow Preview Card */}
        <div className="me-card me-preview-card">
          <div className="me-preview-label">
            <Eye size={11} />
            Live Preview
          </div>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Your Card</h3>
          <div className="me-preview-card-inner">
            <div className="me-preview-banner" />
            <div className="me-preview-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="me-preview-body">
              <div className="me-preview-top">
                <div className="me-preview-title">
                  <h4 className="me-preview-name">{profile.name || 'Your name'}</h4>
                  <span className="me-preview-handle">{profile.handle || '@handle'}</span>
                </div>
                <span className="me-preview-badge">Builder</span>
              </div>
              <p className="me-preview-bio">{profile.bio || 'Your bio shows here.'}</p>
              {profile.project && (
                <div className="me-preview-project-chip">
                  Shipping {profile.project}
                </div>
              )}
              <div className="me-preview-stats">
                <span><strong>{profile.streak}</strong> streak</span>
                <span><strong>{profile.xp}</strong> XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GoalList />
    </div>
  );
}

function GoalList() {
  const [goals] = useState(() => loadAllGoals());
  if (!goals.length) return null;
  return (
    <section className="goal-saved">
      <h3>Saved practice goals</h3>
      <ul>
        {goals.map((g) => (
          <li key={g.creatorId}>{g.creatorName}: {g.days} days from {g.start}. {Object.values(g.checks).filter(Boolean).length} steps checked.</li>
        ))}
      </ul>
    </section>
  );
}
