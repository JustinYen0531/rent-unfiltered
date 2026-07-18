import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const supabaseClientPath = path.join(rootDir, "supabase.jsx");
const mappingsPath = path.join(rootDir, "data", "evidence", "evidence-mappings.v1.json");

function readSupabaseConfig() {
  const source = fs.readFileSync(supabaseClientPath, "utf8");
  const url = source.match(/const SUPABASE_URL\s*=\s*"([^"]+)"/)?.[1];
  const key = source.match(/const SUPABASE_ANON_KEY\s*=\s*"([^"]+)"/)?.[1];
  if (!url || !key) throw new Error("無法從 supabase.jsx 讀取 Supabase publishable 設定");
  return { url, key };
}

async function queryTable(config, table, params) {
  const url = new URL(`/rest/v1/${table}`, config.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`
    }
  });
  if (!response.ok) {
    throw new Error(`${table} 查詢失敗（${response.status}）：${await response.text()}`);
  }
  return response.json();
}

const config = readSupabaseConfig();
const dictionary = JSON.parse(fs.readFileSync(mappingsPath, "utf8"));
const allLocalMappings = dictionary.cases.flatMap(caseEntry =>
  caseEntry.mappings.map(mapping => ({ ...mapping, caseId: caseEntry.caseId }))
);
const sample = allLocalMappings[0];
if (!sample) throw new Error("mapping 詞典沒有可測試的資料");

const expectedCaseIds = new Set(
  allLocalMappings
    .filter(mapping =>
      mapping.rhirField === sample.rhirField &&
      mapping.disclosureStatus === sample.disclosureStatus &&
      mapping.riskType === sample.riskType
    )
    .map(mapping => mapping.caseId)
);

const mappingRows = await queryTable(config, "evidence_mappings", {
  select: "case_id,rhir_field,disclosure_status,risk_type,mapping_note",
  rhir_field: `eq.${sample.rhirField}`,
  disclosure_status: `eq.${sample.disclosureStatus}`,
  risk_type: `eq.${sample.riskType}`,
  order: "case_id.asc"
});

const liveCaseIds = new Set(mappingRows.map(mapping => mapping.case_id));
if (liveCaseIds.size !== expectedCaseIds.size ||
  [...expectedCaseIds].some(caseId => !liveCaseIds.has(caseId))) {
  throw new Error("Supabase 精確 mapping 結果與 Git 詞典不一致");
}

const caseRows = await queryTable(config, "evidence_cases", {
  select: "id,review_status,title,source_type,confidence",
  id: `in.(${[...liveCaseIds].join(",")})`,
  review_status: "eq.verified"
});
if (caseRows.length !== liveCaseIds.size || caseRows.some(row => row.review_status !== "verified")) {
  throw new Error("案例查詢包含未驗證案例或遺漏 verified 案例");
}

const emptyRows = await queryTable(config, "evidence_mappings", {
  select: "case_id",
  rhir_field: "eq.__retrieval_test_missing_field__",
  disclosure_status: "eq.unknown",
  risk_type: "eq.__retrieval_test_missing_risk__"
});
if (emptyRows.length !== 0) throw new Error("不存在的三欄位查詢應回傳空結果");

console.log("三欄位案例查詢驗證通過");
console.log(`- RHIR：${sample.rhirField}`);
console.log(`- disclosureStatus：${sample.disclosureStatus}`);
console.log(`- riskType：${sample.riskType}`);
console.log(`- 精確 mappings：${mappingRows.length}`);
console.log(`- verified cases：${caseRows.length}`);
console.log("- 空結果契約：通過");
