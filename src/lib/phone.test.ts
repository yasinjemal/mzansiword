import { describe, expect, it } from "vitest";
import { normalizeSaPhone } from "./phone";

describe("normalizeSaPhone", () => {
  it("normalizes local, international and prefixed formats", () => {
    expect(normalizeSaPhone("073 123 4567")).toBe("+27731234567");
    expect(normalizeSaPhone("0731234567")).toBe("+27731234567");
    expect(normalizeSaPhone("27731234567")).toBe("+27731234567");
    expect(normalizeSaPhone("+27 73 123 4567")).toBe("+27731234567");
    expect(normalizeSaPhone("073-123-4567")).toBe("+27731234567");
  });

  it("rejects wrong lengths and non-numbers", () => {
    expect(normalizeSaPhone("073 123 456")).toBeNull();
    expect(normalizeSaPhone("073 123 45678")).toBeNull();
    expect(normalizeSaPhone("hello")).toBeNull();
    expect(normalizeSaPhone("+44 20 7946 0958")).toBeNull();
    expect(normalizeSaPhone("0031234567")).toBeNull(); // 0 after trunk prefix
  });
});
