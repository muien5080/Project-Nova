/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { ResourceSidebar } from './components/ResourceSidebar';
import { OverviewTab } from './components/OverviewTab';
import { ProductionTab } from './components/ProductionTab';
import { StorageTab } from './components/StorageTab';
import { ResearchTab } from './components/ResearchTab';
import { ExplorationTab } from './components/ExplorationTab';
import { WondersTab } from './components/WondersTab';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineModal } from './components/OfflineModal';
import { HardDrive, Shield } from 'lucide-react';

function GameContent() {
  const { state } = useGame();
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const renderActiveTab = () => {
    switch (state.settings.activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'production':
        return <ProductionTab />;
      case 'storage':
        return <StorageTab />;
      case 'research':
        return <ResearchTab />;
      case 'exploration':
        return <ExplorationTab />;
      case 'wonders':
        return <WondersTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans bg-grid-pattern selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        onOpenStats={() => setShowStats(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        <ResourceSidebar />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-full">
          <div className="max-w-5xl mx-auto space-y-6">
            {renderActiveTab()}

            {/* Quiet Footer */}
            <footer className="pt-8 pb-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Project Nova</span>
                <span>·</span>
                <span>Inspired by SpaceCompany</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400/90">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Local Persistent Save Active</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Offline Ready</span>
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Modals */}
      <OfflineModal />
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
