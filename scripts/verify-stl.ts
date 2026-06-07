// STL cross-check: compare our in-browser (three.js) STL against the STL that
// OpenSCAD produces from the .scad we generate for the same parameters.
//
// Run with:  yarn verify:stl
//
// It writes everything to verify-output/ and prints a comparison of triangle
// counts, bounding boxes and signed volumes, plus two rendered PNGs (one per
// STL) produced by OpenSCAD with an identical camera so they can be eyeballed.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { buildSceneGeometry } from '../src/geometry/buildSceneGeometry';
import { generateScad } from '../src/export/scadGenerator';
import { DEFAULT_PARAMS } from '../src/model/defaults';

const OPENSCAD = '/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD';
const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../verify-output');
mkdirSync(out, { recursive: true });

const params = DEFAULT_PARAMS;

// 1. Our STL, straight from the three.js geometry.
const geometry = buildSceneGeometry(params);
const dv = new STLExporter().parse(new THREE.Mesh(geometry), { binary: true });
const ourStl = Buffer.from(
  dv.buffer.slice(dv.byteOffset, dv.byteOffset + dv.byteLength),
);
writeFileSync(resolve(out, 'indep.stl'), ourStl);

// 2. The .scad we generate, then OpenSCAD's own STL export of it.
const scad = generateScad(params);
const scadPath = resolve(out, 'holder.scad');
writeFileSync(scadPath, scad);
const scadStlPath = resolve(out, 'openscad.stl');
execFileSync(OPENSCAD, ['-o', scadStlPath, '--export-format', 'binstl', scadPath]);
const scadStl = readFileSync(scadStlPath);

// ---- binary STL analysis ---------------------------------------------------
interface StlStats {
  triangles: number;
  min: [number, number, number];
  max: [number, number, number];
  volume: number; // mm^3, signed sum of tetrahedra
}

function analyze(buf: Buffer): StlStats {
  const tris = buf.readUInt32LE(80);
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  let vol = 0;
  let p = 84;
  for (let t = 0; t < tris; t++) {
    p += 12; // skip normal
    const v: number[][] = [];
    for (let i = 0; i < 3; i++) {
      const x = buf.readFloatLE(p);
      const y = buf.readFloatLE(p + 4);
      const z = buf.readFloatLE(p + 8);
      p += 12;
      v.push([x, y, z]);
      for (let a = 0; a < 3; a++) {
        const c = [x, y, z][a];
        if (c < min[a]) min[a] = c;
        if (c > max[a]) max[a] = c;
      }
    }
    p += 2; // attribute byte count
    // signed volume of tetra (origin, v0, v1, v2)
    const [a, b, c] = v;
    vol +=
      (a[0] * (b[1] * c[2] - b[2] * c[1]) -
        a[1] * (b[0] * c[2] - b[2] * c[0]) +
        a[2] * (b[0] * c[1] - b[1] * c[0])) /
      6;
  }
  return { triangles: tris, min, max, volume: Math.abs(vol) };
}

const ours = analyze(ourStl);
const theirs = analyze(scadStl);

function size(s: StlStats): [number, number, number] {
  return [s.max[0] - s.min[0], s.max[1] - s.min[1], s.max[2] - s.min[2]];
}
const fmt = (n: number) => n.toFixed(2);
const fmt3 = (a: number[]) => `[${a.map(fmt).join(', ')}]`;

console.log('\n=== STL cross-check (default model) ===\n');
console.log('                 ours (three.js)      openscad (.scad)');
console.log(`triangles        ${String(ours.triangles).padEnd(20)} ${theirs.triangles}`);
console.log(`bbox size mm     ${fmt3(size(ours)).padEnd(20)} ${fmt3(size(theirs))}`);
console.log(`volume mm^3      ${fmt(ours.volume).padEnd(20)} ${fmt(theirs.volume)}`);

const sizeDiff = size(ours).map((d, i) => Math.abs(d - size(theirs)[i]));
const volPct = (100 * (ours.volume - theirs.volume)) / theirs.volume;
console.log(`\nbbox abs diff mm ${fmt3(sizeDiff)}`);
console.log(`volume diff      +${volPct.toFixed(2)} %`);
console.log(
  '  (ours is expected to read slightly higher: our STL is overlapping solids,\n' +
    '   so the tube/baseplate overlap is counted twice and the print epsilon adds\n' +
    '   a little. OpenSCAD reports the true evaluated union. Both print identically.)',
);

// ---- render both STLs to PNG with an identical camera -----------------------
const cam = `${params.baseLength},${params.baseDepth},${params.baseHeight},55,25,0,520`;
function render(stlFile: string, pngFile: string) {
  const wrapper = resolve(out, `wrap-${pngFile}.scad`);
  writeFileSync(wrapper, `import("${stlFile}");\n`);
  execFileSync(OPENSCAD, [
    '-o',
    resolve(out, pngFile),
    '--imgsize=900,675',
    '--camera=' + cam,
    '--colorscheme=Tomorrow',
    wrapper,
  ]);
}
render(resolve(out, 'indep.stl'), 'indep.png');
render(resolve(out, 'openscad.stl'), 'openscad.png');

geometry.dispose();

// Match on orientation + size (the print-critical invariant). Allow a little
// slack for the print epsilon. Volume is reported but not a pass/fail signal
// (see note above).
const ok = sizeDiff.every((d) => d < 0.01);
console.log(`\nrendered: verify-output/indep.png  vs  verify-output/openscad.png`);
console.log(ok ? '\nRESULT: MATCH ✅\n' : '\nRESULT: DIFFERENCES — inspect above ⚠️\n');
