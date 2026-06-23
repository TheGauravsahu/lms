import { useState, useEffect } from "react";

/**
 * useHaptic — Vibration API wrapper for mobile haptic feedback.
 * Falls back gracefully if the Vibration API is not supported.
 */
export const useHaptic = () => {
  const isSupported =
    typeof navigator !== "undefined" && "vibrate" in navigator;

  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lms-haptic-enabled") !== "false";
    }
    return true;
  });

  const toggle = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("lms-haptic-enabled", String(next));
    }
    if (next && isSupported) {
      navigator.vibrate(10);
    }
  };

  const vibrate = (pattern = 10) => {
    if (isSupported && isEnabled) {
      navigator.vibrate(pattern);
    }
  };

  return {
    isSupported,
    isEnabled,
    toggle,
    tap: () => vibrate(10),
    medium: () => vibrate(30),
    success: () => vibrate([20, 50, 20]),
    error: () => vibrate(100),
    custom: (pattern) => vibrate(pattern),
  };
};
