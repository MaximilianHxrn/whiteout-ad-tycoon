// Combat system: player vs bears, etc.
import { ITEMS } from '../data/items.js';
import { BALANCE } from '../data/balance.js';
import { distance } from '../../engine/math.js';

export function updateCombat(state, dt) {
  const player = state.player;
  // Update player's attack cooldown
  if (player.cooldownTimer > 0) {
    player.cooldownTimer -= dt;
  }
  // Player attacks bears on contact
  state.bears = state.bears.filter(bear => {
    if (distance(bear, player) < 20) {
      if (player.cooldownTimer <= 0) {
        bear.health -= player.damage;
        player.cooldownTimer = player.cooldown;
      }
    }
    // If bear dead: drop meat
    if (bear.health <= 0) {
      dropItem(state, 'rawMeat', bear.x, bear.y, BALANCE.bearDropCount);
      return false;
    }
    return true;
  });

  // Player chops trees on contact similar to bears
  state.trees = state.trees.filter(tree => {
    if (distance(tree, player) < 20) {
      if (player.cooldownTimer <= 0) {
        tree.health -= player.damage;
        player.cooldownTimer = player.cooldown;
      }
    }
    if (tree.health <= 0) {
      dropItem(state, 'wood', tree.x, tree.y, 2);
      return false;
    }
    return true;
  });
  // Player mines oil nodes (similar to trees) but drop crudeOil
  state.oilNodes = state.oilNodes.filter(node => {
    if (distance(node, player) < 20) {
      if (player.cooldownTimer <= 0) {
        node.health -= player.damage;
        player.cooldownTimer = player.cooldown;
      }
    }
    if (node.health <= 0) {
      dropItem(state, 'crudeOil', node.x, node.y, 2);
      return false;
    }
    return true;
  });
}

function dropItem(state, type, x, y, count) {
  for (let i = 0; i < count; i++) {
    state.items.push({ id: state.nextId++, type, x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 10, color: ITEMS[type].color });
  }
}