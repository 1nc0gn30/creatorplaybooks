import { useState } from 'react';
import type { CreatorProfile } from '../types';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

const CANONICAL_URL = 'https://creatorplaybooks.netlify.app';

export function DocsView({ activeCreator }: { activeCreator: CreatorProfile }) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const endpoints = [
    { method: 'GET', path: '/api/creators', desc: 'All creators with full playbooks' },
    { method: 'GET', path: '/api/creator?id=' + activeCreator.id, desc: 'Single creator playbook JSON' },
    { method: 'GET', path: '/api/playbook?creator=' + activeCreator.id, desc: 'Markdown playbook export' },
    { method: 'GET', path: '/api/ideas?creator=' + activeCreator.id + '&count=6', desc: 'AI-generated content ideas' },
    { method: 'GET', path: '/api/export?creator=' + activeCreator.id, desc: 'Agent-ready JSON bundle' },
  ];

  const handleCopy = (fullUrl: string, path: string) => {
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="page docs-page">
      <div className="docs-header" style={{ marginBottom: '24px' }}>
        <h2 className="page-title">Docs & API</h2>
        <p className="page-subtitle">Every creator playbook is fully exposed as structured JSON for AI agents, Cursor prompts, or custom automation workflows.</p>
      </div>

      {/* Digestible cute Overview Section */}
      <div className="docs-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%)', border: '1px solid rgba(236, 72, 153, 0.15)', borderRadius: '20px', padding: '24px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>🚀</span>
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--primary)', fontWeight: 800 }}>For Shippers (Users)</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.6, margin: 0 }}>
            Study verified growth plays from top creators. Keep consistent by drafting your weekly posts in the scheduler, track your daily streak, and level up your creator rank as you log your progress!
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%)', border: '1px solid rgba(34, 211, 238, 0.15)', borderRadius: '20px', padding: '24px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>🤖</span>
            <h3 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--accent)', fontWeight: 800 }}>For Builders (Developers & Agents)</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', lineHeight: 1.6, margin: 0 }}>
            Integrate playbook knowledge directly into your local IDE or AI agents. Copy pre-built agent prompts, download complete config folders, or fetch playbooks programmatically from our endpoints.
          </p>
        </div>
      </div>

      {/* Base URL Banner */}
      <div className="docs-base-banner" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Terminal size={18} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 600 }}>API Base URL:</span>
          <code style={{ fontFamily: 'var(--mono)', color: 'var(--ink)', fontSize: '0.95rem', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '6px' }}>{CANONICAL_URL}</code>
        </div>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => handleCopy(CANONICAL_URL, 'base')}
          style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
        >
          {copiedPath === 'base' ? <><Check size={12} style={{ color: 'var(--success)' }} /> Copied</> : <><Copy size={12} /> Copy Base</>}
        </button>
      </div>

      <div className="docs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '18px' }}>
        {endpoints.map((ep) => {
          const fullUrl = `${CANONICAL_URL}${ep.path}`;
          const isCopied = copiedPath === ep.path;
          return (
            <div key={ep.path} className="docs-card" style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.2s ease', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span className="docs-method" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>{ep.method}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => handleCopy(fullUrl, ep.path)}
                    className="icon-only" 
                    title="Copy full endpoint URL"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px', color: isCopied ? 'var(--success)' : 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <a 
                    href={fullUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="icon-only"
                    title="Open API endpoint"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <code style={{ fontFamily: 'var(--mono)', fontSize: '0.86rem', color: 'var(--accent)', wordBreak: 'break-all', background: 'rgba(34, 211, 238, 0.04)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.08)' }}>{ep.path}</code>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-muted)', margin: '4px 0 0' }}>{ep.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
