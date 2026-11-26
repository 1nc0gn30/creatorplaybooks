import { useMemo, useState } from 'react';
import type { CreatorProfile } from '../types';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { site } from '../lib/site';
import '../styles/auth-pages.css';

function resolveApiBase(): string {
  const host = window.location.hostname;
  if (host === '127.0.0.1' || host === 'localhost' || host === '[::1]') {
    return window.location.origin;
  }
  return site.origin;
}

export function DocsView({ activeCreator }: { activeCreator: CreatorProfile }) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const apiBase = useMemo(() => resolveApiBase(), []);

  const endpoints = [
    { method: 'GET', path: '/health', desc: 'Service telemetry, version (1.1.0), and creator/play/place totals' },
    { method: 'GET', path: '/api/creators', desc: 'Full 35-mentor index (supports ?q=, ?category=, ?tag=)' },
    { method: 'GET', path: `/api/creator?id=${activeCreator.id}&expand=all`, desc: 'One mentor with plays, hooks, angles, products, and verified sources' },
    { method: 'GET', path: `/api/playbook?creator=${activeCreator.id}`, desc: 'Repeatable plays only for a specific mentor' },
    { method: 'GET', path: `/api/ideas?creator=${activeCreator.id}&count=6`, desc: 'Draft post ideas synthesized from that mentor’s hooks and angles' },
    { method: 'GET', path: `/api/export?creator=${activeCreator.id}`, desc: 'Downloadable JSON agent-kit bundle (add &format=md for a Markdown pack)' },
  ];

  const handleCopy = (fullUrl: string, path: string) => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="page docs-page">
      <div className="docs-header">
        <div className="docs-header-badge">
          Reference · v1.1.0
        </div>
        <h2 className="page-title">API &amp; Agent Protocol</h2>
        <p className="page-subtitle">Each mentor is served from the same shared dataset (shared/creators.json) both locally on 127.0.0.1:5185 and on Netlify Functions.</p>
      </div>

      <div className="docs-overview-grid">
        <div className="docs-overview-card shippers">
          <div className="docs-overview-card-icon">
            <h3>Loopback &amp; Cloud Parity</h3>
          </div>
          <p>
            Every GET endpoint below works offline on <code>127.0.0.1:5185</code> via <code>server.mjs</code> and online via Netlify Functions with strict Host/Origin enforcement.
          </p>
        </div>

        <div className="docs-overview-card builders">
          <div className="docs-overview-card-icon">
            <h3>Hermes Agent Plugin Tools</h3>
          </div>
          <p>
            The Hermes plugin exposes 5 read-only tools: <code>creatorplaybooks_mentors</code>, <code>creatorplaybooks_mentor</code>, <code>creatorplaybooks_playbook</code>, <code>creatorplaybooks_ideas</code>, and <code>creatorplaybooks_goal_plan</code>.
          </p>
        </div>
      </div>

      <div className="docs-base-banner">
        <div className="docs-base-banner-inner">
          <Terminal size={18} style={{ color: 'var(--accent)' }} />
          <span className="docs-base-label">API Base URL:</span>
          <code>{apiBase}</code>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => handleCopy(apiBase, 'base')}
        >
          {copiedPath === 'base' ? <><Check size={14} style={{ color: 'var(--success)' }} /> Copied</> : <><Copy size={14} /> Copy Base</>}
        </button>
      </div>

      <div className="docs-grid">
        {endpoints.map((ep) => {
          const fullUrl = `${apiBase}${ep.path}`;
          const isCopied = copiedPath === ep.path;
          return (
            <div key={ep.path} className="docs-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span className="docs-method">{ep.method}</span>
                <div className="docs-card-actions">
                  <button
                    type="button"
                    onClick={() => handleCopy(fullUrl, ep.path)}
                    className="docs-card-action"
                    title="Copy full endpoint URL"
                    aria-label={`Copy ${ep.path}`}
                  >
                    {isCopied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  </button>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="docs-card-action"
                    title="Open API endpoint"
                    aria-label={`Open ${ep.path}`}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <code className="docs-card-code">{ep.path}</code>
                <p className="docs-card-desc">{ep.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
