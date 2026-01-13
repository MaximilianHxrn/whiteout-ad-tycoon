// Turret system: handles automatic bear killing and collecting meat into piles.
import { distance } from '../../engine/math.js';
import { BALANCE } from '../data/balance.js';
import { ITEMS } from '../data/items.js';

export function updateTurrets(state, dt) {
  state.turrets.forEach((turret, index) => {
    turret.fireCooldown = (turret.fireCooldown || 0) - dt;
    if (turret.fireCooldown <= 0) {
      // find nearest bear within range
      let targetIndex = -1;
      let minDist = BALANCE.turretRange;
      state.bears.forEach((bear, i) => {
        const d = distance(turret, bear);
        if (d < minDist) {
          minDist = d;
          targetIndex = i;
        }
      });
      if (targetIndex >= 0) {
        // kill bear instantly
        const bear = state.bears[targetIndex];
        state.bears.splice(targetIndex, 1);
        // drop meat into turret pile
        const pile = state.turretPiles[index];
        pile.stack.push({ type: 'rawMeat', color: ITEMS.rawMeat.color });
        // set cooldown
        turret.fireCooldown = 1 / BALANCE.turretFireRate;
      }
    }
  });
}