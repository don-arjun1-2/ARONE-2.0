import React from 'react';
import { Activity } from 'lucide-react';

export type NavTab = 'hud' | 'console' | 'telemetry' | 'profiler' | 'queue';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onQuickAction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onQuickAction,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-cyan-950/80 bg-[#040816]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('hud');
        }}
        className="text-lg font-bold tracking-widest text-slate-100 whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
      >
        ARONE
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400" aria-label="Main Navigation">
        <button
          type="button"
          onClick={() => onSelectTab('hud')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'hud' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Holographic HUD
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('console')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'console' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Executive Console
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('telemetry')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'telemetry' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          System Telemetry
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('profiler')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'profiler' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Architecture Lab
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('queue')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'queue' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Tactical Queue
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onQuickAction}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
          aria-label="Run Diagnostic Suite"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Diagnostic Pulse</span>
        </button>
      </div>
    </header>
  );
};
