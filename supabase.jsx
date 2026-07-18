// RHIR Server integration via Supabase
//
// SETUP STEPS:
// 1. 到 https://supabase.com 建立免費專案
//
// 2. 在 Supabase SQL Editor 執行以下 SQL：
//    案例證據資料表請改執行 docs/RRI/evidence_cases.sql
//
//    CREATE TABLE rhir_uploads (
//      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//      record_id TEXT NOT NULL,
//      title TEXT,
//      district TEXT,
//      monthly_rent INTEGER,
//      rhir_json JSONB NOT NULL,
//      uploaded_at TIMESTAMPTZ DEFAULT now()
//    );
//
//    ALTER TABLE rhir_uploads ENABLE ROW LEVEL SECURITY;
//    CREATE POLICY "public upload" ON rhir_uploads FOR INSERT WITH CHECK (true);
//    CREATE POLICY "public read"   ON rhir_uploads FOR SELECT USING (true);
//
// 3. 到 Project Settings → API，複製 Project URL 和 anon public key
// 4. 貼到下方兩個變數

const SUPABASE_URL      = "https://ypjuewskrfmbhzgyjint.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_G8A-JLI_5r1kXrIf-UmKlg_3Ge-BwzK";
const INSIGHT_OWNER_STORAGE_KEY = "ru_ai_insight_owner_token";
const AI_INSIGHT_PROMPT_VERSION = "action-provenance-v2";
const STRATEGY_PROMPT_VERSION = "personal-strategy-v1";

const _isConfigured = () =>
  !SUPABASE_URL.includes("YOUR_PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_ANON");

let _sb = null;
let _insightOwnerToken = null;

function _createUuid() {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  if (typeof cryptoApi?.getRandomValues !== "function") {
    throw new Error("目前瀏覽器無法建立 AI Insight 的本機識別碼。");
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(value => value.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join("")
  ].join("-");
}

function _getInsightOwnerToken() {
  if (_insightOwnerToken) return _insightOwnerToken;

  try {
    const stored = window.localStorage.getItem(INSIGHT_OWNER_STORAGE_KEY);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored || "")) {
      _insightOwnerToken = stored;
      return _insightOwnerToken;
    }
  } catch (error) {
    // Keep an in-memory capability token when local storage is unavailable.
  }

  _insightOwnerToken = _createUuid();
  try {
    window.localStorage.setItem(INSIGHT_OWNER_STORAGE_KEY, _insightOwnerToken);
  } catch (error) {
    // The current page can still save and reload until it is closed.
  }
  return _insightOwnerToken;
}

function _client() {
  if (!_sb && _isConfigured() && typeof supabase !== "undefined") {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          "x-ru-insight-token": _getInsightOwnerToken()
        }
      }
    });
  }
  return _sb;
}

const EVIDENCE_CASE_RETRIEVAL_SELECT = [
  "id",
  "source_type",
  "source_name",
  "source_url",
  "source_reference_url",
  "title",
  "year",
  "keywords",
  "rhir_fields",
  "risk_types",
  "summary",
  "common_outcome",
  "legal_basis",
  "action_hints",
  "evidence_to_keep",
  "confidence",
  "review_status",
  "notes"
].join(",");

const EVIDENCE_SOURCE_RANK = {
  gov: 0,
  court: 1,
  research: 2,
  interview: 3,
  social: 4
};

const EVIDENCE_CONFIDENCE_RANK = {
  high: 0,
  medium: 1,
  low: 2
};

function normalizeEvidenceQuery(query, defaultLimit = 5) {
  const normalized = {
    rhirField: String(query?.rhirField || "").trim(),
    disclosureStatus: String(query?.disclosureStatus || "").trim(),
    riskType: String(query?.riskType || "").trim()
  };
  const missingKeys = Object.entries(normalized)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`案例查詢缺少必要欄位：${missingKeys.join(", ")}`);
  }

  const requestedLimit = Number(query?.limit ?? defaultLimit);
  normalized.limit = Number.isFinite(requestedLimit)
    ? Math.min(10, Math.max(1, Math.floor(requestedLimit)))
    : defaultLimit;
  return normalized;
}

