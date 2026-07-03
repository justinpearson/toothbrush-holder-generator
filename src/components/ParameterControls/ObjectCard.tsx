import { LIMITS } from '../../model/constraints';
import type {
  GlobalDefaults,
  HolderObject,
  ShapeKind,
  SizeKey,
} from '../../model/types';
import type { HolderControls } from '../../state/useHolderParams';
import { Slider } from './Slider';

const SHAPES: { value: ShapeKind; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'star', label: 'Star' },
];

interface OverrideRowProps {
  label: string;
  sizeKey: SizeKey;
  value: number | null;
  globalValue: number;
  controls: HolderControls;
  objectId: string;
}

/**
 * One inheritable size. The slider is always visible: disabled at the global
 * value while inheriting, enabled once "Override global …" is checked.
 */
function OverrideRow({
  label,
  sizeKey,
  value,
  globalValue,
  controls,
  objectId,
}: OverrideRowProps) {
  const overridden = value !== null;
  const limits = LIMITS[sizeKey];
  const lowerLabel = label.toLowerCase();
  return (
    <div className="override">
      <Slider
        label={label}
        value={value ?? globalValue}
        {...limits}
        disabled={!overridden}
        onChange={(v) => controls.setOverride(objectId, sizeKey, v)}
      />
      {!overridden && (
        <span className="override__inherited">
          Inheriting the global value ({globalValue} mm)
        </span>
      )}
      <label className="override__toggle">
        <input
          type="checkbox"
          checked={overridden}
          aria-label={`Override global ${lowerLabel}`}
          onChange={(e) =>
            controls.setOverride(
              objectId,
              sizeKey,
              e.target.checked ? globalValue : null,
            )
          }
        />
        <span>Override global {lowerLabel}</span>
      </label>
    </div>
  );
}

interface ObjectCardProps {
  object: HolderObject;
  index: number;
  globals: GlobalDefaults;
  controls: HolderControls;
  canRemove: boolean;
}

export function ObjectCard({
  object,
  index,
  globals,
  controls,
  canRemove,
}: ObjectCardProps) {
  return (
    <div className="object-card" data-testid="object-card">
      <div className="object-card__head">
        <strong>Object {index + 1}</strong>
        <button
          type="button"
          className="object-card__remove"
          disabled={!canRemove}
          aria-label={`Remove object ${index + 1}`}
          onClick={() => controls.removeObject(object.id)}
        >
          ✕
        </button>
      </div>

      <div className="object-card__row">
        <label className="field">
          <span>Shape</span>
          <select
            data-testid="object-shape"
            value={object.shape}
            onChange={(e) =>
              controls.setObjectShape(object.id, e.target.value as ShapeKind)
            }
          >
            {SHAPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Type</span>
          <select
            data-testid="object-type"
            value={object.solid ? 'solid' : 'tube'}
            onChange={(e) =>
              controls.setObjectSolid(object.id, e.target.value === 'solid')
            }
          >
            <option value="tube">Tube (hollow)</option>
            <option value="solid">Solid</option>
          </select>
        </label>
      </div>

      {object.shape === 'ellipse' && (
        <Slider
          label="Eccentricity"
          value={object.shapeParams.eccentricity}
          {...LIMITS.eccentricity}
          unit=""
          onChange={(v) => controls.setShapeParam(object.id, 'eccentricity', v)}
        />
      )}
      {object.shape === 'polygon' && (
        <Slider
          label="Sides"
          value={object.shapeParams.sides}
          {...LIMITS.sides}
          unit=""
          onChange={(v) => controls.setShapeParam(object.id, 'sides', v)}
        />
      )}
      {object.shape === 'star' && (
        <>
          <Slider
            label="Points"
            value={object.shapeParams.points}
            {...LIMITS.points}
            unit=""
            onChange={(v) => controls.setShapeParam(object.id, 'points', v)}
          />
          <Slider
            label="Point depth"
            value={object.shapeParams.pointDepth}
            {...LIMITS.pointDepth}
            unit=""
            onChange={(v) => controls.setShapeParam(object.id, 'pointDepth', v)}
          />
        </>
      )}

      <OverrideRow
        label="Object diameter"
        sizeKey="objectDiameter"
        value={object.objectDiameter}
        globalValue={globals.objectDiameter}
        controls={controls}
        objectId={object.id}
      />
      <OverrideRow
        label="Height"
        sizeKey="height"
        value={object.height}
        globalValue={globals.height}
        controls={controls}
        objectId={object.id}
      />
      {!object.solid && (
        <>
          <OverrideRow
            label="Padding"
            sizeKey="padding"
            value={object.padding}
            globalValue={globals.padding}
            controls={controls}
            objectId={object.id}
          />
          <OverrideRow
            label="Wall thickness"
            sizeKey="wallThickness"
            value={object.wallThickness}
            globalValue={globals.wallThickness}
            controls={controls}
            objectId={object.id}
          />
        </>
      )}
    </div>
  );
}
