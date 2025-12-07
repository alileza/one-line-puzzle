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
    lastPlayed: new Date().toISOString()
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

/** Migrate progress from older versions if needed */
function migrateProgress(progress: PlayerProgress): PlayerProgress {
  // Currently only version 1, no migration needed
  if (progress.version < CURRENT_VERSION) {
    return {
      ...progress,
      version: CURRENT_VERSION
    };
  }
  return progress;
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
export function completeLevel(progress: PlayerProgress, levelId: number): PlayerProgress {
  const completedLevels = progress.completedLevels.includes(levelId)
    ? progress.completedLevels
    : [...progress.completedLevels, levelId];

  const highestUnlocked = Math.max(progress.highestUnlocked, levelId + 1);

  return {
    ...progress,
    completedLevels,
    highestUnlocked
  };
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
