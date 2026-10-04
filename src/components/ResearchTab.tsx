import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TECH_DEFS, RESOURCE_DEFS } from '../data/gameData';
import { ResourceId } from '../types/game';
import { formatNumber } from '../utils/format';
import {
  Atom,
  CheckCircle2,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';

export const ResearchTab: React.FC = () => {
  const { state, researchTech } = useGame();
  const [filter, setFilter] = useState<'available' | 'completed' | 'all'>('available');

  const techsWithStatus = TECH_DEFS.map((tech) => {
    const isResearched = !!state.techs[tech.id]?.researched;

    // Check prerequisites
    const missingPrereqs = tech.prerequisites.filter(
      (prereqId) => !state.techs[prereqId]?.researched
    );
    const hasPrereqs = missingPrereqs.length === 0;

    // Check cost
    let canAfford = true;
    for (const [res, needed] of Object.entries(tech.cost)) {
      if ((state.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
        canAfford = false;
        break;
      }
    }

    const isAvailable = !isResearched && hasPrereqs;

    return {
      ...tech,
      isResearched,
      hasPrereqs,
      missingPrereqs,
      canAfford,
      isAvailable,
    };
  });

  const filteredTechs = techsWithStatus.filter((t) => {
    if (filter === 'available') return t.isAvailable;
    if (filter === 'completed') return t.isResearched;
    return true;
  });

  const completedCount = techsWithStatus.filter((t) => t.isResearched).length;
  const availableCount = techsWithStatus.filter((t) => t.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Atom className="w-4 h-4 text-indigo-400" />
            <span>Aerospace & Science Technology Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accumulate research data in laboratories and radio observatories to unlock next-generation tech.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              filter === 'available'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Researched ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({TECH_DEFS.length})
          </button>
        </div>
      </div>

      {/* Tech Cards Grid */}
      {filteredTechs.length === 0 ? (
        <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/20 text-slate-400 space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
          <div className="text-sm font-medium text-slate-300">No technologies matching filter</div>
          <div className="text-xs text-slate-500">
            {filter === 'available'
              ? 'Complete current technologies or check prerequisites to discover new breakthroughs.'
              : 'Keep researching to expand your technological archive.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTechs.map((tech) => {
            return (
              <div
                key={tech.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-4 ${
                  tech.isResearched
                    ? 'border-indigo-900/40 bg-indigo-950/10'
                    : tech.isAvailable
                    ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    : 'border-slate-800/40 bg-slate-950/40 opacity-70'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-100">{tech.name}</h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-indigo-800/40 bg-indigo-950/40 text-indigo-300">
                          Tier {tech.tier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {tech.description}
                      </p>
                    </div>

                    {tech.isResearched && (
                      <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    )}

                    {!tech.hasPrereqs && (
                      <span className="flex items-center gap-1 text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {tech.prerequisites.length > 0 && !tech.isResearched && (
                    <div className="text-[11px] font-mono text-slate-400 flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-slate-500">Requires:</span>
                      {tech.prerequisites.map((pId) => {
                        const pTech = TECH_DEFS.find((t) => t.id === pId);
                        const isDone = !!state.techs[pId]?.researched;
                        return (
                          <span
                            key={pId}
                            className={`px-1.5 py-0.5 rounded text-[10px] border ${
                              isDone
                                ? 'border-emerald-800/50 bg-emerald-950/30 text-emerald-300'
                                : 'border-slate-800 bg-slate-950 text-slate-500'
                            }`}
                          >
                            {pTech?.name || pId}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Unlocks description */}
                  <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60 text-xs text-cyan-300/90 font-mono">
                    <span className="text-slate-500 mr-1.5">UNLOCKS:</span>
                    {tech.unlocksDescription}
                  </div>
                </div>

                {/* Cost & Research Action */}
                {!tech.isResearched && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {Object.entries(tech.cost).map(([res, needed]) => {
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
                      disabled={!tech.hasPrereqs || !tech.canAfford}
                      onClick={() => researchTech(tech.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                        tech.hasPrereqs && tech.canAfford
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-98'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Research</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
