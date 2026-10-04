import React from 'react';
import { useGame } from '../context/GameContext';
import { RESOURCE_DEFS, CELESTIAL_BODIES, TECH_DEFS } from '../data/gameData';
import { formatNumber, formatDuration } from '../utils/format';
import { BarChart3, X, Clock, MousePointer, Building2, Atom, Globe2 } from 'lucide-react';

interface StatsModalProps {
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ onClose }) => {
  const { state } = useGame();

  const totalGathered = state.stats.totalGathered || {};
  const colonizedCount = Object.values(state.celestialBodies).filter((b) => b.explored).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-[#0c101c] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-display uppercase tracking-wider">
              Mission Telemetry Statistics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time Played</span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {formatDuration(state.stats.totalTimePlayedMs / 1000)}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Manual Extractions</span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {formatNumber(state.stats.manualClicks)}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Facilities Built</span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {formatNumber(state.stats.totalBuildingsConstructed)}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Atom className="w-3.5 h-3.5 text-indigo-400" />
              <span>Techs Researched</span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {state.stats.totalTechsResearched} / {TECH_DEFS.length}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Worlds Colonized</span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {colonizedCount} / {CELESTIAL_BODIES.length}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <BarChart3 className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Megastructures</span>
            </div>
            <div className="text-sm font-mono font-bold text-slate-100">
              {Object.values(state.wonders).filter((w) => w.currentStage > 0).length} / 3 Active
            </div>
          </div>
        </div>

        {/* Lifetime Resources Gathered */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            LIFETIME RESOURCE ACCUMULATION:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
            {RESOURCE_DEFS.filter((def) => state.resources[def.id]?.unlocked).map((def) => {
              const amount = totalGathered[def.id] || 0;
              return (
                <div
                  key={def.id}
                  className="p-2 rounded border border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-slate-400">{def.name}:</span>
                  <span className="text-slate-100 font-semibold">{formatNumber(amount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-200 transition-colors"
        >
          Close Statistics
        </button>
      </div>
    </div>
  );
};
