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

const _isConfigured = () =>
  !SUPABASE_URL.includes("YOUR_PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_ANON");

let _sb = null;
function _client() {
  if (!_sb && _isConfigured() && typeof supabase !== "undefined") {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sb;
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

    const { data, error } = await client
      .from("evidence_cases")
      .select("id, source_type, source_name, source_url, source_reference_url, title, year, keywords, rhir_fields, risk_types, summary, common_outcome, action_hints, evidence_to_keep, confidence, review_status, review_notes, reviewed_at, reviewed_by, mapping_notes, notes, updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
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
