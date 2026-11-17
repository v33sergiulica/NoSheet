import { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { SimpleTableSetup } from './components/SimpleTable/SimpleTableSetup';
import { TableView } from './components/SimpleTable/TableView';
import { SavedGames } from './components/SavedGames';
import type { SimpleTableConfig } from './types';
import { loadActiveTable, saveActiveTable, saveTableToHistory } from './utils/storage';

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
    setView('setup-new');
  };

  const handleOpenSavedGames = () => {
    setView('saved-games');
  };

  const handleResumeActiveTable = () => {
    if (activeTable) {
      setView('table');
    }
  };

  // Table Generation
  const handleGenerateNewTable = (newTable: SimpleTableConfig) => {
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
    setActiveTable(game);
    saveActiveTable(game);
    setView('table');
  };

  const handleBackToMenu = () => {
    setView('menu');
  };

  const handleEditConfig = () => {
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
        />
      )}

      {view === 'setup-edit' && (
        <SimpleTableSetup
          onBack={() => setView('table')}
          onGenerate={handleGenerateNewTable}
          initialConfig={activeTable}
          isEditingExisting={true}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      )}

      {view === 'saved-games' && (
        <SavedGames
          onBack={handleBackToMenu}
          onSelectGame={handleSelectSavedGame}
          isDark={isDark}
          onToggleTheme={toggleTheme}
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
        />
      )}
    </div>
  );
}

export default App;
