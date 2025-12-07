# Research: One Line Too Many

**Date**: 2025-12-07
**Branch**: `001-one-line-puzzle`

## Technology Stack Decisions

### Rendering Approach

**Decision**: HTML5 Canvas 2D API

**Rationale**:
- Native browser support, no additional libraries needed
- Full control over rendering pipeline for 60fps performance
- Efficient for drawing continuous lines and simple geometric shapes
- requestAnimationFrame provides smooth, vsync'd rendering
- Small bundle footprint (0KB overhead)

**Alternatives Considered**:
| Option | Rejected Because |
|--------|-----------------|
| SVG | DOM manipulation overhead, poor performance for continuous line updates |
| WebGL | Overkill for 2D puzzle game, complexity not justified |
| Pixi.js | Adds ~150KB bundle, Canvas API sufficient for our needs |
| Phaser | Full game engine overhead (~1MB), too heavy for simple puzzle |

### Touch Input Handling

**Decision**: Native Touch Events API with pointer events fallback

**Rationale**:
- Direct access to touch coordinates with minimal latency
- Pointer Events provide unified API for touch/mouse/pen
- No library overhead
- Can implement custom gesture recognition (shake to reset)

**Implementation Notes**:
- Use `touchstart`, `touchmove`, `touchend` as primary
- Fallback to `pointerdown`, `pointermove`, `pointerup` for stylus/mouse testing
- Implement touch point smoothing for clean line rendering
- Debounce rapid touch events to maintain 60fps

### State Management

**Decision**: Custom lightweight state pattern (no library)

**Rationale**:
- Game state is simple and well-defined
- Three screens: level select, game, success
- State transitions are predictable
- Avoids Redux/MobX/Zustand bundle overhead

**State Structure**:
```typescript
interface GameState {
  screen: 'level-select' | 'game' | 'success';
  currentPuzzle: number | null;
  linePoints: Point[];
  visitedDots: Set<number>;
  visitedShapes: Set<number>;
  hasViolation: boolean;
  violationType: 'red-area' | 'shape-reentry' | null;
}
```

### Progress Persistence

**Decision**: localStorage with JSON serialization

**Rationale**:
- No user accounts required for MVP
- localStorage available in all target browsers
- Sufficient for tracking ~20 levels of progress
- Simple key-value storage fits our data model

**Data Format**:
```json
{
  "version": 1,
  "completedLevels": [1, 2, 3],
  "highestUnlocked": 4,
  "lastPlayed": "2025-12-07T10:30:00Z"
}
```

### Build Tooling

**Decision**: Vite with vanilla TypeScript

**Rationale**:
- Fast development server with HMR
- Optimized production builds with tree-shaking
- Native TypeScript support
- Small output bundles (~3KB runtime overhead)
- PWA plugin available for offline support

**Alternatives Considered**:
| Option | Rejected Because |
|--------|-----------------|
| Webpack | More complex configuration, slower builds |
| Rollup | Vite uses Rollup internally, provides better DX |
| esbuild only | Missing dev server features |
| Parcel | Less control over output, larger bundles |

### Testing Strategy

**Decision**: Vitest (unit/integration) + Playwright (E2E)

**Rationale**:
- Vitest: Native Vite integration, fast execution, Jest-compatible API
- Playwright: Excellent mobile emulation, touch event simulation
- Both support TypeScript out of the box

**Test Categories**:
1. **Unit**: Rule validation logic, collision detection, progress serialization
2. **Integration**: Game state transitions, puzzle loading
3. **E2E**: Full gameplay flows on mobile viewport with touch simulation

## Collision Detection Approach

**Decision**: Point-in-polygon for shapes, point-to-line distance for dots, bounding box + pixel check for red areas

**Implementation**:
- **Dots**: Circle collision - distance from line segment to dot center < dot radius
- **Shapes**: Ray casting algorithm for point-in-polygon
- **Red Areas**: Bounding box pre-check, then fine-grained segment intersection
- **Line Self-Intersection**: Not enforced (line can cross itself unless explicitly a rule)

**Performance Considerations**:
- Spatial partitioning not needed for ~50 elements per puzzle
- Check collisions incrementally as line extends (only new segment)
- Cache bounding boxes for static elements

## Haptic Feedback

**Decision**: Vibration API with graceful degradation

**Rationale**:
- `navigator.vibrate()` supported on Android Chrome
- iOS Safari doesn't support web vibration (degrade to visual only)
- Short pulse (50ms) on rule violation
- No vibration on success (visual celebration sufficient)

## Offline Support

**Decision**: Service Worker with cache-first strategy

**Rationale**:
- Game assets are static, cache-first optimal
- Vite PWA plugin simplifies implementation
- Puzzles bundled in initial load, no network needed after first visit

## Mobile Browser Compatibility

**Target Browsers**:
- iOS Safari 14+ (iPhone 6s and newer)
- Chrome Android 90+ (Android 8.0+)
- Samsung Internet 15+
- Firefox Mobile 100+

**Polyfills Needed**: None - all features have native support in target browsers

## Performance Budget

| Metric | Target | Justification |
|--------|--------|---------------|
| Initial JS bundle | <100KB gzipped | Fast 4G load, good 3G load |
| HTML + CSS | <20KB | Minimal shell |
| Puzzle data | ~50KB | 20 puzzles, JSON format |
| Total initial load | <200KB | Under 3s on 4G |
| Time to interactive | <1.5s | Perceived performance |
| Frame budget | 16.67ms | 60fps target |
| Touch latency | <50ms | Responsive drawing |

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Canvas vs SVG? | Canvas - better performance for continuous drawing |
| Framework needed? | No - vanilla TS sufficient, smaller bundle |
| How to handle iOS vibration? | Graceful degradation to visual-only feedback |
| State management library? | Custom - state is simple enough |
| Offline first? | Yes - PWA with service worker |
