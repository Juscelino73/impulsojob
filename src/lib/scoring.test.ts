import { describe, expect, it } from "vitest";
import { DEFAULT_WEIGHTS, weightedScore } from "./scoring";

describe("match score", () => {
  it("is 100 when every criterion is perfect", () => {
    const all = Object.keys(DEFAULT_WEIGHTS).map((k) => ({ key: k as never, score: 100 }));
    expect(weightedScore(all)).toBe(100);
  });
  it("weights required skills more than education", () => {
    const a = weightedScore([
      { key: "required_skills", score: 100 },
      { key: "education", score: 0 },
    ]);
    const b = weightedScore([
      { key: "required_skills", score: 0 },
      { key: "education", score: 100 },
    ]);
    expect(a).toBeGreaterThan(b);
  });
  it("clamps out-of-range scores to 0-100", () => {
    expect(weightedScore([{ key: "experience", score: 250 }])).toBe(100);
    expect(weightedScore([{ key: "experience", score: -20 }])).toBe(0);
  });
});
