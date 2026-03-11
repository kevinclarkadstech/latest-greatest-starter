import { Cache } from "@myapp/shared";
import { createClient } from "@redis/client";

export type RedisCacheConfig = {
  initialize?: () => Promise<void>;
  prefix?: string;
  client: ReturnType<typeof createClient>;
};

export class RedisCache<T extends { [key: string]: any }> implements Cache<T> {
  protected client: ReturnType<typeof createClient>;
  protected prefix: string;
  initialize: () => Promise<void>;
  public constructor(config: RedisCacheConfig) {
    this.initialize = config.initialize ?? (async () => {});
    this.client = config.client;
    this.prefix = config.prefix ?? "";
  }

  protected getPrefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  protected async deleteKeysByPrefix(prefix: string): Promise<void> {
    let keysToDelete: string[] = [];

    // scanIterator handles the cursor/recursion logic for you
    const iterator = this.client.scanIterator({
      MATCH: `${prefix}*`,
      COUNT: 100, // Hint for how many keys to pull from Redis per network call
    });

    for await (const key of iterator) {
      keysToDelete.push(...key);

      if (keysToDelete.length >= 500) {
        await this.client.unlink(keysToDelete);
        keysToDelete = [];
      }
    }

    // Cleanup the tail
    if (keysToDelete.length > 0) {
      await this.client.unlink(keysToDelete);
    }
  }

  async populate(values: T[], getKey: (value: T) => string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async set(key: string, value: T): Promise<void> {
    const completeKey = this.getPrefixedKey(key);
    if (typeof value === "string") {
      this.client.set(completeKey, value);
    } else {
      this.client.set(completeKey, JSON.stringify(value));
    }
  }

  protected async getOrThrow(key: string): Promise<T> {
    const completeKey = this.getPrefixedKey(key);
    const value = await this.client.get(completeKey);
    if (value === null) {
      throw new Error(`Key not found: ${key}`);
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }
  //   async getOrThrowAndRemove(key: string): Promise<T> {
  //     const value = await this.getOrThrow(key);
  //     await this.removeOne(key);
  //     return value;
  //   }
  async get(key: string): Promise<T | null> {
    try {
      return await this.getOrThrow(key);
    } catch {
      return null;
    }
  }
  async remove(key: string): Promise<void> {
    const completeKey = this.getPrefixedKey(key);
    await this.client.del(completeKey);
  }
  async removeMultiple(keys: string[]): Promise<void> {
    if (keys.length === 0 || keys.length > 500) return;
    const completeKeys = keys.map((key) => this.getPrefixedKey(key));
    await this.client.del(completeKeys);
  }
  async clear(): Promise<void> {
    await this.deleteKeysByPrefix(this.prefix);
  }
}
