import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, Users, Dices, ChevronRight } from 'lucide-react';
import type { SimpleTableConfig } from '../../types';
import { ThemeToggle } from '../ThemeToggle';
import { SoundToggle } from '../SoundToggle';
import { playTapSound } from '../../utils/sound';
import {
  getShortestUniqueAbbreviations,
  getWhistCardSequence,
  createWhistTableConfig,
} from '../../utils/whist';

interface WhistSetupProps {
  onBack: () => void;
  onGenerate: (config: SimpleTableConfig) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export const WhistSetup: React.FC<WhistSetupProps> = ({
  onBack,
  onGenerate,
  isDark,
  onToggleTheme,
  isMuted = false,
  onToggleSound = () => {},
}) => {
  // 1. Number of Players (3 to 6, default 4)
  const [playerCount, setPlayerCount] = useState<number>(4);

  // 2. Player Names
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Serj',
    'Dave',
    'Dick',
    'Alex',
    'Player 5',
    'Player 6',
  ]);

  // 3. Variant: 'short' (1-8-1) or 'long' (8-1-8)
  const [variant, setVariant] = useState<'short' | 'long'>('short');

  // 4. Column Order: 'tricks-first' (1 2) or 'score-first' (2 1)
  const [columnOrder, setColumnOrder] = useState<'tricks-first' | 'score-first'>('score-first');

  // Active names for the selected player count
  const activeNames = useMemo(() => {
    return playerNames.slice(0, playerCount).map((n, i) => {
      const trimmed = n.trim();
      return trimmed.length > 0 ? trimmed : `Player ${i + 1}`;
    });
  }, [playerNames, playerCount]);

  // Shortest unique abbreviations for dealers
  const dealerAbbreviations = useMemo(() => {
    return getShortestUniqueAbbreviations(activeNames);
  }, [activeNames]);

  // Card sequence for preview
  const cardSequence = useMemo(() => {
    return getWhistCardSequence(playerCount, variant);
  }, [playerCount, variant]);

  const handlePlayerNameChange = (index: number, newName: string) => {
    setPlayerNames((prev) => {
      const updated = [...prev];
      updated[index] = newName;
      return updated;
    });
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();

    const config = createWhistTableConfig({
      playerCount,
      playerNames: activeNames,
      variant,
      columnOrder,
    });

    onGenerate(config);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] px-4 py-6 sm:px-6 lg:px-8 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            onBack();
          }}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          <span>Presets</span>
        </button>

        <div className="flex items-center gap-2">
          <SoundToggle isMuted={isMuted} onToggle={onToggleSound} />
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>

      <form onSubmit={handleStartGame} className="space-y-5">
        {/* Title Card */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-paper)] shadow-2xs">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-subtle-bg)] text-[var(--accent-subtle-text)] flex items-center justify-center border border-[var(--accent-subtle-border)] shrink-0">
              <Dices className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-serif">
                Romanian Whist
              </h1>
              <span className="text-xs text-[var(--text-muted)]">
                Preset configuration with automated rules
              </span>
            </div>
          </div>
        </div>

        {/* 1. Number of Players */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-paper)] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>1. Number of Players</span>
            </label>
            <span className="text-xs font-mono font-bold text-[var(--accent)]">
              {playerCount} Players
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  playTapSound();
                  setPlayerCount(num);
                }}
                className={`py-2.5 rounded-xl font-mono font-bold text-sm transition-all cursor-pointer border ${
                  playerCount === num
                    ? 'bg-[var(--accent-subtle-bg)] text-[var(--accent)] border-[var(--accent-subtle-border)] shadow-2xs scale-102'
                    : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border-paper)] hover:border-[var(--border-strong)]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Names of Players */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-paper)] shadow-2xs space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            2. Player Names & Dealer Order
          </label>

          <div className="space-y-2">
            {Array.from({ length: playerCount }).map((_, idx) => {
              const abbr = dealerAbbreviations[idx] || `P${idx + 1}`;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-[var(--bg-input)] p-1.5 px-3 rounded-xl border border-[var(--border-paper)] focus-within:border-[var(--accent)] transition-colors"
                >
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-4 text-center">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={playerNames[idx] ?? ''}
                    onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                    placeholder={`Player ${idx + 1}`}
                    className="flex-1 bg-transparent text-sm font-semibold text-[var(--text-primary)] focus:outline-none"
                    required
                  />
                  {/* Smart Abbreviation Pill */}
                  <span
                    className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-paper)] text-[var(--accent)] shrink-0"
                    title={`Dealer abbreviation: ${abbr}`}
                  >
                    {abbr}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Dealer Abbreviation Explanation */}
          <div className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-paper)] text-xs text-[var(--text-muted)] flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)] shrink-0">Dealer cycles:</span>
            <span className="font-mono font-bold text-[var(--accent)] truncate">
              {dealerAbbreviations.join(' → ')} → {dealerAbbreviations[0]}...
            </span>
          </div>
        </div>

        {/* 3. Short (1 8 1) vs Long (8 1 8) */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-paper)] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
              3. Card Sequence Format
            </label>
            <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
              {cardSequence.length} rounds
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setVariant('short');
              }}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                variant === 'short'
                  ? 'bg-[var(--accent-subtle-bg)] border-[var(--accent-subtle-border)] shadow-2xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-paper)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-[var(--text-primary)] font-serif">
                  Short (1 8 1)
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-paper)]">
                  Standard
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Starts at 1 card, climbs to 8, finishes at 1 card.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound();
                setVariant('long');
              }}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                variant === 'long'
                  ? 'bg-[var(--accent-subtle-bg)] border-[var(--accent-subtle-border)] shadow-2xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-paper)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-[var(--text-primary)] font-serif">
                  Long (8 1 8)
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--accent)] border border-[var(--border-paper)]">
                  Reverse
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Starts at 8 cards, drops to 1, finishes at 8 cards.
              </p>
            </button>
          </div>

          {/* Sequence Preview Track */}
          <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-paper)] text-[11px] font-mono font-bold text-[var(--text-secondary)] flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
            <span className="text-[var(--text-muted)] font-serif text-xs">Cards:</span>
            {cardSequence.map((val, idx) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 rounded ${
                  val === 8 || val === 1
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
                }`}
              >
                {val}
              </span>
            ))}
          </div>
        </div>

        {/* 4. Column Order: Tricks First vs Score First */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-paper)] shadow-2xs space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            4. Player Column Layout
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setColumnOrder('score-first');
              }}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                columnOrder === 'score-first'
                  ? 'bg-[var(--accent-subtle-bg)] border-[var(--accent-subtle-border)] shadow-2xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-paper)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Score First (2 1)
                </span>
                <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
                  2 1
                </span>
              </div>
              <div className="flex gap-1 text-[10px] font-mono font-bold">
                <span className="flex-2 py-1 px-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-paper)] text-center text-[var(--text-primary)]">
                  Score
                </span>
                <span className="flex-1 py-1 px-1 rounded bg-[var(--accent-subtle-bg)] border border-[var(--accent-subtle-border)] text-center text-[var(--accent)]">
                  Bid
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound();
                setColumnOrder('tricks-first');
              }}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer border ${
                columnOrder === 'tricks-first'
                  ? 'bg-[var(--accent-subtle-bg)] border-[var(--accent-subtle-border)] shadow-2xs'
                  : 'bg-[var(--bg-input)] border-[var(--border-paper)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  Tricks First (1 2)
                </span>
                <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
                  1 2
                </span>
              </div>
              <div className="flex gap-1 text-[10px] font-mono font-bold">
                <span className="flex-1 py-1 px-1 rounded bg-[var(--accent-subtle-bg)] border border-[var(--accent-subtle-border)] text-center text-[var(--accent)]">
                  Bid
                </span>
                <span className="flex-2 py-1 px-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-paper)] text-center text-[var(--text-primary)]">
                  Score
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Start Game Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              playTapSound();
              onBack();
            }}
            className="px-5 py-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
            <span>Start Whist Game</span>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </form>
    </div>
  );
};