function compareEvidenceCases(left, right) {
  const sourceDifference =
    (EVIDENCE_SOURCE_RANK[left.source_type] ?? 99) -
    (EVIDENCE_SOURCE_RANK[right.source_type] ?? 99);
  if (sourceDifference !== 0) return sourceDifference;

  const confidenceDifference =
    (EVIDENCE_CONFIDENCE_RANK[left.confidence] ?? 99) -
    (EVIDENCE_CONFIDENCE_RANK[right.confidence] ?? 99);
  if (confidenceDifference !== 0) return confidenceDifference;

  const yearDifference = Number(right.year || 0) - Number(left.year || 0);
  if (yearDifference !== 0) return yearDifference;
  return String(left.id).localeCompare(String(right.id));
}

function toEvidenceRetrievalCase(caseRow, mappingRow) {
  return {
    id: caseRow.id,
    title: caseRow.title,
    year: caseRow.year,
    sourceType: caseRow.source_type,
    sourceName: caseRow.source_name,
    sourceUrl: caseRow.source_url,
    sourceReferenceUrl: caseRow.source_reference_url || null,
    keywords: caseRow.keywords || [],
    rhirFields: caseRow.rhir_fields || [],
    riskTypes: caseRow.risk_types || [],
    summary: caseRow.summary,
    commonOutcome: caseRow.common_outcome,
    legalBasis: caseRow.legal_basis || [],
    actionHints: caseRow.action_hints || [],
    evidenceToKeep: caseRow.evidence_to_keep || [],
    confidence: caseRow.confidence,
    notes: caseRow.notes || null,
    matchedMapping: {
      rhirField: mappingRow.rhir_field,
      disclosureStatus: mappingRow.disclosure_status,
      riskType: mappingRow.risk_type,
      mappingNote: mappingRow.mapping_note || null
    }
  };
}

async function findEvidenceCases(query) {
  const client = _client();
  if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");

  const normalized = normalizeEvidenceQuery(query);
  const { data: mappings, error: mappingError } = await client
    .from("evidence_mappings")
    .select("case_id, rhir_field, disclosure_status, risk_type, mapping_note")
    .eq("rhir_field", normalized.rhirField)
    .eq("disclosure_status", normalized.disclosureStatus)
    .eq("risk_type", normalized.riskType)
    .order("case_id", { ascending: true });

  if (mappingError) throw mappingError;

  const caseIds = [...new Set((mappings || []).map(mapping => mapping.case_id))];
  if (caseIds.length === 0) {
    return {
      query: normalized,
      retrievalMode: "exact-mapping",
      fallbackUsed: false,
      totalMatches: 0,
      cases: []
    };
  }

  const { data: cases, error: caseError } = await client
    .from("evidence_cases")
    .select(EVIDENCE_CASE_RETRIEVAL_SELECT)
    .in("id", caseIds)
    .eq("review_status", "verified");

  if (caseError) throw caseError;

  const mappingByCase = new Map((mappings || []).map(mapping => [mapping.case_id, mapping]));
  const rankedCases = (cases || [])
    .sort(compareEvidenceCases)
    .map(caseRow => toEvidenceRetrievalCase(caseRow, mappingByCase.get(caseRow.id)));

  return {
    query: normalized,
    retrievalMode: "exact-mapping",
    fallbackUsed: false,
    totalMatches: rankedCases.length,
    cases: rankedCases.slice(0, normalized.limit)
  };
}

const EVIDENCE_STATUS_RANK = {
  conflict: 0,
  missing: 1,
  unknown: 2,
  partial: 3,
  inferred: 4,
  supplemented: 5,
  disclosed: 6
};

function collectRhirEvidencePairs(value, path = [], pairs = []) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return pairs;

  if (typeof value.disclosureStatus === "string" && path.length > 0) {
    pairs.push({
      rhirField: path.join("."),
      disclosureStatus: value.disclosureStatus
    });
    return pairs;
  }

  for (const [key, child] of Object.entries(value)) {
    collectRhirEvidencePairs(child, [...path, key], pairs);
  }
  return pairs;
}

function evidencePairKey(rhirField, disclosureStatus) {
  return `${rhirField}\u0000${disclosureStatus}`;
}

