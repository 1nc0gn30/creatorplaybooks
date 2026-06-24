import type { ReactNode } from 'react';

export function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button className={`tab ${active ? 'active' : ''}`} onClick={onClick} title={label}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
