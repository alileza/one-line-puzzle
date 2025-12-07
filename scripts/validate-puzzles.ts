/**
 * Validate all puzzle solution paths
 */

import { getAllPuzzles } from '../src/data/puzzles/index';
import { validateSolutionPath } from '../src/game/core/validation';

const puzzles = getAllPuzzles();

console.log(`Validating ${puzzles.length} puzzles...\n`);

let allValid = true;

for (const puzzle of puzzles) {
  const result = validateSolutionPath(puzzle);

  if (result.valid) {
    console.log(`✓ Puzzle ${puzzle.id} (${puzzle.name}): Valid`);
  } else {
    console.error(`✗ Puzzle ${puzzle.id} (${puzzle.name}): ${result.error}`);
    allValid = false;
  }
}

console.log(`\n${allValid ? '✓ All puzzles valid!' : '✗ Some puzzles have invalid solution paths'}`);
process.exit(allValid ? 0 : 1);
