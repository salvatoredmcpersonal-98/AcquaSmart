import { useState, useEffect, RefObject } from 'react';

export function useElementWidth(ref: RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(ref.current);

    // Set initial width
    setWidth(ref.current.offsetWidth);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);

  return width;
}
