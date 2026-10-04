import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BUILDING_DEFS, RESOURCE_DEFS } from '../data/gameData';
import { BuildingDefinition, ResourceId, BuyMultiplier } from '../types/game';
import { formatNumber } from '../utils/format';
import {
  calculateBulkBuildingCost,
  calculateMaxAffordable,
} from '../utils/storage';
import {
  Power,
  Pickaxe,
  Zap,
  Atom,
  FlaskConical,
  Globe2,
} from 'lucide-react';

export const ProductionTab: React.FC = () => {
  const { state, buyBuilding, toggleBuilding, setBuyMultiplier } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Facilities', icon: Globe2 },
    { id: 'extraction', label: 'Extraction', icon: Pickaxe },
    { id: 'energy', label: 'Power Grid', icon: Zap },
    { id: 'science', label: 'Research', icon: Atom },
    { id: 'synthesis', label: 'Synthesis', icon: FlaskConical },
    { id: 'orbital', label: 'Planetary Outposts', icon: Globe2 },
  ];

  const multipliers: BuyMultiplier[] = [1, 5, 10, 25, 100, -1];

  const visibleBuildings = BUILDING_DEFS.filter((def) => {
    // Check tech requirement
    if (def.requiredTech && !state.techs[def.requiredTech]?.researched) return false;
    // Check planetary body requirement
    if (def.requiredBody && !state.celestialBodies[def.requiredBody]?.explored) return false;
    // Category filter
    if (selectedCategory !== 'all' && def.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls: Buy Multiplier & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-800 bg-slate-900/60">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
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

      {/* Buildings Grid */}
      {visibleBuildings.length === 0 ? (
        <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/20 text-slate-400 space-y-2">
          <Globe2 className="w-8 h-8 mx-auto text-slate-600" />
          <div className="text-sm font-medium text-slate-300">No facilities unlocked in this sector yet</div>
          <div className="text-xs text-slate-500">
            Advance research or explore planets to unlock new industrial extractors.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleBuildings.map((def) => {
            const bState = state.buildings[def.id] || { count: 0, enabled: true };
            const mult = state.settings.buyMultiplier;
            const currentCount = bState.count;

            const toBuy = mult === -1
              ? Math.max(1, calculateMaxAffordable(def.baseCost, def.costMultiplier, currentCount, state.resources))
              : mult;

            const cost = calculateBulkBuildingCost(def.baseCost, def.costMultiplier, currentCount, toBuy);

            let canAfford = true;
            for (const [res, needed] of Object.entries(cost)) {
              if ((state.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
                canAfford = false;
                break;
              }
            }

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
                          {currentCount}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{def.description}</p>
                    </div>

                    <button
                      onClick={() => toggleBuilding(def.id)}
                      title={bState.enabled ? 'Pause facility' : 'Resume facility'}
                      className={`p-1.5 rounded transition-colors cursor-pointer border ${
                        bState.enabled
                          ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50'
                          : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Production & Consumption Rates */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    {/* Produces */}
                    <div className="p-2 rounded bg-slate-950/50 border border-slate-800/50">
                      <div className="text-[10px] text-slate-500 mb-1">PRODUCES (EACH)</div>
                      <div className="space-y-0.5">
                        {Object.entries(def.produces).map(([res, rate]) => {
                          const rDef = RESOURCE_DEFS.find((r) => r.id === res);
                          return (
                            <div key={res} className="text-emerald-400 flex items-center justify-between">
                              <span>{rDef?.name || res}</span>
                              <span>+{rate}/s</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Consumes */}
                    <div className="p-2 rounded bg-slate-950/50 border border-slate-800/50">
                      <div className="text-[10px] text-slate-500 mb-1">CONSUMES (EACH)</div>
                      {Object.keys(def.consumes).length === 0 ? (
                        <div className="text-slate-500 text-[11px]">None</div>
                      ) : (
                        <div className="space-y-0.5">
                          {Object.entries(def.consumes).map(([res, rate]) => {
                            const rDef = RESOURCE_DEFS.find((r) => r.id === res);
                            return (
                              <div key={res} className="text-rose-400 flex items-center justify-between">
                                <span>{rDef?.name || res}</span>
                                <span>-{rate}/s</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cost and Buy Button */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {Object.entries(cost).map(([res, needed]) => {
                      const rDef = RESOURCE_DEFS.find((r) => r.id === res);
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
                          <span className="text-slate-400 mr-1">{rDef?.name || res}:</span>
                          <span className="font-semibold">{formatNumber(needed as number)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => buyBuilding(def.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                      canAfford
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm active:scale-98'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                    }`}
                  >
                    Build +{toBuy}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
