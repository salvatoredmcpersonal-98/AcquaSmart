import { useRef, useCallback } from 'react';

export default function useLongPress(callback: () => void, ms = 700) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number, y: number } | null>(null);
  const isLongPressTriggered = useRef(false);

  const start = useCallback((e: any) => {
    isLongPressTriggered.current = false;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    startPosRef.current = { x: clientX, y: clientY };

    timerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      callback();
    }, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPosRef.current = null;
  }, []);

  const move = useCallback((e: any) => {
    if (!startPosRef.current || !timerRef.current) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const dx = Math.abs(clientX - startPosRef.current.x);
    const dy = Math.abs(clientY - startPosRef.current.y);
    
    if (dx > 10 || dy > 10) {
      stop();
    }
  }, [stop]);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onContextMenu: (e: any) => {
      if (isLongPressTriggered.current) {
        e.preventDefault();
      }
    }
  };
}
