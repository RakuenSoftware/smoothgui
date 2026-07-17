import { useCallback, useMemo } from 'react';

/** Parse a stored blob into a clean list of id strings. Tolerates null,
 * malformed JSON, and non-array/non-string junk — always returns a string[]. */
export function parseSeen(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

/** Return a new list with `id` present (idempotent, order-stable). */
export function withSeen(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id];
}

function readRaw(key: string): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeList(key: string, list: string[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage disabled/full — degrade to always-show */
  }
}

export interface SeenState {
  hasSeen: (id: string) => boolean;
  markSeen: (id: string) => void;
  resetAll: () => void;
}

/** localStorage-backed "have I shown this before?" tracking under `storageKey`.
 * Guards `typeof localStorage` and swallows quota/security errors, so a
 * private-mode or storage-disabled browser degrades to "always show". Powers
 * the once-per-view CoachMark; also usable standalone (e.g. a "replay tours"
 * action via `resetAll`). */
export function useSeenState(storageKey: string): SeenState {
  const hasSeen = useCallback((id: string) => parseSeen(readRaw(storageKey)).includes(id), [storageKey]);
  const markSeen = useCallback(
    (id: string) => writeList(storageKey, withSeen(parseSeen(readRaw(storageKey)), id)),
    [storageKey],
  );
  const resetAll = useCallback(() => {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);
  return useMemo(() => ({ hasSeen, markSeen, resetAll }), [hasSeen, markSeen, resetAll]);
}
