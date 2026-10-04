import { GameSaveData, ResourceId } from '../types/game';
import { getInitialGameState, RESOURCE_DEFS, BUILDING_DEFS, STORAGE_DEFS } from '../data/gameData';

export const SAVE_KEY = 'project_nova_save_v1';

export interface OfflineReport {
  secondsOffline: number;
  resourcesGained: Partial<Record<ResourceId, number>>;
}

export function saveGame(state: GameSaveData): boolean {
  try {
    const copy: GameSaveData = {
      ...state,
      stats: {
        ...state.stats,
        lastTickTime: Date.now(),
      },
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
    return true;
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err);
    return false;
  }
}

export function calculateBuildingCost(
  baseCost: Partial<Record<ResourceId, number>>,
  multiplier: number,
  currentCount: number
): Partial<Record<ResourceId, number>> {
  const result: Partial<Record<ResourceId, number>> = {};
  for (const [res, base] of Object.entries(baseCost)) {
    const cost = Math.floor((base as number) * Math.pow(multiplier, currentCount));
    result[res as ResourceId] = cost;
  }
  return result;
}

export function calculateBulkBuildingCost(
  baseCost: Partial<Record<ResourceId, number>>,
  costMult: number,
  currentCount: number,
  amountToBuy: number
): Partial<Record<ResourceId, number>> {
  const result: Partial<Record<ResourceId, number>> = {};
  for (const [res, base] of Object.entries(baseCost)) {
    let total = 0;
    for (let i = 0; i < amountToBuy; i++) {
      total += Math.floor((base as number) * Math.pow(costMult, currentCount + i));
    }
    result[res as ResourceId] = total;
  }
  return result;
}

export function calculateMaxAffordable(
  baseCost: Partial<Record<ResourceId, number>>,
  costMult: number,
  currentCount: number,
  resources: Record<ResourceId, { amount: number }>
): number {
  let count = 0;
  let simulatedCount = currentCount;
  const available: Record<string, number> = {};
  for (const [r, obj] of Object.entries(resources)) {
    available[r] = obj.amount;
  }

  while (count < 1000) {
    let canAfford = true;
    const stepCost: Record<string, number> = {};
    for (const [res, base] of Object.entries(baseCost)) {
      const needed = Math.floor((base as number) * Math.pow(costMult, simulatedCount));
      stepCost[res] = needed;
      if ((available[res] || 0) < needed) {
        canAfford = false;
        break;
      }
    }

    if (!canAfford) break;

    for (const [res, cost] of Object.entries(stepCost)) {
      available[res] -= cost;
    }
    count++;
    simulatedCount++;
  }

  return Math.max(count, 0);
}

