import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { JsonFileFlagProvider } from "./json-file-provider";

type AppFlags = "featureA" | "darkMode" | "betaSearch";

describe("JsonFileFlagProvider", () => {
  async function withTempFile(
    content: string,
    fn: (filePath: string) => Promise<void>,
  ): Promise<void> {
    const filePath = join(tmpdir(), `flags-${Date.now()}.json`);
    await writeFile(filePath, content, "utf-8");
    try {
      await fn(filePath);
    } finally {
      await unlink(filePath);
    }
  }

  function withFlagsFile(
    flags: Record<AppFlags, boolean>,
    fn: (filePath: string) => Promise<void>,
  ) {
    return withTempFile(JSON.stringify(flags), fn);
  }

  describe("initialize", () => {
    it("loads flags from a JSON file", async () => {
      await withFlagsFile(
        { featureA: true, darkMode: false, betaSearch: false },
        async (filePath) => {
          const provider = new JsonFileFlagProvider<AppFlags>(filePath);
          await provider.initialize();
          assert.equal(provider.isEnabled("featureA"), true);
          assert.equal(provider.isEnabled("darkMode"), false);
        },
      );
    });

    it("throws when the file does not exist", async () => {
      const provider = new JsonFileFlagProvider<AppFlags>(
        "/nonexistent/path/flags.json",
      );
      await assert.rejects(() => provider.initialize());
    });

    it("throws a descriptive error when the file contains invalid JSON", async () => {
      await withTempFile("{ not valid json }", async (filePath) => {
        const provider = new JsonFileFlagProvider<AppFlags>(filePath);
        await assert.rejects(
          () => provider.initialize(),
          (err: Error) => {
            assert.ok(err.message.includes("invalid JSON"));
            return true;
          },
        );
      });
    });

    it("throws when the default parser receives a non-object JSON value", async () => {
      await withTempFile("[true, false]", async (filePath) => {
        const provider = new JsonFileFlagProvider<AppFlags>(filePath);
        await assert.rejects(
          () => provider.initialize(),
          (err: Error) => {
            assert.ok(err.message.includes("JSON object"));
            return true;
          },
        );
      });
    });

    it("uses a custom parser to validate the shape", async () => {
      await withFlagsFile(
        { featureA: true, darkMode: true, betaSearch: false },
        async (filePath) => {
          const parser = (input: unknown): Record<AppFlags, boolean> => {
            if (
              typeof input !== "object" ||
              input === null ||
              Array.isArray(input)
            ) {
              throw new Error("Expected an object");
            }
            const obj = input as Record<string, unknown>;
            if (typeof obj["featureA"] !== "boolean") {
              throw new Error("featureA must be boolean");
            }
            return input as Record<AppFlags, boolean>;
          };
          const provider = new JsonFileFlagProvider<AppFlags>(filePath);
          await provider.initialize(parser);
          assert.equal(provider.isEnabled("featureA"), true);
        },
      );
    });

    it("propagates errors thrown by a custom parser", async () => {
      await withFlagsFile(
        { featureA: true, darkMode: false, betaSearch: false },
        async (filePath) => {
          const strictParser = (_input: unknown): Record<AppFlags, boolean> => {
            throw new Error("Schema validation failed");
          };
          const provider = new JsonFileFlagProvider<AppFlags>(filePath);
          await assert.rejects(
            () => provider.initialize(strictParser),
            (err: Error) => {
              assert.ok(err.message.includes("Schema validation failed"));
              return true;
            },
          );
        },
      );
    });
  });

  describe("isEnabled", () => {
    it("returns true for an enabled flag", async () => {
      await withFlagsFile(
        { featureA: true, darkMode: false, betaSearch: false },
        async (filePath) => {
          const provider = new JsonFileFlagProvider<AppFlags>(filePath);
          await provider.initialize();
          assert.equal(provider.isEnabled("featureA"), true);
        },
      );
    });

    it("returns false for a disabled flag", async () => {
      await withFlagsFile(
        { featureA: false, darkMode: false, betaSearch: false },
        async (filePath) => {
          const provider = new JsonFileFlagProvider<AppFlags>(filePath);
          await provider.initialize();
          assert.equal(provider.isEnabled("featureA"), false);
        },
      );
    });

    it("is synchronous after initialize", async () => {
      await withFlagsFile(
        { featureA: true, darkMode: false, betaSearch: true },
        async (filePath) => {
          const provider = new JsonFileFlagProvider<AppFlags>(filePath);
          await provider.initialize();
          const result = provider.isEnabled("betaSearch");
          assert.equal(result, true);
        },
      );
    });
  });
});

