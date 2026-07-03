import { LIMITS } from '../../model/constraints';
import type {
  GlobalDefaults,
  HolderObject,
  ShapeKind,
  SizeKey,
} from '../../model/types';
import type { HolderControls } from '../../state/useHolderParams';
import { Collapsible } from './Collapsible';
import { Slider } from './Slider';

const SHAPES: { value: ShapeKind; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'star', label: 'Star' },
];

/** A bordered panel around one object attribute, with a small title header. */
function AttrPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="attr">
      <div className="attr__head">
        <span className="attr__title">{title}</span>
      </div>
      <div className="attr__body">{children}</div>
    </div>
  );
}

interface OverrideRowProps {
  label: string;
  sizeKey: SizeKey;
  value: number | null;
  globalValue: number;
  controls: HolderControls;
  objectId: string;
}

/**
 * One inheritable size, in its own panel. The slider is always visible:
 * disabled at the global value while inheriting, enabled once
 * "Override global …" is checked.
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
    <div className="attr override">
      <div className="attr__head">
        <span className="attr__title">{label}</span>
      </div>
      <div className="attr__body">
        <Slider
          label={label}
          value={value ?? globalValue}
          {...limits}
          hideLabel
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
  const shapeLabel =
    SHAPES.find((s) => s.value === object.shape)?.label ?? object.shape;
  return (
    <div className="object-card" data-testid="object-card">
      <Collapsible
        title={`Object ${index + 1}`}
        summary={`${shapeLabel} · ${object.solid ? 'Solid' : 'Tube'}`}
        className="collapsible--card"
        actions={
          <button
            type="button"
            className="object-card__remove"
            disabled={!canRemove}
            aria-label={`Remove object ${index + 1}`}
            onClick={() => controls.removeObject(object.id)}
          >
            ✕
          </button>
        }
      >
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
          <AttrPanel title="Eccentricity">
            <Slider
              label="Eccentricity"
              value={object.shapeParams.eccentricity}
              {...LIMITS.eccentricity}
              unit=""
              hideLabel
              onChange={(v) => controls.setShapeParam(object.id, 'eccentricity', v)}
            />
          </AttrPanel>
        )}
        {object.shape === 'polygon' && (
          <AttrPanel title="Sides">
            <Slider
              label="Sides"
              value={object.shapeParams.sides}
              {...LIMITS.sides}
              unit=""
              hideLabel
              onChange={(v) => controls.setShapeParam(object.id, 'sides', v)}
            />
          </AttrPanel>
        )}
        {object.shape === 'star' && (
          <>
            <AttrPanel title="Points">
              <Slider
                label="Points"
                value={object.shapeParams.points}
                {...LIMITS.points}
                unit=""
                hideLabel
                onChange={(v) => controls.setShapeParam(object.id, 'points', v)}
              />
            </AttrPanel>
            <AttrPanel title="Point depth">
              <Slider
                label="Point depth"
                value={object.shapeParams.pointDepth}
                {...LIMITS.pointDepth}
                unit=""
                hideLabel
                onChange={(v) => controls.setShapeParam(object.id, 'pointDepth', v)}
              />
            </AttrPanel>
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
      </Collapsible>
    </div>
  );
}
