import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, Users, Dices, ChevronRight } from 'lucide-react';
import type { SimpleTableConfig } from '../../types';
import { ThemeToggle } from '../ThemeToggle';
import { SoundToggle } from '../SoundToggle';
import { playTapSound } from '../../utils/sound';
import { getShortestUniqueAbbreviations } from '../../utils/whist';
import { createBelotaTableConfig } from '../../utils/belota';

interface BelotaSetupProps {
  onBack: () => void;
  onGenerate: (config: SimpleTableConfig) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export const BelotaSetup: React.FC<BelotaSetupProps> = ({
  onBack,
  onGenerate,
  isDark,
  onToggleTheme,
  isMuted = false,
  onToggleSound = () => {},
}) => {
  // Team 1 & its 2 players
  const [team1Name, setTeam1Name] = useState<string>('Team 1');
  const [team1P1, setTeam1P1] = useState<string>('Player 1');
  const [team1P2, setTeam1P2] = useState<string>('Player 3');

  // Team 2 & its 2 players
  const [team2Name, setTeam2Name] = useState<string>('Team 2');
  const [team2P1, setTeam2P1] = useState<string>('Player 2');
  const [team2P2, setTeam2P2] = useState<string>('Player 4');

  // Alternating deal order around the table:
  // Team 1 Player 1 -> Team 2 Player 1 -> Team 1 Player 2 -> Team 2 Player 2
  const dealOrderNames = useMemo(() => {
    return [
      team1P1.trim() || 'Player 1',
      team2P1.trim() || 'Player 2',
      team1P2.trim() || 'Player 3',
      team2P2.trim() || 'Player 4',
    ];
  }, [team1P1, team2P1, team1P2, team2P2]);

  const dealerAbbreviations = useMemo(() => {
    return getShortestUniqueAbbreviations(dealOrderNames);
  }, [dealOrderNames]);

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();

    const config = createBelotaTableConfig({
      team1Name,
      team1Players: [team1P1, team1P2],
      team2Name,
      team2Players: [team2P1, team2P2],
      initialRows: 12,
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

      <form onSubmit={handleStartGame} className="space-y-4">
        {/* Title Card */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-paper)] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-subtle-bg)] text-[var(--accent-subtle-text)] flex items-center justify-center border border-[var(--accent-subtle-border)] shrink-0">
              <Dices className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-serif">
                Belota
              </h1>
              <span className="text-xs text-[var(--text-muted)]">
                4 players in 2 teams • Circular dealer rotation
              </span>
            </div>
          </div>
        </div>

        {/* Team 1 Section */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 border border-[var(--border-paper)] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Team 1</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
              Team 1 Name
            </label>
            <input
              type="text"
              value={team1Name}
              onFocus={(e) => {
                if (team1Name === 'Team 1') setTeam1Name('');
                else e.target.select();
              }}
              onBlur={() => {
                if (!team1Name || team1Name.trim() === '') setTeam1Name('Team 1');
              }}
              onChange={(e) => setTeam1Name(e.target.value)}
              placeholder="Team 1"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-xl px-3.5 py-2 text-[var(--text-primary)] font-semibold text-sm focus:outline-none focus:border-[var(--accent)] shadow-2xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                Player 1
              </label>
              <input
                type="text"
                value={team1P1}
                onFocus={(e) => {
                  if (team1P1 === 'Player 1') setTeam1P1('');
                  else e.target.select();
                }}
                onBlur={() => {
                  if (!team1P1 || team1P1.trim() === '') setTeam1P1('Player 1');
                }}
                onChange={(e) => setTeam1P1(e.target.value)}
                placeholder="Player 1"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                Player 2
              </label>
              <input
                type="text"
                value={team1P2}
                onFocus={(e) => {
                  if (team1P2 === 'Player 3') setTeam1P2('');
                  else e.target.select();
                }}
                onBlur={() => {
                  if (!team1P2 || team1P2.trim() === '') setTeam1P2('Player 3');
                }}
                onChange={(e) => setTeam1P2(e.target.value)}
                placeholder="Player 3"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>
          </div>
        </div>

        {/* Team 2 Section */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 sm:p-5 border border-[var(--border-paper)] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Team 2</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
              Team 2 Name
            </label>
            <input
              type="text"
              value={team2Name}
              onFocus={(e) => {
                if (team2Name === 'Team 2') setTeam2Name('');
                else e.target.select();
              }}
              onBlur={() => {
                if (!team2Name || team2Name.trim() === '') setTeam2Name('Team 2');
              }}
              onChange={(e) => setTeam2Name(e.target.value)}
              placeholder="Team 2"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-xl px-3.5 py-2 text-[var(--text-primary)] font-semibold text-sm focus:outline-none focus:border-[var(--accent)] shadow-2xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                Player 1
              </label>
              <input
                type="text"
                value={team2P1}
                onFocus={(e) => {
                  if (team2P1 === 'Player 2') setTeam2P1('');
                  else e.target.select();
                }}
                onBlur={() => {
                  if (!team2P1 || team2P1.trim() === '') setTeam2P1('Player 2');
                }}
                onChange={(e) => setTeam2P1(e.target.value)}
                placeholder="Player 2"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                Player 2
              </label>
              <input
                type="text"
                value={team2P2}
                onFocus={(e) => {
                  if (team2P2 === 'Player 4') setTeam2P2('');
                  else e.target.select();
                }}
                onBlur={() => {
                  if (!team2P2 || team2P2.trim() === '') setTeam2P2('Player 4');
                }}
                onChange={(e) => setTeam2P2(e.target.value)}
                placeholder="Player 4"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-paper)] rounded-xl px-3 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                required
              />
            </div>
          </div>
        </div>

        {/* Circular Dealer Order Banner */}
        <div className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-paper)] shadow-2xs text-xs space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Circular Dealer Order:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-semibold text-[var(--text-primary)]">
            <span className="px-2 py-0.5 rounded-md bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono font-bold">
              {dealerAbbreviations[0]} ({dealOrderNames[0]})
            </span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="px-2 py-0.5 rounded-md bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono font-bold">
              {dealerAbbreviations[1]} ({dealOrderNames[1]})
            </span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="px-2 py-0.5 rounded-md bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono font-bold">
              {dealerAbbreviations[2]} ({dealOrderNames[2]})
            </span>
            <span className="text-[var(--text-muted)]">→</span>
            <span className="px-2 py-0.5 rounded-md bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono font-bold">
              {dealerAbbreviations[3]} ({dealOrderNames[3]})
            </span>
            <span className="text-[var(--text-muted)]">...</span>
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
            <span>Start Belota Game</span>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </form>
    </div>
  );
};
