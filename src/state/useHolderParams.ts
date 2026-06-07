import { useCallback, useState } from 'react';
import { DEFAULT_PARAMS, newTube } from '../model/defaults';
import { LIMITS } from '../model/constraints';
import type { HolderParams, TubeParams } from '../model/types';

export interface HolderControls {
  params: HolderParams;
  setBase: (key: 'baseLength' | 'baseDepth' | 'baseHeight', value: number) => void;
  setWallThickness: (value: number) => void;
  setFn: (value: number) => void;
  setTube: (id: string, key: keyof Omit<TubeParams, 'id'>, value: number) => void;
  addTube: () => void;
  removeTube: (id: string) => void;
  setTubeCount: (count: number) => void;
  reset: () => void;
}

/** Single source of truth for the holder parameters. */
export function useHolderParams(
  initial: HolderParams = DEFAULT_PARAMS,
): HolderControls {
  const [params, setParams] = useState<HolderParams>(initial);

  const setBase = useCallback(
    (key: 'baseLength' | 'baseDepth' | 'baseHeight', value: number) => {
      setParams((p) => ({ ...p, [key]: value }));
    },
    [],
  );

  const setWallThickness = useCallback((value: number) => {
    setParams((p) => ({ ...p, wallThickness: value }));
  }, []);

  const setFn = useCallback((value: number) => {
    setParams((p) => ({ ...p, fn: value }));
  }, []);

  const setTube = useCallback(
    (id: string, key: keyof Omit<TubeParams, 'id'>, value: number) => {
      setParams((p) => ({
        ...p,
        tubes: p.tubes.map((t) => (t.id === id ? { ...t, [key]: value } : t)),
      }));
    },
    [],
  );

  const addTube = useCallback(() => {
    setParams((p) =>
      p.tubes.length >= LIMITS.tubeCount.max
        ? p
        : { ...p, tubes: [...p.tubes, newTube()] },
    );
  }, []);

  const removeTube = useCallback((id: string) => {
    setParams((p) =>
      p.tubes.length <= LIMITS.tubeCount.min
        ? p
        : { ...p, tubes: p.tubes.filter((t) => t.id !== id) },
    );
  }, []);

  const setTubeCount = useCallback((count: number) => {
    const target = Math.max(
      LIMITS.tubeCount.min,
      Math.min(LIMITS.tubeCount.max, Math.round(count)),
    );
    setParams((p) => {
      if (target === p.tubes.length) return p;
      if (target < p.tubes.length) {
        return { ...p, tubes: p.tubes.slice(0, target) };
      }
      const tubes = [...p.tubes];
      while (tubes.length < target) {
        // Clone the last tube's size for a sensible default.
        const last = tubes[tubes.length - 1];
        tubes.push(newTube(last?.outerDiameter ?? 42, last?.height ?? 25));
      }
      return { ...p, tubes };
    });
  }, []);

  const reset = useCallback(() => setParams(initial), [initial]);

  return {
    params,
    setBase,
    setWallThickness,
    setFn,
    setTube,
    addTube,
    removeTube,
    setTubeCount,
    reset,
  };
}
