import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../lifecycle.jsx", import.meta.url), "utf8");
const sandbox = {
  window: {},
  console,
  Date,
  JSON,
  Math,
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const lifecycle = sandbox.window.RU_LIFECYCLE;
assert.ok(lifecycle, "RU_LIFECYCLE must be exposed");
assert.deepEqual(Object.keys(lifecycle.STAGES), ["X", "Y1", "Y2", "Y3", "Y4", "Z1", "Z2"]);

const base = {
  cost: {
    monthlyRent: {
      value: 13500,
      disclosureStatus: "disclosed",
      sourceType: "listing",
      eventId: "legacy-x",
    },
  },
};
const event = lifecycle.createEvent({
  stage: "Y3",
  values: {
    eventType: "negotiation_reply",
    "cost.monthlyRent": "14000",
    "progress.landlordResponse": "房東表示租金為 14,000 元",
  },
  sourceType: "landlord_statement",
  currentSnapshot: base,
  existingEvents: [],
  occurredAt: "2026-07-18T12:00:00.000Z",
});

assert.equal(event.displayCode, "Y3-01");
assert.equal(event.cumulativeRhirSnapshot.cost.monthlyRent.value, 14000);
assert.equal(event.cumulativeRhirSnapshot.cost.monthlyRent.disclosureStatus, "conflict");
assert.equal(event.cumulativeRhirSnapshot.cost.monthlyRent.conflicts[0].value, 13500);
assert.equal(event.cumulativeRhirSnapshot.progress.landlordResponse.value, "房東表示租金為 14,000 元");
assert.match(event.snapshotHash, /^ru1-[0-9a-f]{8}$/);

const missing = lifecycle.getMissingPrerequisites("Y4", event.cumulativeRhirSnapshot);
assert.equal(missing.length, 0, "Y4 prerequisite should be satisfied by landlord response");

const legacy = lifecycle.legacyVersionsToEvents(
  [{ id: "X-1", label: "X-1", title: "補件" }, { id: "X", label: "X", title: "初始" }],
  base
);
assert.equal(legacy.length, 2);
assert.equal(legacy[0].substage, "X");
assert.equal(legacy.at(-1).cumulativeRhirSnapshot.cost.monthlyRent.value, 13500);

console.log("XYZ lifecycle contract tests passed.");
