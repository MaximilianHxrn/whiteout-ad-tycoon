// Entry point for the game. Sets up canvas, state and main loop.
import { createInput } from './engine/input.js';
import { Time } from './engine/time.js';
import { Renderer } from './engine/renderer.js';
import { loadGameState, saveGameState, createInitialState } from './game/state.js';
import { updateMovement } from './game/systems/movement.js';
import { updateSpawning } from './game/systems/spawning.js';
import { updateCombat } from './game/systems/combat.js';
import { updatePickup } from './game/systems/pickup.js';
import { updateStations } from './game/systems/stations.js';
import { updateEconomy, applyUpgrade } from './game/systems/economy.js';
import { updateWorkers } from './game/systems/ai_workers.js';
import { updateTurrets } from './game/systems/turrets.js';
import { updateTrucks } from './game/systems/trucks.js';
import { updateUnlocks } from './game/systems/unlock.js';
import { ITEMS } from './game/data/items.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to full window
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Create modules
const input = createInput(canvas);
const time = new Time();
const renderer = new Renderer(ctx);

// Load or create game state
let state = loadGameState();
if (!state) {
  state = createInitialState();
}

// UI elements
const coinDisplay = document.getElementById('coinDisplay');
const invDisplay = document.getElementById('invDisplay');
const objectiveDisplay = document.getElementById('objectiveDisplay');
const upgradeBtn = document.getElementById('upgradeBtn');
const upgradePanel = document.getElementById('upgradePanel');
let upgradePanelVisible = false;

// Attach button handler
upgradeBtn.addEventListener('click', () => {
  upgradePanelVisible = !upgradePanelVisible;
  upgradePanel.classList.toggle('hidden', !upgradePanelVisible);
  if (upgradePanelVisible) {
    // rebuild panel content
    buildUpgradePanel();
  }
});

function buildUpgradePanel() {
  upgradePanel.innerHTML = '<h3>Upgrades</h3>';
  state.upgrades.available.forEach(u => {
    const owned = state.upgrades.owned.includes(u.id);
    const el = document.createElement('div');
    el.className = 'upgrade-item';
    el.innerHTML = `<strong>${u.name}</strong><br>${u.description}<br>Cost: ${u.cost}`;
    const btn = document.createElement('button');
    btn.textContent = owned ? 'Purchased' : 'Buy';
    btn.disabled = owned || state.coins < u.cost || !u.prerequisites.every(pr => state.upgrades.owned.includes(pr));
    btn.addEventListener('click', () => {
      if (!owned && state.coins >= u.cost) {
        state.coins -= u.cost;
        state.upgrades.owned.push(u.id);
        applyUpgrade(state, u.id);
        saveGameState(state);
        buildUpgradePanel();
      }
    });
    el.appendChild(btn);
    upgradePanel.appendChild(el);
  });
}

function updateUI() {
  coinDisplay.textContent = `Coins: ${state.coins.toFixed(0)}`;
  // Show inventory counts by type
  let invStr = '';
  Object.keys(state.inventory).forEach(type => {
    const count = state.inventory[type];
    if (count > 0) {
      invStr += `${type}:${count} `;
    }
  });
  invDisplay.textContent = invStr ? `Inventory: ${invStr}` : 'Inventory: empty';
  // Show objective hint
  objectiveDisplay.textContent = state.objectiveText || '';
}

function loop() {
  const dt = time.tick();
  // Update systems
  updateSpawning(state, dt);
  updateMovement(state, input, dt);
  updateCombat(state, dt);
  updatePickup(state, dt);
  updateStations(state, dt);
  updateEconomy(state, dt);
  updateWorkers(state, dt);
  updateTurrets(state, dt);
  updateTrucks(state, dt);
  updateUnlocks(state, dt);
  // Render
  renderer.render(state);
  // UI update
  updateUI();
  // Save periodically
  state.saveTimer += dt;
  if (state.saveTimer > 10) {
    saveGameState(state);
    state.saveTimer = 0;
  }
  requestAnimationFrame(loop);
}
// Start loop
loop();
