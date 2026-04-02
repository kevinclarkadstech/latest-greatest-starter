export type Cache<T extends { [key: string]: any }> = {
  // populate(values: T[], getKey: (value: T) => string): Promise<void>;
  set(key: string, value: T): Promise<void>;
  //   getAll(): Promise<T[]>;
  get(key: string): Promise<T | null>;
  //   getOrThrow(key: string): Promise<T>;
  //   getOrThrowAndRemove(key: string): Promise<T>;
  remove(key: string): Promise<void>;
  removeMultiple(keys: string[]): Promise<void>;
  clear(): Promise<void>;
};

export function createCache<T extends { [key: string]: any }>(
  implementation: Cache<T>,
): Cache<T> {
  return implementation;
}
