// Movement system: handles player and NPC movement.
import { clamp, distance, angleTo } from '../../engine/math.js';
import { BALANCE } from '../data/balance.js';

export function updateMovement(state, input, dt) {
  const { player, world } = state;
  // Player movement via keyboard
  let dx = 0;
  let dy = 0;
  if (input.isDown('KeyW') || input.isDown('ArrowUp')) dy -= 1;
  if (input.isDown('KeyS') || input.isDown('ArrowDown')) dy += 1;
  if (input.isDown('KeyA') || input.isDown('ArrowLeft')) dx -= 1;
  if (input.isDown('KeyD') || input.isDown('ArrowRight')) dx += 1;
  // pointer on mobile: treat pointer displacement from center as direction
  if (!dx && !dy && input.pointer.active) {
    const px = input.pointer.x - 0.5;
    const py = input.pointer.y - 0.5;
    dx = px;
    dy = py;
  }
  if (dx || dy) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
    const speed = player.speed;
    player.x += dx * speed * dt;
    player.y += dy * speed * dt;
    // Clamp to world
    player.x = clamp(player.x, 0, world.width);
    player.y = clamp(player.y, 0, world.height);
  }
  // Bears movement
  state.bears.forEach(bear => {
    const dist = distance(bear, player);
    if (dist < BALANCE.bearAggroRange) {
      const angle = angleTo(bear, player);
      bear.x += Math.cos(angle) * BALANCE.bearSpeed * dt;
      bear.y += Math.sin(angle) * BALANCE.bearSpeed * dt;
    }
    // clamp to world
    bear.x = clamp(bear.x, 0, world.width);
    bear.y = clamp(bear.y, 0, world.height);
  });
  // Customers movement
  state.customers.forEach(c => {
    if (c.target) {
      const t = c.target;
      const dist = distance(c, t);
      if (dist > 5) {
        const angle = angleTo(c, t);
        c.x += Math.cos(angle) * c.speed * dt;
        c.y += Math.sin(angle) * c.speed * dt;
      }
    }
  });
  // Workers movement handled in ai_workers system
}
