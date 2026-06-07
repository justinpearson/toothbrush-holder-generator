export interface SvgScale {
  /** Convert a model-space length (mm) to px. */
  s: (mm: number) => number;
  /** Map a model-space X (mm) to svg px (with left padding). */
  x: (mm: number) => number;
  /** Map a model-space Y/Z (mm) to svg px, flipped so +up is up on screen. */
  y: (mm: number) => number;
  scale: number;
  width: number;
  height: number;
  pad: number;
}

/**
 * Fit a model bounding box (worldW x worldH mm) into a viewBox of viewW x viewH px,
 * uniformly scaled with padding. SVG Y grows downward, so y() flips it.
 */
export function makeSvgScale(
  worldW: number,
  worldH: number,
  viewW: number,
  viewH: number,
  pad = 48,
): SvgScale {
  const usableW = viewW - pad * 2;
  const usableH = viewH - pad * 2;
  const scale = Math.min(usableW / worldW, usableH / worldH);
  // Center the drawing within the usable area.
  const offsetX = pad + (usableW - worldW * scale) / 2;
  const offsetY = pad + (usableH - worldH * scale) / 2;
  return {
    scale,
    width: viewW,
    height: viewH,
    pad,
    s: (mm) => mm * scale,
    x: (mm) => offsetX + mm * scale,
    y: (mm) => offsetY + (worldH - mm) * scale,
  };
}
