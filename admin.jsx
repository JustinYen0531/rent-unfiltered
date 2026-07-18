// Admin — view all RHIR uploads in the database

const { useState: useStateAD, useEffect: useEffectAD } = React;

const EVIDENCE_WORKPLAN = [
  {
    sourceType: "research",
    sourceName: "崔媽媽基金會",
    target: 6,
    focus: "看屋前付款、押金、修繕、契約與租客行動",
    note: "適合整理具體情境、租客行動與應保留證據。",
    url: "https://www.tmm.org.tw/"
  },
  {
    sourceType: "gov",
    sourceName: "官方 GetG5 租屋候選",
    target: 20,
    focus: "自動篩選押金、電費、修繕、提前終止與資訊揭露",
    note: "來源是混合型官方案例；程式自動抓取，組員只審核租屋關聯與 RHIR 對應。",
    url: "https://pip.moi.gov.tw/asmx/WS1.asmx/GetG5?Year=&City=&DisputeOrigin=&DisputeCause="
  },
  {
    sourceType: "court",
    sourceName: "司法院裁判書查詢",
    target: 4,
    focus: "押金扣款、電費或修繕責任",
    note: "等前兩類資料格式穩定後再加入，避免一開始被判決文字拖慢。",
    url: "https://judgment.judicial.gov.tw/FJUD/default.aspx"
  }
];

const EVIDENCE_SOP = [
  "先確認來源網址、來源類型與發布年份",
  "只整理一個主要爭議模式，不整篇複製文章或判決",
  "填入 1–2 個 RHIR 欄位與 1 個穩定 riskType",
  "寫摘要、常見後果、租客行動與應保留證據",
  "標記 confidence；不確定的法律判斷寫進 notes",
  "第二位組員檢查來源、分類、欄位對應與措辭",
  "通過檢查後才產生 seed SQL，寫入 Supabase 並標記 verified"
];

const REVIEW_STATUS_META = {
  draft: { label: "草稿", className: "badge-draft" },
  verified: { label: "已驗證", className: "badge-verified" },
  revise: { label: "需修改", className: "badge-revise" },
  rejected: { label: "已排除", className: "badge-rejected" }
};

function ReviewStatusBadge({ status }) {
  const meta = REVIEW_STATUS_META[status] || { label: status || "草稿", className: "badge-unknown" };
  return <span className={`badge ${meta.className}`}><span className="dot" />{meta.label}</span>;
}

function parseTagList(value) {
  return [...new Set(value.split(/[,;，；\n]/).map(item => item.trim()).filter(Boolean))];
}

function safeHttpUrl(value) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

