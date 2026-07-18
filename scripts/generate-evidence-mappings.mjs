import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const dictionaryPath = path.join(rootDir, "data", "evidence", "rhir-risk-dictionary.v1.json");
const outputPath = path.join(rootDir, "data", "evidence", "evidence-mappings.v1.json");
const sqlPath = path.join(rootDir, "docs", "RRI", "evidence_mappings.seed.sql");
const supabaseClientPath = path.join(rootDir, "supabase.jsx");

const ALLOWED_STATUSES = ["missing", "disclosed", "conflict", "unknown"];
const MAX_MAPPINGS_PER_CASE = 4;

const RISK_STATUS_PROFILES = {
  deposit_dispute: ["missing", "conflict", "unknown"],
  repair_responsibility_dispute: ["missing", "conflict", "unknown"],
  early_termination_dispute: ["missing", "conflict", "disclosed", "unknown"],
  contract_formation_dispute: ["missing", "conflict", "unknown"],
  rental_subsidy_dispute: ["missing", "conflict", "unknown"],
  broker_fee_dispute: ["missing", "conflict", "disclosed"],
  electricity_overcharge: ["disclosed", "conflict", "unknown"],
  household_registration_dispute: ["missing", "conflict", "unknown"],
  important_information_nondisclosure: ["missing", "unknown", "conflict"],
  noise_disclosure_dispute: ["missing", "unknown", "conflict"],
  pet_policy_conflict: ["conflict"],
  property_condition_nondisclosure: ["missing", "unknown", "conflict"],
  failure_to_deliver: ["conflict", "unknown"],
  repair_cost_dispute: ["missing", "conflict", "disclosed"],
  area_misrepresentation: ["conflict"],
  contract_review_dispute: ["missing", "conflict"],
  deposit_withholding: ["conflict", "disclosed"],
  handover_delay: ["conflict", "unknown"],
  lease_information_mismatch: ["conflict"],
  rent_subsidy_dispute: ["missing", "conflict", "unknown"],
  repair_delay: ["missing", "unknown", "conflict"],
  repair_dispute: ["missing", "conflict", "unknown"],
  restoration_dispute: ["conflict", "disclosed"],
  sublease_authority_dispute: ["missing", "unknown", "conflict"],
  sublease_restriction_dispute: ["disclosed", "conflict"],
  utility_dispute: ["missing", "conflict", "unknown"],
  viewing_payment_scam: ["disclosed"],
  "重要資訊未揭露": ["missing", "unknown", "conflict"]
};

const SPECIAL_CASE_OVERRIDES = {
  gov_moi_rental_864bfc6a7d65: {
    sourceReason: "verified-case-without-reviewed-keys",
    mappings: [
      {
        rhirField: "leaseTerms.depositRefundTerms",
        disclosureStatus: "conflict",
        riskType: "deposit_dispute",
        mappingNote: "此 verified 案例本體目前未填 RHIR 與 Risk Type；依已審核摘要，爭點為支付 3,000 元定金後未依條件完成承租且拒絕返還。只在 mapping 詞典補上押金返還衝突索引，不回寫案例原始欄位。"
      }
    ]
  }
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractSupabaseConfig() {
  const source = fs.readFileSync(supabaseClientPath, "utf8");
  const url = source.match(/const SUPABASE_URL\s*=\s*"([^"]+)"/)?.[1];
  const key = source.match(/const SUPABASE_ANON_KEY\s*=\s*"([^"]+)"/)?.[1];
  if (!url || !key) {
    throw new Error("無法從 supabase.jsx 讀取 Supabase publishable 設定");
  }
  return { url, key };
}

async function fetchTable(baseUrl, key, table, query) {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });
  if (!response.ok) {
    throw new Error(`${table} 讀取失敗：${response.status} ${await response.text()}`);
  }
  return response.json();
}

function mappingKey(mapping) {
  return [
    mapping.caseId,
    mapping.rhirField,
    mapping.disclosureStatus,
    mapping.riskType
  ].join("|");
}

function chooseField(caseRecord, riskType, dictionary) {
  const reviewedFields = caseRecord.rhir_fields || [];
  const preferred = dictionary.riskTypes?.[riskType]?.primaryRhirFields || [];
  return preferred.find(field => reviewedFields.includes(field)) || reviewedFields[0] || null;
}

function generatedMappingNote(caseRecord, mapping, dictionary) {
  return `Mapping 詞典 v1：當 ${mapping.rhirField} 為 ${mapping.disclosureStatus}，且風險為 ${mapping.riskType} 時，引用 verified 案例「${caseRecord.title}」；不改寫案例原始 key。`;
}

