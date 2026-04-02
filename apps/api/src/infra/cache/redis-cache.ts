import { Cache } from "@myapp/shared";
import { createClient } from "@redis/client";

export type RedisCacheConfig = {
  initialize?: () => Promise<void>;
  prefix?: string;
  client: ReturnType<typeof createClient>;
};

/**
 * Functional Factory for Redis Cache
 */
export function createRedisCache<T extends Record<string, any>>(
  config: RedisCacheConfig,
): Cache<T> {
  const { client, prefix = "" } = config;

  // --- Private Helpers (Closures replace 'protected' methods) ---

  const getPrefixedKey = (key: string): string => `${prefix}${key}`;

  const deleteKeysByPrefix = async function deleteKeysByPrefix(
    scanPrefix: string,
  ): Promise<void> {
    let keysToDelete: string[] = [];

    const iterator = client.scanIterator({
      MATCH: `${scanPrefix}*`,
      COUNT: 100,
    });

    for await (const key of iterator) {
      // Reverted to your original spread logic for version 5.11.0 compatibility
      keysToDelete.push(...(Array.isArray(key) ? key : [key]));

      if (keysToDelete.length >= 500) {
        await client.unlink(keysToDelete);
        keysToDelete = [];
      }
    }

    if (keysToDelete.length > 0) {
      await client.unlink(keysToDelete);
    }
  };

  const getOrThrow = async (key: string): Promise<T> => {
    const completeKey = getPrefixedKey(key);
    const value = await client.get(completeKey);

    if (value === null) {
      throw new Error(`Key not found: ${key}`);
    }

    try {
      // Redis returns strings; we check if it looks like JSON
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  };

  // --- Public API ---

  const set: Cache<T>["set"] = async (key, value) => {
    const completeKey = getPrefixedKey(key);
    const payload = typeof value === "string" ? value : JSON.stringify(value);
    await client.set(completeKey, payload);
  };

  const get: Cache<T>["get"] = async (key) => {
    try {
      return await getOrThrow(key);
    } catch {
      return null;
    }
  };

  const remove: Cache<T>["remove"] = async (key) => {
    await client.del(getPrefixedKey(key));
  };

  const removeMultiple: Cache<T>["removeMultiple"] = async (keys) => {
    if (keys.length === 0) return;
    // Note: Redis del handles up to 500+ usually fine,
    // but we respect your previous constraint logic
    const completeKeys = keys.map(getPrefixedKey);
    await client.del(completeKeys);
  };

  const clear: Cache<T>["clear"] = async () => {
    await deleteKeysByPrefix(prefix);
  };

  return {
    set,
    get,
    remove,
    removeMultiple,
    clear,
  };
}
