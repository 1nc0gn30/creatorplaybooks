import { useState } from 'react';
import type { CreatorProfile } from '../types';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { site } from '../lib/site';

export function DocsView({ activeCreator }: { activeCreator: CreatorProfile }) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const endpoints = [
    { method: 'GET', path: '/api/creators', desc: 'The mentor list' },
    { method: 'GET', path: '/api/creator?id=' + activeCreator.id, desc: 'One mentor, short form' },
    { method: 'GET', path: '/api/playbook?creator=' + activeCreator.id, desc: 'Plays only' },
    { method: 'GET', path: '/api/ideas?creator=' + activeCreator.id + '&count=6', desc: 'Draft lines built from that mentor’s hooks' },
    { method: 'GET', path: '/api/export?creator=' + activeCreator.id, desc: 'A zip of the same notes' },
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
          Reference
        </div>
        <h2 className="page-title">API</h2>
        <p className="page-subtitle">Each mentor is a JSON document. The host is set in site.json, so these links move with the domain.</p>
      </div>

      <div className="docs-overview-grid">
        <div className="docs-overview-card shippers">
          <div className="docs-overview-card-icon">
            <h3>Reading</h3>
          </div>
          <p>
            Open a mentor page, copy one play, and put a draft on the dashboard if you want a day of the week attached to it.
          </p>
        </div>

        <div className="docs-overview-card builders">
          <div className="docs-overview-card-icon">
            <h3>Fetching</h3>
          </div>
          <p>
            GET a path below. The body matches the page: profile, plays, hooks, and the source list.
          </p>
        </div>
      </div>

      <div className="docs-base-banner">
        <div className="docs-base-banner-inner">
          <Terminal size={18} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 600 }}>API Base URL:</span>
          <code>{site.origin}</code>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => handleCopy(site.origin, 'base')}
          style={{ padding: '7px 14px', fontSize: '0.8rem', borderRadius: '10px' }}
        >
          {copiedPath === 'base' ? <><Check size={12} style={{ color: 'var(--success)' }} /> Copied</> : <><Copy size={12} /> Copy Base</>}
        </button>
      </div>

      <div className="docs-grid">
        {endpoints.map((ep) => {
          const fullUrl = `${site.origin}${ep.path}`;
          const isCopied = copiedPath === ep.path;
          return (
            <div key={ep.path} className="docs-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span className="docs-method">{ep.method}</span>
                <div className="docs-card-actions">
                  <button
                    onClick={() => handleCopy(fullUrl, ep.path)}
                    className="docs-card-action"
                    title="Copy full endpoint URL"
                  >
                    {isCopied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  </button>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="docs-card-action"
                    title="Open API endpoint"
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