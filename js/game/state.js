// Defines game state structure and save/load functionality.
import { UPGRADES } from './data/upgrades.js';
import { ITEMS } from './data/items.js';

const SAVE_KEY = 'whiteoutTycoonSave';

export function createInitialState() {
  const width = 2000;
  const height = 2000;
  const baseX = width / 2;
  const baseY = height / 2;
  return {
    world: { width, height },
    player: { x: baseX + 100, y: baseY, speed: 150, bagSize: 10, damage: 5, cooldown: 0.5, cooldownTimer: 0 },
    inventory: { rawMeat: 0, wood: 0, processedMeat: 0, crudeOil: 0, diesel: 0 },
    inventoryStack: [],
    coins: 0,
    bears: [],
    items: [],
    stations: [
      { id: 'meatShop', type: 'shop', item: 'rawMeat', x: baseX, y: baseY, buffer: 0, color: '#aa6633' },
    ],
    customers: [],
    upgrades: {
      available: UPGRADES,
      owned: [],
    },
    spawnTimers: {
      bear: 0,
      customer: 0,
    },
    trees: [],
    oilNodes: [],
    workers: [],
    turrets: [],
    turretPiles: [],
    trucks: [],
    objectiveText: 'Hunt polar bears and sell meat to earn coins',
    saveTimer: 0,
    nextId: 1,
  };
}

export function saveGameState(state) {
  try {
    const clone = JSON.parse(JSON.stringify(state));
    // Only persist minimal state; remove volatile things like timers
    delete clone.spawnTimers;
    delete clone.saveTimer;
    localStorage.setItem(SAVE_KEY, JSON.stringify(clone));
  } catch (e) {
    console.warn('Failed to save game', e);
  }
}

export function loadGameState() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      const loaded = JSON.parse(data);
      // Recreate state by merging with defaults
      const state = createInitialState();
      Object.assign(state, loaded);
      // Some fields might not exist if new version; ensure arrays
      state.inventoryStack = [];
      state.spawnTimers = { bear: 0, customer: 0 };
      state.saveTimer = 0;
      // compute nextId to avoid duplicates
      state.nextId = Math.max(state.nextId || 1, 1);
      return state;
    }
  } catch (e) {
    console.warn('Failed to load game', e);
  }
  return null;
}
