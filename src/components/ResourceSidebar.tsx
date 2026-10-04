import React from 'react';
import { useGame } from '../context/GameContext';
import { RESOURCE_DEFS } from '../data/gameData';
import { ResourceId } from '../types/game';
import { formatNumber, formatPerSecond } from '../utils/format';
import {
  Boxes,
  Trees,
  Gem,
  Zap,
  Atom,
  Fuel,
  Cpu,
  Moon,
  Shield,
  Wind,
  Sun,
  Radiation,
  Flame,
  Sparkles,
  Snowflake,
  Activity,
  Orbit,
  Pickaxe,
  TrendingUp,
  BatteryCharging,
  BatteryWarning,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Boxes,
  Trees,
  Gem,
  Zap,
  Atom,
  Fuel,
  Cpu,
  Moon,
  Shield,
  Wind,
  Sun,
  Radiation,
  Flame,
  Sparkles,
  Snowflake,
  Activity,
  Orbit,
};

export const ResourceSidebar: React.FC = () => {
  const { state, gatherResource, getEnergyStats } = useGame();
  const energy = getEnergyStats();

  const unlockedResources = RESOURCE_DEFS.filter(
    (def) => state.resources[def.id]?.unlocked
  );

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-[#090d16]/90 border-r border-slate-800/80 p-4 space-y-5 flex flex-col h-auto lg:h-[calc(100vh-61px)] lg:overflow-y-auto">
      {/* Power Grid Telemetry Card */}
      <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Power Grid</span>
          </div>
          <span
            className={`text-[11px] font-mono font-medium ${
              energy.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {energy.net >= 0 ? '+' : ''}
            {formatNumber(energy.net)} MW/s
          </span>
        </div>

        {/* Battery meter */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              {energy.net >= 0 ? (
                <BatteryCharging className="w-3 h-3 text-amber-400" />
              ) : (
                <BatteryWarning className="w-3 h-3 text-rose-400" />
              )}
              Buffer
            </span>
            <span className="tabular-nums">
              {formatNumber(state.resources.energy.amount)} / {formatNumber(state.resources.energy.capacity)}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                energy.net >= 0 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (state.resources.energy.amount / state.resources.energy.capacity) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 text-[11px] font-mono">
          <div>
            <div className="text-slate-500 text-[10px]">PRODUCTION</div>
            <div className="text-slate-200 font-semibold tabular-nums">
              {formatNumber(energy.produced)} MW
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px]">DEMAND</div>
            <div className="text-slate-200 font-semibold tabular-nums">
              {formatNumber(energy.consumed)} MW
            </div>
          </div>
        </div>
      </div>

      {/* Manual Resource Gathering Deck */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Pickaxe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Manual Extraction</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => gatherResource('metal')}
            className="group relative p-2.5 rounded border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all text-center focus:outline-none"
          >
            <Boxes className="w-4 h-4 mx-auto text-slate-300 group-hover:text-cyan-400 transition-colors mb-1" />
            <div className="text-[11px] font-medium text-slate-200">Mine Ore</div>
            <div className="text-[9px] font-mono text-slate-500">+Metal</div>
          </button>

          <button
            onClick={() => gatherResource('wood')}
            className="group relative p-2.5 rounded border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all text-center focus:outline-none"
          >
            <Trees className="w-4 h-4 mx-auto text-emerald-400 group-hover:text-emerald-300 transition-colors mb-1" />
            <div className="text-[11px] font-medium text-slate-200">Biomass</div>
            <div className="text-[9px] font-mono text-slate-500">+Wood</div>
          </button>

          <button
            onClick={() => gatherResource('gem')}
            className="group relative p-2.5 rounded border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all text-center focus:outline-none"
          >
            <Gem className="w-4 h-4 mx-auto text-cyan-400 group-hover:text-cyan-300 transition-colors mb-1" />
            <div className="text-[11px] font-medium text-slate-200">Excavate</div>
            <div className="text-[9px] font-mono text-slate-500">+Gem</div>
          </button>
        </div>
      </div>

      {/* Telemetry Resource Readouts */}
      <div className="space-y-2 flex-1">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resource Reserves</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {unlockedResources.length} UNLOCKED
          </span>
        </div>

        <div className="space-y-1.5">
          {unlockedResources.map((resDef) => {
            const rState = state.resources[resDef.id];
            if (!rState) return null;

            const Icon = ICON_MAP[resDef.iconName] || Boxes;
            const fillPct = Math.min(100, (rState.amount / rState.capacity) * 100);
            const isFull = fillPct >= 99.5;
            const rate = rState.perSecond;

            return (
              <div
                key={resDef.id}
                className="p-2 rounded border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 transition-colors group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${resDef.color}`} />
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {resDef.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-medium text-slate-100 tabular-nums">
                      {formatNumber(rState.amount)}
                      <span className="text-[10px] text-slate-500 ml-1">
                        / {formatNumber(rState.capacity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar + rate row */}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        isFull
                          ? 'bg-rose-500'
                          : fillPct > 80
                          ? 'bg-amber-400'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-mono tabular-nums shrink-0 ${
                      rate > 0
                        ? 'text-emerald-400'
                        : rate < 0
                        ? 'text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {formatPerSecond(rate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
