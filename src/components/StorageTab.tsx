import React from 'react';
import { useGame } from '../context/GameContext';
import { STORAGE_DEFS, RESOURCE_DEFS } from '../data/gameData';
import { ResourceId, BuyMultiplier } from '../types/game';
import { formatNumber } from '../utils/format';
import {
  calculateBulkBuildingCost,
  calculateMaxAffordable,
} from '../utils/storage';
import { Warehouse, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const StorageTab: React.FC = () => {
  const { state, upgradeStorage, setBuyMultiplier } = useGame();

  const multipliers: BuyMultiplier[] = [1, 5, 10, 25, 100, -1];
  const elevatorStage = state.wonders.spaceElevator?.currentStage || 0;
  const hasElevatorDiscount = elevatorStage >= 1;

  const unlockedUpgrades = STORAGE_DEFS.filter((def) => {
    if (def.requiredTech && !state.techs[def.requiredTech]?.researched) return false;
    // Check if resource is unlocked
    if (!state.resources[def.resourceId]?.unlocked) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Multiplier Control */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-cyan-400" />
            <span>Resource Storage Silos & Depots</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct high-capacity containment bunkers to expand material limits.
            {hasElevatorDiscount && (
              <span className="text-emerald-400 ml-2 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                -15% Space Elevator Discount Active
              </span>
            )}
          </p>
        </div>

        {/* Buy Multiplier Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800 shrink-0">
          <span className="text-[10px] font-mono text-slate-500 uppercase px-2">Buy:</span>
          {multipliers.map((m) => {
            const isActive = state.settings.buyMultiplier === m;
            return (
              <button
                key={m}
                onClick={() => setBuyMultiplier(m)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {m === -1 ? 'MAX' : `${m}x`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upgrades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unlockedUpgrades.map((def) => {
          const sState = state.storageUpgrades[def.id] || { count: 0 };
          const mult = state.settings.buyMultiplier;
          const currentCount = sState.count;

          const toBuy = mult === -1
            ? Math.max(1, calculateMaxAffordable(def.baseCost, def.costMultiplier, currentCount, state.resources))
            : mult;

          const rawCost = calculateBulkBuildingCost(def.baseCost, def.costMultiplier, currentCount, toBuy);
          const costDiscount = hasElevatorDiscount ? 0.85 : 1.0;

          const cost: Partial<Record<ResourceId, number>> = {};
          let canAfford = true;

          for (const [res, needed] of Object.entries(rawCost)) {
            const discounted = Math.floor((needed as number) * costDiscount);
            cost[res as ResourceId] = discounted;
            if ((state.resources[res as ResourceId]?.amount || 0) < discounted) {
              canAfford = false;
            }
          }

          const rDef = RESOURCE_DEFS.find((r) => r.id === def.resourceId);
          const rState = state.resources[def.resourceId];
          const fillPct = rState ? Math.min(100, (rState.amount / rState.capacity) * 100) : 0;

          return (
            <div
              key={def.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                      <span>{def.name}</span>
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                        {currentCount} Built
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{def.description}</p>
                  </div>

                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
                    +{formatNumber(def.capacityBonus * toBuy)} Cap
                  </span>
                </div>

                {/* Target Resource Status */}
                {rState && (
                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">{rDef?.name || def.resourceId} Level</span>
                      <span className="text-slate-200 tabular-nums">
                        {formatNumber(rState.amount)} / {formatNumber(rState.capacity)} ({fillPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          fillPct > 90 ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cost and Buy Row */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {Object.entries(cost).map(([res, needed]) => {
                    const resDef = RESOURCE_DEFS.find((r) => r.id === res);
                    const currentHave = state.resources[res as ResourceId]?.amount || 0;
                    const hasEnough = currentHave >= (needed as number);

                    return (
                      <div
                        key={res}
                        className={`px-2 py-0.5 rounded text-[11px] border ${
                          hasEnough
                            ? 'border-slate-800 bg-slate-950 text-slate-300'
                            : 'border-rose-900/50 bg-rose-950/30 text-rose-400'
                        }`}
                      >
                        <span className="text-slate-400 mr-1">{resDef?.name || res}:</span>
                        <span className="font-semibold">{formatNumber(needed as number)}</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  disabled={!canAfford}
                  onClick={() => upgradeStorage(def.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 ${
                    canAfford
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm active:scale-98'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                  }`}
                >
                  <span>Expand +{toBuy}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
