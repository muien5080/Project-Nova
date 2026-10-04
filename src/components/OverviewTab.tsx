import React from 'react';
import { useGame } from '../context/GameContext';
import { ASSET_IMAGES, CELESTIAL_BODIES, TECH_DEFS } from '../data/gameData';
import { GameSettings } from '../types/game';
import { formatNumber, formatDuration } from '../utils/format';
import {
  Compass,
  Zap,
  Atom,
  Building2,
  Globe2,
  ChevronRight,
  Sparkles,
  Terminal,
} from 'lucide-react';

interface MissionDirective {
  title: string;
  desc: string;
  actionTab: GameSettings['activeTab'];
  actionLabel: string;
}

export const OverviewTab: React.FC = () => {
  const { state, setActiveTab, getEnergyStats } = useGame();
  const energy = getEnergyStats();

  const colonizedCount = Object.values(state.celestialBodies).filter((b) => b.explored).length;
  const researchedCount = Object.values(state.techs).filter((t) => t.researched).length;
  const totalBuildings = Object.values(state.buildings).reduce((acc, b) => acc + b.count, 0);

  // Derive dynamic mission directive
  let missionDirective: MissionDirective = {
    title: 'Establish Basic Terrestrial Industry',
    desc: 'Extract metal, gather organic biomass, and develop basic metallurgy to automate mining operations.',
    actionTab: 'production',
    actionLabel: 'Deploy Miners',
  };

  if (!state.techs.scientificMethod?.researched) {
    missionDirective = {
      title: 'Advance Scientific Inquiry',
      desc: 'Research the Scientific Method to unlock modular laboratories and generate automated science telemetry.',
      actionTab: 'research',
      actionLabel: 'Open Research',
    };
  } else if (!state.techs.electrification?.researched) {
    missionDirective = {
      title: 'Commission Power Grid',
      desc: 'Research Electrification to unlock solar photovoltaic arrays and capacitor battery buffers.',
      actionTab: 'research',
      actionLabel: 'Research Power',
    };
  } else if (!state.techs.rocketry?.researched) {
    missionDirective = {
      title: 'Initiate Aerospace Program',
      desc: 'Synthesize hydrocarbons and refine semiconductor silicon to construct gravity-defying rockets.',
      actionTab: 'research',
      actionLabel: 'Develop Rocketry',
    };
  } else if (!state.celestialBodies.moon?.explored) {
    missionDirective = {
      title: 'Target: Lunar Colony Alpha',
      desc: 'Launch an exploration expedition to Luna to harvest ultra-dense Lunarite and high-stress Titanium.',
      actionTab: 'exploration',
      actionLabel: 'Launch to Moon',
    };
  } else if (!state.techs.dysonInitiative?.researched) {
    missionDirective = {
      title: 'Solar System Colonization',
      desc: 'Expand colonization across Venus, Mars, and the Asteroid Belt to harvest exotic volatile ores.',
      actionTab: 'exploration',
      actionLabel: 'Explore System',
    };
  } else if (state.wonders.dysonSwarm?.currentStage < 3) {
    missionDirective = {
      title: 'Megastructure: Dyson Swarm',
      desc: 'Construct and launch orbital solar mirror fleets around Sol to harvest up to 10,000 MW pure stellar energy.',
      actionTab: 'wonders',
      actionLabel: 'Build Dyson Swarm',
    };
  } else {
    missionDirective = {
      title: 'Project Nova Apex: Interstellar Gate',
      desc: 'Synthesize exotic antimatter singularities to open an Einstein-Rosen bridge to Alpha Centauri.',
      actionTab: 'wonders',
      actionLabel: 'Activate Stargate',
    };
  }

  return (
    <div className="space-y-6">
      {/* Hero Mission Banner */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0c101c] shadow-lg">
        <div className="relative h-56 sm:h-72 w-full">
          <img
            src={ASSET_IMAGES.systemOverview}
            alt="Project Nova Star System View"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/60 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Compass className="w-4 h-4" />
              <span>SOLAR EXPEDITION SECTOR // PRIMARY BASE</span>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
              MISSION TIME: {formatDuration(state.stats.totalTimePlayedMs / 1000)}
            </div>
          </div>

          <div className="space-y-2 max-w-2xl">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Project Nova Telemetry Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Industrial space exploration initiative. Coordinate planetary extraction, automate orbital
              refineries, and construct cosmic megastructures across the Sol system and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* Strategic Status Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Worlds Colonized</span>
          </div>
          <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
            {colonizedCount} / {CELESTIAL_BODIES.length}
          </div>
          <div className="text-[11px] text-slate-500">Solar System reach</div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Facilities</span>
          </div>
          <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
            {formatNumber(totalBuildings)}
          </div>
          <div className="text-[11px] text-slate-500">Extractors & Smelters</div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Atom className="w-3.5 h-3.5 text-indigo-400" />
            <span>Research Tier</span>
          </div>
          <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
            {researchedCount} / {TECH_DEFS.length}
          </div>
          <div className="text-[11px] text-slate-500">Technologies mastered</div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-900/50 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Power Output</span>
          </div>
          <div className="text-xl font-mono font-bold text-slate-100 tabular-nums">
            {formatNumber(energy.produced)} MW
          </div>
          <div className="text-[11px] text-slate-500">
            {energy.net >= 0 ? 'Surplus' : 'Deficit'}: {formatNumber(Math.abs(energy.net))} MW
          </div>
        </div>
      </div>

      {/* Primary Directive Card */}
      <div className="p-4 rounded-xl border border-cyan-800/40 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-slate-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACTIVE MISSION DIRECTIVE</span>
          </div>
          <div className="font-semibold text-slate-100">{missionDirective.title}</div>
          <p className="text-xs text-slate-400 leading-normal">{missionDirective.desc}</p>
        </div>

        <button
          onClick={() => setActiveTab(missionDirective.actionTab)}
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white shadow-sm transition-all whitespace-nowrap cursor-pointer shrink-0"
        >
          <span>{missionDirective.actionLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Mission Logs */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Mission Telemetry Chronicle</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">LAST 10 EVENTS</span>
        </div>

        <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
          {state.logs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 py-1 px-2 rounded bg-slate-900/60 border border-slate-800/50 text-slate-300"
            >
              <span className="text-slate-500 text-[10px] shrink-0 mt-0.5">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span
                className={
                  log.type === 'discovery'
                    ? 'text-cyan-300 font-semibold'
                    : log.type === 'tech'
                    ? 'text-indigo-300'
                    : log.type === 'milestone'
                    ? 'text-amber-300 font-semibold'
                    : 'text-slate-300'
                }
              >
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
