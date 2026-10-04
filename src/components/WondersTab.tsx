import React from 'react';
import { useGame } from '../context/GameContext';
import { WONDER_DEFS, RESOURCE_DEFS } from '../data/gameData';
import { ResourceId } from '../types/game';
import { formatNumber } from '../utils/format';
import {
  Sparkles,
  CheckCircle2,
  Hammer,
  Shield,
  Layers,
} from 'lucide-react';

export const WondersTab: React.FC = () => {
  const { state, buildWonderStage } = useGame();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cosmic Wonders & Megastructures</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monumental multi-stage engineering projects that reshape the solar system and propel civilization to the stars.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-800/40 shrink-0">
          <Layers className="w-4 h-4" />
          <span>Megastructure Blueprints</span>
        </div>
      </div>

      {/* Wonders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {WONDER_DEFS.map((wonder) => {
          const wState = state.wonders[wonder.id] || { currentStage: 0 };
          const techMet = !wonder.requiredTech || !!state.techs[wonder.requiredTech]?.researched;
          const currentStage = wState.currentStage;
          const isFullyBuilt = currentStage >= wonder.stages.length;
          const nextStage = !isFullyBuilt ? wonder.stages[currentStage] : null;

          let canAfford = true;
          if (nextStage) {
            for (const [res, needed] of Object.entries(nextStage.cost)) {
              if ((state.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
                canAfford = false;
                break;
              }
            }
          }

          return (
            <div
              key={wonder.id}
              className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-all ${
                isFullyBuilt
                  ? 'border-amber-700/50 bg-slate-900/60'
                  : techMet
                  ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  : 'border-slate-800/40 bg-slate-950/30 opacity-70'
              }`}
            >
              <div>
                {/* Visual Image Asset */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={wonder.image}
                    alt={wonder.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  <div className="absolute top-3 right-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md border border-slate-700/80 bg-slate-900/90 text-slate-200">
                      Stage {currentStage} / {wonder.stages.length}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 flex items-center justify-between">
                      <span>{wonder.name}</span>
                      {isFullyBuilt && (
                        <span className="text-amber-400 flex items-center gap-1 text-xs font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Complete
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {wonder.description}
                    </p>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStage / wonder.stages.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Perks summary */}
                  {currentStage > 0 && (
                    <div className="p-2.5 rounded bg-amber-950/20 border border-amber-800/40 text-xs font-mono text-amber-200 space-y-1">
                      <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>ACTIVE MEGASTRUCTURE PERKS:</span>
                      </div>
                      <div className="space-y-0.5 text-[11px]">
                        {wonder.stages.slice(0, currentStage).map((st) => (
                          <div key={st.stageNumber}>
                            • Stage {st.stageNumber}: {st.perks}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Stage Construction Preview */}
                  {nextStage && (
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                        <span>NEXT: Stage {nextStage.stageNumber} - {nextStage.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{nextStage.description}</p>
                      <div className="text-[11px] text-cyan-300 font-mono">
                        Perk: {nextStage.perks}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action row */}
              <div className="p-4 border-t border-slate-800/60 bg-slate-900/30">
                {isFullyBuilt ? (
                  <div className="text-center py-1 text-xs font-mono text-amber-400 font-semibold">
                    ★ Megastructure Operating at Full Celestial Capacity ★
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nextStage && (
                      <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                        {Object.entries(nextStage.cost).map(([res, needed]) => {
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
                    )}

                    <button
                      disabled={!techMet || !canAfford || !nextStage}
                      onClick={() => buildWonderStage(wonder.id)}
                      className={`w-full py-2.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        techMet && canAfford && nextStage
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm active:scale-98'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                      }`}
                    >
                      <Hammer className="w-3.5 h-3.5" />
                      <span>Assemble Stage {nextStage?.stageNumber}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
