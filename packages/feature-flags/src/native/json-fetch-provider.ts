import type { FlagMap, FlagProvider } from "../core";
import { defaultParse } from "../core";

export class JsonFetchFlagProvider<Keys extends string>
  implements FlagProvider<Keys>
{
  private flags: FlagMap<Keys> = {} as FlagMap<Keys>;

  constructor(private readonly url: string) {}

  async initialize(
    parser: (input: unknown) => FlagMap<Keys> = defaultParse,
  ): Promise<void> {
    const response = await fetch(this.url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch feature flags from "${this.url}": ${response.status} ${response.statusText}`,
      );
    }
    const raw: unknown = await response.json();
    this.flags = parser(raw);
  }

  isEnabled(key: Keys): boolean {
    return this.flags[key] ?? false;
  }
}
