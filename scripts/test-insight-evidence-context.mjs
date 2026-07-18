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
assert.match(payload.system, /actionItems/);
assert.match(payload.system, /mixed/);
assert.match(payload.system, /evidence_backed/);
assert.match(payload.system, /ai_assessment/);
assert.match(payload.system, /verified 案例/);

const actionOutput = context.window.RU_INSIGHT.validateEvidenceReferences({
  actionItems: [
    {
      title: "先確認本物件的實際電費",
      rationale: "目前資料出現衝突，需要先釐清。",
      sourceMode: "ai_assessment",
      priority: 1,
      caseReferences: []
    },
    {
      title: "保存電費帳單",
      rationale: "過去案例顯示帳單是釐清計價爭議的重要資料。",
      sourceMode: "evidence_backed",
      priority: 1,
      caseReferences: [{
        caseId: "gov_electricity_test_001",
        title: "電費計價爭議案例",
        relevance: "案例的爭議同樣涉及契約與實際計價不一致。"
      }]
    },
    {
      title: "簽約前把計價方式寫入契約",
      rationale: "本物件的欄位衝突與案例方向一致，應先用書面消除不確定性。",
      sourceMode: "mixed",
      priority: 1,
      caseReferences: [{
        caseId: "gov_electricity_test_001",
        title: "電費計價爭議案例",
        relevance: "案例支持在簽約前確認書面計價方式。"
      }]
    }
  ]
}, evidenceContext);
assert.equal(actionOutput.actionItems.length, 3);
assert.equal(actionOutput.actionItems[0].sourceMode, "mixed");
assert.equal(actionOutput.actionItems[1].sourceMode, "evidence_backed");
assert.equal(actionOutput.actionItems[2].sourceMode, "ai_assessment");
assert.equal(
  actionOutput.actionItems[0].caseReferences[0].sourceUrl,
  "https://example.com/case"
);

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

assert.throws(() => {
  context.window.RU_INSIGHT.validateEvidenceReferences({
    actionItems: [{
      title: "沒有案例卻標成案例支持",
      rationale: "這個輸出不應通過。",
      sourceMode: "evidence_backed",
      priority: 1,
      caseReferences: []
    }]
  }, evidenceContext);
}, /至少需要 1 筆案例引用/);

assert.throws(() => {
  context.window.RU_INSIGHT.validateEvidenceReferences({
    actionItems: [{
      title: "AI 判讀不應偷偷掛案例",
      rationale: "來源標籤必須誠實。",
      sourceMode: "ai_assessment",
      priority: 1,
      caseReferences: [{
        caseId: "gov_electricity_test_001",
        title: "電費計價爭議案例",
        relevance: "不應存在的引用。"
      }]
    }]
  }, evidenceContext);
}, /ai_assessment，不可附帶案例引用/);

const emptyPayload = context.window.RU_INSIGHT.buildPromptPayload(rriResult, null, {
  retrievalMode: "deterministic-exact-v1",
  fallbackUsed: false,
  findings: []
});
const emptyParsed = JSON.parse(emptyPayload.user);
assert.deepEqual(emptyParsed.evidenceContext.findings, []);
const emptyContextOutput = context.window.RU_INSIGHT.validateEvidenceReferences({
  actionItems: [{
    title: "確認目前未揭露資訊",
    rationale: "目前沒有精確案例，僅能依 RRI 的資訊缺口提出確認建議。",
    sourceMode: "ai_assessment",
    priority: 1,
    caseReferences: []
  }]
}, {
  retrievalMode: "deterministic-exact-v1",
  fallbackUsed: false,
  findings: []
});
assert.equal(emptyContextOutput.actionItems[0].sourceMode, "ai_assessment");
assert.equal(emptyContextOutput.actionItems[0].caseReferences.length, 0);

const strategyProfile = {
  rentalGoal: "長期居住",
  moveUrgency: "兩週內",
  budgetFlexibility: "只能小幅調整",
  mustHaveConditions: "必須有獨立電表",
  negotiableConditions: "租金可小幅調整",
  redLines: "拒絕書面確認電費",
  specialNeeds: ["需要租屋補助"],
  personalNote: "通勤時間很重要"
};
const savedInsight = {
  status: "ok",
  insightSummary: "電費揭露衝突應優先確認。",
  actionItems: [{
    title: "要求書面確認電費",
    rationale: "案例與本物件訊號方向一致。",
    sourceMode: "mixed",
    priority: 1,
    caseReferences: [{
      caseId: "gov_electricity_test_001",
      title: "電費計價爭議案例",
      relevance: "同樣涉及契約與實際計價不一致。"
    }]
  }]
};
const strategyContext = context.window.RU_INSIGHT.buildStrategyChatContext(
  rriResult,
  evidenceContext,
  strategyProfile,
  savedInsight,
  null
);
assert.equal(strategyContext.rri.totalScore, 55);
assert.equal(strategyContext.strategyProfile.redLines, "拒絕書面確認電費");
assert.equal(strategyContext.savedInsight.actionItems[0].sourceMode, "mixed");
assert.equal(
  strategyContext.evidenceContext.findings[0].cases[0].id,
  "gov_electricity_test_001"
);
assert.equal(
  context.window.RU_INSIGHT.buildStrategyChatContext(
    rriResult,
    evidenceContext,
    strategyProfile,
    null
  ).savedInsight,
  null
);
assert.match(context.window.RU_INSIGHT.CHAT_SYSTEM_PROMPT, /strategyProfile/);
assert.match(context.window.RU_INSIGHT.CHAT_SYSTEM_PROMPT, /不修改風險等級/);

