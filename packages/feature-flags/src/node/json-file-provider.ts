import { readFile } from "fs/promises";
import type { FlagMap, FlagProvider } from "../core";
import { defaultParse } from "../core";

export class JsonFileFlagProvider<Keys extends string>
  implements FlagProvider<Keys>
{
  private flags: FlagMap<Keys> = {} as FlagMap<Keys>;

  constructor(private readonly filePath: string) {}

  async initialize(
    parser: (input: unknown) => FlagMap<Keys> = defaultParse,
  ): Promise<void> {
    const content = await readFile(this.filePath, "utf-8");
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch (err) {
      throw new Error(
        `Failed to parse feature flags from "${this.filePath}": file contains invalid JSON — ${String(err)}`,
      );
    }
    this.flags = parser(raw);
  }

  isEnabled(key: Keys): boolean {
    return this.flags[key] ?? false;
  }
}
