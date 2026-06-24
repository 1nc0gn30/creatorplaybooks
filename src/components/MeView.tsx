import type { BuilderProfile } from '../types';
export function MeView({ profile, setProfile }: { profile: BuilderProfile; setProfile: (p: BuilderProfile) => void }) {
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
