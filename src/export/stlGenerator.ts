import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { buildSceneGeometry } from '../geometry/buildSceneGeometry';
import type { HolderParams } from '../model/types';

/** Generate a binary STL Blob for the given parameters. */
export function generateStlBlob(params: HolderParams): Blob {
  const geometry = buildSceneGeometry(params);
  const mesh = new THREE.Mesh(geometry);
  try {
    const result = new STLExporter().parse(mesh, { binary: true });
    // Across three versions STLExporter returns a DataView (binary) or string.
    const data =
      result instanceof DataView
        ? result.buffer.slice(
            result.byteOffset,
            result.byteOffset + result.byteLength,
          )
        : (result as unknown as ArrayBuffer | string);
    return new Blob([data as BlobPart], { type: 'model/stl' });
  } finally {
    geometry.dispose();
  }
}

export const STL_FILENAME = 'toothbrush-holder.stl';