function normalizeExistingMapping(mapping, caseId, priorMappings) {
  const prior = priorMappings.get(mappingKey({
    caseId,
    rhirField: mapping.rhir_field,
    disclosureStatus: mapping.disclosure_status,
    riskType: mapping.risk_type
  }));
  return {
    rhirField: mapping.rhir_field,
    disclosureStatus: mapping.disclosure_status,
    riskType: mapping.risk_type,
    mappingNote: mapping.mapping_note || null,
    sourceReason: prior?.sourceReason || "existing-reviewed-mapping"
  };
}

function generateCaseMappings(caseRecord, existingMappings, dictionary, priorMappings) {
  if (existingMappings.length > 0) {
    return existingMappings
      .map(mapping => normalizeExistingMapping(mapping, caseRecord.id, priorMappings))
      .slice(0, MAX_MAPPINGS_PER_CASE);
  }

  const override = SPECIAL_CASE_OVERRIDES[caseRecord.id];
  if (override) {
    return override.mappings.map(mapping => ({
      ...mapping,
      sourceReason: override.sourceReason
    }));
  }

  const pairs = (caseRecord.risk_types || []).map(riskType => {
    const rhirField = chooseField(caseRecord, riskType, dictionary);
    const statuses = RISK_STATUS_PROFILES[riskType];
    if (!rhirField || !statuses) {
      throw new Error(`案例 ${caseRecord.id} 無法建立 mapping：${rhirField || "無 RHIR"} / ${riskType}`);
    }
    return { rhirField, riskType, statuses };
  });

  const generated = [];
  const seen = new Set();
  const maxDepth = Math.max(...pairs.map(pair => pair.statuses.length), 0);

  for (let statusIndex = 0; statusIndex < maxDepth; statusIndex += 1) {
    for (const pair of pairs) {
      if (generated.length >= MAX_MAPPINGS_PER_CASE) break;
      const disclosureStatus = pair.statuses[statusIndex];
      if (!disclosureStatus) continue;
      const base = {
        caseId: caseRecord.id,
        rhirField: pair.rhirField,
        disclosureStatus,
        riskType: pair.riskType
      };
      const key = mappingKey(base);
      if (seen.has(key)) continue;
      seen.add(key);
      generated.push({
        rhirField: pair.rhirField,
        disclosureStatus,
        riskType: pair.riskType,
        mappingNote: generatedMappingNote(caseRecord, base, dictionary),
        sourceReason: "reviewed-keys-status-profile"
      });
    }
  }

  return generated;
}

