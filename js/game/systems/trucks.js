// Truck system: manages exporting processed meat using diesel
import { BALANCE } from '../data/balance.js';
import { ITEMS } from '../data/items.js';

export function updateTrucks(state, dt) {
  // For each truck in flight
  if (!state.trucks) state.trucks = [];
  for (let i = state.trucks.length - 1; i >= 0; i--) {
    const truck = state.trucks[i];
    truck.time -= dt;
    if (truck.time <= 0) {
      // Truck returns with revenue
      state.coins += truck.load * ITEMS.processedMeat.value * 5;
      state.trucks.splice(i, 1);
    }
  }
  // Check to launch new trucks if depot exists
  const depot = state.stations.find(s => s.type === 'truckDepot');
  if (!depot) return;
  depot.storage = depot.storage || { processedMeat: 0, diesel: 0 };
  while (depot.storage.processedMeat > 0 && depot.storage.diesel >= BALANCE.dieselPerTrip && state.trucks.length < 3) {
    const load = Math.min(depot.storage.processedMeat, BALANCE.truckCapacity);
    depot.storage.processedMeat -= load;
    depot.storage.diesel -= BALANCE.dieselPerTrip;
    state.trucks.push({ load, time: BALANCE.truckTripTime });
  }
}
