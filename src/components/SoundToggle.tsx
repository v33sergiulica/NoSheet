import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ isMuted, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      type="button"
      className="p-2 rounded-xl transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)]"
      title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
      aria-label="Toggle sound effects"
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 text-[var(--text-muted)]" strokeWidth={1.75} />
      ) : (
        <Volume2 className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
      )}
    </button>
  );
};
