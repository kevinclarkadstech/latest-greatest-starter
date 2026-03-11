import { Cache } from "@myapp/shared";

export type InMemoryCacheConfig = {
  initialize?: () => Promise<void>;
};

export class InMemoryCache<
  T extends { [key: string]: any },
> implements Cache<T> {
  private cache: Map<string, T>;
  initialize: () => Promise<void>;
  constructor(config: InMemoryCacheConfig = {}) {
    this.initialize = config.initialize ?? (async () => {});
    this.cache = new Map<string, T>();
  }

  async populate(values: T[], getKey: (value: T) => string): Promise<void> {
    for (const value of values) {
      const key = getKey(value);
      this.cache.set(key, value);
    }
  }

  async set(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
  }

  async get(key: string): Promise<T | null> {
    return this.cache.get(key) ?? null;
  }
  async clear(): Promise<void> {
    this.cache.clear();
  }
  async remove(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
