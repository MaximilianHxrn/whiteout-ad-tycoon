# Whiteout Ad Tycoon

This is a static HTML/JS game inspired by the **Whiteout Survival** playable ad tycoon loop.
The game runs entirely in the browser without any backend. Deploy it via GitHub Pages to play.

## How to run locally

To run the game locally you need a local static file server (the browser restricts module imports for `file://` URLs). Use Python to serve the `docs/` folder:

```bash
cd whiteout-tycoon/docs
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

## How to deploy to GitHub Pages

1. Push this repository to GitHub.
2. In the repository settings, configure **GitHub Pages** to serve from the `main` branch and `/docs` directory.
3. After enabling Pages, visit the provided URL. The game should load automatically.

## Testing

* Use **WASD** or **Arrow** keys to move the player. On mobile, touch and drag anywhere on the screen to move.
* Hunt polar bears to collect raw meat. Drop the meat at the **Meat Shop** (a square near the starting area) to earn coins from customers.
* Spend coins on upgrades via the **Upgrades** button. Unlock new mechanics such as turrets, forest harvesting, workers, cookhouse, oil field, refinery, and truck depot.
* The game saves progress to `localStorage` every 10 seconds.

## Structure

The `docs` folder contains the static site served by GitHub Pages. JavaScript modules are organised under `docs/js/`:

- `engine/` – Core utilities (input handling, timekeeping, rendering, math).
- `game/data/` – Static data definitions for items, upgrades, recipes and balance values.
- `game/state.js` – Initial game state and save/load functions.
- `game/systems/` – Game logic split into systems (movement, spawning, combat, pickup, stations, economy, workers, turrets, trucks, unlocks).

Contributions are welcome! See `game/data/balance.js` to tweak gameplay parameters.
