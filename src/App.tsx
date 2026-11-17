import { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { SimpleTableSetup } from './components/SimpleTable/SimpleTableSetup';
import { TableView } from './components/SimpleTable/TableView';
import { SavedGames } from './components/SavedGames';
import type { SimpleTableConfig } from './types';
import { loadActiveTable, saveActiveTable, saveTableToHistory } from './utils/storage';
import { getSoundMuted, toggleSoundMuted, playTapSound } from './utils/sound';

type AppView = 'menu' | 'setup-new' | 'setup-edit' | 'saved-games' | 'table';

export function App() {
  const [view, setView] = useState<AppView>('menu');
  const [activeTable, setActiveTable] = useState<SimpleTableConfig | null>(() => loadActiveTable());

  // Dark mode state: default to dark (Warm Espresso) or from localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('table_theme');
    if (saved) return saved === 'dark';
    return false; // start with Warm Paper or check preference
  });

  // Sound effects mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => getSoundMuted());

  const handleToggleSound = () => {
    const next = toggleSoundMuted();
    setIsMuted(next);
    if (!next) {
      playTapSound();
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('table_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('table_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Synchronize active table and history
  useEffect(() => {
    saveActiveTable(activeTable);
    if (activeTable) {
      saveTableToHistory(activeTable);
    }
  }, [activeTable]);

  // Menu Actions
  const handleSelectNewTable = () => {
    playTapSound();
    setView('setup-new');
  };

  const handleOpenSavedGames = () => {
    playTapSound();
    setView('saved-games');
  };

  const handleResumeActiveTable = () => {
    playTapSound();
    if (activeTable) {
      setView('table');
    }
  };

  // Table Generation
  const handleGenerateNewTable = (newTable: SimpleTableConfig) => {
    playTapSound();
    setActiveTable(newTable);
    saveActiveTable(newTable);
    saveTableToHistory(newTable);
    setView('table');
  };

  const handleUpdateTable = (updatedTable: SimpleTableConfig) => {
    setActiveTable(updatedTable);
    saveActiveTable(updatedTable);
    saveTableToHistory(updatedTable);
  };

  const handleSelectSavedGame = (game: SimpleTableConfig) => {
    playTapSound();
    setActiveTable(game);
    saveActiveTable(game);
    setView('table');
  };

  const handleBackToMenu = () => {
    playTapSound();
    setView('menu');
  };

  const handleEditConfig = () => {
    playTapSound();
    setView('setup-edit');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)] selection:text-white">
      {view === 'menu' && (
        <MainMenu
          onSelectSimpleTable={handleSelectNewTable}
          onOpenSavedGames={handleOpenSavedGames}
          activeTable={activeTable}
          onResumeActiveTable={handleResumeActiveTable}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {view === 'setup-new' && (
        <SimpleTableSetup
          onBack={handleBackToMenu}
          onGenerate={handleGenerateNewTable}
          initialConfig={null}
          isEditingExisting={false}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {view === 'setup-edit' && (
        <SimpleTableSetup
          onBack={() => {
            playTapSound();
            setView('table');
          }}
          onGenerate={handleGenerateNewTable}
          initialConfig={activeTable}
          isEditingExisting={true}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {view === 'saved-games' && (
        <SavedGames
          onBack={handleBackToMenu}
          onSelectGame={handleSelectSavedGame}
          activeTableId={activeTable?.id}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {view === 'table' && activeTable && (
        <TableView
          table={activeTable}
          onUpdateTable={handleUpdateTable}
          onBackToMenu={handleBackToMenu}
          onEditConfig={handleEditConfig}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}
    </div>
  );
}

export default App;
