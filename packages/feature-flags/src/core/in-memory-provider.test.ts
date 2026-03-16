import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryFlagProvider } from "./in-memory-provider";

describe("InMemoryFlagProvider", () => {
  describe("getBooleanValue", () => {
    it("returns the stored boolean flag value", async () => {
      const provider = new InMemoryFlagProvider({ myFlag: true });
      await provider.initialize();
      assert.equal(await provider.getBooleanValue("myFlag", false), true);
    });

    it("returns the default value when the key is not found", async () => {
      const provider = new InMemoryFlagProvider({});
      await provider.initialize();
      assert.equal(await provider.getBooleanValue("missing", false), false);
    });

    it("returns the default value when the stored value is not a boolean", async () => {
      const provider = new InMemoryFlagProvider({ myFlag: "not-a-boolean" });
      await provider.initialize();
      assert.equal(await provider.getBooleanValue("myFlag", true), true);
    });
  });

  describe("getStringValue", () => {
    it("returns the stored string flag value", async () => {
      const provider = new InMemoryFlagProvider({ theme: "dark" });
      await provider.initialize();
      assert.equal(await provider.getStringValue("theme", "light"), "dark");
    });

    it("returns the default value when the key is not found", async () => {
      const provider = new InMemoryFlagProvider({});
      await provider.initialize();
      assert.equal(await provider.getStringValue("missing", "default"), "default");
    });

    it("returns the default value when the stored value is not a string", async () => {
      const provider = new InMemoryFlagProvider({ theme: 42 });
      await provider.initialize();
      assert.equal(await provider.getStringValue("theme", "light"), "light");
    });
  });

  describe("getNumberValue", () => {
    it("returns the stored number flag value", async () => {
      const provider = new InMemoryFlagProvider({ maxRetries: 5 });
      await provider.initialize();
      assert.equal(await provider.getNumberValue("maxRetries", 3), 5);
    });

    it("returns the default value when the key is not found", async () => {
      const provider = new InMemoryFlagProvider({});
      await provider.initialize();
      assert.equal(await provider.getNumberValue("missing", 0), 0);
    });

    it("returns the default value when the stored value is not a number", async () => {
      const provider = new InMemoryFlagProvider({ maxRetries: "five" });
      await provider.initialize();
      assert.equal(await provider.getNumberValue("maxRetries", 3), 3);
    });
  });

  it("works with an empty flags object by default", async () => {
    const provider = new InMemoryFlagProvider();
    await provider.initialize();
    assert.equal(await provider.getBooleanValue("anyFlag", false), false);
  });
});
