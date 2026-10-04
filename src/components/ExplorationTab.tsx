import React from 'react';
import { useGame } from '../context/GameContext';
import { CELESTIAL_BODIES, RESOURCE_DEFS, BUILDING_DEFS } from '../data/gameData';
import { ResourceId } from '../types/game';
import { formatNumber } from '../utils/format';
import {
  Rocket,
  Globe2,
  CheckCircle2,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ExplorationTab: React.FC = () => {
  const { state, exploreCelestialBody } = useGame();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Interplanetary Exploration & Celestial Colonization</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deploy interplanetary probes and automated colony arks to extract exotic extraterrestrial elements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-800/40 shrink-0">
          <Globe2 className="w-4 h-4" />
          <span>
            {Object.values(state.celestialBodies).filter((b) => b.explored).length} /{' '}
            {CELESTIAL_BODIES.length} Worlds Colonized
          </span>
        </div>
      </div>

      {/* Celestial Bodies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CELESTIAL_BODIES.map((body) => {
          const isExplored = !!state.celestialBodies[body.id]?.explored;
          const techMet = !body.requiredTech || !!state.techs[body.requiredTech]?.researched;

          let canAfford = true;
          for (const [res, needed] of Object.entries(body.explorationCost)) {
            if ((state.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
              canAfford = false;
              break;
            }
          }

          // Active facilities on this body
          const activeBuildings = BUILDING_DEFS.filter(
            (b) => b.requiredBody === body.id && (state.buildings[b.id]?.count || 0) > 0
          );

          return (
            <div
              key={body.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                isExplored
                  ? 'border-cyan-900/40 bg-slate-900/60'
                  : techMet
                  ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  : 'border-slate-800/40 bg-slate-950/30 opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100">{body.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800 bg-slate-950 text-slate-400">
                        {body.orbitalDistance}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {body.description}
                    </p>
                  </div>

                  {isExplored ? (
                    <span className="flex items-center gap-1 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Colony Active</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      Uncharted
                    </span>
                  )}
                </div>

                {/* Target Resources */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-500">EXOTIC DEPOSITS:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {body.unlockedResources.map((resId) => {
                      const rDef = RESOURCE_DEFS.find((r) => r.id === resId);
                      return (
                        <span
                          key={resId}
                          className="px-2 py-0.5 rounded text-[11px] font-mono border border-slate-800 bg-slate-950/80 text-slate-300 flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400" />
                          <span>{rDef?.name || resId}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* If explored, show active outpost operations */}
                {isExplored && (
                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60 space-y-1 text-xs font-mono">
                    <div className="text-[10px] text-slate-500">OPERATIONAL SURFACE FACILITIES:</div>
                    {activeBuildings.length === 0 ? (
                      <div className="text-slate-400 text-[11px]">
                        No outpost extractors deployed yet. Check the Production tab!
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 text-slate-300">
                        {activeBuildings.map((b) => (
                          <span
                            key={b.id}
                            className="bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded text-[11px] text-cyan-300"
                          >
                            {b.name} ({state.buildings[b.id]?.count || 0})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Exploration Launch Section */}
              {!isExplored && (
                <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {Object.entries(body.explorationCost).map(([res, needed]) => {
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
                    disabled={!techMet || !canAfford}
                    onClick={() => exploreCelestialBody(body.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                      techMet && canAfford
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm active:scale-98'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                    }`}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Launch Mission</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
