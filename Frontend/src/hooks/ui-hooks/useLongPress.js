import { useCallback, useRef } from "react";

export const useLongPress = (
  onLongPress,
  onClick,
  { delay = 600, moveThreshold = 10 } = {}
) => {
  const timeout = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });
  const moved = useRef(false);
  const longPressTriggered = useRef(false);

  const start = useCallback(
    (e) => {
      moved.current = false;
      longPressTriggered.current = false;

      const point = "touches" in e ? e.touches[0] : e;
      startPos.current = { x: point.clientX, y: point.clientY };

      timeout.current = setTimeout(() => {
        onLongPress(e);
        longPressTriggered.current = true;
      }, delay);
    },
    [onLongPress, delay]
  );

  const move = useCallback(
    (e) => {
      const point = "touches" in e ? e.touches[0] : e;
      const dx = Math.abs(point.clientX - startPos.current.x);
      const dy = Math.abs(point.clientY - startPos.current.y);

      if (dx > moveThreshold || dy > moveThreshold) {
        moved.current = true;
        clearTimeout(timeout.current);
      }
    },
    [moveThreshold]
  );

  const clear = useCallback(
    (e) => {
      clearTimeout(timeout.current);

      if (!moved.current && !longPressTriggered.current) {
        onClick(e);
      }
    },
    [onClick]
  );

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: clear,
    onTouchCancel: () => {
      clearTimeout(timeout.current);
      moved.current = true;
    },

    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: clear,

    onContextMenu: (e) => {
      e.preventDefault();
      onLongPress(e);
    },
  };
};

const isTouchEvent = (event) => {
  return "touches" in event;
};

const preventDefault = (event) => {
  if (!isTouchEvent(event)) return;
  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};
