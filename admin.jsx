// Admin — view all RHIR uploads in the database

const { useState: useStateAD, useEffect: useEffectAD } = React;

const EVIDENCE_WORKPLAN = [
  {
    sourceType: "research",
    sourceName: "崔媽媽基金會",
    target: 3,
    focus: "看屋前付款、押金返還、修繕 / 漏水",
    note: "適合整理具體情境、租客行動與應保留證據。",
    url: "https://www.tmm.org.tw/"
  },
  {
    sourceType: "gov",
    sourceName: "內政部不動產資訊平台",
    target: 5,
    focus: "押金、電費、修繕、提前終止、租賃權益",
    note: "優先使用糾紛案例；糾紛統計只做背景數據，不直接當案例卡。",
    url: "https://pip.moi.gov.tw/Publicize/Info/G2020"
  },
  {
    sourceType: "court",
    sourceName: "司法院裁判書查詢",
    target: 2,
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

function EvidenceWorkBoard({ cases, loading, error }) {
  const bySource = cases.reduce((counts, item) => {
    counts[item.source_type] = (counts[item.source_type] || 0) + 1;
    return counts;
  }, {});
  const totalTarget = EVIDENCE_WORKPLAN.reduce((sum, item) => sum + item.target, 0);
  const totalDone = cases.filter(item => item.review_status !== "archived").length;
  const remaining = Math.max(totalTarget - totalDone, 0);
  const percent = Math.min(Math.round((totalDone / totalTarget) * 100), 100);

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
          {loading ? "讀取案例中..." : `${totalDone}/${totalTarget} · 還差 ${remaining} 筆`}
        </span>
      </div>

      <div className="stat-row" style={{ marginBottom: 14 }}>
        <div className="stat">
          <div className="stat-label">第一批目標</div>
          <div className="stat-value">{totalTarget}<span className="delta mono">筆</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">已入庫</div>
          <div className="stat-value">{totalDone}<span className="delta mono">筆</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">待補資料</div>
          <div className="stat-value">{remaining}<span className="delta mono">筆</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">完成度</div>
          <div className="stat-value">{percent}<span className="delta mono">%</span></div>
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
          const done = bySource[item.sourceType] || 0;
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
              <div className="evidence-work-meta">還需 {left} 筆 · {item.note}</div>
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
