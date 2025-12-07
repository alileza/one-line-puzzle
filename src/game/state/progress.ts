/**
 * Player progress persistence
 */

import type { PlayerProgress } from './types';

const STORAGE_KEY = 'one-line-progress';
const CURRENT_VERSION = 1;

/** Create default progress for new players */
function createDefaultProgress(): PlayerProgress {
  return {
    version: CURRENT_VERSION,
    completedLevels: [],
    highestUnlocked: 1,
    lastPlayed: new Date().toISOString(),
    tutorialSeen: false,
    gameCompleted: false
  };
}

/** Validate progress data structure */
function isValidProgress(data: unknown): data is PlayerProgress {
  if (typeof data !== 'object' || data === null) return false;

  const progress = data as Record<string, unknown>;

  return (
    typeof progress.version === 'number' &&
    Array.isArray(progress.completedLevels) &&
    typeof progress.highestUnlocked === 'number'
  );
}

/** Migrate progress from older versions and apply defaults for new fields */
function migrateProgress(progress: PlayerProgress): PlayerProgress {
  const defaults = createDefaultProgress();

  // Apply defaults for any missing fields
  return {
    ...defaults,
    ...progress,
    version: CURRENT_VERSION,
    tutorialSeen: progress.tutorialSeen ?? defaults.tutorialSeen,
    gameCompleted: progress.gameCompleted ?? defaults.gameCompleted
  };
}

/** Load player progress from localStorage */
export function loadProgress(): PlayerProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createDefaultProgress();
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!isValidProgress(parsed)) {
      console.warn('Invalid progress data, creating new');
      return createDefaultProgress();
    }

    return migrateProgress(parsed);
  } catch (error) {
    console.warn('Error loading progress:', error);
    return createDefaultProgress();
  }
}

/** Save player progress to localStorage */
export function saveProgress(progress: PlayerProgress): void {
  try {
    const updated = {
      ...progress,
      lastPlayed: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Error saving progress:', error);
  }
}

/** Mark a level as completed and unlock next */
export function completeLevel(
  progress: PlayerProgress,
  levelId: number,
  totalLevels: number
): PlayerProgress {
  const completedLevels = progress.completedLevels.includes(levelId)
    ? progress.completedLevels
    : [...progress.completedLevels, levelId];

  const highestUnlocked = Math.max(progress.highestUnlocked, levelId + 1);

  // Check if all levels are now completed
  const allComplete = completedLevels.length >= totalLevels;
  const gameCompleted = allComplete || progress.gameCompleted || false;
  const firstCompletionDate = allComplete && !progress.gameCompleted
    ? new Date().toISOString()
    : progress.firstCompletionDate;

  return {
    ...progress,
    completedLevels,
    highestUnlocked,
    gameCompleted,
    firstCompletionDate
  };
}

/** Check if all levels are completed */
export function isGameCompleted(progress: PlayerProgress, totalLevels: number): boolean {
  return progress.completedLevels.length >= totalLevels;
}

/** Check if a level is unlocked */
export function isLevelUnlocked(progress: PlayerProgress, levelId: number): boolean {
  return levelId <= progress.highestUnlocked;
}

/** Check if a level is completed */
export function isLevelCompleted(progress: PlayerProgress, levelId: number): boolean {
  return progress.completedLevels.includes(levelId);
}

/** Get level status for UI */
export type LevelStatus = 'locked' | 'unlocked' | 'completed';

export function getLevelStatus(progress: PlayerProgress, levelId: number): LevelStatus {
  if (isLevelCompleted(progress, levelId)) {
    return 'completed';
  }
  if (isLevelUnlocked(progress, levelId)) {
    return 'unlocked';
  }
  return 'locked';
}
