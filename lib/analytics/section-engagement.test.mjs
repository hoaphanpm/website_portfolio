import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { SectionEngagement } from "./section-engagement.ts";

const SECTIONS = ["overview", "problem", "evidence"].map((id, i) => ({
  id,
  index: i + 1,
}));
const make = (now = 0) =>
  new SectionEngagement({ idleMs: 60_000, minSendMs: 1000, sections: SECTIONS, now });
const S = 1000;

test("accumulates active time and sends it when leaving the section", () => {
  const e = make();
  e.setVisibility("overview", 600, true, 0);
  e.interaction(5 * S);
  const out = e.setVisibility("overview", 0, false, 10 * S);
  assert.deepEqual(out, [
    { section_id: "overview", section_index: 1, engagement_seconds: 10 },
  ]);
});

test("hidden tab stops counting and flushes", () => {
  const e = make();
  e.setVisibility("overview", 600, true, 0);
  const out = e.setPageVisible(false, 8 * S);
  assert.equal(out[0].engagement_seconds, 8);
  e.interaction(100 * S);
  assert.deepEqual(e.flushAll(200 * S), []); // 192s hidden credited nothing
  e.setPageVisible(true, 300 * S);
  assert.deepEqual(e.flushAll(302 * S).map((p) => p.engagement_seconds), [2]);
});

test("idle time is capped at idleMs after the last interaction", () => {
  const e = make();
  e.setVisibility("overview", 600, true, 0);
  const out = e.flushAll(600 * S); // 10 minutes with no input
  assert.equal(out[0].engagement_seconds, 60);
  // Idle stretch is gone for good: a late interaction does not back-fill it.
  e.interaction(900 * S);
  assert.deepEqual(e.flushAll(905 * S).map((p) => p.engagement_seconds), [5]);
});

test("only the dominant of overlapping sections accrues time", () => {
  const e = make();
  e.setVisibility("overview", 300, true, 0);
  e.setVisibility("problem", 500, true, 0); // larger share wins
  e.interaction(1 * S);
  const out = e.flushAll(10 * S);
  assert.deepEqual(
    out.map((p) => [p.section_id, p.engagement_seconds]),
    [["problem", 10]],
  );
});

test("overlap ties go to the lower index; total never exceeds wall time", () => {
  const e = make();
  e.setVisibility("problem", 400, true, 0);
  e.setVisibility("overview", 400, true, 0);
  e.setVisibility("overview", 0, false, 4 * S);
  e.setVisibility("evidence", 400, true, 4 * S);
  const out = [...e.flushAll(10 * S)];
  const total = out.reduce((n, p) => n + p.engagement_seconds, 4);
  assert.ok(total <= 10);
});

test("revisiting a section accumulates; each event carries the new delta", () => {
  const e = make();
  e.setVisibility("overview", 600, true, 0);
  const first = e.setVisibility("problem", 900, true, 3 * S); // leaves overview
  assert.equal(first[0].engagement_seconds, 3);
  e.setVisibility("problem", 0, false, 6 * S); // problem 3s
  e.setVisibility("overview", 600, true, 6 * S);
  const again = e.flushAll(10 * S);
  assert.deepEqual(
    again.map((p) => [p.section_id, p.engagement_seconds]),
    [["overview", 4]],
  );
});

test("sub-second and zero durations are never sent but are not lost", () => {
  const e = make();
  e.setVisibility("overview", 600, true, 0);
  assert.deepEqual(e.setVisibility("overview", 0, false, 400), []);
  e.setVisibility("overview", 600, true, 1000);
  const out = e.flushAll(1800); // 0.4 + 0.8 = 1.2s total
  assert.deepEqual(out.map((p) => p.engagement_seconds), [1.2]);
  assert.deepEqual(e.flushAll(1900), []);
});

test("ineligible sections, unknown ids and an empty tracker send nothing", () => {
  const e = make();
  e.setVisibility("overview", 600, false, 0);
  assert.deepEqual(e.setVisibility("nope", 600, true, 0), []);
  assert.deepEqual(e.flushAll(30 * S), []);
});

