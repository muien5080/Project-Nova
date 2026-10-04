import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  ResourceId,
  GameSaveData,
  BuyMultiplier,
  GameLog,
  GameSettings,
} from '../types/game';
import {
  RESOURCE_DEFS,
  BUILDING_DEFS,
  STORAGE_DEFS,
  TECH_DEFS,
  CELESTIAL_BODIES,
  WONDER_DEFS,
  getInitialGameState,
} from '../data/gameData';
import {
  loadGame,
  saveGame,
  OfflineReport,
  calculateBuildingCost,
  calculateBulkBuildingCost,
  calculateMaxAffordable,
  exportSaveString,
  importSaveString,
  clearSave,
} from '../utils/storage';
import { soundFX } from '../utils/audio';

interface GameContextType {
  state: GameSaveData;
  offlineReport: OfflineReport | null;
  closeOfflineModal: () => void;
  gatherResource: (resId: ResourceId) => void;
  buyBuilding: (buildingId: string) => boolean;
  toggleBuilding: (buildingId: string) => void;
  upgradeStorage: (upgradeId: string) => boolean;
  researchTech: (techId: string) => boolean;
  exploreCelestialBody: (bodyId: string) => boolean;
  buildWonderStage: (wonderId: string) => boolean;
  setBuyMultiplier: (mult: BuyMultiplier) => void;
  toggleSound: () => void;
  setActiveTab: (tab: GameSettings['activeTab']) => void;
  manualSave: () => boolean;
  importSave: (code: string) => boolean;
  exportSave: () => string;
  resetGame: () => void;
  addLog: (text: string, type?: GameLog['type']) => void;
  getEnergyStats: () => { produced: number; consumed: number; net: number; efficiency: number };
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameSaveData>(() => {
    const { state } = loadGame();
    return state;
  });

  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(() => {
    const { offlineReport } = loadGame();
    return offlineReport;
  });

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // Initialize sound settings
  useEffect(() => {
    soundFX.enabled = gameState.settings.soundEnabled;
  }, [gameState.settings.soundEnabled]);