const validatedStrategy = context.window.RU_INSIGHT.validateStrategyResult({
  decisionSummary: "先確認電費書面條件，再決定是否進入租金談判。",
  priorityActions: [{
    title: "持續觀察其他費用",
    rationale: "目前沒有直接衝突，但仍需保留紀錄。",
    sourceMode: "ai_assessment",
    priority: 1,
    priorityLevel: "monitor",
    caseReferences: [],
    trace: {
      personalInputs: [{
        field: "budgetFlexibility",
        value: "只能小幅調整",
        relevance: "額外費用可能影響預算"
      }],
      rhirSignals: [],
      rriSignals: ["持續觀察費用變化"],
      aiInsightActions: [],
      reasonSummary: "預算彈性有限，因此將其他費用列為持續觀察。"
    }
  }, {
    title: "取得電費計價書面確認",
    rationale: "電費衝突同時碰到使用者的必要條件。",
    sourceMode: "mixed",
    priority: 1,
    priorityLevel: "immediate",
    caseReferences: [{
      caseId: "gov_electricity_test_001",
      title: "電費計價爭議案例",
      relevance: "案例同樣涉及契約與實際計價不一致。"
    }],
    trace: {
      personalInputs: [{
        field: "mustHaveConditions",
        value: "必須有獨立電表",
        relevance: "直接影響是否承租"
      }],
      rhirSignals: [{
        field: "cost.electricityRate",
        disclosureStatus: "conflict"
      }],
      rriSignals: ["費用透明度是主要風險"],
      aiInsightActions: [{
        sourceMode: "mixed",
        title: "要求書面確認電費"
      }],
      reasonSummary: "個人必要條件與物件衝突欄位重疊，應先處理。"
    }
  }],
  questionsToAsk: ["請問每度電費與計算方式會寫入契約嗎？"],
  negotiationPoints: [{
    topic: "電費條款",
    target: "寫入明確計價方式",
    approach: "以避免雙方日後誤會為理由提出",
    fallback: "無法書面確認時暫緩簽約"
  }],
  redLineWarnings: [{
    condition: "拒絕提供書面計價方式",
    response: "啟用備用方案並暫緩簽約"
  }],
  evidenceChecklist: ["契約電費條款", "電費帳單"],
  fallbackPlan: ["比較其他物件"],
  copyMessages: [{
    label: "詢問電費",
    text: "想先確認每度電費與計算方式是否能寫入契約。"
  }],
  cautionNote: "此策略僅供租屋決策輔助，不代表法律判定。"
}, evidenceContext);
assert.equal(validatedStrategy.priorityActions[0].priorityLevel, "immediate");
assert.equal(validatedStrategy.priorityActions[1].priorityLevel, "monitor");
assert.equal(validatedStrategy.priorityActions[0].caseReferences[0].sourceType, "gov");
assert.equal(validatedStrategy.negotiationPoints[0].topic, "電費條款");

const strategyWithResultContext = context.window.RU_INSIGHT.buildStrategyChatContext(
  rriResult,
  evidenceContext,
  strategyProfile,
  savedInsight,
  validatedStrategy
);
assert.equal(
  strategyWithResultContext.strategyResult.priorityActions[0].title,
  "取得電費計價書面確認"
);
assert.match(context.window.RU_INSIGHT.STRATEGY_SYSTEM_PROMPT, /priorityActions/);
assert.match(context.window.RU_INSIGHT.STRATEGY_SYSTEM_PROMPT, /personalInputs/);
assert.match(context.window.RU_INSIGHT.CHAT_SYSTEM_PROMPT, /strategyResult/);

assert.throws(() => {
  context.window.RU_INSIGHT.validateStrategyResult({
    decisionSummary: "不合法策略",
    priorityActions: [{
      title: "使用未定義欄位",
      rationale: "此測試應被阻擋。",
      sourceMode: "ai_assessment",
      priority: 1,
      priorityLevel: "immediate",
      caseReferences: [],
      trace: {
        personalInputs: [{
          field: "inventedProfileField",
          value: "不存在",
          relevance: "不應通過"
        }],
        reasonSummary: "測試"
      }
    }]
  }, { retrievalMode: "deterministic-exact-v1", findings: [] });
}, /未知個人欄位/);

console.log("AI Insight evidence context 契約驗證通過");
console.log("- verified case context：已包含");
console.log("- 三來源 actionItems：分類與順序已驗證");
console.log("- 案例展盒 metadata：已由 verified context 補齊");
console.log("- 策略顧問 context：RRI、案例、保存 Insight、個人情境已分層");
console.log("- 個人策略 schema：優先行動、談判點、Strategy Trace 已驗證");
console.log("- 個人策略來源：verified case 與正式 profile 欄位已驗證");
console.log("- UI 重複資料：未送入 prompt");
console.log("- 空案例 context：合法");
console.log("- 虛構案例引用：已阻擋");
console.log("- AI API：未呼叫");
