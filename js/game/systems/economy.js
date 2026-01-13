// Economy system: handles customer sales and applying upgrades.
import { ITEMS } from '../data/items.js';
import { BALANCE } from '../data/balance.js';

export function updateEconomy(state, dt) {
  // Process customers buying from shops
  state.customers.forEach(c => {
    const shop = c.target;
    if (!shop) return;
    const dx = c.x - shop.x;
    const dy = c.y - shop.y;
    if (Math.hypot(dx, dy) < 10) {
      // at shop
      c.state = 'waiting';
      c.waitTimer = (c.waitTimer || 0) + dt;
      const multiplier = state.upgrades.owned.includes('unlockShopWorker') ? BALANCE.shopWorkerMultiplier : 1;
      const threshold = BALANCE.customerBuyRate / multiplier;
      if (c.waitTimer >= threshold && shop.buffer > 0) {
        // sale
        shop.buffer--;
        c.completed = true;
        c.waitTimer = 0;
        const value = ITEMS[shop.item].value;
        state.coins += value;
      }
    }
  });
  // Remove customers that completed
  state.customers = state.customers.filter(c => !c.completed);
}

export function applyUpgrade(state, id) {
  switch (id) {
    case 'upgradeBag1':
      state.player.bagSize += 5;
      break;
    case 'upgradeSpeed':
      state.player.speed *= 1.2;
      break;
    case 'unlockTurret':
      // spawn initial turret near base
      spawnTurret(state);
      break;
    case 'unlockForest':
      // generate trees in a region near base
      generateForest(state);
      // add wood shop station
      addStation(state, { id: 'woodShop', type: 'shop', item: 'wood', x: state.stations[0].x + 80, y: state.stations[0].y, buffer: 0, color: '#886633' });
      break;
    case 'unlockHauler':
      // spawn an initial hauler worker
      spawnWorker(state, 'hauler');
      break;
    case 'unlockShopWorker':
      // effect handled in economy multiplier
      break;
    case 'unlockCookhouse':
      // add cookhouse station near base
      addStation(state, { id: 'cookhouse', type: 'cookhouse', x: state.stations[0].x - 80, y: state.stations[0].y + 80, color: '#995544' });
      break;
    case 'unlockOil':
      // generate oil field
      generateOil(state);
      // add crude oil shop? But we refine later; we skip shop
      break;
    case 'unlockRefinery':
      // add refinery
      addStation(state, { id: 'refinery', type: 'refinery', x: state.stations[0].x - 80, y: state.stations[0].y - 80, color: '#333366' });
      break;
    case 'unlockTrucks':
      // add truck depot
      addStation(state, { id: 'truckDepot', type: 'truckDepot', x: state.stations[0].x + 120, y: state.stations[0].y - 80, color: '#555577' });
      break;
    default:
      break;
  }
}

function addStation(state, st) {
  state.stations.push(st);
}

function spawnTurret(state) {
  const base = state.stations[0];
  state.turrets.push({ id: 'turret-' + state.nextId++, x: base.x + 120, y: base.y + 120, fireCooldown: 0 });
  state.turretPiles.push({ id: 'pile-' + state.nextId++, x: base.x + 120, y: base.y + 120, stack: [] });
}

function generateForest(state) {
  // spawn 30 trees in area north of base
  const base = state.stations[0];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 200 + Math.random() * 150;
    const x = base.x + Math.cos(angle) * radius;
    const y = base.y - 300 + Math.sin(angle) * radius;
    state.trees.push({ id: 'tree-' + state.nextId++, x, y, health: 5 });
  }
  state.objectiveText = 'Collect wood from the forest';
}

function generateOil(state) {
  const base = state.stations[0];
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 500 + Math.random() * 200;
    const x = base.x + Math.cos(angle) * radius;
    const y = base.y + 400 + Math.sin(angle) * radius;
    state.oilNodes.push({ id: 'oil-' + state.nextId++, x, y, health: 5 });
  }
  state.objectiveText = 'Collect crude oil from the oil field';
}

function spawnWorker(state, type) {
  // type 'hauler' or 'shop'
  const base = state.stations[0];
  state.workers.push({ id: 'worker-' + state.nextId++, type, x: base.x, y: base.y, task: null });
}