function evidenceQueryKey(rhirField, disclosureStatus, riskType) {
  return `${rhirField}\u0000${disclosureStatus}\u0000${riskType}`;
}

async function planEvidenceQueriesForRhir(rhir, options = {}) {
  const client = _client();
  if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");

  const pairs = collectRhirEvidencePairs(rhir);
  const rhirFields = [...new Set(pairs.map(pair => pair.rhirField))];
  const requestedMax = Number(options.maxFindings ?? 6);
  const maxFindings = Number.isFinite(requestedMax)
    ? Math.min(20, Math.max(1, Math.floor(requestedMax)))
    : 6;

  if (rhirFields.length === 0) {
    return {
      inputFieldCount: 0,
      matchedPairCount: 0,
      totalQueryCount: 0,
      truncated: false,
      queries: []
    };
  }

  const { data: mappings, error } = await client
    .from("evidence_mappings")
    .select("case_id, rhir_field, disclosure_status, risk_type")
    .in("rhir_field", rhirFields);

  if (error) throw error;

  const inputPairs = new Set(pairs.map(pair =>
    evidencePairKey(pair.rhirField, pair.disclosureStatus)
  ));
  const matchedPairs = new Set();
  const queryGroups = new Map();

  for (const mapping of mappings || []) {
    const pairKey = evidencePairKey(mapping.rhir_field, mapping.disclosure_status);
    if (!inputPairs.has(pairKey)) continue;

    matchedPairs.add(pairKey);
    const queryKey = evidenceQueryKey(
      mapping.rhir_field,
      mapping.disclosure_status,
      mapping.risk_type
    );
    const existing = queryGroups.get(queryKey) || {
      rhirField: mapping.rhir_field,
      disclosureStatus: mapping.disclosure_status,
      riskType: mapping.risk_type,
      mappedCaseIds: new Set()
    };
    existing.mappedCaseIds.add(mapping.case_id);
    queryGroups.set(queryKey, existing);
  }

  const allQueries = [...queryGroups.values()]
    .map(query => ({
      rhirField: query.rhirField,
      disclosureStatus: query.disclosureStatus,
      riskType: query.riskType,
      estimatedCaseCount: query.mappedCaseIds.size
    }))
    .sort((left, right) => {
      const statusDifference =
        (EVIDENCE_STATUS_RANK[left.disclosureStatus] ?? 99) -
        (EVIDENCE_STATUS_RANK[right.disclosureStatus] ?? 99);
      if (statusDifference !== 0) return statusDifference;

      const caseDifference = right.estimatedCaseCount - left.estimatedCaseCount;
      if (caseDifference !== 0) return caseDifference;
      return evidenceQueryKey(left.rhirField, left.disclosureStatus, left.riskType)
        .localeCompare(evidenceQueryKey(right.rhirField, right.disclosureStatus, right.riskType));
    });

  return {
    inputFieldCount: pairs.length,
    matchedPairCount: matchedPairs.size,
    totalQueryCount: allQueries.length,
    truncated: allQueries.length > maxFindings,
    queries: allQueries.slice(0, maxFindings)
  };
}

async function buildEvidenceRetrievalContext(findings, options = {}) {
  if (!Array.isArray(findings)) {
    throw new Error("findings 必須是三欄位查詢物件的陣列。");
  }

  const limitPerFinding = Number(options.limitPerFinding ?? 5);
  const results = await Promise.all(findings.map(finding =>
    findEvidenceCases({ ...finding, limit: limitPerFinding })
  ));
  const uniqueCases = new Map();

  for (const result of results) {
    for (const evidenceCase of result.cases) {
      const existing = uniqueCases.get(evidenceCase.id);
      if (!existing) {
        const { matchedMapping, ...caseData } = evidenceCase;
        uniqueCases.set(evidenceCase.id, {
          ...caseData,
          matchedMappings: [matchedMapping]
        });
        continue;
      }

      const mappingKey = JSON.stringify(evidenceCase.matchedMapping);
      const existingKeys = new Set(existing.matchedMappings.map(mapping => JSON.stringify(mapping)));
      if (!existingKeys.has(mappingKey)) {
        existing.matchedMappings.push(evidenceCase.matchedMapping);
      }
    }
  }

  return {
    retrievalMode: "deterministic-exact-v1",
    fallbackUsed: false,
    findings: results,
    uniqueCases: [...uniqueCases.values()],
    stats: {
      findingCount: findings.length,
      matchedFindingCount: results.filter(result => result.totalMatches > 0).length,
      uniqueCaseCount: uniqueCases.size
    }
  };
}

