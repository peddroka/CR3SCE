import { describe, expect, it } from "vitest";
import { invertSilences } from "@/lib/silence-detect";

describe("invertSilences", () => {
  it("returns the entire video when there are no silences", () => {
    const segments = invertSilences([], 10);
    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ start: 0, end: 10, duration: 10 });
  });

  it("inverts a single mid-video silence into two interesting segments", () => {
    const silences = [{ start: 4, end: 6, duration: 2 }];
    const segments = invertSilences(silences, 10);

    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({ start: 0, end: 4, duration: 4 });
    expect(segments[1]).toMatchObject({ start: 6, end: 10, duration: 4 });
  });

  it("skips leading silence", () => {
    const silences = [
      { start: 0, end: 2, duration: 2 },
      { start: 6, end: 7, duration: 1 },
    ];
    const segments = invertSilences(silences, 10);
    // First segment after leading silence
    expect(segments[0].start).toBe(2);
  });

  it("drops trailing silence", () => {
    const silences = [{ start: 8, end: 10, duration: 2 }];
    const segments = invertSilences(silences, 10);
    expect(segments).toHaveLength(1);
    expect(segments[0].end).toBe(8);
  });

  it("ignores tiny non-silent gaps below minSegmentDuration", () => {
    const silences = [
      { start: 0, end: 1, duration: 1 },
      { start: 1.2, end: 5, duration: 3.8 }, // only 0.2s gap between
    ];
    const segments = invertSilences(silences, 10, 0.5);
    // The 0.2s gap should be dropped
    expect(segments.find((s) => s.start === 1 && s.end === 1.2)).toBeUndefined();
  });

  it("handles overlapping silences without negative durations", () => {
    const silences = [
      { start: 2, end: 5, duration: 3 },
      { start: 4, end: 7, duration: 3 }, // overlap
    ];
    const segments = invertSilences(silences, 10);
    for (const s of segments) {
      expect(s.duration).toBeGreaterThanOrEqual(0);
      expect(s.end).toBeGreaterThanOrEqual(s.start);
    }
  });

  it("returns empty when video is entirely silent", () => {
    const silences = [{ start: 0, end: 10, duration: 10 }];
    const segments = invertSilences(silences, 10);
    expect(segments).toEqual([]);
  });
});
