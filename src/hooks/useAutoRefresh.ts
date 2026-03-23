/**
 * useAutoRefresh
 * 
 * Custom hook that manages a countdown timer for auto-refresh.
 * Returns the seconds remaining, toggle state, and controls.
 */

import { useState, useEffect, useCallback, useRef } from "react";

const DEFAULT_INTERVAL = 30; // seconds

interface UseAutoRefreshOptions {
  /** Interval in seconds between refreshes */
  intervalSeconds?: number;
  /** Callback fired when the countdown hits zero */
  onRefresh: () => void;
}

export function useAutoRefresh({
  intervalSeconds = DEFAULT_INTERVAL,
  onRefresh,
}: UseAutoRefreshOptions) {
  const [enabled, setEnabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  // Reset countdown when toggled on or after a refresh
  const resetCountdown = useCallback(() => {
    setSecondsLeft(intervalSeconds);
  }, [intervalSeconds]);

  useEffect(() => {
    if (!enabled) return;

    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Fire refresh and restart countdown
          onRefreshRef.current();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [enabled, intervalSeconds]);

  // Reset countdown when re-enabled
  useEffect(() => {
    if (enabled) resetCountdown();
  }, [enabled, resetCountdown]);

  return { enabled, setEnabled, secondsLeft, resetCountdown };
}
