import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../rri.jsx", import.meta.url), "utf8");
const context = { window: {}, console };
vm.runInNewContext(source, context);

const result = context.window.RU_RRI.calculate({
  progress: {
    paymentPressure: {
      value: "今晚前先匯訂金",
      disclosureStatus: "disclosed",
    },
  },
}, { stage: "Y3" });

assert.equal(result.stageAssessment.stage, "Y3");
assert.equal(result.stageAssessment.ruleVersion, "xyz-stage-v1");
assert.ok(result.stageAssessment.findings.some(item => item.riskType === "payment_pressure"));

const y4 = context.window.RU_RRI.buildStageAssessment({}, "Y4");
assert.deepEqual(
  Array.from(y4.findings, item => item.rhirField),
  ["contract.lessorAuthority", "leaseTerms.specialClauses", "payment.preContractStatus"]
);

console.log("XYZ stage RRI rules passed.");
