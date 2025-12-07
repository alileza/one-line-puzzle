/**
 * Puzzle index and loader
 */

import type { Puzzle } from '../../game/core/types';
import { parsePuzzle } from '../../game/core/puzzle';

// Import all puzzle JSON files
import puzzle001 from './puzzle-001.json';
import puzzle002 from './puzzle-002.json';
import puzzle003 from './puzzle-003.json';
import puzzle004 from './puzzle-004.json';
import puzzle005 from './puzzle-005.json';
import puzzle006 from './puzzle-006.json';
import puzzle007 from './puzzle-007.json';
import puzzle008 from './puzzle-008.json';
import puzzle009 from './puzzle-009.json';
import puzzle010 from './puzzle-010.json';
import puzzle011 from './puzzle-011.json';
import puzzle012 from './puzzle-012.json';
import puzzle013 from './puzzle-013.json';
import puzzle014 from './puzzle-014.json';
import puzzle015 from './puzzle-015.json';
import puzzle016 from './puzzle-016.json';
import puzzle017 from './puzzle-017.json';
import puzzle018 from './puzzle-018.json';
import puzzle019 from './puzzle-019.json';
import puzzle020 from './puzzle-020.json';

/** All available puzzles in order */
const PUZZLE_DATA: unknown[] = [
  puzzle001,
  puzzle002,
  puzzle003,
  puzzle004,
  puzzle005,
  puzzle006,
  puzzle007,
  puzzle008,
  puzzle009,
  puzzle010,
  puzzle011,
  puzzle012,
  puzzle013,
  puzzle014,
  puzzle015,
  puzzle016,
  puzzle017,
  puzzle018,
  puzzle019,
  puzzle020
];

/** Parsed and validated puzzles */
let puzzlesCache: Puzzle[] | null = null;

/** Get all puzzles, parsing and caching them on first call */
export function getAllPuzzles(): Puzzle[] {
  if (puzzlesCache === null) {
    puzzlesCache = PUZZLE_DATA.map(data => parsePuzzle(data));
  }
  return puzzlesCache;
}

/** Get a puzzle by ID */
export function getPuzzleById(id: number): Puzzle | undefined {
  return getAllPuzzles().find(p => p.id === id);
}

/** Get puzzle count */
export function getPuzzleCount(): number {
  return getAllPuzzles().length;
}

/** Get the next puzzle after a given ID */
export function getNextPuzzle(currentId: number): Puzzle | undefined {
  const puzzles = getAllPuzzles();
  const currentIndex = puzzles.findIndex(p => p.id === currentId);
  if (currentIndex === -1 || currentIndex >= puzzles.length - 1) {
    return undefined;
  }
  return puzzles[currentIndex + 1];
}
