// Spawning system: spawns bears and customers over time.
import { BALANCE } from '../data/balance.js';

export function updateSpawning(state, dt) {
  state.spawnTimers.bear += dt;
  if (state.spawnTimers.bear >= BALANCE.bearSpawnInterval) {
    state.spawnTimers.bear = 0;
    spawnBear(state);
  }
  state.spawnTimers.customer += dt;
  // spawn customers only if meat shop exists and has buffer > 0 or at least some items
  if (state.spawnTimers.customer >= BALANCE.customerSpawnInterval) {
    state.spawnTimers.customer = 0;
    spawnCustomer(state);
  }
}

function spawnBear(state) {
  const id = state.nextId++;
  // spawn at random around edges
  const margin = 50;
  let x, y;
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: // top
      x = Math.random() * state.world.width;
      y = margin;
      break;
    case 1: // bottom
      x = Math.random() * state.world.width;
      y = state.world.height - margin;
      break;
    case 2: // left
      x = margin;
      y = Math.random() * state.world.height;
      break;
    default: // right
      x = state.world.width - margin;
      y = Math.random() * state.world.height;
      break;
  }
  state.bears.push({ id, x, y, health: BALANCE.bearHealth });
}

function spawnCustomer(state) {
  const id = state.nextId++;
  // Customers spawn near base shops; pick first shop station
  const shop = state.stations.find(s => s.type === 'shop' && s.item === 'rawMeat');
  if (!shop) return;
  // spawn near some offset
  const angle = Math.random() * Math.PI * 2;
  const radius = 150 + Math.random() * 50;
  const x = shop.x + Math.cos(angle) * radius;
  const y = shop.y + Math.sin(angle) * radius;
  state.customers.push({ id, x, y, state: 'going', target: shop, speed: 80, waitTimer: 0 });
}
