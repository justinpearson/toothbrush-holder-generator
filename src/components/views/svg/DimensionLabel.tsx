interface DimensionLabelProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  /** Offset of the text from the line midpoint, px. */
  textOffset?: { dx?: number; dy?: number };
}

/**
 * A double-headed dimension arrow with a centered text label, in the schematic
 * style. Coordinates are in svg px (already scaled).
 */
export function DimensionLabel({
  x1,
  y1,
  x2,
  y2,
  label,
  textOffset = {},
}: DimensionLabelProps) {
  const mx = (x1 + x2) / 2 + (textOffset.dx ?? 0);
  const my = (y1 + y2) / 2 + (textOffset.dy ?? 0);
  return (
    <g className="dim">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle">
        {label}
      </text>
    </g>
  );
}

/** Shared arrowhead marker definition; render once per svg. */
export function ArrowMarker() {
  return (
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 1 L 9 5 L 0 9 z" fill="currentColor" />
      </marker>
    </defs>
  );
}
