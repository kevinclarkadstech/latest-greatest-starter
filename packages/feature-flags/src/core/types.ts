export type FlagMap<Keys extends string> = Record<Keys, boolean>;

export interface FlagProvider<Keys extends string> {
  initialize(parser?: (input: unknown) => FlagMap<Keys>): Promise<void>;
  isEnabled(key: Keys): boolean;
}
