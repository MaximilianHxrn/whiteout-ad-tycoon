// Handles picking up items from ground and turret piles.
import { distance } from '../../engine/math.js';

export function updatePickup(state, dt) {
  const player = state.player;
  // pick ground items
  state.items = state.items.filter(item => {
    if (state.inventoryStack.length >= player.bagSize) {
      return true; // cannot pick more
    }
    if (distance(item, player) < 20) {
      // pick item
      state.inventory[item.type] = (state.inventory[item.type] || 0) + 1;
      state.inventoryStack.push({ type: item.type, color: item.color });
      return false;
    }
    return true;
  });
  // pick from turret piles
  state.turretPiles.forEach(pile => {
    if (distance(pile, player) < 25) {
      while (pile.stack.length > 0 && state.inventoryStack.length < player.bagSize) {
        const itm = pile.stack.pop();
        state.inventory[itm.type] = (state.inventory[itm.type] || 0) + 1;
        state.inventoryStack.push({ type: itm.type, color: itm.color });
      }
    }
  });
}
