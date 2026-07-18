import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const source = fs.readFileSync(path.join(rootDir, "supabase.jsx"), "utf8");
const migration = fs.readFileSync(
  path.join(rootDir, "docs", "RRI", "strategy_sessions.sql"),
  "utf8"
);
const calls = [];
const ownerToken = "11111111-1111-4111-8111-111111111111";

function createBuilder(table) {
  const call = { table, filters: [] };
  calls.push(call);
  return {
    insert(payload) {
      call.operation = "insert";
      call.payload = payload;
      return this;
    },
    update(payload) {
      call.operation = "update";
      call.payload = payload;
      return this;
    },
    select(columns) {
      call.select = columns;
      return this;
    },
    eq(field, value) {
      call.filters.push([field, value]);
      return this;
    },
    order() { return this; },
    limit() { return this; },
    async single() {
      if (call.operation === "insert") {
        return {
          data: {
            id: "22222222-2222-4222-8222-222222222222",
            ...call.payload,
            created_at: "2026-07-18T12:00:00.000Z",
            updated_at: "2026-07-18T12:00:00.000Z"
          },
          error: null
        };
      }
      return {
        data: {
          id: "22222222-2222-4222-8222-222222222222",
          ...call.payload
        },
        error: null
      };
    },
    async maybeSingle() {
      return { data: null, error: null };
    }
  };
}

const context = {
  window: {
    localStorage: {
      getItem: () => ownerToken,
      setItem: () => {}
    },
    RU: {}
  },
  globalThis: {
    crypto: {
      randomUUID: () => ownerToken
    }
  },
  supabase: {
    createClient: () => ({
      from: createBuilder
    })
  },
  fetch: async () => {
    throw new Error("strategy session contract test must not call the network");
  },
  console
};

vm.runInNewContext(source, context);

const strategyResult = {
  status: "ok",
  promptVersion: "personal-strategy-v1",
  model: "test-model",
  decisionSummary: "測試策略",
  priorityActions: [{
    title: "先確認",
    sourceMode: "ai_assessment",
    priorityLevel: "immediate",
    caseReferences: [],
    trace: {
      personalInputs: [],
      rhirSignals: [],
      rriSignals: ["測試"],
      aiInsightActions: [],
      reasonSummary: "測試理由"
    }
  }]
};
const saved = await context.window.RU_SUPABASE.saveStrategySession({
  recordId: "record-1",
  versionId: "v1",
  basisEventId: "event-y3-01",
  snapshotHash: "ru1-12345678",
  aiInsightId: null,
  strategyProfile: { rentalGoal: "長期居住" },
  rriSnapshot: { totalScore: 55 },
  evidenceContext: { findings: [] },
  insightSnapshot: null,
  strategyResult,
  consultationMessages: []
});
assert.equal(saved.id, "22222222-2222-4222-8222-222222222222");

const insertCall = calls.find(call => call.table === "strategy_sessions" && call.operation === "insert");
assert.ok(insertCall);
assert.equal(insertCall.payload.owner_token, ownerToken);
assert.equal(insertCall.payload.record_id, "record-1");
assert.equal(insertCall.payload.basis_event_id, "event-y3-01");
assert.equal(insertCall.payload.snapshot_hash, "ru1-12345678");
assert.equal(insertCall.payload.strategy_trace[0].actionTitle, "先確認");
assert.equal(insertCall.payload.status, "completed");

await context.window.RU_SUPABASE.getLatestStrategySession("record-1", "v1");
const selectCall = calls.find(call =>
  call.table === "strategy_sessions" &&
  !call.operation &&
  call.filters.some(([field]) => field === "record_id")
);
assert.ok(selectCall);
assert.deepEqual(
  selectCall.filters.map(([field]) => field),
  ["owner_token", "record_id", "version_id"]
);

await context.window.RU_SUPABASE.updateStrategySessionMessages(
  "22222222-2222-4222-8222-222222222222",
  [{ role: "user", content: "測試追問" }]
);
const updateCall = calls.find(call => call.table === "strategy_sessions" && call.operation === "update");
assert.ok(updateCall);
assert.equal(updateCall.payload.consultation_messages[0].content, "測試追問");
assert.deepEqual(
  updateCall.filters.map(([field]) => field),
  ["id", "owner_token"]
);

assert.match(migration, /alter table public\.strategy_sessions enable row level security/i);
assert.match(migration, /for select[\s\S]*to anon, authenticated[\s\S]*using/i);
assert.match(migration, /for insert[\s\S]*to anon, authenticated[\s\S]*with check/i);
assert.match(migration, /for update[\s\S]*using[\s\S]*with check/i);
assert.match(migration, /grant select, insert on table public\.strategy_sessions/i);
assert.match(migration, /grant update \(consultation_messages, updated_at\)/i);
assert.doesNotMatch(migration, /service_role/i);

console.log("策略 session 契約驗證通過");
console.log("- 每次生成：INSERT 新 session");
console.log("- 重新載入：owner + record + version 精確查詢");
console.log("- 顧問對話：只更新 messages 與 updated_at");
console.log("- RLS：SELECT / INSERT / UPDATE 均以 owner token 隔離");
console.log("- 網路與 AI API：未呼叫");
