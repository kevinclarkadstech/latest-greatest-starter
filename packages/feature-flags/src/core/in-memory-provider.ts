import type { FlagMap, FlagProvider } from "./types";

export class InMemoryFlagProvider<Keys extends string>
  implements FlagProvider<Keys>
{
  constructor(private readonly flags: FlagMap<Keys>) {}

  async initialize(
    _parser?: (input: unknown) => FlagMap<Keys>,
  ): Promise<void> {}

  isEnabled(key: Keys): boolean {
    return this.flags[key] ?? false;
  }
}
