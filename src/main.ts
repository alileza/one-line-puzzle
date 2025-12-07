/**
 * One Line Too Many - Entry Point
 * Mobile-first browser puzzle game
 */

import { setupCanvas, calculateCanvasSize, createRenderLoop } from './game/rendering/canvas';
import { createGameManager } from './game/state/game';
import { getAllPuzzles, getNextPuzzle, getPuzzleCount } from './data/puzzles/index';
import { loadProgress, saveProgress, completeLevel, isLevelUnlocked, isGameCompleted } from './game/state/progress';
import type { PlayerProgress } from './game/state/types';
import { renderGameScreen, setupGameScreen } from './ui/screens/game';
import { renderSuccessScreen, setupSuccessScreen } from './ui/screens/success';
import {
  renderLevelSelectScreen,
  calculateLevelButtons,
  setupLevelSelectScreen
} from './ui/screens/level-select';
import { renderTutorialScreen, setupTutorialScreen } from './ui/screens/tutorial';
import { renderCelebrationScreen, setupCelebrationScreen } from './ui/screens/celebration';

/** Main game initialization */
export function init() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  // Setup canvas with proper sizing
  const { width, height } = calculateCanvasSize();
  const canvasCtx = setupCanvas(canvas, width, height);

  // Load player progress
  let progress: PlayerProgress = loadProgress();

  // Create game manager
  const gameManager = createGameManager();

  // Get all puzzles
  const puzzles = getAllPuzzles();
  const totalLevels = getPuzzleCount();

  // Calculate level buttons (recalculated when progress changes)
  let levelButtons = calculateLevelButtons(puzzles, progress, width, height);

  // Calculate puzzle scale for coordinate conversion
  const getScale = () => {
    const state = gameManager.getState();
    if (!state.currentPuzzle) {
      return { scale: 1, offsetX: 0, offsetY: 0 };
    }

    const puzzle = state.currentPuzzle;
    const scaleX = width / puzzle.boardWidth;
    const scaleY = height / puzzle.boardHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    const offsetX = (width - puzzle.boardWidth * scale) / 2;
    const offsetY = (height - puzzle.boardHeight * scale) / 2;

    return { scale, offsetX, offsetY };
  };

  // Track cleanup functions for screen transitions
  let cleanupCurrentScreen: (() => void) | null = null;

  // Setup screen-specific input handlers
  const setupCurrentScreen = () => {
    // Cleanup previous screen
    if (cleanupCurrentScreen) {
      cleanupCurrentScreen();
      cleanupCurrentScreen = null;
    }

    const state = gameManager.getState();

    switch (state.screen) {
      case 'tutorial':
        cleanupCurrentScreen = setupTutorialScreen(canvas, {
          onNextStep: () => {
            gameManager.nextTutorialStep();
            const newState = gameManager.getState();
            if (newState.tutorialStep === 0 && newState.screen === 'level-select') {
              // Tutorial completed - mark as seen
              progress = { ...progress, tutorialSeen: true };
              saveProgress(progress);
            }
          },
          onSkipTutorial: () => {
            gameManager.skipTutorial();
            progress = { ...progress, tutorialSeen: true };
            saveProgress(progress);
          }
        });
        break;
      case 'game':
        cleanupCurrentScreen = setupGameScreen(canvas, gameManager, getScale, {
          onBackToLevelSelect: () => {
            gameManager.setScreen('level-select');
          },
          onShowHint: () => {
            gameManager.showHint();
          }
        });
        break;
      case 'success': {
        // Save progress when reaching success screen
        const currentPuzzle = state.currentPuzzle;
        if (currentPuzzle) {
          const wasGameCompleted = progress.gameCompleted;
          progress = completeLevel(progress, currentPuzzle.id, totalLevels);
          saveProgress(progress);
          levelButtons = calculateLevelButtons(puzzles, progress, width, height);

          // Check if just completed all levels for first time
          if (!wasGameCompleted && isGameCompleted(progress, totalLevels)) {
            gameManager.setScreen('celebration');
            return;
          }
        }

        cleanupCurrentScreen = setupSuccessScreen(canvas, {
          onNextLevel: () => {
            const puzzle = state.currentPuzzle;
            if (puzzle) {
              const nextPuzzle = getNextPuzzle(puzzle.id);
              if (nextPuzzle && isLevelUnlocked(progress, nextPuzzle.id)) {
                gameManager.loadPuzzle(nextPuzzle);
              } else {
                // No more levels or next is locked - go to level select
                gameManager.setScreen('level-select');
              }
            }
          },
          onLevelSelect: () => {
            gameManager.setScreen('level-select');
          }
        });
        break;
      }
      case 'celebration':
        cleanupCurrentScreen = setupCelebrationScreen(canvas, {
          onContinue: () => {
            gameManager.setScreen('level-select');
          }
        });
        break;
      case 'level-select':
        cleanupCurrentScreen = setupLevelSelectScreen(canvas, levelButtons, {
          onSelectLevel: (puzzle) => {
            if (isLevelUnlocked(progress, puzzle.id)) {
              gameManager.loadPuzzle(puzzle);
            }
          }
        });
        break;
    }
  };

  // Subscribe to state changes to update screen handlers
  let lastScreen = gameManager.getState().screen;
  gameManager.subscribe(() => {
    const currentScreen = gameManager.getState().screen;
    if (currentScreen !== lastScreen) {
      lastScreen = currentScreen;
      setupCurrentScreen();
    }
  });

  // Render function
  const render = () => {
    const state = gameManager.getState();
    const hasNextLevel = state.currentPuzzle
      ? getNextPuzzle(state.currentPuzzle.id) !== undefined
      : false;

    switch (state.screen) {
      case 'tutorial':
        renderTutorialScreen(canvasCtx.ctx, width, height, state.tutorialStep);
        break;
      case 'game':
        renderGameScreen(canvasCtx, gameManager);
        break;
      case 'success':
        renderSuccessScreen(canvasCtx.ctx, width, height, state.currentPuzzle, hasNextLevel);
        break;
      case 'celebration':
        renderCelebrationScreen(canvasCtx.ctx, width, height, totalLevels, progress.firstCompletionDate);
        break;
      case 'level-select':
        renderLevelSelectScreen(
          canvasCtx.ctx,
          width,
          height,
          levelButtons,
          isGameCompleted(progress, totalLevels)
        );
        break;
    }
  };

  // Start render loop
  const renderLoop = createRenderLoop();
  renderLoop.start(render);

  // Initial setup - show tutorial for first-time players
  if (!progress.tutorialSeen) {
    gameManager.startTutorial();
  }

  setupCurrentScreen();

  // Auto-load the first unlocked incomplete level for quick start (if not in tutorial)
  if (progress.tutorialSeen) {
    const firstUnlockedLevel = puzzles.find(p => isLevelUnlocked(progress, p.id));
    if (firstUnlockedLevel) {
      gameManager.loadPuzzle(firstUnlockedLevel);
    }
  }

  console.log('One Line Too Many - Ready!');
}

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL + 'sw.js';
    navigator.serviceWorker.register(swPath).catch(() => {
      // Service worker registration failed - app will work without offline support
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
