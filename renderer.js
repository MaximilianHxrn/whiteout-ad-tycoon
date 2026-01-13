// Renderer draws all entities and world onto the canvas.
import { clamp } from './math.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  render(state) {
    const ctx = this.ctx;
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Determine camera to keep player centered
    const player = state.player;
    const camX = player.x;
    const camY = player.y;
    // World size
    const worldWidth = state.world.width;
    const worldHeight = state.world.height;
    const halfW = canvas.width / 2;
    const halfH = canvas.height / 2;
    // Draw ground
    ctx.fillStyle = '#eef7ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Translate world
    ctx.save();
    ctx.translate(halfW - camX, halfH - camY);
    // Draw boundary
    ctx.strokeStyle = '#ccddee';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, worldWidth, worldHeight);
    // Draw trees and oil nodes
    state.trees.forEach(tree => {
      ctx.fillStyle = '#006600';
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
    state.oilNodes.forEach(node => {
      ctx.fillStyle = '#663300';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
    // Draw stations
    state.stations.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x - 20, s.y - 20, 40, 40);
    });
    // Draw turrets
    state.turrets.forEach(turret => {
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.arc(turret.x, turret.y, 15, 0, Math.PI * 2);
      ctx.fill();
    });
    // Draw workers
    state.workers.forEach(worker => {
      ctx.fillStyle = worker.type === 'hauler' ? '#ffbb00' : '#ff8800';
      ctx.beginPath();
      ctx.arc(worker.x, worker.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    // Draw customers
    state.customers.forEach(cust => {
      ctx.fillStyle = '#0066cc';
      ctx.beginPath();
      ctx.arc(cust.x, cust.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    // Draw bears
    state.bears.forEach(bear => {
      ctx.fillStyle = '#442200';
      ctx.beginPath();
      ctx.arc(bear.x, bear.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
    // Draw items (drops and piles)
    state.items.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    // Draw player
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
    ctx.fill();
    // Draw player's stack
    let stackY = player.y - 16;
    const stackTypes = Object.keys(state.inventoryStack); // stack is array? We'll use inventoryStack list for rendering order
    state.inventoryStack.forEach(item => {
      ctx.fillStyle = item.color;
      ctx.fillRect(player.x - 6, stackY - 8, 12, 8);
      stackY -= 9;
    });
    // Draw turret piles
    state.turretPiles.forEach(pile => {
      let y = pile.y - 16;
      pile.stack.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(pile.x - 6, y - 8, 12, 8);
        y -= 9;
      });
    });
    ctx.restore();
  }
}