import React from 'react';
import { Smartphone, Share, PlusSquare, MoreVertical, Download, X } from 'lucide-react';
import { playTapSound } from '../utils/sound';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onNativeInstall?: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onNativeInstall,
}) => {
  // Automatically detect platform (iOS vs other)
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  if (!isOpen) return null;

  const handleDismiss = () => {
    playTapSound();
    localStorage.setItem('nosheet_install_guide_seen', 'true');
    onClose();
  };

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-paper)] rounded-2xl p-5 shadow-xl relative"
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4 pr-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle-bg)] text-[var(--accent)] border border-[var(--accent-subtle-border)] flex items-center justify-center shrink-0 shadow-2xs">
            <Smartphone className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Add to your Phone
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Install for full-screen access and offline support.
            </p>
          </div>
        </div>

        {/* Dynamic Content: iOS takes precedence because iOS never supports native 1-tap prompts */}
        {isIOS ? (
          /* iOS Safari: Flattened Borderless List */
          <ol className="space-y-3 pt-1 text-xs text-[var(--text-secondary)]">
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Tap the{' '}
                <span className="font-semibold text-[var(--text-primary)] inline-flex items-center gap-1">
                  Share icon <Share className="w-3.5 h-3.5 inline text-[var(--accent)]" />
                </span>{' '}
                at the bottom of Safari
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span>
                Scroll down and tap{' '}
                <span className="font-semibold text-[var(--text-primary)] inline-flex items-center gap-1">
                  Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-[var(--accent)]" />
                </span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span>
                Tap <span className="font-semibold text-[var(--text-primary)]">Add</span> in the top right corner
              </span>
            </li>
          </ol>
        ) : deferredPrompt && onNativeInstall ? (
          /* Native 1-Tap Install (Android / Chrome) */
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onNativeInstall();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" strokeWidth={2.5} />
              <span>Install App</span>
            </button>
          </div>
        ) : (
          /* Android / Other Browsers Manual Fallback */
          <ol className="space-y-3 pt-1 text-xs text-[var(--text-secondary)]">
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Tap the{' '}
                <span className="font-semibold text-[var(--text-primary)] inline-flex items-center gap-0.5">
                  menu <MoreVertical className="w-3.5 h-3.5 inline text-[var(--accent)]" />
                </span>{' '}
                in the top right of Chrome
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span>
                Tap <span className="font-semibold text-[var(--text-primary)]">Install app</span> or{' '}
                <span className="font-semibold text-[var(--text-primary)]">Add to Home screen</span>
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-[var(--accent-subtle-bg)] text-[var(--accent)] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <span>
                Confirm by tapping <span className="font-semibold text-[var(--text-primary)]">Install</span>
              </span>
            </li>
          </ol>
        )}
      </div>
    </div>
  );
};
