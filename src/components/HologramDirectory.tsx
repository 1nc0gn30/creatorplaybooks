import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
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
  const canGl = useMemo(() => webglOk(), []);
  const [open, setOpen] = useState(false);
  const userChose = useRef(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1181px)').matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!desktop || reduced || connection?.saveData || !canGl) return;
    let cancelled = false;
    const show = () => {
      if (!cancelled && !userChose.current) setOpen(true);
    };
    const idle = window.requestIdleCallback?.(show, { timeout: 2200 });
    const timer = window.setTimeout(show, 1600);
    return () => {
      cancelled = true;
      if (typeof idle === 'number') window.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
    };
  }, [reduced, canGl]);

  const toggle = () => {
    userChose.current = true;
    setOpen((value) => !value);
  };

  return (
    <div className="hologram-slot">
      <div className="hologram-slot-bar">
        <p>The card list stays on the page. On a wide screen the hologram opens after the page paints. You can hide it.</p>
        <button type="button" className="btn btn-secondary" aria-pressed={open} onClick={toggle}>
          {open ? 'Hide hologram' : 'Show hologram'}
        </button>
      </div>
      {reduced && <p className="hologram-note">Reduced motion is on, so the hologram stays closed until you open it.</p>}
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
