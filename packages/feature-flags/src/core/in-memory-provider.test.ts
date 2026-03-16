import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryFlagProvider } from "./in-memory-provider";

type AppFlags = "darkMode" | "newDashboard" | "betaFeature";

describe("InMemoryFlagProvider", () => {
  describe("isEnabled", () => {
    it("returns true for an enabled flag", async () => {
      const provider = new InMemoryFlagProvider<AppFlags>({
        darkMode: true,
        newDashboard: false,
        betaFeature: false,
      });
      await provider.initialize();
      assert.equal(provider.isEnabled("darkMode"), true);
    });

    it("returns false for a disabled flag", async () => {
      const provider = new InMemoryFlagProvider<AppFlags>({
        darkMode: false,
        newDashboard: false,
        betaFeature: false,
      });
      await provider.initialize();
      assert.equal(provider.isEnabled("darkMode"), false);
    });

    it("is synchronous — no await required", () => {
      const provider = new InMemoryFlagProvider<AppFlags>({
        darkMode: true,
        newDashboard: false,
        betaFeature: true,
      });
      assert.equal(provider.isEnabled("betaFeature"), true);
      assert.equal(provider.isEnabled("newDashboard"), false);
    });
  });

  describe("initialize", () => {
    it("accepts a parser callback (no-op for in-memory, but must not throw)", async () => {
      const provider = new InMemoryFlagProvider<AppFlags>({
        darkMode: true,
        newDashboard: false,
        betaFeature: false,
      });
      const parser = (input: unknown) =>
        input as Record<AppFlags, boolean>;
      await assert.doesNotReject(() => provider.initialize(parser));
    });
  });
});