async function buildEvidenceRetrievalContextFromRhir(rhir, options = {}) {
  const plan = await planEvidenceQueriesForRhir(rhir, options);
  const context = await buildEvidenceRetrievalContext(plan.queries, options);
  return {
    ...context,
    planner: plan
  };
}

window.RU_SUPABASE = {
  isConfigured: _isConfigured,

  async uploadRhir(rhirBundle) {
    const client = _client();
    if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");

    const recordId = window.RU.getRhirRecordId(rhirBundle);
    const property  = rhirBundle?.property || {};
    const cost      = rhirBundle?.cost || {};
    const district  = property?.district?.value || null;
    const type      = property?.propertyType?.value || null;

    const { data, error } = await client
      .from("rhir_uploads")
      .insert({
        record_id:    recordId,
        title:        district && type ? `${district} · ${type}` : district || recordId,
        district,
        monthly_rent: cost?.monthlyRent?.value ? Number(cost.monthlyRent.value) : null,
        rhir_json:    rhirBundle,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllUploads() {
    const client = _client();
    if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");

    const { data, error } = await client
      .from("rhir_uploads")
      .select("id, record_id, title, district, monthly_rent, uploaded_at")
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUploadJson(id) {
    const client = _client();
    if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");

    const { data, error } = await client
      .from("rhir_uploads")
      .select("rhir_json")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data.rhir_json;
  },

  async getAllEvidenceCases() {
    const client = _client();
    if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");

    const [casesResult, mappingsResult] = await Promise.all([
      client
        .from("evidence_cases")
        .select("id, source_type, source_name, source_url, source_reference_url, title, year, keywords, rhir_fields, risk_types, summary, common_outcome, legal_basis, action_hints, evidence_to_keep, confidence, review_status, review_notes, reviewed_at, reviewed_by, mapping_notes, notes, case_record, created_at, updated_at")
        .order("updated_at", { ascending: false }),
      client
        .from("evidence_mappings")
        .select("case_id, rhir_field, disclosure_status, risk_type, mapping_note")
        .order("rhir_field", { ascending: true })
        .order("disclosure_status", { ascending: true })
        .order("risk_type", { ascending: true })
    ]);

    if (casesResult.error) throw casesResult.error;
    if (mappingsResult.error) throw mappingsResult.error;

    const mappingsByCase = new Map();
    for (const mapping of mappingsResult.data || []) {
      const caseMappings = mappingsByCase.get(mapping.case_id) || [];
      caseMappings.push(mapping);
      mappingsByCase.set(mapping.case_id, caseMappings);
    }

    return (casesResult.data || []).map(item => ({
      ...item,
      evidence_mappings: mappingsByCase.get(item.id) || []
    }));
  },

  findEvidenceCases,
  planEvidenceQueriesForRhir,
  buildEvidenceRetrievalContext,
  buildEvidenceRetrievalContextFromRhir,

  async saveAiInsight({
    recordId,
    versionId,
    rriSnapshot,
    evidenceContext,
    insightResult
  }) {
    const client = _client();
    if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");
    if (!recordId || !versionId || !rriSnapshot || !evidenceContext || !insightResult) {
      throw new Error("儲存 AI Insight 缺少紀錄、版本、RRI、案例 context 或 Insight 結果。");
    }

    const { data, error } = await client
      .from("ai_insights")
      .insert({
        owner_token: _getInsightOwnerToken(),
        record_id: String(recordId),
        version_id: String(versionId),
        prompt_version: AI_INSIGHT_PROMPT_VERSION,
        rri_snapshot: rriSnapshot,
        evidence_context: evidenceContext,
        insight_result: insightResult,
        model: insightResult.model || null
      })
      .select("id, record_id, version_id, model, created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async getLatestAiInsight(recordId, versionId) {
    const client = _client();
    if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");
    if (!recordId || !versionId) return null;

    const { data, error } = await client
      .from("ai_insights")
      .select("id, record_id, version_id, prompt_version, rri_snapshot, evidence_context, insight_result, model, created_at")
      .eq("record_id", String(recordId))
      .eq("version_id", String(versionId))
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  async saveStrategySession({
    recordId,
    versionId,
    aiInsightId,
    strategyProfile,
    rriSnapshot,
    evidenceContext,
    insightSnapshot,
    strategyResult,
    consultationMessages = []
  }) {
    const client = _client();
    if (!client) throw new Error("請先完成 Supabase 設定，才能保存個人策略。");
    if (
      !recordId ||
      !versionId ||
      !strategyProfile ||
      !rriSnapshot ||
      !evidenceContext ||
      !strategyResult
    ) {
      throw new Error("保存個人策略缺少紀錄、版本、個人情境、RRI、案例 context 或策略結果。");
    }

    const strategyTrace = (strategyResult.priorityActions || []).map(action => ({
      actionTitle: action.title,
      sourceMode: action.sourceMode,
      priorityLevel: action.priorityLevel,
      caseReferences: action.caseReferences || [],
      ...action.trace,
    }));
    const { data, error } = await client
      .from("strategy_sessions")
      .insert({
        owner_token: _getInsightOwnerToken(),
        record_id: String(recordId),
        version_id: String(versionId),
        ai_insight_id: aiInsightId || null,
        prompt_version: strategyResult.promptVersion || STRATEGY_PROMPT_VERSION,
        strategy_profile: strategyProfile,
        rri_snapshot: rriSnapshot,
        evidence_context: evidenceContext,
        insight_snapshot: insightSnapshot || null,
        strategy_result: strategyResult,
        strategy_trace: strategyTrace,
        consultation_messages: Array.isArray(consultationMessages) ? consultationMessages : [],
        status: "completed",
        model: strategyResult.model || null
      })
      .select("id, record_id, version_id, ai_insight_id, prompt_version, strategy_profile, strategy_result, strategy_trace, consultation_messages, status, model, created_at, updated_at")
      .single();

    if (error) throw error;
    return data;
  },

  async getLatestStrategySession(recordId, versionId) {
    const client = _client();
    if (!client) throw new Error("請先完成 Supabase 設定，才能讀取個人策略。");
    if (!recordId || !versionId) return null;

    const { data, error } = await client
      .from("strategy_sessions")
      .select("id, record_id, version_id, ai_insight_id, prompt_version, strategy_profile, rri_snapshot, evidence_context, insight_snapshot, strategy_result, strategy_trace, consultation_messages, status, model, created_at, updated_at")
      .eq("owner_token", _getInsightOwnerToken())
      .eq("record_id", String(recordId))
      .eq("version_id", String(versionId))
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  },

  async updateStrategySessionMessages(sessionId, consultationMessages) {
    const client = _client();
    if (!client) throw new Error("請先完成 Supabase 設定，才能保存策略對話。");
    if (!sessionId) throw new Error("缺少策略 session id。");

    const messages = (Array.isArray(consultationMessages) ? consultationMessages : [])
      .filter(message => message && ["user", "assistant"].includes(message.role))
      .map(message => ({
        role: message.role,
        content: String(message.content || ""),
        error: Boolean(message.error),
      }));
    const { data, error } = await client
      .from("strategy_sessions")
      .update({
        consultation_messages: messages,
        updated_at: new Date().toISOString()
      })
      .eq("id", sessionId)
      .eq("owner_token", _getInsightOwnerToken())
      .select("id, consultation_messages, updated_at")
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvidenceReview(id, changes) {
    const client = _client();
    if (!client) throw new Error("請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理頁面。");

    const { data, error } = await client
      .from("evidence_cases")
      .update({
        review_status: changes.decision,
        review_notes: changes.reviewNotes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: "team",
        risk_types: changes.riskTypes,
        rhir_fields: changes.rhirFields,
        mapping_notes: changes.mappingNotes || null,
        source_reference_url: changes.sourceReferenceUrl || null
      })
      .eq("id", id)
      .select("id, review_status, review_notes, reviewed_at, reviewed_by, risk_types, rhir_fields, mapping_notes, source_reference_url")
      .single();

    if (error) throw error;
    return data;
  },
};
