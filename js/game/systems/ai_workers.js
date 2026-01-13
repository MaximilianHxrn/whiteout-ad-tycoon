// AI Workers: handle haulers and shop workers.
import { distance, angleTo } from '../../engine/math.js';
import { BALANCE } from '../data/balance.js';
import { ITEMS } from '../data/items.js';

export function updateWorkers(state, dt) {
  state.workers.forEach(worker => {
    if (worker.type === 'hauler') {
      updateHauler(state, worker, dt);
    }
  });
}

function updateHauler(state, worker, dt) {
  const speed = BALANCE.workerSpeed;
  const capacity = BALANCE.workerCapacity;
  // Determine current task
  if (!worker.task) {
    // If carrying items, deliver them
    if (worker.carry && worker.carry.length > 0) {
      const firstType = worker.carry[0].type;
      const dest = findDestination(state, firstType);
      if (dest) {
        worker.task = { type: 'deliver', dest, itemType: firstType };
      }
    } else {
      // Find a source to pick up
      const source = findSource(state);
      if (source) {
        worker.task = { type: 'pickup', source };
      }
    }
  }
  // Execute task
  if (worker.task) {
    if (worker.task.type === 'pickup') {
      const src = worker.task.source;
      const targetPos = getSourcePos(src);
      moveTowards(worker, targetPos, speed, dt);
      if (distance(worker, targetPos) < 10) {
        // Pick as many as possible until capacity
        worker.carry = worker.carry || [];
        const space = capacity - worker.carry.length;
        if (src.kind === 'pile') {
          while (src.ref.stack.length > 0 && worker.carry.length < capacity) {
            const itm = src.ref.stack.pop();
            worker.carry.push({ type: itm.type, color: itm.color });
          }
        } else if (src.kind === 'stationOutput') {
          const st = src.ref;
          Object.keys(st.output).forEach(type => {
            while (st.output[type] > 0 && worker.carry.length < capacity) {
              st.output[type]--;
              worker.carry.push({ type, color: ITEMS[type].color });
            }
          });
        } else if (src.kind === 'ground') {
          // remove from state's items list
          const item = src.ref;
          const idx = state.items.indexOf(item);
          if (idx >= 0 && worker.carry.length < capacity) {
            state.items.splice(idx, 1);
            worker.carry.push({ type: item.type, color: item.color });
          }
        }
        // After picking, clear task
        worker.task = null;
      }
    } else if (worker.task.type === 'deliver') {
      const dest = worker.task.dest;
      moveTowards(worker, dest, speed, dt);
      if (distance(worker, dest) < 15) {
        // Deposit items matching dest type
        const depositType = worker.task.itemType;
        let i = worker.carry.length;
        while (i--) {
          const itm = worker.carry[i];
          if (itm.type === depositType) {
            worker.carry.splice(i, 1);
            depositItem(state, dest, itm.type);
          }
        }
        worker.task = null;
      }
    }
  }
}

function moveTowards(entity, target, speed, dt) {
  const angle = angleTo(entity, target);
  entity.x += Math.cos(angle) * speed * dt;
  entity.y += Math.sin(angle) * speed * dt;
}

function findDestination(state, type) {
  // Determine appropriate station based on item type
  if (type === 'rawMeat') {
    // Prefer cookhouse if exists and recipe requires rawMeat
    const cook = state.stations.find(s => s.type === 'cookhouse');
    if (cook) return cook;
    // else meat shop
    return state.stations.find(s => s.type === 'shop' && s.item === 'rawMeat');
  }
  if (type === 'wood') {
    // Prefer cookhouse for fuel
    const cook = state.stations.find(s => s.type === 'cookhouse');
    if (cook) return cook;
    return state.stations.find(s => s.type === 'shop' && s.item === 'wood');
  }
  if (type === 'processedMeat') {
    // Deliver processed meat to truck depot if exists, else to meat shop
    const depot = state.stations.find(s => s.type === 'truckDepot');
    if (depot) return depot;
    return state.stations.find(s => s.type === 'shop' && s.item === 'processedMeat');
  }
  if (type === 'crudeOil') {
    const refinery = state.stations.find(s => s.type === 'refinery');
    if (refinery) return refinery;
  }
  if (type === 'diesel') {
    const depot = state.stations.find(s => s.type === 'truckDepot');
    if (depot) return depot;
  }
  return null;
}

function depositItem(state, dest, type) {
  if (dest.type === 'shop') {
    dest.buffer = (dest.buffer || 0) + 1;
  } else if (dest.type === 'cookhouse') {
    dest.input = dest.input || {};
    dest.input[type] = (dest.input[type] || 0) + 1;
  } else if (dest.type === 'refinery') {
    dest.input = dest.input || {};
    dest.input[type] = (dest.input[type] || 0) + 1;
  } else if (dest.type === 'truckDepot') {
    dest.storage = dest.storage || { processedMeat: 0, diesel: 0 };
    dest.storage[type] = (dest.storage[type] || 0) + 1;
  }
}

function findSource(state) {
  // turret piles first
  let closest = null;
  let minDist = Infinity;
  state.turretPiles.forEach(pile => {
    if (pile.stack.length > 0) {
      const d = distance(pile, state.player); // approximate using player's pos; but worker pos later
      if (d < minDist) {
        minDist = d;
        closest = { kind: 'pile', ref: pile };
      }
    }
  });
  // station outputs
  state.stations.forEach(st => {
    if (st.output) {
      const hasOutput = Object.keys(st.output).some(type => st.output[type] > 0);
      if (hasOutput) {
        const d = distance(st, state.player);
        if (d < minDist) {
          minDist = d;
          closest = { kind: 'stationOutput', ref: st };
        }
      }
    }
  });
  // ground items
  if (!closest) {
    if (state.items.length > 0) {
      // pick first
      const item = state.items[0];
      closest = { kind: 'ground', ref: item };
    }
  }
  return closest;
}

function getSourcePos(src) {
  if (src.kind === 'pile') return src.ref;
  if (src.kind === 'stationOutput') return src.ref;
  if (src.kind === 'ground') return src.ref;
  return { x: 0, y: 0 };
}
