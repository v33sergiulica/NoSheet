import React from 'react';
import { ArrowLeft, ArrowRight, Dices, Sparkles, Layers, Flame } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { SoundToggle } from '../SoundToggle';
import { playTapSound } from '../../utils/sound';

interface PresetGamesMenuProps {
  onBack: () => void;
  onSelectWhist: () => void;
  onSelectBelota: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export const PresetGamesMenu: React.FC<PresetGamesMenuProps> = ({
  onBack,
  onSelectWhist,
  onSelectBelota,
  isDark,
  onToggleTheme,
  isMuted = false,
  onToggleSound = () => {},
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col justify-start sm:justify-center px-4 pt-4 pb-8 sm:pt-6 sm:pb-10 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        {/* Navigation & Toggles */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => {
              playTapSound();
              onBack();
            }}
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>Menu</span>
          </button>
          <div className="flex items-center gap-2">
            <SoundToggle isMuted={isMuted} onToggle={onToggleSound} />
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent-subtle-bg)] text-[var(--accent-subtle-text)] border border-[var(--accent-subtle-border)] mb-2 shadow-2xs">
            <Dices className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-1 font-serif">
            Preset Games
          </h1>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-xs mx-auto text-balance">
            Instant scorecards with pre-configured rules, card progressions, and dealer rotation.
          </p>
        </div>

        {/* Preset Games List */}
        <div className="space-y-3">
          {/* Game 1: Romanian Whist */}
          <button
            onClick={() => {
              playTapSound();
              onSelectWhist();
            }}
            className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)] hover:border-[var(--accent)] transition-all cursor-pointer group shadow-2xs relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-[var(--accent-subtle-bg)] text-[var(--accent)] border border-[var(--accent-subtle-border)]">
                    3–6 Players
                  </span>
                  <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                    Popular
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                  Romanian Whist
                </h2>
              </div>

              <div className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] group-hover:bg-[var(--accent)] group-hover:text-white flex items-center justify-center text-[var(--text-muted)] transition-all shrink-0">
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
          </button>

          {/* Game 2: Belota */}
          <button
            onClick={() => {
              playTapSound();
              onSelectBelota();
            }}
            className="w-full text-left p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)] hover:border-[var(--accent)] transition-all cursor-pointer group shadow-2xs relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-[var(--accent-subtle-bg)] text-[var(--accent)] border border-[var(--accent-subtle-border)]">
                    4 Players (2 Teams)
                  </span>
                  <span className="text-xs font-medium text-[var(--text-muted)] flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[var(--accent)]" />
                    Hot
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors font-serif">
                  Belota
                </h2>
              </div>

              <div className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] group-hover:bg-[var(--accent)] group-hover:text-white flex items-center justify-center text-[var(--text-muted)] transition-all shrink-0">
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
          </button>

          {/* Coming Soon Notice */}
          <div className="p-4 rounded-2xl bg-[var(--bg-surface)]/50 border border-dashed border-[var(--border-paper)] flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-card)] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <span>More games coming soon: Rentz, Bridge, ...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
