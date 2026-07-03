// Minimal component-test helpers on top of react-dom + React.act. We use these
// instead of @testing-library/react because its peer dep (@testing-library/dom)
// is not installed.
import { act, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

/** Render into a fresh container attached to the document. */
export function renderInto(element: ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return {
    container,
    rerender: (el: ReactElement) => act(() => root.render(el)),
    unmount: () => {
      act(() => root.unmount());
      container.remove();
    },
  };
}

/** Set an input's value the way a user would, firing React's onChange. */
export function setInputValue(input: HTMLInputElement, text: string) {
  // Use the native setter so React's internal value tracker sees the change.
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value',
  )!.set!;
  act(() => {
    setter.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

/** Blur an element, firing React's onBlur (which listens to focusout). */
export function blurElement(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });
}

/** Click an element, firing React's onClick/onChange handlers. */
export function clickElement(el: HTMLElement) {
  act(() => {
    el.click();
  });
}
