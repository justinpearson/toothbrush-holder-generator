import type { GlobalDefaults, HolderObject } from './types';

export interface ResolvedSizes {
  diameter: number;
  height: number;
  wallThickness: number;
}

/** Resolve an object's sizes: a per-object override wins, else the global default. */
export function effective(obj: HolderObject, globals: GlobalDefaults): ResolvedSizes {
  return {
    diameter: obj.diameter ?? globals.diameter,
    height: obj.height ?? globals.height,
    wallThickness: obj.wallThickness ?? globals.wallThickness,
  };
}