function EvidenceWorkBoard({ cases, loading, error }) {
  const verifiedCases = cases.filter(item => item.review_status === "verified");
  const draftCases = cases.filter(item => item.review_status === "draft");
  const verifiedBySource = verifiedCases.reduce((counts, item) => {
    counts[item.source_type] = (counts[item.source_type] || 0) + 1;
    return counts;
  }, {});
  const draftBySource = draftCases.reduce((counts, item) => {
    counts[item.source_type] = (counts[item.source_type] || 0) + 1;
    return counts;
  }, {});
  const totalTarget = EVIDENCE_WORKPLAN.reduce((sum, item) => sum + item.target, 0);
  const totalDone = verifiedCases.length;
  const remaining = Math.max(totalTarget - totalDone, 0);

  return (
    <section style={{ marginBottom: 28 }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>團隊證據工作台</h2>
          <p className="page-sub" style={{ margin: "4px 0 0" }}>
            第一批先完成 {totalTarget} 筆可檢核案例，再接到 RRI 的 Related Cases。
          </p>
        </div>
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
          {loading ? "讀取案例中..." : `${totalDone}/${totalTarget} 已確認 · ${draftCases.length} 筆待審`}
        </span>
      </div>

      <div className="stat-row" style={{ marginBottom: 14 }}>
        <div className="stat">
          <div className="stat-label">第一批目標</div>
          <div className="stat-value">{totalTarget}<span className="delta mono">筆</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">已確認</div>
          <div className="stat-value">{totalDone}<span className="delta mono">筆</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">自動候選待審</div>
          <div className="stat-value">{draftCases.length}<span className="delta mono">筆</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">還需確認</div>
          <div className="stat-value">{remaining}<span className="delta mono">筆</span></div>
        </div>
      </div>

      {error && (
        <div className="callout" style={{ marginBottom: 14 }}>
          <span className="ic">!</span>
          <div>
            <strong>案例表尚未可讀取</strong>
            <p style={{ margin: "4px 0 0" }}>{error} 先執行 `docs/RRI/evidence_cases.sql`，清單仍可先照下面的目標執行。</p>
          </div>
        </div>
      )}

      <div className="evidence-work-grid">
        {EVIDENCE_WORKPLAN.map(item => {
          const done = verifiedBySource[item.sourceType] || 0;
          const draft = draftBySource[item.sourceType] || 0;
          const left = Math.max(item.target - done, 0);
          return (
            <div className="evidence-work-card" key={item.sourceType}>
              <div className="evidence-work-card-head">
                <div>
                  <div className="mono evidence-work-type">{item.sourceType}</div>
                  <h3>{item.sourceName}</h3>
                </div>
                <span className="badge badge-disclosed"><span className="dot" />{done}/{item.target}</span>
              </div>
              <p>{item.focus}</p>
              <div className="evidence-progress"><span style={{ width: `${Math.min((done / item.target) * 100, 100)}%` }} /></div>
              <div className="evidence-work-meta">還需確認 {left} 筆 · 待審 {draft} 筆 · {item.note}</div>
              <a href={item.url} target="_blank" rel="noreferrer" className="evidence-source-link">開啟來源入口 ↗</a>
            </div>
          );
        })}
      </div>

      <div className="fg" style={{ marginTop: 14, marginBottom: 0 }}>
        <div className="fg-head">
          <h3>每一筆案例的整理 SOP</h3>
          <span className="meta">CASE CURATION / v1</span>
        </div>
        <div style={{ padding: "10px 14px" }}>
          {EVIDENCE_SOP.map((step, index) => (
            <div className="evidence-sop-step" key={step}>
              <span className="evidence-sop-number">{String(index + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EvidenceReviewList({ cases, onReviewed }) {
  const [query, setQuery] = useStateAD("");
  const [riskFilter, setRiskFilter] = useStateAD("all");
  const [viewingCase, setViewingCase] = useStateAD(null);
  const [viewingJsonCase, setViewingJsonCase] = useStateAD(null);
  const [jsonCopyMessage, setJsonCopyMessage] = useStateAD("");
  const [reviewNote, setReviewNote] = useStateAD("");
  const [riskTypeInput, setRiskTypeInput] = useStateAD("");
  const [rhirInput, setRhirInput] = useStateAD("");
  const [mappingNote, setMappingNote] = useStateAD("");
  const [sourceReferenceUrl, setSourceReferenceUrl] = useStateAD("");
  const [savingReview, setSavingReview] = useStateAD(false);
  const [reviewMessage, setReviewMessage] = useStateAD(null);
  const risks = [...new Set(cases.flatMap(item => item.risk_types || []))].sort();
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = cases.filter(item => {
    const haystack = [item.id, item.title, item.summary, ...(item.keywords || [])].join(" ").toLowerCase();
    const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
    const matchesRisk = riskFilter === "all" || (item.risk_types || []).includes(riskFilter);
    return matchesQuery && matchesRisk;
  });

  function openCase(item) {
    setViewingCase(item);
    setReviewNote(item.review_notes || "");
    setRiskTypeInput((item.risk_types || []).join(", "));
    setRhirInput((item.rhir_fields || []).join(", "));
    setMappingNote(item.mapping_notes || "");
    setSourceReferenceUrl(item.source_reference_url || "");
    setReviewMessage(null);
  }

  function buildMachineReadableCase(item) {
    const originalRecord = item.case_record && typeof item.case_record === "object"
      ? item.case_record
      : {};

    return {
      ...originalRecord,
      id: item.id,
      sourceType: item.source_type,
      sourceName: item.source_name,
      sourceUrl: item.source_url,
      sourceReferenceUrl: item.source_reference_url || null,
      title: item.title,
      year: item.year,
      keywords: item.keywords || [],
      rhirFields: item.rhir_fields || [],
      riskTypes: item.risk_types || [],
      summary: item.summary,
      commonOutcome: item.common_outcome,
      legalBasis: item.legal_basis || [],
      actionHints: item.action_hints || [],
      evidenceToKeep: item.evidence_to_keep || [],
      confidence: item.confidence,
      review: {
        status: item.review_status,
        notes: item.review_notes || null,
        reviewedAt: item.reviewed_at || null,
        reviewedBy: item.reviewed_by || null,
        mappingNotes: item.mapping_notes || null
      },
      notes: item.notes || null,
      createdAt: item.created_at || null,
      updatedAt: item.updated_at || null
    };
  }

  function openJsonCase(item) {
    setViewingJsonCase(item);
    setJsonCopyMessage("");
  }

  async function copyCaseJson() {
    if (!viewingJsonCase) return;
    try {
      const content = JSON.stringify(buildMachineReadableCase(viewingJsonCase), null, 2);
      await navigator.clipboard.writeText(content);
      setJsonCopyMessage("已複製 JSON");
    } catch (error) {
      setJsonCopyMessage(`複製失敗：${error?.message || error}`);
    }
  }

  async function handleReview(decision) {
    if (!viewingCase) return;
    const safeReferenceUrl = sourceReferenceUrl.trim() ? safeHttpUrl(sourceReferenceUrl) : "";
    if (sourceReferenceUrl.trim() && !safeReferenceUrl) {
      setReviewMessage("補充來源連結請貼完整網址，例如 https://example.com");
      return;
    }
    setSavingReview(true);
    setReviewMessage(null);
    try {
      const updated = await window.RU_SUPABASE.updateEvidenceReview(viewingCase.id, {
        decision,
        reviewNotes: reviewNote,
        riskTypes: parseTagList(riskTypeInput),
        rhirFields: parseTagList(rhirInput),
        mappingNotes: mappingNote,
        sourceReferenceUrl: safeReferenceUrl
      });
      setReviewMessage(`已儲存為 ${REVIEW_STATUS_META[updated.review_status]?.label || updated.review_status}`);
      onReviewed?.(updated);
      setViewingCase(current => current ? { ...current, ...updated } : current);
    } catch (error) {
      setReviewMessage(`無法更新：${error.message}`);
    } finally {
      setSavingReview(false);
    }
  }

  return (
    <section style={{ marginBottom: 28 }}>
      <div className="page-header" style={{ marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>案例檢查</h2>
          <p className="page-sub" style={{ margin: "4px 0 0" }}>
            分別檢查案例內容與結構資料；只有已驗證案例能作為正式建議引用。
          </p>
        </div>
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{filtered.length} / {cases.length} 筆</span>
      </div>

      <div className="toolbar">
        <input
          className="search"
          style={{ width: 280 }}
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="搜尋案例、縣市或關鍵詞"
        />
        <select className="chip" value={riskFilter} onChange={event => setRiskFilter(event.target.value)}>
          <option value="all">全部風險類型</option>
          {risks.map(risk => <option key={risk} value={risk}>{risk}</option>)}
        </select>
      </div>

      <div className="tablewrap">
        <table className="table">
          <thead>
            <tr><th>案例</th><th>年份 / 地區</th><th>Risk Type</th><th>RHIR 欄位</th><th>狀態</th><th>內容</th></tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="t-title">{item.title}</div>
                  <div className="t-meta">{item.id}</div>
                </td>
                <td>{item.year || "—"}</td>
                <td><span className="mono" style={{ fontSize: 11 }}>{(item.risk_types || []).join(", ") || "待配對"}</span><div className="t-meta">{item.mapping_notes || "可填暫定對應，之後再審核"}</div></td>
                <td><span className="mono" style={{ fontSize: 11 }}>{(item.rhir_fields || []).join(", ") || "待配對"}</span><div className="t-meta">{item.mapping_notes || "可填暫定對應，之後再審核"}</div></td>
                <td><ReviewStatusBadge status={item.review_status} /></td>
                <td>
                  <div className="evidence-row-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openCase(item)}>案例審查</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openJsonCase(item)}>結構資料</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--ink-4)" }}>找不到符合的案例</td></tr>}
          </tbody>
        </table>
      </div>

      {viewingCase && (
        <div className="modal-back" onClick={() => setViewingCase(null)}>
          <div className="modal" style={{ width: "min(820px, calc(100vw - 32px))" }} onClick={event => event.stopPropagation()}>
            <div className="modal-head"><h3>{viewingCase.title}</h3></div>
            <div className="modal-body" style={{ maxHeight: "70vh", overflow: "auto" }}>
              <p className="t-meta mono">{viewingCase.id} · {viewingCase.source_name} · {viewingCase.year || "年份未載"}</p>
              <div className="callout" style={{ margin: "14px 0" }}>{viewingCase.summary}</div>
              <p><strong>常見結果：</strong>{viewingCase.common_outcome || "—"}</p>
              <p><strong>目前狀態：</strong><ReviewStatusBadge status={viewingCase.review_status} /></p>
              <p><strong>建議行動：</strong>{(viewingCase.action_hints || []).join("；") || "—"}</p>
              <p><strong>應保留證據：</strong>{(viewingCase.evidence_to_keep || []).join("；") || "—"}</p>
              <p><strong>備註：</strong>{viewingCase.notes || "—"}</p>
              <div style={{ marginTop: 12 }}><strong>上次審核備註：</strong><div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{viewingCase.review_notes || "尚未留下審核備註"}</div></div>
              <label style={{ display: "block", marginTop: 16 }}>
                <strong>Risk Type（可手動修改）</strong>
                <input value={riskTypeInput} onChange={event => setRiskTypeInput(event.target.value)} placeholder="例如：deposit_dispute" style={{ display: "block", width: "100%", marginTop: 6, padding: 8, border: "1px solid var(--hairline)", borderRadius: 4 }} />
              </label>
              <label style={{ display: "block", marginTop: 12 }}>
                <strong>RHIR 欄位（可手動修改）</strong>
                <input value={rhirInput} onChange={event => setRhirInput(event.target.value)} placeholder="例如：leaseTerms.depositRefundTerms" style={{ display: "block", width: "100%", marginTop: 6, padding: 8, border: "1px solid var(--hairline)", borderRadius: 4 }} />
              </label>
              <label style={{ display: "block", marginTop: 12 }}>
                <strong>暫定對應備註</strong>
                <textarea value={mappingNote} onChange={event => setMappingNote(event.target.value)} placeholder="例如：這是暫定 RHIR 對應，下一輪請確認是否要新增正式欄位" style={{ display: "block", width: "100%", minHeight: 58, marginTop: 6, padding: 8, border: "1px solid var(--hairline)", borderRadius: 4 }} />
              </label>
              <label style={{ display: "block", marginTop: 12 }}>
                <strong>補充來源連結</strong>
                <input value={sourceReferenceUrl} onChange={event => setSourceReferenceUrl(event.target.value)} placeholder="貼上你找到這筆資料的網址" style={{ display: "block", width: "100%", marginTop: 6, padding: 8, border: "1px solid var(--hairline)", borderRadius: 4 }} />
                {safeHttpUrl(sourceReferenceUrl) && <a href={safeHttpUrl(sourceReferenceUrl)} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 6 }}>開啟補充來源 ↗</a>}
              </label>
              <label style={{ display: "block", marginTop: 16 }}>
                <strong>審核備註</strong>
                <textarea
                  value={reviewNote}
                  onChange={event => setReviewNote(event.target.value)}
                  placeholder="例如：確定是租屋，但 RHIR 欄位要改成 leaseTerms.repairResponsibility"
                  style={{ display: "block", width: "100%", minHeight: 72, marginTop: 6, padding: 8, border: "1px solid var(--hairline)", borderRadius: 4 }}
                />
              </label>
              {reviewMessage && <div className="callout" style={{ marginTop: 12 }}>{reviewMessage}</div>}
              <a href={viewingCase.source_url} target="_blank" rel="noreferrer">查看原始來源 ↗</a>
              {viewingCase.source_reference_url && <><span style={{ color: "var(--ink-4)" }}>　</span><a href={viewingCase.source_reference_url} target="_blank" rel="noreferrer">查看補充來源 ↗</a></>}
            </div>
            <div className="modal-foot" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn" disabled={savingReview} onClick={() => handleReview(viewingCase.review_status)}>儲存欄位</button>
                <button className="btn btn-primary" disabled={savingReview} onClick={() => handleReview("verified")}>通過</button>
                <button className="btn" disabled={savingReview} onClick={() => handleReview("revise")}>需要修改</button>
                <button className="btn btn-danger" disabled={savingReview} onClick={() => handleReview("rejected")}>排除</button>
              </div>
              <button className="btn" onClick={() => setViewingCase(null)}>關閉</button>
            </div>
          </div>
        </div>
      )}

      {viewingJsonCase && (
        <div className="modal-back" onClick={() => setViewingJsonCase(null)}>
          <div className="modal evidence-json-modal" onClick={event => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3 style={{ marginBottom: 4 }}>{viewingJsonCase.title}</h3>
                <div className="t-meta mono">STRUCTURED CASE DATA · {viewingJsonCase.id}</div>
              </div>
            </div>
            <div className="modal-body evidence-json-body">
              <div className="callout" style={{ marginBottom: 12 }}>
                此處以人工審核後的 RHIR 欄位、Risk Type 與審核狀態覆蓋原始自動整理值；只供複製與系統串接，不會修改資料庫。
              </div>
              <pre className="evidence-json-view">
                {JSON.stringify(buildMachineReadableCase(viewingJsonCase), null, 2)}
              </pre>
              {jsonCopyMessage && <div className="t-meta" style={{ marginTop: 8 }}>{jsonCopyMessage}</div>}
            </div>
            <div className="modal-foot" style={{ justifyContent: "space-between" }}>
              <button className="btn btn-primary" onClick={copyCaseJson}>複製 JSON</button>
              <button className="btn" onClick={() => setViewingJsonCase(null)}>關閉</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AdminPage({ setRoute }) {
  const { Icon, highlightJSON, downloadJSON } = window.RU;
  const [uploads, setUploads]           = useStateAD([]);
  const [loading, setLoading]           = useStateAD(true);
  const [error, setError]               = useStateAD(null);
  const [viewingJson, setViewingJson]   = useStateAD(null);
  const [loadingJsonId, setLoadingJsonId] = useStateAD(null);
  const [evidenceCases, setEvidenceCases] = useStateAD([]);
  const [evidenceLoading, setEvidenceLoading] = useStateAD(true);
  const [evidenceError, setEvidenceError] = useStateAD(null);

  useEffectAD(() => {
    if (!window.RU_SUPABASE?.isConfigured()) {
      setError("Supabase 尚未設定。請先在 supabase.jsx 填入你的 Project URL 和 Anon Key，然後重新整理。");
      setLoading(false);
      return;
    }
    window.RU_SUPABASE.getAllUploads()
      .then(data => setUploads(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffectAD(() => {
    if (!window.RU_SUPABASE?.isConfigured()) {
      setEvidenceError("Supabase 尚未設定。");
      setEvidenceLoading(false);
      return;
    }
    window.RU_SUPABASE.getAllEvidenceCases()
      .then(data => setEvidenceCases(data))
      .catch(err => setEvidenceError(err.message))
      .finally(() => setEvidenceLoading(false));
  }, []);

  async function handleViewJson(upload) {
    setLoadingJsonId(upload.id);
    try {
      const json = await window.RU_SUPABASE.getUploadJson(upload.id);
      setViewingJson({ id: upload.id, recordId: upload.record_id, json });
    } catch (err) {
      alert("無法載入 RHIR JSON：" + err.message);
    } finally {
      setLoadingJsonId(null);
    }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString("zh-TW", { dateStyle: "short", timeStyle: "short" });
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">RHIR 資料庫</h1>
          <p className="page-sub">所有上傳至 RHIR Server 的交付記錄</p>
        </div>
        {!loading && !error && (
          <span className="mono" style={{ fontSize: 13, color: "var(--ink-3)", alignSelf: "flex-end" }}>
            共 {uploads.length} 筆
          </span>
        )}
      </div>

      <EvidenceWorkBoard cases={evidenceCases} loading={evidenceLoading} error={evidenceError} />
      {!evidenceLoading && !evidenceError && (
        <EvidenceReviewList
          cases={evidenceCases}
          onReviewed={updated => setEvidenceCases(current => current.map(item => item.id === updated.id ? { ...item, ...updated } : item))}
        />
      )}

      {loading && (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--ink-3)" }}>
          載入中...
        </div>
      )}

      {error && (
        <div className="callout">
          <span className="ic" style={{ color: "var(--s-missing-ink)" }}>
            <Icon name="alert" size={14} />
          </span>
          <div>
            <strong>無法連線至資料庫</strong>
            <p style={{ margin: "6px 0 0" }}>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="tablewrap">
          <table className="table">
            <thead>
              <tr>
                <th>上傳時間</th>
                <th>Record ID</th>
                <th>物件</th>
                <th>地區</th>
                <th>租金</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--ink-4)", padding: "48px 0" }}>
                    尚無上傳紀錄
                  </td>
                </tr>
              )}
              {uploads.map(u => (
                <tr key={u.id}>
                  <td style={{ color: "var(--ink-3)", whiteSpace: "nowrap" }}>{formatDate(u.uploaded_at)}</td>
                  <td><span className="t-id">{u.record_id}</span></td>
                  <td className="t-title">{u.title || "—"}</td>
                  <td>{u.district || "—"}</td>
                  <td className="mono" style={{ fontSize: 13 }}>
                    {u.monthly_rent ? `NT$ ${u.monthly_rent.toLocaleString()}` : "—"}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleViewJson(u)}
                      disabled={loadingJsonId === u.id}
                    >
                      <Icon name="code" size={13} />
                      {loadingJsonId === u.id ? "載入中..." : "查看 JSON"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewingJson && (
        <div className="modal-back" onClick={() => setViewingJson(null)}>
          <div
            className="modal"
            style={{ width: "min(960px, calc(100vw - 32px))" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <h3>
                RHIR JSON{" "}
                <span className="mono" style={{ color: "var(--accent)" }}>{viewingJson.recordId}</span>
              </h3>
            </div>
            <div className="modal-body" style={{ maxHeight: "70vh", overflow: "auto" }}>
              <pre
                className="import-json"
                dangerouslySetInnerHTML={{ __html: highlightJSON(viewingJson.json) }}
              />
            </div>
            <div className="modal-foot" style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={() => downloadJSON(viewingJson.json, viewingJson.recordId)}
              >
                <Icon name="download" size={14} />
                下載 JSON
              </button>
              <button className="btn" onClick={() => setViewingJson(null)}>
                <Icon name="x" size={14} />
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.AdminPage = AdminPage;
