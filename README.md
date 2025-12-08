# One Line Too Many 🎮

A mobile-first browser puzzle game where you draw a single continuous line to solve increasingly complex puzzles.

**[▶️ Play Now](https://alileza.github.io/one-line-puzzle/)**

## How to Play

Draw one continuous line that:
- ✅ Touches all blue dots
- ✅ Enters each yellow shape exactly once
- ❌ Never crosses red areas

Simple rules, challenging puzzles!

## Features

- 🎯 **30 Puzzles** - Progressive difficulty from easy to expert
- 📱 **Mobile-First** - Touch-optimized controls, works perfectly on phones
- 🎓 **Tutorial** - Interactive 3-step guide for new players
- 💡 **Smart Hints** - Progressive hint system when you're stuck
- 🎊 **Celebration** - Special reward when you complete all levels
- 🔄 **Quick Restart** - Tap restart button, double-tap, or shake to retry
- 📶 **Offline Ready** - Play anywhere, even without internet
- ⚡ **Fast & Lightweight** - Only 15KB download

## Technology

Built with:
- TypeScript 5.x
- HTML5 Canvas
- Vite
- Progressive Web App (PWA)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Game Mechanics

### Puzzle Elements

| Element | Description |
|---------|-------------|
| 🔵 Blue Dot | Must be touched by your line |
| 🟨 Yellow Shape | Enter exactly once - no re-entry |
| 🟥 Red Area | Forbidden zone - avoid completely |

### Controls

- **Draw**: Touch and drag to draw your line
- **Restart**: Tap restart button, double-tap anywhere, or shake device
- **Hint**: Progressive hints (start point → next element → full path)
- **Navigate**: Back button returns to level select

## Project Structure

```text
src/
├── game/
│   ├── core/           # Game logic and rules
│   ├── rendering/      # Canvas rendering
│   ├── state/          # State management
│   └── input/          # Touch and gesture handling
├── ui/
│   ├── screens/        # Game screens
│   └── components/     # Reusable UI components
└── data/
    └── puzzles/        # Puzzle definitions (JSON)
```

## Contributing

This is a personal project, but feel free to fork and experiment!

## License

MIT

---

Made with TypeScript and Canvas API
