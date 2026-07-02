import { describe, expect, it } from "vitest";
import {
  addDays,
  msUntilNextSastMidnight,
  puzzleNumber,
  sastToday,
  sastYesterday,
  LAUNCH_DATE,
} from "./time";

describe("sastToday", () => {
  it("is the SAST date, not the UTC date, just before SAST midnight", () => {
    // 21:59:59 UTC = 23:59:59 SAST -> still the same SAST day as the UTC day
    expect(sastToday(new Date("2026-07-02T21:59:59Z"))).toBe("2026-07-02");
  });

  it("rolls to the next day at 22:00 UTC (SAST midnight)", () => {
    expect(sastToday(new Date("2026-07-02T22:00:01Z"))).toBe("2026-07-03");
  });

  it("is ahead of UTC in the late SAST evening across month ends", () => {
    expect(sastToday(new Date("2026-06-30T23:30:00Z"))).toBe("2026-07-01");
  });
});

describe("sastYesterday", () => {
  it("is one day before sastToday", () => {
    const now = new Date("2026-07-02T22:00:01Z"); // SAST 2026-07-03 00:00:01
    expect(sastYesterday(now)).toBe("2026-07-02");
  });

  it("crosses month boundaries", () => {
    const now = new Date("2026-07-01T05:00:00Z"); // SAST 2026-07-01 07:00
    expect(sastYesterday(now)).toBe("2026-06-30");
  });
});

describe("msUntilNextSastMidnight", () => {
  it("is 1s one second before SAST midnight", () => {
    expect(msUntilNextSastMidnight(new Date("2026-07-02T21:59:59Z"))).toBe(
      1000,
    );
  });

  it("is a full day exactly at SAST midnight", () => {
    expect(msUntilNextSastMidnight(new Date("2026-07-02T22:00:00Z"))).toBe(
      24 * 3600 * 1000,
    );
  });

  it("counts down from earlier in the UTC day", () => {
    expect(msUntilNextSastMidnight(new Date("2026-07-02T10:00:00Z"))).toBe(
      12 * 3600 * 1000,
    );
  });
});

describe("addDays / puzzleNumber", () => {
  it("adds days across month ends", () => {
    expect(addDays("2026-06-30", 1)).toBe("2026-07-01");
    expect(addDays("2026-07-01", 89)).toBe("2026-09-28");
  });

  it("numbers launch day as #1", () => {
    expect(puzzleNumber(LAUNCH_DATE)).toBe(1);
    expect(puzzleNumber(addDays(LAUNCH_DATE, 46))).toBe(47);
  });
});
