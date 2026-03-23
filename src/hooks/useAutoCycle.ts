/**
 * useAutoCycle
 *
 * Cycles through a list of values on a timer.
 * Toggle on/off with configurable interval, countdown display.
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface UseAutoCycleOptions<T> {
  /** Ordered list of values to cycle through */
  values: T[];
  /** Current active value */
  active: T;
  /** Called with the next value when the timer fires */
  onCycle: (next: T) => void;
  /** Interval in seconds between cycles */
  intervalSeconds?: number;
}

export function useAutoCycle<T>({
  values,
  active,
  onCycle,
  intervalSeconds = 10,
}: UseAutoCycleOptions<T>) {
  const [enabled, setEnabled] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);
  const onCycleRef = useRef(onCycle);
  onCycleRef.current = onCycle;

  const resetCountdown = useCallback(() => {
    setSecondsLeft(intervalSeconds);
  }, [intervalSeconds]);

  useEffect(() => {
    if (!enabled) return;

    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const idx = values.indexOf(active);
          const next = values[(idx + 1) % values.length];
          onCycleRef.current(next);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [enabled, intervalSeconds, values, active]);

  useEffect(() => {
    if (enabled) resetCountdown();
  }, [enabled, resetCountdown]);

  return { enabled, setEnabled, secondsLeft, resetCountdown };
}
