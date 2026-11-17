import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      type="button"
      className="p-2 rounded-xl transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)]"
      title={isDark ? 'Switch to Warm Paper (Light)' : 'Switch to Warm Espresso (Dark)'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#d96b52]" strokeWidth={1.75} />
      ) : (
        <Moon className="w-4 h-4 text-[#78716c]" strokeWidth={1.75} />
      )}
    </button>
  );
};
