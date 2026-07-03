import { createContext, useContext, useState, type ReactNode } from 'react';

/** Central open/closed store for collapsible panels. */
export interface CollapseStore {
  isOpen: (key: string) => boolean;
  toggle: (key: string) => void;
}

/**
 * Panels register under stable keys (e.g. "<objectId>:height"), so collapse
 * state belongs to the object itself: it survives list reordering, removals,
 * and panels unmounting (a tube's Padding panel while the object is Solid).
 * Without a provider a Collapsible falls back to its own local state.
 */
export const CollapseContext = createContext<CollapseStore | null>(null);

interface CollapsibleProps {
  title: string;
  /** Stable identity in the CollapseContext store. */
  stateKey: string;
  /** Extra detail shown in the header while collapsed (e.g. current value). */
  summary?: ReactNode;
  /** Rendered in the header outside the toggle button (e.g. a remove button). */
  actions?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}

/** A titled panel whose body collapses behind a chevron header. */
export function Collapsible({
  title,
  stateKey,
  summary,
  actions,
  defaultOpen = true,
  className,
  children,
}: CollapsibleProps) {
  const store = useContext(CollapseContext);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = store ? store.isOpen(stateKey) : localOpen;
  const toggle = () =>
    store ? store.toggle(stateKey) : setLocalOpen((o) => !o);

  return (
    <div className={`collapsible${className ? ` ${className}` : ''}`}>
      <div className="collapsible__head">
        <button
          type="button"
          className="collapsible__toggle"
          aria-expanded={open}
          onClick={toggle}
        >
          <span className="collapsible__chevron" aria-hidden="true">
            {open ? '▾' : '▸'}
          </span>
          <span className="collapsible__title">{title}</span>
          {!open && summary != null && (
            <span className="collapsible__summary">{summary}</span>
          )}
        </button>
        {actions}
      </div>
      {open && <div className="collapsible__body">{children}</div>}
    </div>
  );
}
