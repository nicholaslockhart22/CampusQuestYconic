import test from "node:test";
import assert from "node:assert/strict";
import { applyActivityReward, computeLevel, mergeStats } from "../src/rewards.js";

test("applyActivityReward grants deterministic XP and stat updates", () => {
  const user = {
    totalXp: 0,
    stats: {
      focus: 0,
      knowledge: 0,
      strength: 0,
      social: 0,
      momentum: 0
    }
  };

  const result = applyActivityReward(user, "study");

  assert.equal(result.xpDelta, 120);
  assert.equal(result.totalXp, 120);
  assert.equal(result.level, 1);
  assert.equal(result.stats.knowledge, 10);
  assert.equal(result.stats.focus, 8);
});

test("computeLevel increases every 250 xp", () => {
  assert.equal(computeLevel(0), 1);
  assert.equal(computeLevel(249), 1);
  assert.equal(computeLevel(250), 2);
  assert.equal(computeLevel(750), 4);
});

test("mergeStats preserves missing keys", () => {
  const result = mergeStats({ focus: 4 }, { momentum: 2 });
  assert.equal(result.focus, 4);
  assert.equal(result.momentum, 2);
  assert.equal(result.knowledge, 0);
});
