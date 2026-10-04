import React from 'react';
import { useGame } from '../context/GameContext';
import { RESOURCE_DEFS } from '../data/gameData';
import { formatNumber, formatDuration } from '../utils/format';
import { Radio, Sparkles, CheckCircle2 } from 'lucide-react';

export const OfflineModal: React.FC = () => {
  const { offlineReport, closeOfflineModal } = useGame();

  if (!offlineReport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-xl border border-cyan-800/80 bg-[#0c101c] p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider font-display">
              Telemetry Re-Sync: Offline Progress
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Sensors detected inactivity for {formatDuration(offlineReport.secondsOffline)}. Automated planetary extractors remained online.
            </p>
          </div>
        </div>

        {/* Resources Gained List */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            RESOURCES ACCUMULATED WHILE OFFLINE:
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
            {Object.entries(offlineReport.resourcesGained).map(([resId, amount]) => {
              const rDef = RESOURCE_DEFS.find((r) => r.id === resId);
              return (
                <div
                  key={resId}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/70 flex items-center justify-between font-mono text-xs"
                >
                  <span className="text-slate-300">{rDef?.name || resId}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    +{formatNumber(amount as number)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={closeOfflineModal}
          className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 active:scale-98 transition-all text-xs font-semibold font-mono text-white flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Claim Resources & Resume Command</span>
        </button>
      </div>
    </div>
  );
};
