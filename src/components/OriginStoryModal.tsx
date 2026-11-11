import { X, ArrowRight } from 'lucide-react';

export function OriginStoryModal({ close }: { close: () => void }) {
  const particles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="origin-backdrop" onClick={close}>
      <div className="origin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Rotating border gradient highlight */}
        <div className="origin-shine" />
        
        {/* Floating particles background */}
        <div className="origin-particles">
          {particles.map((i) => (
            <div 
              key={i} 
              className="origin-particle" 
              style={{ '--i': i } as React.CSSProperties} 
            />
          ))}
        </div>

        <button className="modal-close" onClick={close} title="Close story"><X size={20} /></button>
        
        {/* Banner Section */}
        <div className="origin-banner">
          <div className="origin-logo-ring">
            <img src="/brand-mark.webp" alt="" width={48} height={48} className="origin-brand-img" />
          </div>
          <div className="origin-title-block">
            <span className="origin-kicker">Origin Story</span>
            <h2 className="origin-title">A reading list, not a course.</h2>
            <div className="origin-credits">
              Published by <a href="https://x.com/NealFrazierTech" target="_blank" rel="noreferrer">Neal Frazier Tech</a>
              <span className="origin-inspired"> · inspired by <a href="https://x.com/buildwithmaya" target="_blank" rel="noreferrer">@buildwithmaya</a></span>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="origin-body">
          <p className="lead" style={{ marginBottom: '20px' }}>
            The pages collect what public builders are doing, in the places they actually name.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '16px' }}>
            Neal Frazier Tech publishes the site. The idea of studying one person’s posting habits came from @buildwithmaya. The facts were checked on 11 Nov 2026.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '16px' }}>
            Read a page, take one play, and write your own version. The JSON is the same text, for a script.
          </p>
          <div className="highlight-box" style={{ marginTop: '24px', marginBottom: '8px' }}>
            Pick one person. Read the sources. Write the post yourself.
          </div>
        </div>

        {/* Action Button Section */}
        <div className="origin-actions">
          <button className="btn btn-hot btn-lg origin-cta" onClick={close}>
            <span className="origin-cta-shine" />
            <ArrowRight size={18} /> Go to the directory
          </button>
        </div>
      </div>
    </div>
  );
}
