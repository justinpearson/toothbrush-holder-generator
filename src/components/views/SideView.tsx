import { bbox } from '../../geometry/crossSection';
import { deriveObjects } from '../../model/derive';
import type { HolderParams } from '../../model/types';
import { ArrowMarker, DimensionLabel } from './svg/DimensionLabel';
import { makeSvgScale } from './svg/useSvgScale';

const VIEW_W = 640;
const VIEW_H = 320;

/** Side elevation (X-Z): baseplate with each object's silhouette + bore lines. */
export function SideView({ params }: { params: HolderParams }) {
  const objects = deriveObjects(params);
  const maxHeight = objects.reduce((m, o) => Math.max(m, o.height), 0);
  const worldH = params.baseHeight + maxHeight;
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

      {objects.map((o) => {
        const box = bbox(o.outer);
        const left = o.centerX + box.minX;
        const width = box.maxX - box.minX;
        const topY = sc.y(baseTop + o.height);

        // Blind bore: floor sits one wall above the baseplate top.
        const floorY = sc.y(baseTop + o.wallThickness);
        const bore = o.inner ? bbox(o.inner) : null;

        return (
          <g key={o.id} data-testid="side-object" data-shape={o.shape}>
            <rect
              className="tube-outer"
              data-testid="side-object-rect"
              x={sc.x(left)}
              y={topY}
              width={sc.s(width)}
              height={sc.s(o.height)}
            />
            {bore && (
              <>
                <line
                  className="bore"
                  x1={sc.x(o.centerX + bore.minX)}
                  y1={topY}
                  x2={sc.x(o.centerX + bore.minX)}
                  y2={floorY}
                />
                <line
                  className="bore"
                  x1={sc.x(o.centerX + bore.maxX)}
                  y1={topY}
                  x2={sc.x(o.centerX + bore.maxX)}
                  y2={floorY}
                />
                <line
                  className="bore"
                  x1={sc.x(o.centerX + bore.minX)}
                  y1={floorY}
                  x2={sc.x(o.centerX + bore.maxX)}
                  y2={floorY}
                />
              </>
            )}
            <DimensionLabel
              x1={sc.x(left)}
              y1={topY - 14}
              x2={sc.x(left + width)}
              y2={topY - 14}
              label={`${Math.round(width)}`}
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
