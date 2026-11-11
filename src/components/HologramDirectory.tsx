import { lazy, Suspense, useMemo, useState } from 'react';
import type { CreatorProfile } from '../types';

const Honeycomb = lazy(() => import('./HoneycombWebGLGrid').then((m) => ({ default: m.HoneycombWebGLGrid })));

function webglOk() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export function HologramDirectory({
  creators,
  onOpen,
  activeId,
}: {
  creators: CreatorProfile[];
  onOpen: (c: CreatorProfile) => void;
  activeId: string | null;
}) {
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [open, setOpen] = useState(false);
  const canGl = useMemo(() => webglOk(), []);

  return (
    <div className="hologram-slot">
      <div className="hologram-slot-bar">
        <p>The card list stays on the page. The hologram is the 3D directory, and it loads only after you open it.</p>
        <button type="button" className="btn btn-secondary" aria-pressed={open} onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide hologram' : 'Show hologram'}
        </button>
      </div>
      {reduced && <p className="hologram-note">Reduced motion is on. The hologram stays closed until you open it.</p>}
      {open && !canGl && <p className="hologram-note" role="alert">WebGL is not available here. Use the cards.</p>}
      {open && canGl && (
        <div className="hologram-stage">
          <Suspense fallback={<p className="hologram-note">Loading the 3D directory.</p>}>
            <Honeycomb filteredCreators={creators} openCreatorModal={onOpen} modalCreatorId={activeId} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
