import React from 'react';
import { useGame } from '../context/GameContext';
import { GameSettings } from '../types/game';
import { Volume2, VolumeX, Save, BarChart3, Settings, ShieldCheck, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenStats, onOpenSettings }) => {
  const { state, setActiveTab, toggleSound, manualSave, getEnergyStats } = useGame();
  const [saveFlash, setSaveFlash] = React.useState(false);
  const energy = getEnergyStats();

  const navItems: { id: GameSettings['activeTab']; label: string }[] = [
    { id: 'overview', label: 'Command' },
    { id: 'production', label: 'Production' },
    { id: 'storage', label: 'Logistics' },
    { id: 'research', label: 'Research' },
    { id: 'exploration', label: 'Exploration' },
    { id: 'wonders', label: 'Wonders' },
  ];

  const handleManualSave = () => {
    manualSave();
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-display text-xl lg:text-2xl font-bold tracking-wider text-slate-100 group-hover:text-cyan-400 transition-colors uppercase">
              Project Nova
            </span>
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 text-[11px] font-mono">
            {energy.net >= 0 ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>GRID NOMINAL</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span>GRID DEFICIT</span>
              </span>
            )}
          </div>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = state.settings.activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-all rounded ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSave}
            title="Save game to local storage"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-200 hover:text-white transition-all whitespace-nowrap"
          >
            <Save className={`w-3.5 h-3.5 ${saveFlash ? 'text-emerald-400 animate-spin' : ''}`} />
            <span className="hidden sm:inline">{saveFlash ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={toggleSound}
            title={state.settings.soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="p-1.5 rounded border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            {state.settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={onOpenStats}
            title="Telemetry Statistics"
            className="p-1.5 rounded border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Mission Settings & Save Management"
            className="p-1.5 rounded border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-2.5 pt-2 border-t border-slate-800/60 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = state.settings.activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2 py-1 text-[11px] font-medium tracking-wide whitespace-nowrap transition-colors rounded ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
