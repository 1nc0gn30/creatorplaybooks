import { Calendar, MessageSquare, Zap, Plus, RefreshCw, Flame, Trash2 } from 'lucide-react';
import type { ContentIdea, ScheduledPost } from '../types';
export function DashboardView({ progress, setProgress, score, level, ideas, refreshIdeas, schedule, addScheduled, removeScheduled, newPost, setNewPost, newDay, setNewDay, activeCreator }: any) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return (
    <div className="page dashboard-page">
      <div className="dashboard-header">
        <h2 className="page-title">Growth dashboard</h2>
        <p className="page-subtitle">Track what matters and run your next play.</p>
      </div>
      <div className="dashboard-metrics">
        <div className="metric-card metric-score">
          <div className="score-ring-v2" style={{ '--score': `${score.overall}%` } as React.CSSProperties}>
            <span className="score-number">{score.overall}</span>
            <span className="score-label">health</span>
          </div>
          <div className="score-details">
            <div className="metric-info">
              <strong className="level-title">Level {level.level}: {level.title}</strong>
              <span className="level-xp">{level.next - progress.xp} XP to next level</span>
            </div>
            <div className="score-breakdown">
              <div className="score-bar-row">
                <div className="score-bar-label">
                  <span>Consistency</span>
                  <span className="value">{score.consistency}%</span>
                </div>
                <div className="progress-bar"><div className="fill" style={{ width: `${score.consistency}%`, background: 'var(--primary)' }} /></div>
              </div>
              <div className="score-bar-row">
                <div className="score-bar-label">
                  <span>Engagement</span>
                  <span className="value">{score.engagement}%</span>
                </div>
                <div className="progress-bar"><div className="fill" style={{ width: `${score.engagement}%`, background: 'var(--accent)' }} /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="metric-card metric-streak">
          <Flame size={22} className="metric-icon" />
          <div className="metric-num-wrap">
            <strong>{progress.streak}</strong>
            <span>day streak</span>
          </div>
        </div>
        <div className="metric-card metric-posts">
          <Calendar size={22} className="metric-icon" />
          <div className="metric-num-wrap">
            <strong>{progress.postsThisWeek}</strong>
            <span>posts this week</span>
          </div>
        </div>
        <div className="metric-card metric-replies">
          <MessageSquare size={22} className="metric-icon" />
          <div className="metric-num-wrap">
            <strong>{progress.repliesToday}</strong>
            <span>replies today</span>
          </div>
        </div>
        <div className="metric-card metric-xp">
          <Zap size={22} className="metric-icon" />
          <div className="metric-num-wrap">
            <strong>{progress.xp}</strong>
            <span>total XP</span>
          </div>
        </div>
      </div>
      <div className="dashboard-actions">
        <button className="btn btn-hot log-post-btn" onClick={() => setProgress({ ...progress, postsThisWeek: progress.postsThisWeek + 1, xp: progress.xp + 12, lastPostDate: new Date().toISOString().slice(0, 10) })} data-tooltip="Gain +12 XP!"><Plus size={14} /> Log a post</button>
        <button className="btn btn-secondary log-reply-btn" onClick={() => setProgress({ ...progress, repliesToday: progress.repliesToday + 1, xp: progress.xp + 3 })} data-tooltip="Gain +3 XP!"><MessageSquare size={14} /> Log reply</button>
        <button className="btn btn-secondary extend-streak-btn" onClick={() => setProgress({ ...progress, streak: progress.streak + 1, xp: progress.xp + 5 })} data-tooltip="Gain +5 XP!"><Flame size={14} /> Extend streak</button>
      </div>
      <div className="dashboard-ideas">
        <div className="section-header-inline">
          <h3 className="section-title-small">Ideas from {activeCreator.name}</h3>
          <button className="btn btn-sm btn-secondary" onClick={refreshIdeas}><RefreshCw size={14} /> Refresh</button>
        </div>
        <div className="ideas-grid">
          {ideas.map((idea: ContentIdea) => (
            <div key={idea.id} className="idea-card-v2">
              <div className="idea-card-header">
                <span className="idea-format badge" style={{ background: `${activeCreator.theme.primary}15`, color: activeCreator.theme.primary, borderColor: `${activeCreator.theme.primary}30` }}>{idea.format}</span>
              </div>
              <p className="idea-hook">{idea.hook}</p>
              <p className="idea-angle">{idea.angle}</p>
              <div className="idea-tags">{idea.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="dashboard-scheduler">
        <h3 className="section-title-small">Content schedule</h3>
        <div className="schedule-input">
          <select value={newDay} onChange={(e) => setNewDay(e.target.value)}>{days.map((d) => <option key={d} value={d}>{d}</option>)}</select>
          <input type="text" placeholder="Draft your post..." value={newPost} onChange={(e) => setNewPost(e.target.value)} />
          <button className="btn btn-hot" onClick={addScheduled}><Plus size={14} /> Add</button>
        </div>
        <div className="schedule-board">
          {days.map((d) => (
            <div key={d} className="day-column">
              <div className="day-title">{d}</div>
              <div className="day-posts-v2">
                {schedule.filter((s: ScheduledPost) => s.day === d).map((s: ScheduledPost) => (
                  <div key={s.id} className="scheduled-post-v2">
                    <span>{s.content}</span>
                    <button onClick={() => removeScheduled(s.id)} title="Remove" style={{ opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                  </div>
                ))}
                {schedule.filter((s: ScheduledPost) => s.day === d).length === 0 && (
                  <div className="empty-day">Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
