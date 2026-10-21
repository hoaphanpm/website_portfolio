// Run with: npm test  (Node's built-in test runner; no extra dependencies)
import assert from "node:assert/strict";
import test from "node:test";

import {
  QA_PREVIEW_BRANCH,
  decideTracking,
  isClientHostAllowed,
  isTrackingEnvironmentAllowed,
} from "./environment.ts";

const TOKEN = "qa-token-placeholder"; // not a real token
const qaPreview = {
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: QA_PREVIEW_BRANCH,
  NEXT_PUBLIC_MIXPANEL_QA_PREVIEW: "true",
  NEXT_PUBLIC_MIXPANEL_TOKEN: TOKEN,
};
const ok = { isAdmin: false, previewQuery: false };

test("Production, QA flag absent: allowed (existing behaviour)", () => {
  assert.equal(isTrackingEnvironmentAllowed({ VERCEL_ENV: "production" }), true);
  assert.equal(decideTracking({ VERCEL_ENV: "production" }, ok), true);
});

test("Production, QA flag true: unchanged; branch and token are irrelevant", () => {
  const env = { VERCEL_ENV: "production", NEXT_PUBLIC_MIXPANEL_QA_PREVIEW: "true", VERCEL_GIT_COMMIT_REF: "main" };
  assert.equal(isTrackingEnvironmentAllowed(env), true);
  assert.equal(decideTracking(env, ok), true);
});

test("Production keeps its admin and ?preview=true exclusions", () => {
  const env = { VERCEL_ENV: "production" };
  assert.equal(decideTracking(env, { isAdmin: true, previewQuery: false }), false);
  assert.equal(decideTracking(env, { isAdmin: false, previewQuery: true }), false);
});

test("Preview, QA flag absent / false / invalid: OFF", () => {
  for (const flag of [undefined, "", "false", "TRUE", "True", "1", "yes", " true", "true "]) {
    const env = { ...qaPreview, NEXT_PUBLIC_MIXPANEL_QA_PREVIEW: flag };
    assert.equal(isTrackingEnvironmentAllowed(env), false, `flag=${JSON.stringify(flag)}`);
    assert.equal(decideTracking(env, ok), false);
  }
});

test("Integration Preview, QA flag true, valid token: allowed", () => {
  assert.equal(isTrackingEnvironmentAllowed(qaPreview), true);
  assert.equal(decideTracking(qaPreview, ok), true);
});

test("Integration Preview, QA flag true, missing/blank token: OFF", () => {
  for (const token of [undefined, "", "   "]) {
    const env = { ...qaPreview, NEXT_PUBLIC_MIXPANEL_TOKEN: token };
    assert.equal(isTrackingEnvironmentAllowed(env), false);
    assert.equal(decideTracking(env, ok), false);
  }
});

test("Other Preview branch, QA flag true: OFF", () => {
  for (const ref of ["main", "integration/other", "integration/hardcoded-case-studies-2", "feature/integration/hardcoded-case-studies", "INTEGRATION/HARDCODED-CASE-STUDIES"]) {
    assert.equal(isTrackingEnvironmentAllowed({ ...qaPreview, VERCEL_GIT_COMMIT_REF: ref }), false, ref);
  }
});

test("Missing branch identity: OFF (fails closed)", () => {
  assert.equal(isTrackingEnvironmentAllowed({ ...qaPreview, VERCEL_GIT_COMMIT_REF: undefined }), false);
  assert.equal(isTrackingEnvironmentAllowed({ ...qaPreview, VERCEL_GIT_COMMIT_REF: "" }), false);
});

test("Missing or unknown environment identity: OFF", () => {
  for (const vercelEnv of [undefined, "", "development", "staging", "Preview", "PRODUCTION"]) {
    const env = { ...qaPreview, VERCEL_ENV: vercelEnv };
    assert.equal(isTrackingEnvironmentAllowed(env), false, `VERCEL_ENV=${vercelEnv}`);
  }
  assert.equal(isTrackingEnvironmentAllowed({}), false);
});

test("Admin session, QA flag true: OFF", () => {
  assert.equal(decideTracking(qaPreview, { isAdmin: true, previewQuery: false }), false);
});

test("?preview=true, QA flag true: OFF (QA does not bypass it)", () => {
  assert.equal(decideTracking(qaPreview, { isAdmin: false, previewQuery: true }), false);
});

test("Localhost / 127.0.0.1, QA flag true: OFF on the client", () => {
  assert.equal(isClientHostAllowed("localhost", ""), false);
  assert.equal(isClientHostAllowed("127.0.0.1", ""), false);
});

test("Client allows Vercel hostnames; blocks ?preview=true", () => {
  assert.equal(isClientHostAllowed("hoakimphan-portfolio-git-integration.vercel.app", ""), true);
  assert.equal(isClientHostAllowed("hoakimphan-portfolio.vercel.app", "?utm_source=x"), true);
  assert.equal(isClientHostAllowed("hoakimphan-portfolio.vercel.app", "?preview=true"), false);
  assert.equal(isClientHostAllowed("hoakimphan-portfolio.vercel.app", "?preview=false"), true);
});
