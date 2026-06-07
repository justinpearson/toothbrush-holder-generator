import { deriveTubes } from '../../model/derive';
import type { HolderParams } from '../../model/types';
import { ArrowMarker, DimensionLabel } from './svg/DimensionLabel';
import { makeSvgScale } from './svg/useSvgScale';

const VIEW_W = 640;
const VIEW_H = 320;

/** Top-down view: baseplate rectangle with concentric OD/ID circles per tube. */
export function TopView({ params }: { params: HolderParams }) {
  const sc = makeSvgScale(params.baseLength, params.baseDepth, VIEW_W, VIEW_H);
  const tubes = deriveTubes(params);

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

      {tubes.map((t) => (
        <g key={t.id} data-testid="top-tube">
          <circle
            className="tube-outer"
            data-testid="top-tube-outer"
            cx={sc.x(t.centerX)}
            cy={sc.y(t.centerY)}
            r={sc.s(t.outerDiameter / 2)}
          />
          {t.innerDiameter > 0 && (
            <circle
              className="tube-inner"
              cx={sc.x(t.centerX)}
              cy={sc.y(t.centerY)}
              r={sc.s(t.innerDiameter / 2)}
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
