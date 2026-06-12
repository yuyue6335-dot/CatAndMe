import { describe, expect, it } from "vitest";
import { webcrypto } from "node:crypto";
import { snapshotToJSON, jsonToSnapshot } from "@/lib/bundle";
import { encryptJSON, decryptJSON } from "@/lib/crypto";

Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  configurable: true
});

describe("bundle", () => {
  it("exports and imports snapshots", async () => {
    const json = await snapshotToJSON({
      memories: [],
      places: [],
      comments: [],
      tags: [],
      memoryTags: [],
      photos: []
    });

    const parsed = jsonToSnapshot(json);
    expect(parsed.version).toBe(1);
  });

  it("encrypts and decrypts", async () => {
    const payload = await encryptJSON("{\"hello\":\"world\"}", "secret");
    const plain = await decryptJSON(payload.payload, "secret", payload.salt, payload.iv);
    expect(plain).toContain("hello");
  });
});
