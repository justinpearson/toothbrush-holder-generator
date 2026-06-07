import { deriveTubes } from '../../model/derive';
import type { HolderParams } from '../../model/types';
import { ArrowMarker, DimensionLabel } from './svg/DimensionLabel';
import { makeSvgScale } from './svg/useSvgScale';

const VIEW_W = 640;
const VIEW_H = 320;

/** Side elevation (X-Z): baseplate with tube rectangles and dashed bore lines. */
export function SideView({ params }: { params: HolderParams }) {
  const tubes = deriveTubes(params);
  const maxTubeHeight = tubes.reduce((m, t) => Math.max(m, t.height), 0);
  const worldH = params.baseHeight + maxTubeHeight;
  const sc = makeSvgScale(params.baseLength, worldH, VIEW_W, VIEW_H);
  const baseTop = params.baseHeight;

  return (
    <svg
      className="view-svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="Side view"
      data-testid="side-view"
    >
      <ArrowMarker />

      <rect
        className="plate"
        data-testid="side-plate"
        x={sc.x(0)}
        y={sc.y(params.baseHeight)}
        width={sc.s(params.baseLength)}
        height={sc.s(params.baseHeight)}
      />

      {tubes.map((t) => {
        const left = t.centerX - t.outerDiameter / 2;
        const boreLeft = t.centerX - t.innerDiameter / 2;
        const boreRight = t.centerX + t.innerDiameter / 2;
        const topY = sc.y(baseTop + t.height);
        const bottomY = sc.y(baseTop);
        return (
          <g key={t.id} data-testid="side-tube">
            <rect
              className="tube-outer"
              data-testid="side-tube-rect"
              x={sc.x(left)}
              y={topY}
              width={sc.s(t.outerDiameter)}
              height={sc.s(t.height)}
            />
            {t.innerDiameter > 0 && (
              <>
                <line
                  className="bore"
                  x1={sc.x(boreLeft)}
                  y1={topY}
                  x2={sc.x(boreLeft)}
                  y2={bottomY}
                />
                <line
                  className="bore"
                  x1={sc.x(boreRight)}
                  y1={topY}
                  x2={sc.x(boreRight)}
                  y2={bottomY}
                />
              </>
            )}
            <DimensionLabel
              x1={sc.x(left)}
              y1={topY - 14}
              x2={sc.x(left + t.outerDiameter)}
              y2={topY - 14}
              label={`${t.outerDiameter}`}
              textOffset={{ dy: -7 }}
            />
          </g>
        );
      })}

      <DimensionLabel
        x1={sc.x(0) - 18}
        y1={sc.y(0)}
        x2={sc.x(0) - 18}
        y2={sc.y(params.baseHeight)}
        label={`${params.baseHeight}`}
        textOffset={{ dx: -10 }}
      />
    </svg>
  );
}
