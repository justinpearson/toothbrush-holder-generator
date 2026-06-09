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

/** Top-down view: baseplate rectangle with each object's outline (and bore). */
export function TopView({ params }: { params: HolderParams }) {
  const sc = makeSvgScale(params.baseLength, params.baseDepth, VIEW_W, VIEW_H);
  const objects = deriveObjects(params);

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
