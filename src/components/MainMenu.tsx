import React from 'react';
import { Table2, Dices, ArrowRight, History } from 'lucide-react';
import type { SimpleTableConfig } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { SoundToggle } from './SoundToggle';
import { playTapSound } from '../utils/sound';

interface MainMenuProps {
  onSelectSimpleTable: () => void;
  onOpenSavedGames: () => void;
  activeTable?: SimpleTableConfig | null;
  onResumeActiveTable?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectSimpleTable,
  onOpenSavedGames,
  isDark,
  onToggleTheme,
  isMuted = false,
  onToggleSound = () => {},
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col justify-start sm:justify-center px-4 pt-3 pb-8 sm:pt-6 sm:pb-10 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        {/* Top Controls: Sound & Theme Toggles */}
        <div className="flex items-center justify-end gap-2 mb-2 sm:mb-3">
          <SoundToggle isMuted={isMuted} onToggle={onToggleSound} />
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>

        {/* Header - Editorial Style with Official Logo */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="flex justify-center mb-2.5 sm:mb-3">
            <img
              src="./icon.png"
              alt="No Sheet logo"
              className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl shadow-md border border-[var(--border-paper)] object-cover"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-1 font-serif">
            No Sheet
          </h1>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-xs mx-auto text-balance">
            Ditch the scrap paper. Custom scorecards for any card game.
          </p>
        </div>

        {/* Main Options */}
        <div className="space-y-3">
          {/* Option 1: New Table */}
          <button
            onClick={() => {
              playTapSound();
              onSelectSimpleTable();
            }}
            className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)] hover:border-[var(--border-strong)] transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle-bg)] text-[var(--accent-subtle-text)] flex items-center justify-center border border-[var(--accent-subtle-border)] shrink-0">
                  <Table2 className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                  New Table
                </h2>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-white group-hover:bg-[var(--accent)] transition-all shrink-0">
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          </button>

          {/* Option 2: Saved Games */}
          <button
            onClick={() => {
              playTapSound();
              onOpenSavedGames();
            }}
            className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)] hover:border-[var(--border-strong)] transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-paper)] shrink-0">
                  <History className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                  Saved Games
                </h2>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-white group-hover:bg-[var(--accent)] transition-all shrink-0">
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          </button>

          {/* Option 3: Preset Games */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)]/60 border border-[var(--border-paper)] flex items-center justify-between gap-4 select-none opacity-60">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
                <Dices className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-[var(--text-secondary)] font-serif">
                Preset Games
              </h2>
            </div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-paper)]">
              Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
