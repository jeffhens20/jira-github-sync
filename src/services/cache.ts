/**
 * Generic In-Memory TTL Cache
 *
 * Creates a simple key-value cache where entries expire after a
 * configurable time-to-live (TTL). Used to reduce redundant API
 * calls to GitHub and Jira between dashboard refreshes.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  invalidate(key: string): void;
  clear(): void;
}

export function createCache<T>(ttlMs: number): Cache<T> {
  const store = new Map<string, CacheEntry<T>>();

  return {
    get(key: string): T | undefined {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return undefined;
      }
      return entry.data;
    },

    set(key: string, value: T): void {
      store.set(key, { data: value, expiresAt: Date.now() + ttlMs });
    },

    invalidate(key: string): void {
      store.delete(key);
    },

    clear(): void {
      store.clear();
    },
  };
}
