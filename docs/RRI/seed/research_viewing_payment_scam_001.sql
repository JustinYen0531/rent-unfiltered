-- Seed record: research_viewing_payment_scam_001
-- Prerequisite: run ../evidence_cases.sql in Supabase SQL Editor first.
-- Safe to rerun: the same id is updated instead of creating duplicates.

begin;

insert into public.evidence_cases (
  id, source_type, source_name, source_url, title, year,
  keywords, rhir_fields, risk_types, summary, common_outcome,
  legal_basis, action_hints, evidence_to_keep, confidence,
  review_status, notes, case_record
) values (
  'research_viewing_payment_scam_001',
  'research',
  '財團法人崔媽媽基金會',
  'https://www.tmm.org.tw/contents/n_cont?id=181',
  '看屋前要先付押金？租屋網路詐騙讓你血本無歸',
  2021,
  array['看屋預約金', '看屋前付款', '押金', '租屋詐騙', '租屋平台', '身分驗證'],
  array['leaseTerms.viewingPaymentRequirement'],
  array['viewing_payment_scam'],
  '崔媽媽基金會整理數起網路租屋刊登詐騙情境：對方以物件搶手或保留看屋為由，在看屋前索取一個月的押金或所謂預約金，收款後即失聯。文章提醒，民法與租賃住宅相關規範並未要求房客為看屋支付此類費用，並建議拒絕這類要求。',
  '看屋前匯款後對方失聯，租客無法取得房屋或返還款項。',
  array['民法（原文提及，未逐條分析）', '租賃住宅市場發展及管理條例第 13 條（原文提及的廣告刊登責任）'],
  array['看屋前不要支付名稱不明的預約金或押金', '要求確認出租人身分及出租權限，再安排看屋', '區分定金、押金、租金與看屋預約金，不因名稱相近而直接付款'],
  array['租屋刊登頁面與物件照片截圖', '與對方的文字訊息、帳號與電話紀錄', '匯款或轉帳紀錄', '平台檢舉或聯繫紀錄'],
  'medium',
  'verified',
  '來源為基金會知識宣導文章，不是個別法院裁判或政府處分。此案例使用擴充 RHIR 欄位 leaseTerms.viewingPaymentRequirement；現行 RHIR 與 RRI 程式尚未建立此欄位，後續實作時才將它加入表單、規則與 evidence mapping 查詢。',
  $case$
  {
    "id": "research_viewing_payment_scam_001",
    "sourceType": "research",
    "sourceName": "財團法人崔媽媽基金會",
    "sourceUrl": "https://www.tmm.org.tw/contents/n_cont?id=181",
    "title": "看屋前要先付押金？租屋網路詐騙讓你血本無歸",
    "year": 2021,
    "keywords": ["看屋預約金", "看屋前付款", "押金", "租屋詐騙", "租屋平台", "身分驗證"],
    "rhirFields": ["leaseTerms.viewingPaymentRequirement"],
    "riskTypes": ["viewing_payment_scam"],
    "summary": "崔媽媽基金會整理數起網路租屋刊登詐騙情境：對方以物件搶手或保留看屋為由，在看屋前索取一個月的押金或所謂預約金，收款後即失聯。文章提醒，民法與租賃住宅相關規範並未要求房客為看屋支付此類費用，並建議拒絕這類要求。",
    "commonOutcome": "看屋前匯款後對方失聯，租客無法取得房屋或返還款項。",
    "legalBasis": ["民法（原文提及，未逐條分析）", "租賃住宅市場發展及管理條例第 13 條（原文提及的廣告刊登責任）"],
    "actionHints": ["看屋前不要支付名稱不明的預約金或押金", "要求確認出租人身分及出租權限，再安排看屋", "區分定金、押金、租金與看屋預約金，不因名稱相近而直接付款"],
    "evidenceToKeep": ["租屋刊登頁面與物件照片截圖", "與對方的文字訊息、帳號與電話紀錄", "匯款或轉帳紀錄", "平台檢舉或聯繫紀錄"],
    "confidence": "medium",
    "notes": "來源為基金會知識宣導文章，不是個別法院裁判或政府處分。此案例使用擴充 RHIR 欄位 leaseTerms.viewingPaymentRequirement；現行 RHIR 與 RRI 程式尚未建立此欄位，後續實作時才將它加入表單、規則與 evidence mapping 查詢。"
  }
  $case$::jsonb
)
on conflict (id) do update set
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  title = excluded.title,
  year = excluded.year,
  keywords = excluded.keywords,
  rhir_fields = excluded.rhir_fields,
  risk_types = excluded.risk_types,
  summary = excluded.summary,
  common_outcome = excluded.common_outcome,
  legal_basis = excluded.legal_basis,
  action_hints = excluded.action_hints,
  evidence_to_keep = excluded.evidence_to_keep,
  confidence = excluded.confidence,
  review_status = excluded.review_status,
  notes = excluded.notes,
  case_record = excluded.case_record,
  updated_at = now();

insert into public.evidence_mappings (
  case_id, rhir_field, disclosure_status, risk_type, mapping_note
) values (
  'research_viewing_payment_scam_001',
  'leaseTerms.viewingPaymentRequirement',
  'disclosed',
  'viewing_payment_scam',
  '當物件或對話明示「看屋前須先付款、付預約金或付押金才能保留看屋」時，顯示本案例並提醒使用者不要先匯款。'
)
on conflict (case_id, rhir_field, disclosure_status, risk_type) do update set
  mapping_note = excluded.mapping_note;

commit;
