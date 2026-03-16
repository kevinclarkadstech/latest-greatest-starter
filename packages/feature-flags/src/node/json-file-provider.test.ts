import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { JsonFileFlagProvider } from "./json-file-provider";

describe("JsonFileFlagProvider", () => {
  async function withTempFile(
    flags: Record<string, unknown>,
    fn: (filePath: string) => Promise<void>,
  ): Promise<void> {
    const filePath = join(tmpdir(), `flags-${Date.now()}.json`);
    await writeFile(filePath, JSON.stringify(flags), "utf-8");
    try {
      await fn(filePath);
    } finally {
      await unlink(filePath);
    }
  }

  describe("initialize", () => {
    it("loads flags from a JSON file", async () => {
      await withTempFile({ featureA: true }, async (filePath) => {
        const provider = new JsonFileFlagProvider(filePath);
        await provider.initialize();
        assert.equal(await provider.getBooleanValue("featureA", false), true);
      });
    });

    it("throws when the file does not exist", async () => {
      const provider = new JsonFileFlagProvider("/nonexistent/path/flags.json");
      await assert.rejects(() => provider.initialize());
    });

    it("throws a descriptive error when the file contains invalid JSON", async () => {
      const filePath = join(tmpdir(), `flags-invalid-${Date.now()}.json`);
      await writeFile(filePath, "{ not valid json }", "utf-8");
      try {
        const provider = new JsonFileFlagProvider(filePath);
        await assert.rejects(
          () => provider.initialize(),
          (err: Error) => {
            assert.ok(err.message.includes("invalid JSON"));
            return true;
          },
        );
      } finally {
        await unlink(filePath);
      }
    });
  });

  describe("getBooleanValue", () => {
    it("returns the flag value from the JSON file", async () => {
      await withTempFile({ darkMode: false }, async (filePath) => {
        const provider = new JsonFileFlagProvider(filePath);
        await provider.initialize();
        assert.equal(await provider.getBooleanValue("darkMode", true), false);
      });
    });

    it("returns the default value when the key is absent", async () => {
      await withTempFile({}, async (filePath) => {
        const provider = new JsonFileFlagProvider(filePath);
        await provider.initialize();
        assert.equal(await provider.getBooleanValue("missing", true), true);
      });
    });
  });

  describe("getStringValue", () => {
    it("returns the flag value from the JSON file", async () => {
      await withTempFile({ region: "us-east-1" }, async (filePath) => {
        const provider = new JsonFileFlagProvider(filePath);
        await provider.initialize();
        assert.equal(
          await provider.getStringValue("region", "us-west-2"),
          "us-east-1",
        );
      });
    });

    it("returns the default value when the key is absent", async () => {
      await withTempFile({}, async (filePath) => {
        const provider = new JsonFileFlagProvider(filePath);
        await provider.initialize();
        assert.equal(await provider.getStringValue("missing", "default"), "default");
      });
    });
  });

  describe("getNumberValue", () => {
    it("returns the flag value from the JSON file", async () => {
      await withTempFile({ rateLimit: 100 }, async (filePath) => {
        const provider = new JsonFileFlagProvider(filePath);
        await provider.initialize();
        assert.equal(await provider.getNumberValue("rateLimit", 50), 100);
      });
    });

    it("returns the default value when the key is absent", async () => {
      await withTempFile({}, async (filePath) => {
        const provider = new JsonFileFlagProvider(filePath);
        await provider.initialize();
        assert.equal(await provider.getNumberValue("missing", 10), 10);
      });
    });
  });
});
