import { Cache } from "@myapp/shared";

export type InMemoryCacheConfig = {};

export function createInMemoryCache<T extends Record<string, any>>(
  _config: InMemoryCacheConfig = {},
): Cache<T> {
  const cache = new Map<string, T>();

  const set: Cache<T>["set"] = async (key, value) => {
    cache.set(key, value);
  };
  const get: Cache<T>["get"] = async (key) => {
    return cache.get(key) ?? null;
  };

  const clear: Cache<T>["clear"] = async () => {
    cache.clear();
  };

  const remove: Cache<T>["remove"] = async (key) => {
    cache.delete(key);
  };

  const removeMultiple: Cache<T>["removeMultiple"] = async (keys) => {
    for (const key of keys) {
      cache.delete(key);
    }
  };

  return {
    set,
    get,
    clear,
    remove,
    removeMultiple,
  };
}