export function loadGame(): { state: GameSaveData; offlineReport: OfflineReport | null } {
  const defaultState = getInitialGameState();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return { state: defaultState, offlineReport: null };
    }

    const parsed: GameSaveData = JSON.parse(raw);

    // Merge resources with definitions to guarantee no missing fields
    const mergedResources = { ...defaultState.resources };
    for (const def of RESOURCE_DEFS) {
      if (parsed.resources && parsed.resources[def.id]) {
        mergedResources[def.id] = {
          ...defaultState.resources[def.id],
          ...parsed.resources[def.id],
        };
      }
    }

    // Merge buildings
    const mergedBuildings = { ...defaultState.buildings };
    for (const def of BUILDING_DEFS) {
      if (parsed.buildings && parsed.buildings[def.id]) {
        mergedBuildings[def.id] = {
          ...defaultState.buildings[def.id],
          ...parsed.buildings[def.id],
        };
      }
    }

    // Merge storage upgrades
    const mergedStorage = { ...defaultState.storageUpgrades };
    for (const def of STORAGE_DEFS) {
      if (parsed.storageUpgrades && parsed.storageUpgrades[def.id]) {
        mergedStorage[def.id] = {
          ...defaultState.storageUpgrades[def.id],
          ...parsed.storageUpgrades[def.id],
        };
      }
    }

    const state: GameSaveData = {
      version: 1,
      resources: mergedResources,
      buildings: mergedBuildings,
      storageUpgrades: mergedStorage,
      techs: { ...defaultState.techs, ...(parsed.techs || {}) },
      celestialBodies: { ...defaultState.celestialBodies, ...(parsed.celestialBodies || {}) },
      wonders: { ...defaultState.wonders, ...(parsed.wonders || {}) },
      stats: { ...defaultState.stats, ...(parsed.stats || {}) },
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      logs: Array.isArray(parsed.logs) ? parsed.logs.slice(-30) : defaultState.logs,
    };

    // Calculate offline progress
    const now = Date.now();
    const lastTick = state.stats.lastTickTime || now;
    const diffSeconds = Math.max(0, (now - lastTick) / 1000);

    let offlineReport: OfflineReport | null = null;

    // Only process offline progress if player was away for more than 10 seconds
    if (diffSeconds > 10) {
      const cappedSeconds = Math.min(diffSeconds, 86400); // 24hr cap
      const offlineGains: Partial<Record<ResourceId, number>> = {};

      // Estimate net rates based on active buildings
      // 1. Calculate production rates
      const rates: Partial<Record<ResourceId, number>> = {};
      for (const bDef of BUILDING_DEFS) {
        const bState = state.buildings[bDef.id];
        if (!bState || bState.count <= 0 || !bState.enabled) continue;

        // Check if unlocked / explored
        if (bDef.requiredBody && !state.celestialBodies[bDef.requiredBody]?.explored) continue;
        if (bDef.requiredTech && !state.techs[bDef.requiredTech]?.researched) continue;

        for (const [res, prod] of Object.entries(bDef.produces)) {
          rates[res as ResourceId] = (rates[res as ResourceId] || 0) + (prod as number) * bState.count;
        }
      }

      // Add wonder bonuses if active
      if (state.wonders.dysonSwarm?.currentStage >= 1) {
        const stage = state.wonders.dysonSwarm.currentStage;
        const dysonMW = stage === 1 ? 500 : stage === 2 ? 2500 : 10000;
        rates['energy'] = (rates['energy'] || 0) + dysonMW;
      }

      for (const [res, rate] of Object.entries(rates)) {
        if (!rate || rate <= 0) continue;
        const resId = res as ResourceId;
        const gained = rate * cappedSeconds;
        const currentAmount = state.resources[resId].amount;
        const capacity = state.resources[resId].capacity;
        const newAmount = Math.min(capacity, currentAmount + gained);
        const actualGained = Math.max(0, newAmount - currentAmount);

        if (actualGained > 0) {
          state.resources[resId].amount = newAmount;
          offlineGains[resId] = actualGained;
          state.stats.totalGathered[resId] = (state.stats.totalGathered[resId] || 0) + actualGained;
        }
      }

      if (Object.keys(offlineGains).length > 0) {
        offlineReport = {
          secondsOffline: diffSeconds,
          resourcesGained: offlineGains,
        };
      }
    }

    state.stats.lastTickTime = now;
    return { state, offlineReport };
  } catch (err) {
    console.error('Error loading game state:', err);
    return { state: defaultState, offlineReport: null };
  }
}

export function exportSaveString(state: GameSaveData): string {
  try {
    const raw = JSON.stringify(state);
    return btoa(unescape(encodeURIComponent(raw)));
  } catch (e) {
    return JSON.stringify(state);
  }
}

export function importSaveString(encoded: string): GameSaveData | null {
  try {
    let jsonStr = encoded.trim();
    try {
      jsonStr = decodeURIComponent(escape(atob(jsonStr)));
    } catch {}

    const parsed: GameSaveData = JSON.parse(jsonStr);
    if (!parsed.resources || !parsed.buildings) {
      throw new Error('Invalid save structure');
    }
    return parsed;
  } catch (err) {
    console.error('Failed to import save:', err);
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}
