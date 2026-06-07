# Toothbrush Holder Maker

**Live app: https://justinpearson.github.io/toothbrush-holder-generator/**

<video src="images/demo.mp4" controls muted loop playsinline width="100%"></video>

_Demo (if the player above doesn't load, [watch `images/demo.mp4`](images/demo.mp4)):_

![The web app](images/app-screenshot.png)

![A 3D-printed toothbrush holder in use](images/printed-holder.jpeg)

A small web app for designing a parametric toothbrush holder. Move sliders to set
the baseplate size, the number of tubes, and each tube's diameter and height; watch
the top, side, and 3D views update live; then download an OpenSCAD `.scad` file and a
ready-to-print binary `.stl`.

It grew out of a one-off model (`toothbrush-holder-3d-model/`) that was hand-drawn,
turned into a `.scad`, rendered to `.stl` with OpenSCAD, and printed on a Bambu P1S.
This app lets anyone produce the same kind of holder without writing OpenSCAD by hand.

## How it works

The holder geometry is simple: a baseplate (`cube`) plus N tubes, each a cylinder with
a **blind** cylindrical bore (the hole does not go through the base). Inner diameter is
`outer − 2 × wall_thickness`; tubes are evenly spaced along the length and centered in
depth — exactly matching the reference `.scad`.

Because each tube is axially symmetric, the app does **not** need OpenSCAD's CSG engine:

- **Views.** Top and side are SVG; the 3D view is Three.js via `@react-three/fiber`.
- **`.scad` export.** A template fills in the parameter block and reuses the reference
  `module toothbrush_holder()` body verbatim, so the download renders identically in
  OpenSCAD. See `src/export/scadGenerator.ts`.
- **`.stl` export.** Built directly in the browser from the same geometry: the baseplate
  is a box and each tube is a watertight `LatheGeometry` (a revolved cross-section),
  merged and written as binary STL with Three's `STLExporter`. The export geometry is
  Z-up (printer/OpenSCAD convention) so it imports upright in a slicer. See
  `src/geometry/buildSceneGeometry.ts` and `src/export/stlGenerator.ts`.

The tubes overlap the baseplate as separate solids rather than a CSG union; every slicer
treats overlapping closed solids as filled, so the STL prints correctly.

## Develop

```sh
yarn install
yarn dev            # http://localhost:5173
```

## Test

```sh
yarn test           # Vitest unit tests (model, scad/stl, geometry)
yarn build          # typecheck + production build
yarn exec playwright test -- --project=chromium --workers=1 --no-deps   # e2e
```

## Verify STL against OpenSCAD

`yarn verify:stl` cross-checks the in-browser STL against the STL OpenSCAD produces from
the generated `.scad`, for the default model. It compares triangle counts, bounding boxes,
and signed volumes, and renders both STLs to PNG (via OpenSCAD `import()`) with an
identical camera so they can be eyeballed. Output goes to `verify-output/`.

It expects OpenSCAD at `/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD`. The bounding
boxes match exactly; our reported volume reads a few percent higher because our STL is
overlapping solids (the tube/base overlap is counted twice, plus a small print epsilon),
whereas OpenSCAD reports the true evaluated union — both print identically.

## Build for static hosting

```sh
yarn build          # outputs dist/ (base is relative, so it works on any subpath)
```

`dist/` is a static site — host it on GitHub Pages, Netlify, Vercel, or any static host.

### GitHub Pages

This repo deploys to GitHub Pages via `.github/workflows/deploy.yml`: every push to
`main` builds the app and publishes `dist/`. For it to run, set the repository's
**Settings → Pages → Source** to **GitHub Actions** (not "Deploy from a branch" — a
branch/root deploy can't build the Vite app). The site is then served at
`https://<user>.github.io/toothbrush-holder-generator/`.

## Project layout

```
src/
  model/        parameter types, defaults, derivations, validation
  geometry/     tube cross-section profile, merged export geometry
  export/       .scad generator, .stl generator, download helper
  state/        useHolderParams hook (single source of truth)
  components/   ParameterControls (sliders), views (Top/Side/3D), DownloadBar
scripts/        verify-stl.ts  (OpenSCAD cross-check)
e2e/            Playwright specs
```

## Limitations / future work

- Holes are always blind (no drain-through-base) — matches the reference model's v1.
- The blind floor is one wall thick.
- The STL is overlapping solids, not a CSG-evaluated union (fine for slicing). A true
  manifold could be produced later with a CSG library if needed.
