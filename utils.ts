
import { Point, Plane } from './types';

export const pointToKey = (p: Point): string => `${p.r},${p.c}`;

export const keyToPoint = (key: string): Point => {
  const [r, c] = key.split(',').map(Number);
  return { r, c };
};

export const getAllPlanePoints = (planes: Plane[]): Point[] => {
  return planes.flatMap(p => [p.head, ...p.bodyParts]);
};

export const formatCoord = (r: number, c: number): string => `${c}${r}`;
