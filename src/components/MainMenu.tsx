import React from 'react';
import { Table2, Dices, ArrowRight, History, Smartphone } from 'lucide-react';
import type { SimpleTableConfig } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { SoundToggle } from './SoundToggle';
import { playTapSound } from '../utils/sound';
import logoImg from '../assets/logo.png';

interface MainMenuProps {
  onSelectSimpleTable: () => void;
  onOpenSavedGames: () => void;
  onOpenPresetGames: () => void;
  onOpenInstallGuide?: () => void;
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
  onOpenPresetGames,
  onOpenInstallGuide,
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
              src={logoImg}
              alt="No Sheet logo"
              className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl shadow-md border border-[var(--border-paper)] object-cover"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] font-serif">
            No Sheet
          </h1>
          <p className="text-sm sm:text-base font-semibold tracking-wide text-[var(--accent)] font-serif italic mt-0.5 mb-1.5">
            No worries.
          </p>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-xs mx-auto text-balance">
            Make custom scoresheets for any game.
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
          <button
            onClick={() => {
              playTapSound();
              onOpenPresetGames();
            }}
            className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)] hover:border-[var(--border-strong)] transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle-bg)] text-[var(--accent-subtle-text)] flex items-center justify-center border border-[var(--accent-subtle-border)] shrink-0">
                  <Dices className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                  Preset Games
                </h2>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-white group-hover:bg-[var(--accent)] transition-all shrink-0">
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          </button>
        </div>

        {/* Footer Link: Add to Phone / Install Tutorial */}
        <div className="mt-5 sm:mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onOpenInstallGuide?.();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-subtle-bg)]/40 border border-transparent hover:border-[var(--accent-subtle-border)] transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Add app to phone</span>
          </button>
        </div>
      </div>
    </div>
  );
};
