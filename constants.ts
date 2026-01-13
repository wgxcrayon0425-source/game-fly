
import { Direction, Point } from './types';

export const GRID_SIZE = 10;
export const PLANES_COUNT = 3;

/**
 * Standard Air Strike plane shape:
 *    [H]
 * [B][B][B][B][B]
 *    [B]
 *  [B][B][B]
 */
export const getPlaneBodyParts = (head: Point, dir: Direction): Point[] => {
  const { r, c } = head;
  switch (dir) {
    case Direction.UP:
      return [
        { r: r + 1, c: c - 2 }, { r: r + 1, c: c - 1 }, { r: r + 1, c: c }, { r: r + 1, c: c + 1 }, { r: r + 1, c: c + 2 },
        { r: r + 2, c: c },
        { r: r + 3, c: c - 1 }, { r: r + 3, c: c }, { r: r + 3, c: c + 1 }
      ];
    case Direction.DOWN:
      return [
        { r: r - 1, c: c - 2 }, { r: r - 1, c: c - 1 }, { r: r - 1, c: c }, { r: r - 1, c: c + 1 }, { r: r - 1, c: c + 2 },
        { r: r - 2, c: c },
        { r: r - 3, c: c - 1 }, { r: r - 3, c: c }, { r: r - 3, c: c + 1 }
      ];
    case Direction.LEFT:
      return [
        { r: r - 2, c: c + 1 }, { r: r - 1, c: c + 1 }, { r: r, c: c + 1 }, { r: r + 1, c: c + 1 }, { r: r + 2, c: c + 1 },
        { r: r, c: c + 2 },
        { r: r - 1, c: c + 3 }, { r: r, c: c + 3 }, { r: r + 1, c: c + 3 }
      ];
    case Direction.RIGHT:
      return [
        { r: r - 2, c: c - 1 }, { r: r - 1, c: c - 1 }, { r: r, c: c - 1 }, { r: r + 1, c: c - 1 }, { r: r + 2, c: c - 1 },
        { r: r, c: c - 2 },
        { r: r - 1, c: c - 3 }, { r: r, c: c - 3 }, { r: r + 1, c: c - 3 }
      ];
    default:
      return [];
  }
};

export const isValidPoint = (p: Point) => p.r >= 0 && p.r < GRID_SIZE && p.c >= 0 && p.c < GRID_SIZE;

export const isPlaneValid = (head: Point, dir: Direction, existingPlanes: Point[]): boolean => {
  if (!isValidPoint(head)) return false;
  const body = getPlaneBodyParts(head, dir);
  if (body.length < 9) return false;
  
  const allParts = [head, ...body];
  // Check bounds
  if (!allParts.every(isValidPoint)) return false;

  // Check collision with existing planes
  return !allParts.some(p => existingPlanes.some(ep => ep.r === p.r && ep.c === p.c));
};
