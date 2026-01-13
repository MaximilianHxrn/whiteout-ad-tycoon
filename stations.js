// Handles depositing items into stations and processing production.
import { distance } from '../../engine/math.js';
import { RECIPES } from '../data/recipes.js';
import { ITEMS } from '../data/items.js';
import { BALANCE } from '../data/balance.js';

export function updateStations(state, dt) {
  const player = state.player;
  // Deposit items into stations when player overlaps
  state.stations.forEach(st => {
    if (distance(player, st) < 30) {
      if (st.type === 'shop') {
        depositToShop(state, st);
      } else if (st.type === 'cookhouse') {
        depositToCookhouse(state, st);
      } else if (st.type === 'refinery') {
        depositToRefinery(state, st);
      } else if (st.type === 'truckDepot') {
        depositToTruckDepot(state, st);
      }
    }
  });
  // Update cookhouse and refinery processing
  state.stations.forEach(st => {
    if (st.type === 'cookhouse') {
      processRecipe(state, st, RECIPES.cookhouse, dt);
    } else if (st.type === 'refinery') {
      processRecipe(state, st, RECIPES.refinery, dt);
    }
  });
}

function removeFromPlayer(state, type, amount) {
  // Remove items of 'type' from inventory and inventoryStack (last collected first)
  let removed = 0;
  // remove from inventoryStack by popping items until removed amount
  for (let i = state.inventoryStack.length - 1; i >= 0 && removed < amount; i--) {
    const itm = state.inventoryStack[i];
    if (itm.type === type) {
      state.inventoryStack.splice(i, 1);
      removed++;
    }
  }
  state.inventory[type] = Math.max((state.inventory[type] || 0) - removed, 0);
  return removed;
}

function depositToShop(state, shop) {
  const type = shop.item;
  const available = state.inventory[type] || 0;
  if (available > 0) {
    const removed = removeFromPlayer(state, type, available);
    shop.buffer += removed;
    state.objectiveText = `Sold ${removed} ${type}`;
  }
}

function depositToCookhouse(state, st) {
  st.input = st.input || {};
  ['rawMeat', 'wood'].forEach(type => {
    const have = state.inventory[type] || 0;
    if (have > 0) {
      const removed = removeFromPlayer(state, type, have);
      st.input[type] = (st.input[type] || 0) + removed;
    }
  });
}

function depositToRefinery(state, st) {
  st.input = st.input || {};
  const type = 'crudeOil';
  const have = state.inventory[type] || 0;
  if (have > 0) {
    const removed = removeFromPlayer(state, type, have);
    st.input[type] = (st.input[type] || 0) + removed;
  }
}

function depositToTruckDepot(state, st) {
  // deposit processedMeat and diesel to depot storage
  st.storage = st.storage || { processedMeat: 0, diesel: 0 };
  ['processedMeat', 'diesel'].forEach(type => {
    const have = state.inventory[type] || 0;
    if (have > 0) {
      const removed = removeFromPlayer(state, type, have);
      st.storage[type] += removed;
    }
  });
}

function processRecipe(state, st, recipe, dt) {
  st.input = st.input || {};
  st.output = st.output || {};
  st.progress = st.progress || 0;
  if (st.progress > 0) {
    st.progress -= dt;
    if (st.progress <= 0) {
      // move outputs to st.outputBuffer
      Object.keys(recipe.outputs).forEach(outType => {
        const count = recipe.outputs[outType];
        st.output[outType] = (st.output[outType] || 0) + count;
      });
    }
    return;
  }
  // if not processing, check if inputs available
  let canStart = true;
  Object.keys(recipe.inputs).forEach(inType => {
    if ((st.input[inType] || 0) < recipe.inputs[inType]) {
      canStart = false;
    }
  });
  if (canStart) {
    // consume inputs
    Object.keys(recipe.inputs).forEach(inType => {
      st.input[inType] -= recipe.inputs[inType];
    });
    st.progress = recipe.time;
  }
  // Transfer outputs to player's inventory automatically when near
  if (distance(state.player, st) < 30) {
    Object.keys(st.output).forEach(outType => {
      const count = st.output[outType];
      if (count > 0) {
        const removed = count;
        // deliver to player until bag full
        while (st.output[outType] > 0 && state.inventoryStack.length < state.player.bagSize) {
          st.output[outType]--;
          state.inventory[outType] = (state.inventory[outType] || 0) + 1;
          state.inventoryStack.push({ type: outType, color: ITEMS[outType].color });
        }
      }
    });
  }
}