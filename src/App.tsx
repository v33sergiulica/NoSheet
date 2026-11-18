import { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { SimpleTableSetup } from './components/SimpleTable/SimpleTableSetup';
import { TableView } from './components/SimpleTable/TableView';
import { SavedGames } from './components/SavedGames';
import { PresetGamesMenu } from './components/PresetGames/PresetGamesMenu';
import { WhistSetup } from './components/PresetGames/WhistSetup';
import { BelotaSetup } from './components/PresetGames/BelotaSetup';
import { InstallGuideModal } from './components/InstallGuideModal';
import type { SimpleTableConfig } from './types';
import { loadActiveTable, saveActiveTable, saveTableToHistory } from './utils/storage';
import { getSoundMuted, toggleSoundMuted, playTapSound } from './utils/sound';

type AppView = 'menu' | 'setup-new' | 'setup-edit' | 'saved-games' | 'preset-games' | 'preset-whist' | 'preset-belota' | 'table';

export function App() {
  const [view, setView] = useState<AppView>('menu');
  const [activeTable, setActiveTable] = useState<SimpleTableConfig | null>(() => loadActiveTable());

  // First-time visit & PWA install guide state
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      if (isStandalone) return false;
      const hasSeen = localStorage.getItem('nosheet_install_guide_seen');
      return !hasSeen;
    }
    return false;
  });

  // Native beforeinstallprompt support (Chrome/Android/Desktop)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('nosheet_install_guide_seen', 'true');
      setIsInstallGuideOpen(false);
    }
    setDeferredPrompt(null);
  };

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

  const handleOpenPresetGames = () => {
    playTapSound();
    setView('preset-games');
  };

  const handleSelectWhist = () => {
    playTapSound();
    setView('preset-whist');
  };

  const handleSelectBelota = () => {
    playTapSound();
    setView('preset-belota');
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
          onOpenPresetGames={handleOpenPresetGames}
          onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
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

      {view === 'preset-games' && (
        <PresetGamesMenu
          onBack={handleBackToMenu}
          onSelectWhist={handleSelectWhist}
          onSelectBelota={handleSelectBelota}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {view === 'preset-whist' && (
        <WhistSetup
          onBack={() => {
            playTapSound();
            setView('preset-games');
          }}
          onGenerate={handleGenerateNewTable}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {view === 'preset-belota' && (
        <BelotaSetup
          onBack={() => {
            playTapSound();
            setView('preset-games');
          }}
          onGenerate={handleGenerateNewTable}
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

      {/* First-time & on-demand Install / Add to Phone Tutorial Modal */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
        deferredPrompt={deferredPrompt}
        onNativeInstall={handleNativeInstall}
      />
    </div>
  );
}

export default App;
