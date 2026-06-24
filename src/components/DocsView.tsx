import type { CreatorProfile } from '../types';
const CANONICAL_URL = 'https://hotappsummer-mayagrowth.netlify.app';
export function DocsView({ activeCreator }: { activeCreator: CreatorProfile }) {
  const endpoints = [
    { method: 'GET', path: '/api/creators', desc: 'All creators with full playbooks' },
    { method: 'GET', path: '/api/creator?id=' + activeCreator.id, desc: 'Single creator playbook' },
    { method: 'GET', path: '/api/playbook?creator=' + activeCreator.id, desc: 'Markdown playbook export' },
    { method: 'GET', path: '/api/ideas?creator=' + activeCreator.id + '&count=6', desc: 'AI-generated content ideas' },
    { method: 'GET', path: '/api/export?creator=' + activeCreator.id, desc: 'Agent-ready JSON bundle' },
  ];
  return (
    <div className="page docs-page">
      <h2 className="page-title">Docs & API</h2>
      <p className="page-subtitle">Everything is available as JSON for agents, automations, and custom UIs.</p>
      <div className="docs-grid">
        {endpoints.map((ep) => (
          <a key={ep.path} href={`${CANONICAL_URL}${ep.path}`} target="_blank" rel="noreferrer" className="docs-card">
            <span className="docs-method">{ep.method}</span>
            <code className="docs-path">{ep.path}</code>
            <p>{ep.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
