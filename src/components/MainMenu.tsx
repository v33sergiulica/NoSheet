import React from 'react';
import { Table2, Dices, ArrowRight, Play, History } from 'lucide-react';
import type { SimpleTableConfig } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface MainMenuProps {
  onSelectSimpleTable: () => void;
  onOpenSavedGames: () => void;
  activeTable: SimpleTableConfig | null;
  onResumeActiveTable: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onSelectSimpleTable,
  onOpenSavedGames,
  activeTable,
  onResumeActiveTable,
  isDark,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        {/* Top Controls: Theme Toggle */}
        <div className="flex justify-end mb-6">
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>

        {/* Header - Editorial Style with Official Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="./icon.png"
              alt="No Sheet logo"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-md border border-[var(--border-paper)] object-cover"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-2 font-serif">
            No Sheet
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-sm mx-auto text-balance">
            Simple digital pen-and-paper score table generator with custom column thickness.
          </p>
        </div>

        {/* Resume Banner */}
        {activeTable && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-paper)] flex items-center justify-between gap-4 shadow-2xs">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active Game</p>
              <p className="text-[var(--text-primary)] font-bold text-base mt-0.5 truncate max-w-[200px]">
                {activeTable.title}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-mono tabular-nums mt-0.5">
                {activeTable.rows.length} rounds • {activeTable.columns.length} columns
              </p>
            </div>
            <button
              onClick={onResumeActiveTable}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.75} />
              Resume
            </button>
          </div>
        )}

        {/* Main Options */}
        <div className="space-y-3">
          {/* Option 1: Custom Table (New Table) */}
          <button
            onClick={onSelectSimpleTable}
            className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)] hover:border-[var(--border-strong)] transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle-bg)] text-[var(--accent-subtle-text)] flex items-center justify-center border border-[var(--accent-subtle-border)] shrink-0">
                  <Table2 className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                    New Table
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                    Configure rows and column thickness (e.g. <span className="font-mono text-[var(--accent)] font-semibold">2 1 2 1</span>)
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-white group-hover:bg-[var(--accent)] transition-all shrink-0">
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          </button>

          {/* Option 2: Saved Games */}
          <button
            onClick={onOpenSavedGames}
            className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)] hover:border-[var(--border-strong)] transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-paper)] shrink-0">
                  <History className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                    Saved Games
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                    View previous tables and crash-safe history
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-white group-hover:bg-[var(--accent)] transition-all shrink-0">
                <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
          </button>

          {/* Option 3: Preset Games: Subtle */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)]/60 border border-[var(--border-paper)] flex items-center justify-between gap-4 select-none opacity-70">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-card)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
                <Dices className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-[var(--text-secondary)] font-serif">
                  Preset Games
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Pre-built templates (Whist, Uno, Yahtzee)
                </p>
              </div>
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
