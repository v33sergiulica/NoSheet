import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Trash2, Play, Calendar, Layers, Sparkles } from 'lucide-react';
import type { SimpleTableConfig } from '../types';
import { getSavedTables, deleteTableFromHistory } from '../utils/storage';
import { ThemeToggle } from './ThemeToggle';
import { SoundToggle } from './SoundToggle';
import { playTapSound } from '../utils/sound';

interface SavedGamesProps {
  onBack: () => void;
  onSelectGame: (game: SimpleTableConfig) => void;
  activeTableId?: string | null;
  isDark: boolean;
  onToggleTheme: () => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
}

export const SavedGames: React.FC<SavedGamesProps> = ({
  onBack,
  onSelectGame,
  activeTableId,
  isDark,
  onToggleTheme,
  isMuted = false,
  onToggleSound = () => {},
}) => {
  const [savedGames, setSavedGames] = useState<SimpleTableConfig[]>([]);

  useEffect(() => {
    setSavedGames(getSavedTables());
  }, []);

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from saved games?`)) return;
    playTapSound();
    const updated = deleteTableFromHistory(id);
    setSavedGames(updated);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] px-4 py-6 sm:px-6 lg:px-8 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            playTapSound();
            onBack();
          }}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          Back
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <SoundToggle isMuted={isMuted} onToggle={onToggleSound} />
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
            Game History
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Resume your last match or revisit previous game nights
          </p>
        </div>

        {savedGames.length === 0 ? (
          <div className="p-8 text-center bg-[var(--bg-card)] rounded-2xl border border-[var(--border-paper)] mt-6 shadow-2xs">
            <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-60" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-[var(--text-primary)]">No saved games yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Any table you create or score you enter is automatically saved here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 mt-4">
            {savedGames.map((game, index) => {
              const isLast = activeTableId ? game.id === activeTableId : index === 0;

              return (
                <div
                  key={game.id}
                  className={`p-4 rounded-2xl transition-all flex items-center justify-between gap-3 shadow-2xs group ${
                    isLast
                      ? 'bg-[var(--bg-card)] border-2 border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
                      : 'bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] border border-[var(--border-paper)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-[var(--text-primary)] font-serif truncate">
                        {game.title}
                      </h3>
                      {isLast && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[var(--accent)] text-white shadow-2xs flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Last Played
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1 font-mono tabular-nums">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {game.rows.length} rounds • {game.columns.length} cols
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-sans">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
                        {formatDate(game.lastModified || game.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDelete(game.id, game.title)}
                      className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                      title="Delete game"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    </button>

                    <button
                      onClick={() => onSelectGame(game)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                        isLast
                          ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white'
                          : 'bg-[var(--bg-surface)] hover:bg-[var(--accent)] hover:text-white text-[var(--text-primary)] border border-[var(--border-paper)]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.75} />
                      {isLast ? 'Resume' : 'Open'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
