import { useCallback, useState } from 'react';
import { DEFAULT_PARAMS, newObject } from '../model/defaults';
import { LIMITS } from '../model/constraints';
import { effective } from '../model/resolve';
import type {
  HolderObject,
  HolderParams,
  ShapeKind,
  ShapeParams,
  SizeKey,
} from '../model/types';

export interface HolderControls {
  params: HolderParams;
  setBase: (key: 'baseLength' | 'baseDepth' | 'baseHeight', value: number) => void;
  setGlobal: (key: SizeKey, value: number) => void;
  setObjectCount: (count: number) => void;
  addObject: () => void;
  removeObject: (id: string) => void;
  setObjectShape: (id: string, shape: ShapeKind) => void;
  setObjectSolid: (id: string, solid: boolean) => void;
  setShapeParam: (id: string, key: keyof ShapeParams, value: number) => void;
  /** value = a number to override, or null to inherit the global default. */
  setOverride: (id: string, key: SizeKey, value: number | null) => void;
  reset: () => void;
}

export function useHolderParams(
  initial: HolderParams = DEFAULT_PARAMS,
): HolderControls {
  const [params, setParams] = useState<HolderParams>(initial);

  const patchObject = useCallback(
    (id: string, patch: (o: HolderObject) => HolderObject) => {
      setParams((p) => ({
        ...p,
        objects: p.objects.map((o) => (o.id === id ? patch(o) : o)),
      }));
    },
    [],
  );

  const setBase = useCallback(
    (key: 'baseLength' | 'baseDepth' | 'baseHeight', value: number) =>
      setParams((p) => ({ ...p, [key]: value })),
    [],
  );

  const setGlobal = useCallback(
    (key: SizeKey, value: number) =>
      setParams((p) => ({ ...p, globals: { ...p.globals, [key]: value } })),
    [],
  );

  const setObjectCount = useCallback((count: number) => {
    const target = Math.max(
      LIMITS.objectCount.min,
      Math.min(LIMITS.objectCount.max, Math.round(count)),
    );
    setParams((p) => {
      if (target === p.objects.length) return p;
      if (target < p.objects.length) {
        return { ...p, objects: p.objects.slice(0, target) };
      }
      const objects = [...p.objects];
      while (objects.length < target) objects.push(newObject());
      return { ...p, objects };
    });
  }, []);

  const addObject = useCallback(() => {
    setParams((p) =>
      p.objects.length >= LIMITS.objectCount.max
        ? p
        : { ...p, objects: [...p.objects, newObject()] },
    );
  }, []);

  const removeObject = useCallback((id: string) => {
    setParams((p) =>
      p.objects.length <= LIMITS.objectCount.min
        ? p
        : { ...p, objects: p.objects.filter((o) => o.id !== id) },
    );
  }, []);

  const setObjectShape = useCallback(
    (id: string, shape: ShapeKind) => patchObject(id, (o) => ({ ...o, shape })),
    [patchObject],
  );

  const setObjectSolid = useCallback(
    (id: string, solid: boolean) => patchObject(id, (o) => ({ ...o, solid })),
    [patchObject],
  );

  const setShapeParam = useCallback(
    (id: string, key: keyof ShapeParams, value: number) =>
      patchObject(id, (o) => ({
        ...o,
        shapeParams: { ...o.shapeParams, [key]: value },
      })),
    [patchObject],
  );

  const setOverride = useCallback(
    (id: string, key: SizeKey, value: number | null) =>
      patchObject(id, (o) => ({ ...o, [key]: value })),
    [patchObject],
  );

  const reset = useCallback(() => setParams(initial), [initial]);

  return {
    params,
    setBase,
    setGlobal,
    setObjectCount,
    addObject,
    removeObject,
    setObjectShape,
    setObjectSolid,
    setShapeParam,
    setOverride,
    reset,
  };
}

/** Effective sizes for an object id, for components that need the resolved value. */
export function effectiveFor(params: HolderParams, obj: HolderObject) {
  return effective(obj, params.globals);
}
