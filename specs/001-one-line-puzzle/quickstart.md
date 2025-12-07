# Quickstart: One Line Too Many

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
# Clone and enter project
cd game

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit/integration tests |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |

## Project Structure

```
src/
├── game/           # Core game logic (no DOM/Canvas dependencies)
│   ├── core/       # Puzzle, rules, line collision
│   ├── rendering/  # Canvas rendering
│   ├── input/      # Touch handling
│   └── state/      # Game state management
├── ui/             # Screens and UI components
├── data/puzzles/   # Puzzle JSON files
└── main.ts         # Entry point

tests/
├── unit/           # Pure function tests
├── integration/    # State + logic tests
└── e2e/            # Full browser tests
```

## Creating a New Puzzle

1. Create a JSON file in `src/data/puzzles/`:

```json
{
  "id": 21,
  "name": "Your Puzzle Name",
  "difficulty": 3,
  "boardWidth": 300,
  "boardHeight": 400,
  "elements": [
    {
      "id": 1,
      "type": "dot",
      "position": { "x": 50, "y": 50 },
      "radius": 15
    }
  ]
}
```

2. Validate against `specs/001-one-line-puzzle/contracts/puzzle-schema.json`

3. Test the puzzle is solvable!

## Testing on Mobile

1. Start dev server: `npm run dev -- --host`
2. Find your local IP in the terminal output
3. Open `http://<your-ip>:5173` on mobile device (same network)

Or use Playwright's mobile emulation:
```bash
npm run test:e2e
```

## Key Files

| File | Purpose |
|------|---------|
| `src/game/core/rules.ts` | Rule validation engine |
| `src/game/core/line.ts` | Line collision detection |
| `src/game/state/game.ts` | Game state management |
| `src/game/rendering/canvas.ts` | Canvas setup and render loop |
| `src/ui/screens/game.ts` | Main game screen |

## Debugging

### Canvas rendering issues
- Check browser console for errors
- Use `requestAnimationFrame` timing to verify 60fps
- Canvas context: `canvas.getContext('2d')`

### Touch input issues
- Test with browser DevTools mobile emulation
- Check `touchstart`/`touchmove` event handlers
- Verify touch coordinates are correctly mapped to canvas

### Progress not saving
- Check localStorage in DevTools → Application → Local Storage
- Key: `one-line-progress`
- Verify JSON is valid

## Performance Targets

- Initial load: <3s on 4G
- Touch latency: <50ms
- Frame rate: 60fps
- Bundle size: <500KB