test("a flush is idempotent: nothing is sent twice", () => {
  const e = make();
  e.setVisibility("overview", 600, true, 0);
  assert.equal(e.flushAll(5 * S).length, 1);
  assert.equal(e.flushAll(5 * S).length, 0);
  assert.equal(e.setPageVisible(false, 5 * S).length, 0);
});

test("clock going backwards never produces negative or NaN durations", () => {
  const e = make(10 * S);
  e.setVisibility("overview", 600, true, 10 * S);
  const out = e.flushAll(5 * S);
  assert.deepEqual(out, []);
});

test("page that starts hidden accrues nothing until visible", () => {
  const e = make();
  e.setPageVisible(false, 0);
  e.setVisibility("overview", 600, true, 0);
  assert.deepEqual(e.flushAll(30 * S), []);
  e.setPageVisible(true, 30 * S);
  assert.equal(e.flushAll(33 * S)[0].engagement_seconds, 3);
});

// Case completion is deliberately unchanged; these pin its contract.
const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const configs = {
  momo: read("../../components/case-study/momo/momo-config.ts"),
  vpbank: read("../../components/case-study/vpbank/vpbank-config.ts"),
};
const sectionSrc = {
  momo: read("../../components/case-study/momo/momo-section.tsx"),
  vpbank: read("../../components/case-study/vpbank/vpbank-section.tsx"),
};

for (const [name, caseId] of [
  ["momo", "momo-salary-v2"],
  ["vpbank", "vpbank-ai-debt-management-v2"],
]) {
  test(`${name}: completion is the last section and uses the real case id`, () => {
    assert.match(configs[name], /COMPLETION_SECTION = "reflection"/);
    assert.ok(configs[name].includes(`CASE_ID = "${caseId}"`));
    const order = name === "momo"
      ? configs.momo
      : read("../../components/case-study/vpbank/vpbank-case-study.tsx");
    assert.match(order, /"reflection",?\s*\]/); // reflection is last in the order
  });

  test(`${name}: completion fires only after the section view was sent`, () => {
    const src = sectionSrc[name];
    const viewed = src.indexOf("CASE_SECTION_VIEWED");
    const sentGuard = src.indexOf("if (!sent) return;");
    const completed = src.indexOf("CASE_STUDY_COMPLETED");
    assert.ok(viewed > 0 && viewed < sentGuard && sentGuard < completed);
    assert.equal(src.split("CASE_STUDY_COMPLETED").length - 1, 1);
    assert.match(src, /sectionId === completionSectionId/);
    assert.match(src, /if \(hasTrackedOnce\(dedupKey\)\) return;/); // once per session
  });

  test(`${name}: engagement uses the page's canonical section ids`, () => {
    const page = read(`../../components/case-study/${name}/${name}-case-study.tsx`);
    assert.match(page, /<SectionEngagementTracker/);
  });
}

test("the Experiment section id and label are preserved", () => {
  assert.match(configs.momo, /"experiment",/);
  assert.match(configs.momo, /experiment: "Experiment"/);
  assert.doesNotMatch(read("section-engagement.ts"), /experience/);
});

test("engagement events go through the shared gate (internal QA exclusion)", () => {
  const tracker = read("../../components/analytics/section-engagement-tracker.tsx");
  assert.match(tracker, /attemptTrackedEvent\(/);
  assert.doesNotMatch(tracker, /mixpanel/);
  const service = read("service.ts");
  const attempt = service.slice(service.indexOf("export function attemptTrackedEvent"));
  assert.ok(
    attempt.indexOf("isInternalQaMode()") < attempt.indexOf("ensureAnalyticsReady"),
  );
  // UTM + device_type come from trackEvent's shared payload.
  assert.match(service, /\.\.\.sessionUtm,\s*\.\.\.properties,\s*device_type/);
});
