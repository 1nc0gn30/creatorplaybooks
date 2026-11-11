import { useEffect, useMemo, useState } from 'react';
import type { CreatorProfile } from '../types';
import { buildPlan, GOAL_LENGTHS, todayISO } from '../lib/playbookPlan';
import { completion, datedSteps, dayStreak, downloadIcs, loadGoal, resetGoal, saveGoal, toIcs, type StoredGoal } from '../lib/goalStore';

export function PlaybookGoal({ creator }: { creator: CreatorProfile }) {
  const steps = useMemo(() => buildPlan(creator), [creator]);
  const [days, setDays] = useState<number>(30);
  const [custom, setCustom] = useState('');
  const [start, setStart] = useState(todayISO);
  const [goal, setGoal] = useState<StoredGoal | null>(null);

  useEffect(() => {
    const saved = loadGoal(creator.id);
    setGoal(saved);
    if (saved) {
      setDays(saved.days);
      setStart(saved.start);
      if (!(GOAL_LENGTHS as readonly number[]).includes(saved.days)) setCustom(String(saved.days));
    }
  }, [creator.id]);

  const activeDays = custom.trim() ? Math.min(365, Math.max(1, Number(custom) || days)) : days;
  const dated = goal ? datedSteps(steps, goal) : [];
  const today = todayISO();
  const percent = goal ? completion(steps, goal.checks) : 0;
  const streak = goal ? dayStreak(dated, goal.checks, today) : 0;
  const todays = dated.filter((s) => s.date <= today && !goal?.checks[s.id]);

  const persist = (next: StoredGoal) => {
    saveGoal(next);
    setGoal(next);
  };

  const startGoal = () => {
    const length = custom.trim() ? Math.min(365, Math.max(1, Number(custom) || 30)) : days;
    persist({
      creatorId: creator.id,
      creatorName: creator.name,
      days: length,
      start: start || todayISO(),
      checks: goal?.creatorId === creator.id ? goal.checks : {},
      updatedAt: new Date().toISOString(),
    });
  };

  const toggle = (id: string) => {
    if (!goal) return;
    persist({ ...goal, checks: { ...goal.checks, [id]: !goal.checks[id] } });
  };

  const clear = () => {
    resetGoal(creator.id);
    setGoal(null);
    setCustom('');
  };

  const phases = new Map<string, typeof dated>();
  dated.forEach((step) => {
    const list = phases.get(step.phaseTitle) || [];
    list.push(step);
    phases.set(step.phaseTitle, list);
  });

  return (
    <section className="goal-plan" aria-labelledby={`goal-${creator.id}`}>
      <div className="goal-plan-head">
        <h3 id={`goal-${creator.id}`}>Practice plan</h3>
        <p>Pick how long you want to work this playbook. The steps spread across those days. Suggestions are ours. The study steps point at their public pages.</p>
      </div>

      <fieldset className="goal-lengths">
        <legend>Goal length</legend>
        <div className="goal-length-row">
          {GOAL_LENGTHS.map((n) => (
            <label key={n} className={days === n && !custom.trim() ? 'is-on' : ''}>
              <input
                type="radio"
                name={`len-${creator.id}`}
                checked={days === n && !custom.trim()}
                onChange={() => { setDays(n); setCustom(''); }}
              />
              {n} days
            </label>
          ))}
          <label className={custom.trim() ? 'is-on' : ''}>
            Custom
            <input
              type="number"
              min={1}
              max={365}
              inputMode="numeric"
              aria-label="Custom length in days"
              value={custom}
              placeholder="days"
              onChange={(e) => setCustom(e.target.value)}
            />
          </label>
        </div>
        <label className="goal-start">
          Start date
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <div className="goal-actions">
          <button type="button" className="btn btn-hot" onClick={startGoal}>{goal ? 'Update goal' : 'Start goal'}</button>
          {goal && (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => downloadIcs(`${creator.id}-plan.ics`, toIcs(goal, steps))}>Export calendar</button>
              <button type="button" className="btn btn-secondary" onClick={clear}>Reset</button>
            </>
          )}
        </div>
      </fieldset>

      {goal && (
        <>
          <div className="goal-stats" aria-live="polite">
            <div><strong>{percent}%</strong><span>complete</span></div>
            <div><strong>{streak}</strong><span>day streak</span></div>
            <div><strong>{activeDays}</strong><span>day goal</span></div>
          </div>
          <div className="goal-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Plan progress">
            <span style={{ width: `${percent}%` }} />
          </div>

          <h4>Today</h4>
          {todays.length === 0 ? (
            <p className="goal-empty">Nothing due today. Later steps stay on their dates.</p>
          ) : (
            <ul className="goal-today">
              {todays.map((step) => (
                <li key={step.id}>
                  <label>
                    <input type="checkbox" checked={false} onChange={() => toggle(step.id)} />
                    <span>
                      <strong>{step.title}</strong>
                      <em>{step.date}{step.date < today ? ' · overdue' : ''}</em>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {[...phases.entries()].map(([title, phaseSteps]) => (
            <div key={title} className="goal-phase">
              <h4>{title}</h4>
              <ol>
                {phaseSteps.map((step) => (
                  <li key={step.id}>
                    <label>
                      <input type="checkbox" checked={!!goal.checks[step.id]} onChange={() => toggle(step.id)} />
                      <span>
                        <strong>{step.title}</strong>
                        <em>{step.date} · {step.basis === 'suggestion' ? 'Our suggestion' : 'From their public work'}</em>
                        <p>{step.detail}</p>
                        <p><b>Deliverable.</b> {step.deliverable}</p>
                        <p><b>Checkpoint.</b> {step.checkpoint}</p>
                        {step.sourceUrl && <a href={step.sourceUrl} target="_blank" rel="noreferrer">Source</a>}
                      </span>
                    </label>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
