export type ResourceId =
  | 'metal'
  | 'wood'
  | 'gem'
  | 'energy'
  | 'science'
  | 'oil'
  | 'silicon'
  | 'lunarite'
  | 'titanium'
  | 'hydrogen'
  | 'helium'
  | 'uranium'
  | 'lava'
  | 'meteorite'
  | 'ice'
  | 'plasma'
  | 'antimatter';

export interface ResourceDefinition {
  id: ResourceId;
  name: string;
  category: 'terrestrial' | 'power' | 'specialized' | 'cosmic';
  description: string;
  iconName: string;
  color: string;
  accentBg: string;
  baseCapacity: number;
  unlockedByDefault: boolean;
  canGatherManually: boolean;
  manualGatherAmount: number;
}

export interface ResourceState {
  amount: number;
  capacity: number;
  perSecond: number;
  unlocked: boolean;
}

export interface BuildingDefinition {
  id: string;
  name: string;
  description: string;
  category: 'extraction' | 'energy' | 'science' | 'synthesis' | 'orbital';
  baseCost: Partial<Record<ResourceId, number>>;
  costMultiplier: number;
  produces: Partial<Record<ResourceId, number>>;
  consumes: Partial<Record<ResourceId, number>>;
  requiredTech?: string;
  requiredBody?: string;
}

export interface BuildingState {
  count: number;
  enabled: boolean;
}

export interface StorageUpgradeDefinition {
  id: string;
  name: string;
  description: string;
  resourceId: ResourceId;
  capacityBonus: number;
  baseCost: Partial<Record<ResourceId, number>>;
  costMultiplier: number;
  requiredTech?: string;
}

export interface StorageUpgradeState {
  count: number;
}

export interface TechDefinition {
  id: string;
  name: string;
  description: string;
  tier: number;
  cost: Partial<Record<ResourceId, number>>;
  prerequisites: string[];
  unlocksDescription: string;
}

export interface TechState {
  researched: boolean;
}

export type CelestialBodyType = 'star' | 'planet' | 'moon' | 'asteroid' | 'outer_system';

export interface CelestialBodyDefinition {
  id: string;
  name: string;
  type: CelestialBodyType;
  orbitalDistance: string;
  description: string;
  explorationCost: Partial<Record<ResourceId, number>>;
  requiredTech?: string;
  unlockedResources: ResourceId[];
  associatedBuildings: string[];
}

export interface CelestialBodyState {
  explored: boolean;
}

export interface WonderStage {
  stageNumber: number;
  name: string;
  description: string;
  cost: Partial<Record<ResourceId, number>>;
  perks: string;
}

export interface WonderDefinition {
  id: string;
  name: string;
  description: string;
  image: string;
  requiredTech: string;
  stages: WonderStage[];
}

export interface WonderState {
  currentStage: number; // 0 means not started, up to stages.length
}

export interface GameLog {
  id: string;
  timestamp: number;
  text: string;
  type: 'system' | 'tech' | 'discovery' | 'milestone';
}

export interface GameStats {
  startTime: number;
  lastTickTime: number;
  totalTimePlayedMs: number;
  manualClicks: number;
  totalGathered: Partial<Record<ResourceId, number>>;
  totalTechsResearched: number;
  totalBuildingsConstructed: number;
}

export type BuyMultiplier = 1 | 5 | 10 | 25 | 100 | -1; // -1 represents 'MAX'

export interface GameSettings {
  soundEnabled: boolean;
  buyMultiplier: BuyMultiplier;
  showStorageAlerts: boolean;
  activeTab: 'overview' | 'production' | 'storage' | 'research' | 'exploration' | 'wonders';
}

export interface GameSaveData {
  version: number;
  resources: Record<ResourceId, ResourceState>;
  buildings: Record<string, BuildingState>;
  storageUpgrades: Record<string, StorageUpgradeState>;
  techs: Record<string, TechState>;
  celestialBodies: Record<string, CelestialBodyState>;
  wonders: Record<string, WonderState>;
  stats: GameStats;
  settings: GameSettings;
  logs: GameLog[];
}
