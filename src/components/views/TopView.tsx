import { deriveObjects } from '../../model/derive';
import type { DerivedObject, HolderParams, Vec2 } from '../../model/types';
import { ArrowMarker, DimensionLabel } from './svg/DimensionLabel';
import { makeSvgScale, type SvgScale } from './svg/useSvgScale';

const VIEW_W = 640;
const VIEW_H = 320;

/** SVG polygon points for an outline placed at the object's center. */
function polyPoints(pts: Vec2[], cx: number, cy: number, sc: SvgScale): string {
  return pts.map(([px, py]) => `${sc.x(cx + px)},${sc.y(cy + py)}`).join(' ');
}

/** Trim a length to at most 2 decimals for a dimension label. */
function fmt(v: number): string {
  return `${Number(v.toFixed(2))}`;
}

/** Top-down view: baseplate rectangle with each object's outline (and bore). */
export function TopView({ params }: { params: HolderParams }) {
  const sc = makeSvgScale(params.baseLength, params.baseDepth, VIEW_W, VIEW_H);
  const objects = deriveObjects(params);
  const centers = objects.map((o) => o.centerX);
  // Spacing chain along the plate's top edge: left edge -> center 1 ->
  // center 2 -> ... -> right edge, so even spacing is easy to verify.
  const spacingY = sc.y(params.baseDepth) + 16;
  const spans = [
    { from: 0, to: centers[0] },
    ...centers.slice(1).map((c, i) => ({ from: centers[i], to: c })),
    { from: centers[centers.length - 1], to: params.baseLength },
  ].filter((s) => s.to > s.from);

  return (
    <svg
      className="view-svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="Top view"
      data-testid="top-view"
    >
      <ArrowMarker />

      <rect
        className="plate"
        data-testid="top-plate"
        x={sc.x(0)}
        y={sc.y(params.baseDepth)}
        width={sc.s(params.baseLength)}
        height={sc.s(params.baseDepth)}
      />

      {objects.map((o: DerivedObject) => (
        <g key={o.id} data-testid="top-object" data-shape={o.shape}>
          <polygon
            className="tube-outer"
            data-testid="top-object-outer"
            data-role="outer"
            points={polyPoints(o.outer, o.centerX, o.centerY, sc)}
          />
          {o.inner && (
            <polygon
              className="tube-inner"
              data-role="inner"
              points={polyPoints(o.inner, o.centerX, o.centerY, sc)}
            />
          )}
          <g data-testid="top-width-dim">
            <DimensionLabel
              x1={sc.x(o.centerX - o.outerDiameter / 2)}
              y1={sc.y(o.centerY + o.outerDiameter / 2) - 8}
              x2={sc.x(o.centerX + o.outerDiameter / 2)}
              y2={sc.y(o.centerY + o.outerDiameter / 2) - 8}
              label={fmt(o.outerDiameter)}
              textOffset={{ dy: -7 }}
            />
          </g>
        </g>
      ))}

      {spans.map((s, i) => (
        <g key={i} data-testid="top-spacing-dim">
          <DimensionLabel
            x1={sc.x(s.from)}
            y1={spacingY}
            x2={sc.x(s.to)}
            y2={spacingY}
            label={fmt(s.to - s.from)}
            textOffset={{ dy: -6 }}
          />
        </g>
      ))}

      <DimensionLabel
        x1={sc.x(0)}
        y1={sc.y(params.baseDepth) - 18}
        x2={sc.x(params.baseLength)}
        y2={sc.y(params.baseDepth) - 18}
        label={`${params.baseLength}`}
        textOffset={{ dy: -8 }}
      />
      <DimensionLabel
        x1={sc.x(0) - 18}
        y1={sc.y(0)}
        x2={sc.x(0) - 18}
        y2={sc.y(params.baseDepth)}
        label={`${params.baseDepth}`}
        textOffset={{ dx: -10 }}
      />
    </svg>
  );
}
