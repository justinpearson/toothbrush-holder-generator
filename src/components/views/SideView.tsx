import { bbox } from '../../geometry/crossSection';
import { deriveObjects } from '../../model/derive';
import type { DerivedObject, HolderParams } from '../../model/types';
import { ArrowMarker, DimensionLabel } from './svg/DimensionLabel';
import { makeSvgScale } from './svg/useSvgScale';

const VIEW_W = 640;
const VIEW_H = 320;

/** How far the dummy held object (toothbrush) pokes out of its tube, mm. */
function stickout(o: DerivedObject): number {
  return Math.max(8, o.height * 0.4);
}

/** Side elevation (X-Z): baseplate with each object's silhouette + bore lines. */
export function SideView({ params }: { params: HolderParams }) {
  const objects = deriveObjects(params);
  const worldTop = objects.reduce(
    (m, o) => Math.max(m, o.height + (o.inner ? stickout(o) : 0)),
    0,
  );
  const worldH = params.baseHeight + worldTop;
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

        // Dummy held object (e.g. a toothbrush): a light silhouette of the
        // measured item, standing on the bore floor and poking out the top.
        const held = o.inner
          ? {
              width: o.objectDiameter,
              bottom: baseTop + o.wallThickness,
              top: baseTop + o.height + stickout(o),
            }
          : null;

        // Dimension the size the user set: the held object's diameter for a
        // tube, the outer diameter for a solid. (A star/polygon silhouette
        // is narrower than its vertex-to-vertex diameter, so never measure
        // the bbox — a 15 mm star would read 14.)
        const dimWidth = held ? held.width : o.outerDiameter;
        const dimY = held ? sc.y(held.top) - 14 : topY - 14;

        return (
          <g key={o.id} data-testid="side-object" data-shape={o.shape}>
            {held && (
              <rect
                className="held"
                data-testid="side-held"
                x={sc.x(o.centerX - held.width / 2)}
                y={sc.y(held.top)}
                width={sc.s(held.width)}
                height={sc.s(held.top - held.bottom)}
              />
            )}
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
              x1={sc.x(o.centerX - dimWidth / 2)}
              y1={dimY}
              x2={sc.x(o.centerX + dimWidth / 2)}
              y2={dimY}
              label={`${dimWidth}`}
              textOffset={{ dy: -7 }}
            />
            {/* Height, dimensioned just right of the silhouette. */}
            <g data-testid="side-height-dim">
              <DimensionLabel
                x1={sc.x(left + width) + 12}
                y1={topY}
                x2={sc.x(left + width) + 12}
                y2={sc.y(baseTop)}
                label={`${o.height}`}
                textOffset={{ dx: 12 }}
              />
            </g>
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
