import { useState, useEffect, useRef } from 'react';

export function usePersistedState(key, defaultValue) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });

  // Save to localStorage on every change (uses ref to avoid stale closure)
  const keyRef = useRef(key);
  keyRef.current = key;

  const setPersisted = (newVal) => {
    setVal(prev => {
      const next = typeof newVal === 'function' ? newVal(prev) : newVal;
      try { localStorage.setItem(keyRef.current, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return [val, setPersisted];
}
