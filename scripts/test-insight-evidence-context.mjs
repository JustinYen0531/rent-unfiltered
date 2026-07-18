import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const insightSource = fs.readFileSync(path.join(rootDir, "insight.jsx"), "utf8");
const context = {
  window: {
    RU: {
      getStoredApiKey: () => ""
    },
    location: {
      origin: "https://rent-unfiltered.local"
    }
  },
  fetch: async () => {
    throw new Error("context contract test must not call the AI API");
  },
  console
};

vm.runInNewContext(insightSource, context);

const evidenceContext = {
  retrievalMode: "deterministic-exact-v1",
  fallbackUsed: false,
  findings: [{
    query: {
      rhirField: "cost.electricityRate",
      disclosureStatus: "conflict",
      riskType: "electricity_overcharge"
    },
    totalMatches: 1,
    cases: [{
      id: "gov_electricity_test_001",
      title: "電費計價爭議案例",
      year: 2025,
      sourceType: "gov",
      sourceName: "政府案例",
      sourceUrl: "https://example.com/case",
      summary: "契約與實際電費計價方式不一致。",
      commonOutcome: "入住後發生電費爭議",
      actionHints: ["要求確認每度電價與計算方式"],
      evidenceToKeep: ["契約電費條款", "電費帳單"],
      confidence: "high",
      matchedMapping: {
        rhirField: "cost.electricityRate",
        disclosureStatus: "conflict",
        riskType: "electricity_overcharge",
        mappingNote: "verified mapping"
      }
    }]
  }],
  uniqueCases: [{ id: "must_not_be_duplicated" }],
  planner: { totalQueryCount: 1 }
};

const rriResult = {
  totalScore: 55,
  scoreRange: { min: 45, max: 65 },
  riskLevel: "中風險",
  topRiskDimensions: ["費用透明度"],
  topIssues: ["電費資訊衝突"],
  conflictFields: ["cost.electricityRate"],
  uncertainFields: [],
  suggestedQuestions: []
};

const payload = context.window.RU_INSIGHT.buildPromptPayload(
  rriResult,
  null,
  evidenceContext
);
const parsed = JSON.parse(payload.user);

assert.equal(parsed.evidenceContext.retrievalMode, "deterministic-exact-v1");
assert.equal(parsed.evidenceContext.fallbackUsed, false);
assert.equal(parsed.evidenceContext.findings.length, 1);
assert.equal(parsed.evidenceContext.findings[0].cases.length, 1);
assert.equal(parsed.evidenceContext.findings[0].cases[0].id, "gov_electricity_test_001");
assert.equal(parsed.evidenceContext.uniqueCases, undefined);
assert.equal(parsed.evidenceContext.planner, undefined);
assert.match(payload.system, /evidenceReferences/);
assert.match(payload.system, /verified Related Cases/);

const validOutput = context.window.RU_INSIGHT.validateEvidenceReferences({
  evidenceReferences: [{
    caseId: "gov_electricity_test_001",
    title: "電費計價爭議案例",
    relevance: "電費條件同樣出現來源衝突。"
  }]
}, evidenceContext);
assert.equal(validOutput.evidenceReferences.length, 1);

assert.throws(() => {
  context.window.RU_INSIGHT.validateEvidenceReferences({
    evidenceReferences: [{
      caseId: "invented_case_999",
      title: "不存在的案例",
      relevance: "模型虛構的案例。"
    }]
  }, evidenceContext);
}, /evidence context 以外的案例/);

assert.throws(() => {
  context.window.RU_INSIGHT.validateEvidenceReferences({
    evidenceReferences: []
  }, evidenceContext);
}, /沒有提供案例引用/);

const emptyPayload = context.window.RU_INSIGHT.buildPromptPayload(rriResult, null, {
  retrievalMode: "deterministic-exact-v1",
  fallbackUsed: false,
  findings: []
});
const emptyParsed = JSON.parse(emptyPayload.user);
assert.deepEqual(emptyParsed.evidenceContext.findings, []);

console.log("AI Insight evidence context 契約驗證通過");
console.log("- verified case context：已包含");
console.log("- UI 重複資料：未送入 prompt");
console.log("- 空案例 context：合法");
console.log("- 虛構案例引用：已阻擋");
console.log("- AI API：未呼叫");
