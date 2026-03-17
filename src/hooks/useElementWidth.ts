import { useState, useLayoutEffect, RefObject } from 'react';

export function useElementWidth(ref: RefObject<HTMLElement>, deps: any[] = []): number {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    
    const element = ref.current;
    const updateWidth = () => {
      const newWidth = element.offsetWidth;
      if (newWidth > 0) {
        setWidth(prev => prev === newWidth ? prev : newWidth);
      }
    };

    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        const newWidth = entries[0].contentRect.width;
        if (newWidth > 0) {
          setWidth(prev => prev === newWidth ? prev : newWidth);
        }
      }
    });

    observer.observe(element);
    updateWidth();

    return () => {
      observer.unobserve(element);
    };
  }, [ref, ...deps]);

  return width;
}
