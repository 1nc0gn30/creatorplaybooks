import type { BuilderProfile } from '../types';

export function MeView({ profile, setProfile }: { profile: BuilderProfile; setProfile: (p: BuilderProfile) => void }) {
  const initials = profile.name ? profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'B';

  return (
    <div className="page me-page">
      <div className="me-header" style={{ marginBottom: '28px' }}>
        <h2 className="page-title">Builder profile</h2>
        <p className="page-subtitle">Who you are, what you ship, and where you are headed.</p>
      </div>

      <div className="me-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '28px' }}>
        {/* Left Side: Form and Accessibility Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Form Card */}
          <div className="me-card me-form-card" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Edit Details</h3>
            <div className="me-form" style={{ display: 'grid', gap: '16px' }}>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="me-name-input" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Name</label>
                  <input id="me-name-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="me-handle-input" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Handle</label>
                  <input id="me-handle-input" value={profile.handle} onChange={(e) => setProfile({ ...profile, handle: e.target.value })} placeholder="@handle" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="me-project-input" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Project Name</label>
                  <input id="me-project-input" value={profile.project} onChange={(e) => setProfile({ ...profile, project: e.target.value })} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="me-url-input" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>URL</label>
                  <input id="me-url-input" value={profile.url} onChange={(e) => setProfile({ ...profile, url: e.target.value })} placeholder="https://" style={{ width: '100%' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="me-bio-input" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Bio</label>
                <textarea id="me-bio-input" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="me-goal-input" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Goal</label>
                <textarea id="me-goal-input" value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} rows={2} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Accessibility Settings Card */}
          <div className="me-card me-acc-card" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Accessibility Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.94rem', color: 'var(--ink-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={!!profile.accessibilityPreferences?.largeText} 
                  onChange={(e) => setProfile({
                    ...profile,
                    accessibilityPreferences: {
                      ...profile.accessibilityPreferences,
                      largeText: e.target.checked
                    }
                  })} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <strong style={{ display: 'block', color: 'var(--ink)', fontWeight: 600 }}>Large Typography</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>Increase default typography sizes for readability.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.94rem', color: 'var(--ink-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={!!profile.accessibilityPreferences?.highContrast} 
                  onChange={(e) => setProfile({
                    ...profile,
                    accessibilityPreferences: {
                      ...profile.accessibilityPreferences,
                      highContrast: e.target.checked
                    }
                  })} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <strong style={{ display: 'block', color: 'var(--ink)', fontWeight: 600 }}>High Contrast Highlights</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>Emphasize paragraphs and sections with clean contrast highlights.</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.94rem', color: 'var(--ink-muted)' }}>
                <input 
                  type="checkbox" 
                  checked={!!profile.accessibilityPreferences?.reducedMotion} 
                  onChange={(e) => setProfile({
                    ...profile,
                    accessibilityPreferences: {
                      ...profile.accessibilityPreferences,
                      reducedMotion: e.target.checked
                    }
                  })} 
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <strong style={{ display: 'block', color: 'var(--ink)', fontWeight: 600 }}>Reduced Motion</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>Disable keyframe animation glows and dynamic visual drifts.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Preview Card */}
        <div className="me-card me-preview-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Preview Card</h3>
          <div className="creator-card-clean" style={{ cursor: 'default', pointerEvents: 'none', background: 'rgba(18, 18, 26, 0.7)', '--card-primary': 'var(--primary)', '--card-accent': 'var(--accent)' } as React.CSSProperties}>
            <div className="creator-card-clean-banner" style={{ height: '80px', background: 'linear-gradient(135deg, var(--primary) 40%, var(--accent) 40%)' }} />
            <div className="creator-card-clean-avatar avatar-fallback" style={{ top: '42px', width: '64px', height: '64px', fontSize: '1.1rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
              {initials}
            </div>
            <div className="creator-card-clean-body" style={{ padding: '36px 20px 20px' }}>
              <div className="creator-card-clean-top" style={{ marginBottom: '8px' }}>
                <div className="creator-card-clean-title">
                  <h3 className="creator-card-clean-name" style={{ fontSize: '1.1rem' }}>{profile.name || 'Your name'}</h3>
                  <span className="creator-card-clean-handle">{profile.handle || '@handle'}</span>
                </div>
                <span className="status-badge" style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.2)', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '99px', fontWeight: 700 }}>Builder</span>
              </div>
              <p className="creator-card-clean-bio" style={{ fontSize: '0.84rem', margin: '0 0 12px' }}>{profile.bio || 'Your bio will appear here. Share what you build!'}</p>
              {profile.project && (
                <div className="tag-chip" style={{ background: 'rgba(34, 211, 238, 0.1)', borderColor: 'rgba(34, 211, 238, 0.2)', color: 'var(--accent)', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '99px', display: 'inline-block', marginBottom: '14px', fontWeight: 600 }}>
                  🚀 Shipping {profile.project}
                </div>
              )}
              <div className="creator-card-clean-stats" style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                <span><strong>{profile.streak}</strong> streak</span>
                <span><strong>{profile.xp}</strong> XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
