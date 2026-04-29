import { useEffect, useState } from 'react';

export const DEFAULT_FX_RATE = 32;
export const SHARED_FX_RATE_STORAGE_KEY = 'export-doc-gen-shared-fx-rate-v1';
const SHARED_FX_RATE_EVENT = 'export-doc-gen-shared-fx-rate-change';

function normalizeFxRate(value: unknown, fallback = DEFAULT_FX_RATE) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function readSharedFxRate(fallback = DEFAULT_FX_RATE) {
  if (typeof localStorage === 'undefined') return fallback;
  return normalizeFxRate(localStorage.getItem(SHARED_FX_RATE_STORAGE_KEY), fallback);
}

export function writeSharedFxRate(value: number) {
  const next = normalizeFxRate(value);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(SHARED_FX_RATE_STORAGE_KEY, String(next));
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SHARED_FX_RATE_EVENT, { detail: next }));
  }
  return next;
}

export function useSharedFxRate(fallback = DEFAULT_FX_RATE) {
  const [fxRate, setFxRateState] = useState(() => readSharedFxRate(fallback));

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SHARED_FX_RATE_STORAGE_KEY) {
        setFxRateState(normalizeFxRate(event.newValue, fallback));
      }
    };
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      setFxRateState(normalizeFxRate(customEvent.detail, fallback));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(SHARED_FX_RATE_EVENT, handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(SHARED_FX_RATE_EVENT, handleCustomEvent);
    };
  }, [fallback]);

  const setFxRate = (value: number) => {
    const next = writeSharedFxRate(value);
    setFxRateState(next);
    return next;
  };

  return [fxRate, setFxRate] as const;
}
