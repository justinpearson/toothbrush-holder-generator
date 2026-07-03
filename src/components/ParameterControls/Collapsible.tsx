import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/**
 * "Expand all" signal: a counter bumped by the Expand all button. Every
 * Collapsible opens when it changes.
 */
export const ExpandAllContext = createContext(0);

interface CollapsibleProps {
  title: string;
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
  summary,
  actions,
  defaultOpen = true,
  className,
  children,
}: CollapsibleProps) {
  const expandAllTick = useContext(ExpandAllContext);
  const [open, setOpen] = useState(defaultOpen);
  const mountTick = useRef(expandAllTick);
  useEffect(() => {
    if (expandAllTick !== mountTick.current) setOpen(true);
  }, [expandAllTick]);

  return (
    <div className={`collapsible${className ? ` ${className}` : ''}`}>
      <div className="collapsible__head">
        <button
          type="button"
          className="collapsible__toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
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