  const addLog = useCallback((text: string, type: GameLog['type'] = 'system') => {
    setGameState((prev) => {
      const newLog: GameLog = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        timestamp: Date.now(),
        text,
        type,
      };
      return {
        ...prev,
        logs: [newLog, ...prev.logs.slice(0, 49)],
      };
    });
  }, []);

  const closeOfflineModal = useCallback(() => {
    setOfflineReport(null);
  }, []);

  const toggleSound = useCallback(() => {
    setGameState((prev) => {
      const next = !prev.settings.soundEnabled;
      soundFX.enabled = next;
      return {
        ...prev,
        settings: {
          ...prev.settings,
          soundEnabled: next,
        },
      };
    });
  }, []);

  const setBuyMultiplier = useCallback((mult: BuyMultiplier) => {
    setGameState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        buyMultiplier: mult,
      },
    }));
  }, []);

  const setActiveTab = useCallback((tab: GameSettings['activeTab']) => {
    setGameState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        activeTab: tab,
      },
    }));
  }, []);

  // Manual gather
  const gatherResource = useCallback((resId: ResourceId) => {
    const def = RESOURCE_DEFS.find((r) => r.id === resId);
    if (!def || !def.canGatherManually) return;

    soundFX.playGather();

    setGameState((prev) => {
      const current = prev.resources[resId];
      if (!current) return prev;

      // Check space elevator perk: stage 2 gives +200% manual gather
      const elevatorStage = prev.wonders.spaceElevator?.currentStage || 0;
      const gatherBonus = elevatorStage >= 2 ? 3 : 1;
      const amountToAdd = def.manualGatherAmount * gatherBonus;

      const newAmount = Math.min(current.capacity, current.amount + amountToAdd);
      const actualDelta = newAmount - current.amount;

      return {
        ...prev,
        resources: {
          ...prev.resources,
          [resId]: {
            ...current,
            amount: newAmount,
          },
        },
        stats: {
          ...prev.stats,
          manualClicks: prev.stats.manualClicks + 1,
          totalGathered: {
            ...prev.stats.totalGathered,
            [resId]: (prev.stats.totalGathered[resId] || 0) + actualDelta,
          },
        },
      };
    });
  }, []);

  // Buy Building with multiplier
  const buyBuilding = useCallback((buildingId: string): boolean => {
    const def = BUILDING_DEFS.find((b) => b.id === buildingId);
    if (!def) return false;

    const currentCount = stateRef.current.buildings[buildingId]?.count || 0;
    const mult = stateRef.current.settings.buyMultiplier;

    let toBuy = mult === -1 ? calculateMaxAffordable(def.baseCost, def.costMultiplier, currentCount, stateRef.current.resources) : mult;
    if (toBuy <= 0) return false;

    const cost = calculateBulkBuildingCost(def.baseCost, def.costMultiplier, currentCount, toBuy);

    // Verify player can afford
    for (const [res, needed] of Object.entries(cost)) {
      if ((stateRef.current.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
        return false;
      }
    }

    soundFX.playBuy();

    setGameState((prev) => {
      const nextResources = { ...prev.resources };
      for (const [res, needed] of Object.entries(cost)) {
        const rId = res as ResourceId;
        nextResources[rId] = {
          ...nextResources[rId],
          amount: Math.max(0, nextResources[rId].amount - (needed as number)),
        };
      }

      const nextBuildings = {
        ...prev.buildings,
        [buildingId]: {
          ...prev.buildings[buildingId],
          count: (prev.buildings[buildingId]?.count || 0) + toBuy,
        },
      };

      return {
        ...prev,
        resources: nextResources,
        buildings: nextBuildings,
        stats: {
          ...prev.stats,
          totalBuildingsConstructed: prev.stats.totalBuildingsConstructed + toBuy,
        },
      };
    });

    addLog(`Constructed ${toBuy}x ${def.name}.`, 'system');
    return true;
  }, [addLog]);

  const toggleBuilding = useCallback((buildingId: string) => {
    setGameState((prev) => ({
      ...prev,
      buildings: {
        ...prev.buildings,
        [buildingId]: {
          ...prev.buildings[buildingId],
          enabled: !prev.buildings[buildingId]?.enabled,
        },
      },
    }));
  }, []);

  // Upgrade Storage
  const upgradeStorage = useCallback((upgradeId: string): boolean => {
    const def = STORAGE_DEFS.find((s) => s.id === upgradeId);
    if (!def) return false;

    const currentCount = stateRef.current.storageUpgrades[upgradeId]?.count || 0;
    const mult = stateRef.current.settings.buyMultiplier;

    let toBuy = mult === -1 ? calculateMaxAffordable(def.baseCost, def.costMultiplier, currentCount, stateRef.current.resources) : mult;
    if (toBuy <= 0) return false;

    // Wonder perk: Space elevator stage 1 reduces storage cost by 15%
    const elevatorStage = stateRef.current.wonders.spaceElevator?.currentStage || 0;
    const costDiscount = elevatorStage >= 1 ? 0.85 : 1.0;

    const rawCost = calculateBulkBuildingCost(def.baseCost, def.costMultiplier, currentCount, toBuy);
    const discountedCost: Partial<Record<ResourceId, number>> = {};
    for (const [res, amount] of Object.entries(rawCost)) {
      discountedCost[res as ResourceId] = Math.floor((amount as number) * costDiscount);
    }

    for (const [res, needed] of Object.entries(discountedCost)) {
      if ((stateRef.current.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
        return false;
      }
    }

    soundFX.playBuy();

    setGameState((prev) => {
      const nextResources = { ...prev.resources };
      for (const [res, needed] of Object.entries(discountedCost)) {
        const rId = res as ResourceId;
        nextResources[rId] = {
          ...nextResources[rId],
          amount: Math.max(0, nextResources[rId].amount - (needed as number)),
        };
      }

      // Increase storage capacity for resource
      const targetRes = def.resourceId;
      const bonusCapacity = def.capacityBonus * toBuy;
      nextResources[targetRes] = {
        ...nextResources[targetRes],
        capacity: nextResources[targetRes].capacity + bonusCapacity,
      };

      const nextStorage = {
        ...prev.storageUpgrades,
        [upgradeId]: {
          ...prev.storageUpgrades[upgradeId],
          count: currentCount + toBuy,
        },
      };

      return {
        ...prev,
        resources: nextResources,
        storageUpgrades: nextStorage,
      };
    });

    addLog(`Expanded ${def.name} (+${def.capacityBonus * toBuy} capacity).`, 'system');
    return true;
  }, [addLog]);

  // Research Tech
  const researchTech = useCallback((techId: string): boolean => {
    const def = TECH_DEFS.find((t) => t.id === techId);
    if (!def) return false;
    if (stateRef.current.techs[techId]?.researched) return false;

    // Check prerequisites
    for (const req of def.prerequisites) {
      if (!stateRef.current.techs[req]?.researched) return false;
    }

    // Check cost
    for (const [res, needed] of Object.entries(def.cost)) {
      if ((stateRef.current.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
        return false;
      }
    }

    soundFX.playTechUnlocked();

    setGameState((prev) => {
      const nextResources = { ...prev.resources };
      for (const [res, needed] of Object.entries(def.cost)) {
        const rId = res as ResourceId;
        nextResources[rId] = {
          ...nextResources[rId],
          amount: Math.max(0, nextResources[rId].amount - (needed as number)),
        };
      }

      // Check if this tech unlocks any resources
      if (techId === 'fossilFuel') nextResources['oil'].unlocked = true;
      if (techId === 'siliconRefining') nextResources['silicon'].unlocked = true;
      if (techId === 'nuclearFission') nextResources['uranium'].unlocked = true;
      if (techId === 'innerPlanetsMission') nextResources['lava'].unlocked = true;
      if (techId === 'asteroidMining') nextResources['meteorite'].unlocked = true;
      if (techId === 'gasGiantSiphoning') {
        nextResources['hydrogen'].unlocked = true;
        nextResources['helium'].unlocked = true;
      }
      if (techId === 'cryogenicSystems') nextResources['ice'].unlocked = true;
      if (techId === 'dysonInitiative') nextResources['plasma'].unlocked = true;
      if (techId === 'antimatterSynthesis') nextResources['antimatter'].unlocked = true;

      const nextTechs = {
        ...prev.techs,
        [techId]: { researched: true },
      };

      return {
        ...prev,
        resources: nextResources,
        techs: nextTechs,
        stats: {
          ...prev.stats,
          totalTechsResearched: prev.stats.totalTechsResearched + 1,
        },
      };
    });

    addLog(`Research Completed: ${def.name}.`, 'tech');
    return true;
  }, [addLog]);

  // Explore Celestial Body
  const exploreCelestialBody = useCallback((bodyId: string): boolean => {
    const def = CELESTIAL_BODIES.find((b) => b.id === bodyId);
    if (!def) return false;
    if (stateRef.current.celestialBodies[bodyId]?.explored) return false;

    // Check required tech
    if (def.requiredTech && !stateRef.current.techs[def.requiredTech]?.researched) {
      return false;
    }

    // Check cost
    for (const [res, needed] of Object.entries(def.explorationCost)) {
      if ((stateRef.current.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
        return false;
      }
    }

    soundFX.playExplorationLaunch();

    setGameState((prev) => {
      const nextResources = { ...prev.resources };
      for (const [res, needed] of Object.entries(def.explorationCost)) {
        const rId = res as ResourceId;
        nextResources[rId] = {
          ...nextResources[rId],
          amount: Math.max(0, nextResources[rId].amount - (needed as number)),
        };
      }

      // Unlock resources associated with this body
      for (const res of def.unlockedResources) {
        if (nextResources[res]) {
          nextResources[res].unlocked = true;
        }
      }

      const nextBodies = {
        ...prev.celestialBodies,
        [bodyId]: { explored: true },
      };

      return {
        ...prev,
        resources: nextResources,
        celestialBodies: nextBodies,
      };
    });

    addLog(`Expedition Successful: Colony outpost established on ${def.name}!`, 'discovery');
    return true;
  }, [addLog]);

  // Build Wonder Stage
  const buildWonderStage = useCallback((wonderId: string): boolean => {
    const def = WONDER_DEFS.find((w) => w.id === wonderId);
    if (!def) return false;

    const currentStage = stateRef.current.wonders[wonderId]?.currentStage || 0;
    if (currentStage >= def.stages.length) return false;

    const stageToBuild = def.stages[currentStage];
    if (!stageToBuild) return false;

    // Check tech
    if (def.requiredTech && !stateRef.current.techs[def.requiredTech]?.researched) {
      return false;
    }

    // Check cost
    for (const [res, needed] of Object.entries(stageToBuild.cost)) {
      if ((stateRef.current.resources[res as ResourceId]?.amount || 0) < (needed as number)) {
        return false;
      }
    }

    soundFX.playWonderStage();

    setGameState((prev) => {
      const nextResources = { ...prev.resources };
      for (const [res, needed] of Object.entries(stageToBuild.cost)) {
        const rId = res as ResourceId;
        nextResources[rId] = {
          ...nextResources[rId],
          amount: Math.max(0, nextResources[rId].amount - (needed as number)),
        };
      }

      const nextWonders = {
        ...prev.wonders,
        [wonderId]: { currentStage: currentStage + 1 },
      };

      return {
        ...prev,
        resources: nextResources,
        wonders: nextWonders,
      };
    });

    addLog(`Megastructure Milestone: ${def.name} - Stage ${stageToBuild.stageNumber} [${stageToBuild.name}] operational!`, 'milestone');
    return true;
  }, [addLog]);

  // Get Power / Energy stats
  const getEnergyStats = useCallback(() => {
    const state = stateRef.current;
    let produced = 0;
    let consumed = 0;

    for (const bDef of BUILDING_DEFS) {
      const bState = state.buildings[bDef.id];
      if (!bState || bState.count <= 0 || !bState.enabled) continue;
      if (bDef.requiredBody && !state.celestialBodies[bDef.requiredBody]?.explored) continue;
      if (bDef.requiredTech && !state.techs[bDef.requiredTech]?.researched) continue;

      if (bDef.produces.energy) {
        produced += bDef.produces.energy * bState.count;
      }
      if (bDef.consumes.energy) {
        consumed += bDef.consumes.energy * bState.count;
      }
    }

    // Add Dyson Swarm energy bonus
    const dysonStage = state.wonders.dysonSwarm?.currentStage || 0;
    if (dysonStage >= 1) {
      const dysonMW = dysonStage === 1 ? 500 : dysonStage === 2 ? 2500 : 10000;
      produced += dysonMW;
    }

    const net = produced - consumed;
    const efficiency = consumed === 0 ? 1 : Math.min(1, (produced + (state.resources.energy?.amount || 0)) / consumed);

    return { produced, consumed, net, efficiency };
  }, []);

  // Main simulation tick loop (every 100ms)
  useEffect(() => {
    let lastTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 1.0); // clamp dt to max 1s
      lastTime = now;

      setGameState((prev) => {
        // 1. Calculate Energy production vs consumption
        let totalEnergyProduced = 0;
        let totalEnergyRequired = 0;

        for (const bDef of BUILDING_DEFS) {
          const bState = prev.buildings[bDef.id];
          if (!bState || bState.count <= 0 || !bState.enabled) continue;
          if (bDef.requiredBody && !prev.celestialBodies[bDef.requiredBody]?.explored) continue;
          if (bDef.requiredTech && !prev.techs[bDef.requiredTech]?.researched) continue;

          if (bDef.produces.energy) {
            totalEnergyProduced += bDef.produces.energy * bState.count;
          }
          if (bDef.consumes.energy) {
            totalEnergyRequired += bDef.consumes.energy * bState.count;
          }
        }

        // Dyson swarm bonus
        const dysonStage = prev.wonders.dysonSwarm?.currentStage || 0;
        if (dysonStage >= 1) {
          totalEnergyProduced += dysonStage === 1 ? 500 : dysonStage === 2 ? 2500 : 10000;
        }

        let powerEfficiency = 1.0;
        let batteryDelta = (totalEnergyProduced - totalEnergyRequired) * dt;

        if (batteryDelta < 0) {
          const energyStored = prev.resources.energy.amount;
          if (energyStored >= Math.abs(batteryDelta)) {
            // Buffer can handle deficit
            powerEfficiency = 1.0;
          } else {
            // Throttled
            powerEfficiency = totalEnergyRequired > 0 ? Math.max(0.1, (totalEnergyProduced + energyStored / dt) / totalEnergyRequired) : 1.0;
          }
        }

        // 2. Calculate net production rates for all resources
        const netRates: Record<ResourceId, number> = {} as any;
        for (const def of RESOURCE_DEFS) {
          netRates[def.id] = 0;
        }

        // Energy rate is production - consumption
        netRates.energy = totalEnergyProduced - totalEnergyRequired;

        // Wonder bonuses: Space elevator stage 3 gives +50% extraction
        const elevatorStage = prev.wonders.spaceElevator?.currentStage || 0;
        const extractionMultiplier = elevatorStage >= 3 ? 1.5 : 1.0;

        // Warp gate stage 1 gives +100% science
        const warpStage = prev.wonders.warpGate?.currentStage || 0;
        const scienceMultiplier = warpStage >= 1 ? 2.0 : 1.0;

        for (const bDef of BUILDING_DEFS) {
          const bState = prev.buildings[bDef.id];
          if (!bState || bState.count <= 0 || !bState.enabled) continue;
          if (bDef.requiredBody && !prev.celestialBodies[bDef.requiredBody]?.explored) continue;
          if (bDef.requiredTech && !prev.techs[bDef.requiredTech]?.researched) continue;

          // Check non-energy inputs (e.g., oil for combustion, uranium for fission, etc.)
          let inputAvailable = true;
          for (const [res, neededRate] of Object.entries(bDef.consumes)) {
            if (res === 'energy') continue;
            const rId = res as ResourceId;
            const neededAmount = (neededRate as number) * bState.count * dt;
            if (prev.resources[rId].amount < neededAmount) {
              inputAvailable = false;
              break;
            }
          }

          if (!inputAvailable) continue;

          // Consume inputs
          for (const [res, neededRate] of Object.entries(bDef.consumes)) {
            if (res === 'energy') continue;
            const rId = res as ResourceId;
            netRates[rId] -= (neededRate as number) * bState.count;
          }

          // Building effective multiplier
          const buildingEff = bDef.consumes.energy ? powerEfficiency : 1.0;

          // Produce outputs
          for (const [res, prodRate] of Object.entries(bDef.produces)) {
            if (res === 'energy') continue;
            const rId = res as ResourceId;
            let mult = buildingEff;
            if (bDef.category === 'extraction' || bDef.category === 'orbital') {
              mult *= extractionMultiplier;
            }
            if (bDef.category === 'science') {
              mult *= scienceMultiplier;
            }
            netRates[rId] += (prodRate as number) * bState.count * mult;
          }
        }

        // 3. Update resource amounts and cap at capacity
        const nextResources = { ...prev.resources };
        const gatheredStats = { ...prev.stats.totalGathered };

        for (const def of RESOURCE_DEFS) {
          const rId = def.id;
          const current = nextResources[rId];
          const rate = netRates[rId] || 0;
          const delta = rate * dt;

          let newAmount = current.amount + delta;
          if (newAmount > current.capacity) {
            newAmount = current.capacity;
          }
          if (newAmount < 0) {
            newAmount = 0;
          }

          if (delta > 0) {
            gatheredStats[rId] = (gatheredStats[rId] || 0) + delta;
          }

          nextResources[rId] = {
            ...current,
            amount: newAmount,
            perSecond: rate,
          };
        }

        return {
          ...prev,
          resources: nextResources,
          stats: {
            ...prev.stats,
            lastTickTime: now,
            totalTimePlayedMs: prev.stats.totalTimePlayedMs + dt * 1000,
            totalGathered: gatheredStats,
          },
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Periodic autosave every 5 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGame(stateRef.current);
    }, 5000);

    const handleBeforeUnload = () => {
      saveGame(stateRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const manualSave = useCallback((): boolean => {
    const success = saveGame(stateRef.current);
    if (success) {
      addLog('Mission telemetry & state saved locally.', 'system');
    }
    return success;
  }, [addLog]);

  const exportSave = useCallback((): string => {
    return exportSaveString(stateRef.current);
  }, []);

  const importSave = useCallback((code: string): boolean => {
    const loaded = importSaveString(code);
    if (!loaded) return false;
    setGameState(loaded);
    saveGame(loaded);
    addLog('Restored state from imported telemetry packet.', 'system');
    return true;
  }, [addLog]);

  const resetGame = useCallback(() => {
    clearSave();
    const fresh = getInitialGameState();
    setGameState(fresh);
    saveGame(fresh);
    addLog('Project Nova command reset to initial baseline.', 'system');
  }, [addLog]);

  return (
    <GameContext.Provider
      value={{
        state: gameState,
        offlineReport,
        closeOfflineModal,
        gatherResource,
        buyBuilding,
        toggleBuilding,
        upgradeStorage,
        researchTech,
        exploreCelestialBody,
        buildWonderStage,
        setBuyMultiplier,
        toggleSound,
        setActiveTab,
        manualSave,
        importSave,
        exportSave,
        resetGame,
        addLog,
        getEnergyStats,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