function validateOutput(output, dictionary) {
  const errors = [];
  const caseIds = new Set();
  const globalKeys = new Set();

  if (output.cases.length !== output.sourceSnapshot.verifiedCases) {
    errors.push(`案例數 ${output.cases.length} 與 verified ${output.sourceSnapshot.verifiedCases} 不一致`);
  }

  for (const caseEntry of output.cases) {
    if (caseIds.has(caseEntry.caseId)) errors.push(`重複 caseId：${caseEntry.caseId}`);
    caseIds.add(caseEntry.caseId);
    if (caseEntry.mappings.length < 1 || caseEntry.mappings.length > MAX_MAPPINGS_PER_CASE) {
      errors.push(`${caseEntry.caseId} mapping 數量為 ${caseEntry.mappings.length}`);
    }

    for (const mapping of caseEntry.mappings) {
      if (!dictionary.rhirFields[mapping.rhirField]) {
        errors.push(`${caseEntry.caseId} 使用未知 RHIR ${mapping.rhirField}`);
      }
      if (!dictionary.riskTypes[mapping.riskType]) {
        errors.push(`${caseEntry.caseId} 使用未知 riskType ${mapping.riskType}`);
      }
      if (!ALLOWED_STATUSES.includes(mapping.disclosureStatus)) {
        errors.push(`${caseEntry.caseId} 使用不支援狀態 ${mapping.disclosureStatus}`);
      }
      const key = mappingKey({ caseId: caseEntry.caseId, ...mapping });
      if (globalKeys.has(key)) errors.push(`重複 mapping：${key}`);
      globalKeys.add(key);
    }
  }

  if (errors.length > 0) {
    throw new Error(`mapping 驗證失敗：\n- ${errors.join("\n- ")}`);
  }
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function buildSql(output) {
  const rows = output.cases.flatMap(caseEntry =>
    caseEntry.mappings.map(mapping => [
      caseEntry.caseId,
      mapping.rhirField,
      mapping.disclosureStatus,
      mapping.riskType,
      mapping.mappingNote
    ])
  );

  const values = rows
    .map(row => `  (${row.map(sqlString).join(", ")})`)
    .join(",\n");

  return `-- Generated from data/evidence/evidence-mappings.v1.json.
-- Reviewed evidence case fields and risk types are not modified.
begin;

insert into public.evidence_mappings (
  case_id,
  rhir_field,
  disclosure_status,
  risk_type,
  mapping_note
)
values
${values}
on conflict (case_id, rhir_field, disclosure_status, risk_type)
do nothing;

commit;
`;
}

async function main() {
  const write = process.argv.includes("--write");
  const dictionary = readJson(dictionaryPath);
  const priorOutput = fs.existsSync(outputPath) ? readJson(outputPath) : null;
  const priorMappings = new Map(
    (priorOutput?.cases || []).flatMap(caseEntry =>
      caseEntry.mappings.map(mapping => [
        mappingKey({ caseId: caseEntry.caseId, ...mapping }),
        mapping
      ])
    )
  );
  const { url, key } = extractSupabaseConfig();

  const [cases, existingMappings] = await Promise.all([
    fetchTable(
      url,
      key,
      "evidence_cases",
      "select=id,title,rhir_fields,risk_types,review_status&review_status=eq.verified&order=id.asc"
    ),
    fetchTable(
      url,
      key,
      "evidence_mappings",
      "select=case_id,rhir_field,disclosure_status,risk_type,mapping_note&order=case_id.asc,rhir_field.asc,disclosure_status.asc,risk_type.asc"
    )
  ]);

  const existingByCase = new Map();
  for (const mapping of existingMappings) {
    if (!existingByCase.has(mapping.case_id)) existingByCase.set(mapping.case_id, []);
    existingByCase.get(mapping.case_id).push(mapping);
  }

  const mappedCases = cases.map(caseRecord => ({
    caseId: caseRecord.id,
    title: caseRecord.title,
    reviewStatus: caseRecord.review_status,
    sourceRhirFields: caseRecord.rhir_fields || [],
    sourceRiskTypes: caseRecord.risk_types || [],
    mappings: generateCaseMappings(
      caseRecord,
      existingByCase.get(caseRecord.id) || [],
      dictionary,
      priorMappings
    )
  }));

  const totalMappings = mappedCases.reduce((sum, item) => sum + item.mappings.length, 0);
  const distribution = mappedCases.reduce((counts, item) => {
    counts[item.mappings.length] = (counts[item.mappings.length] || 0) + 1;
    return counts;
  }, {});

  const casesUnchanged = priorOutput
    && JSON.stringify(priorOutput.cases) === JSON.stringify(mappedCases);
  const output = {
    mappingDictionaryId: "rent-unfiltered-evidence-mappings",
    version: "1.0.0",
    generatedAt: casesUnchanged ? priorOutput.generatedAt : new Date().toISOString(),
    sourceSnapshot: {
      source: "Supabase public.evidence_cases + public.evidence_mappings",
      verifiedCases: cases.length,
      existingMappingsPreserved: existingMappings.length
    },
    policy: {
      requiredKeys: ["rhirField", "disclosureStatus", "riskType"],
      allowedDisclosureStatuses: ALLOWED_STATUSES,
      minimumMappingsPerCase: 1,
      maximumMappingsPerCase: MAX_MAPPINGS_PER_CASE,
      preserveReviewedCaseValues: true,
      preserveExistingMappings: true,
      statusProfiles: RISK_STATUS_PROFILES
    },
    statistics: {
      caseCount: mappedCases.length,
      mappingCount: totalMappings,
      mappingsPerCase: distribution
    },
    cases: mappedCases
  };

  validateOutput(output, dictionary);

  if (write) {
    fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
    fs.writeFileSync(sqlPath, buildSql(output), "utf8");
  }

  console.log("Evidence mapping 詞典驗證通過");
  console.log(`- verified cases：${mappedCases.length}`);
  console.log(`- mappings：${totalMappings}`);
  console.log(`- 每案分布：${JSON.stringify(distribution)}`);
  console.log(`- 既有 mappings 保留：${existingMappings.length}`);
  console.log(write ? `- 已寫入：${path.relative(rootDir, outputPath)}、${path.relative(rootDir, sqlPath)}` : "- check-only：未寫入檔案");
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
