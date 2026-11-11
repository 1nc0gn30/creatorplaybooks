import { useState } from 'react';
import type { CreatorProfile } from '../types';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

function thumbSrc(avatar: string, id: string) {
  const match = avatar.match(/\/creators\/([^/]+)\//);
  return `/creators/thumbs/${match?.[1] || id}.webp`;
}

function Avatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="mentor-tile-fallback" aria-hidden="true">{initials(name)}</span>;
  }
  return (
    <img
      src={src}
      alt=""
      width={72}
      height={72}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function MentorDirectory({
  creators,
  activeId,
  onOpen,
}: {
  creators: CreatorProfile[];
  activeId: string | null;
  onOpen: (creator: CreatorProfile) => void;
}) {
  return (
    <ul className="mentor-board">
      {creators.map((creator) => (
        <li key={creator.id}>
          <button type="button" className={`mentor-tile${activeId === creator.id ? ' is-active' : ''}`} onClick={() => onOpen(creator)} aria-current={activeId === creator.id ? 'true' : undefined}>
            <Avatar src={thumbSrc(creator.avatar, creator.id)} name={creator.name} />
            <span className="mentor-tile-copy">
              <span className="mentor-tile-name">{creator.name}</span>
              <span className="mentor-tile-handle">{creator.handle}</span>
              {creator.currentFocus && <span className="mentor-tile-focus">{creator.currentFocus}</span>}
            </span>
            <span className="mentor-tile-meta">{creator.followersStr} on X</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
