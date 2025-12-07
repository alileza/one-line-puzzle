/**
 * Core type definitions for One Line Too Many
 */

/** 2D coordinate on the puzzle board */
export interface Point {
  x: number;
  y: number;
}

/** Base type for all interactive board elements */
interface BoardElementBase {
  id: number;
  position: Point;
}

/** A dot that the line must touch */
export interface Dot extends BoardElementBase {
  type: 'dot';
  radius: number;
}

/** A polygon that the line must enter exactly once */
export interface Shape extends BoardElementBase {
  type: 'shape';
  vertices: Point[];
}

/** A forbidden zone the line must not cross */
export interface RedArea extends BoardElementBase {
  type: 'red-area';
  vertices: Point[];
}

/** Union type for all board element variants */
export type BoardElement = Dot | Shape | RedArea;

/** Puzzle definition */
export interface Puzzle {
  id: number;
  name: string;
  difficulty: number;
  boardWidth: number;
  boardHeight: number;
  elements: BoardElement[];
  startHint?: Point;
}

/** Type guard for Dot elements */
export function isDot(element: BoardElement): element is Dot {
  return element.type === 'dot';
}

/** Type guard for Shape elements */
export function isShape(element: BoardElement): element is Shape {
  return element.type === 'shape';
}

/** Type guard for RedArea elements */
export function isRedArea(element: BoardElement): element is RedArea {
  return element.type === 'red-area';
}
