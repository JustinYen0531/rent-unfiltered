// Admin — view all RHIR uploads in the database

const { useState: useStateAD, useEffect: useEffectAD } = React;

function AdminPage({ setRoute }) {
  const { Icon, highlightJSON, downloadJSON } = window.RU;
  const [uploads, setUploads]           = useStateAD([]);
  const [loading, setLoading]           = useStateAD(true);
  const [error, setError]               = useStateAD(null);
  const [viewingJson, setViewingJson]   = useStateAD(null);
  const [loadingJsonId, setLoadingJsonId] = useStateAD(null);

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
