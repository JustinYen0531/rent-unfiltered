// Detail page — left version list + right content with 4 tabs

const { useState: useStateD, useMemo: useMemoD } = React;

function DetailPage({ setRoute, recordId }) {
  const { SAMPLE_RECORDS, VERSIONS_0142, FIELD_GROUPS, REPORT_X2, RECORD_0142_RHIR } = window.RU_DATA;
  const { Icon, Badge, RiskPill, Crumbs, downloadJSON } = window.RU;
  const bundle = window.RU_DATA.getRecordBundle(recordId);
  const record = bundle?.record || SAMPLE_RECORDS.find(r => r.id === recordId) || SAMPLE_RECORDS[0];
  const versions = bundle?.versions || VERSIONS_0142;
  const fieldGroups = bundle?.fieldGroups || FIELD_GROUPS;
  const rhir = bundle?.rhir || RECORD_0142_RHIR;
  const report = bundle?.report || REPORT_X2;

  const [activeVer, setActiveVer] = useStateD(versions[0].id);
  const [tab, setTab] = useStateD("fields");
  const [showAddModal, setShowAddModal] = useStateD(false);
  const activeVersion = versions.find(v => v.id === activeVer) || versions[0];

  return (
    <>
      <Crumbs setRoute={setRoute} items={[
        { label: "租屋紀錄", to: { name: "home" } },
        { label: record.title },
      ]}/>

      <div className="page">
        {/* Detail head */}
        <div className="detail-head">
          <div style={{flex:1}}>
            <div className="mono" style={{fontSize:11, color:"#5a6573", letterSpacing:"0.08em"}}>
              {record.id} · RHIR v0.1
            </div>
            <h1>{record.title}</h1>
            <div className="meta">
              <span><span className="k">ADDRESS</span>{record.address}</span>
              <span><span className="k">TYPE</span>{record.summary}</span>
              <span><span className="k">RENT</span><span className="mono">NT$ {record.rent.toLocaleString()}</span> / 月</span>
              <span><span className="k">CREATED</span><span className="mono">{record.createdAt}</span></span>
              <span><span className="k">UPDATED</span><span className="mono">{record.updatedAt}</span></span>
            </div>
          </div>
          <div style={{display:"flex", gap:8, flexShrink:0}}>
            <button className="btn" onClick={() => downloadJSON(rhir, record.id)}>
              <Icon name="download" size={14}/> 下載 RHIR
            </button>
            <button className="btn"><Icon name="copy" size={14}/> 複製紀錄</button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Icon name="git" size={14}/> 新增子版本
            </button>
          </div>
        </div>

        <div className="detail-grid">
          {/* Version list */}
          <aside className="aside">
            <div className="aside-head">
              <div className="aside-title">版本（{versions.length}）</div>
              <button className="aside-add" onClick={() => setShowAddModal(true)} title="新增子版本">+</button>
            </div>
            <ul className="vlist">
              {versions.map(v => (
                <li
                  key={v.id}
                  className={`vitem ${activeVer === v.id ? "active" : ""}`}
                  onClick={() => setActiveVer(v.id)}
                >
                  <div className="mono vlabel">{v.label}</div>
                  <div>
                    <div style={{fontSize:12, color:"#2a313b"}}>{v.title}</div>
                    <div className="vmeta mono">{v.createdAt.slice(0,10)}</div>
                  </div>
                  <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3}}>
                    {v.hasReport
                      ? <span className="mono" style={{fontSize:10, color:"#1652f0"}}>RRI {v.rri}</span>
                      : <span className="mono" style={{fontSize:10, color:"#8a93a0"}}>未分析</span>}
                    <span className="vstatus mono">{Math.round(v.completion*100)}%</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="aside-foot">
              <div style={{marginBottom:6}}>子版本是延伸，不是覆蓋。每個版本都會保留為獨立節點，可比較不同填寫狀態與分析結果。</div>
            </div>
          </aside>

          {/* Content */}
          <main>
            <VersionHeader version={activeVersion} recordId={record.id} setRoute={setRoute} nextLabel={`X-${versions.length}`}/>

            <div className="tabs">
              <button className={`tab ${tab === "fields" ? "active" : ""}`} onClick={() => setTab("fields")}>
                <Icon name="sliders" size={14}/> 欄位填寫情形
                <span className="tabcount mono">{Math.round(activeVersion.completion*31)}/31</span>
              </button>
              <button className={`tab ${tab === "rhir" ? "active" : ""}`} onClick={() => setTab("rhir")}>
                <Icon name="code" size={14}/> 查看 RHIR
                <span className="tabcount mono">JSON</span>
              </button>
              <button className={`tab ${tab === "report" ? "active" : ""}`} onClick={() => setTab("report")}>
                <Icon name="chart" size={14}/> 分析報告
                {activeVersion.hasReport
                  ? <span className="tabcount mono">RRI {activeVersion.rri}</span>
                  : <span className="tabcount mono">未生成</span>}
              </button>
              <button className={`tab ${tab === "strategy" ? "active" : ""}`} onClick={() => setTab("strategy")}>
                <Icon name="sparkle" size={14}/> 策略分析
                <span className="tabcount mono">PERSONAL</span>
              </button>
            </div>

            {tab === "fields" && <FieldCompletionView groups={fieldGroups} rhir={rhir} recordId={record.id} setRoute={setRoute}/>}
            {tab === "rhir" && <RHIRView data={rhir} recordId={record.id}/>}
            {tab === "report" && <ReportView report={report} version={activeVersion} rhir={rhir} recordId={record.id}/>}
            {tab === "strategy" && (
              <StrategyView
                key={`${record.id}-${activeVersion.id}`}
                version={activeVersion}
                rhir={rhir}
                recordId={record.id}
              />
            )}
          </main>
        </div>
      </div>

      {showAddModal && (
        <AddVersionModal
          onClose={() => setShowAddModal(false)}
          nextLabel={`X-${versions.length}`}
          recordId={record.id}
          setRoute={setRoute}
        />
      )}
    </>
  );
}

function VersionHeader({ version, recordId, setRoute, nextLabel }) {
  const { Icon } = window.RU;
  const openForm = (section = "") => {
    if (!recordId || !setRoute) return;
    setRoute({ name: "form", mode: "new", editRecordId: recordId, section, versionLabel: nextLabel || "X-1" });
  };
  return (
    <div className="detail-head" style={{padding:"14px 18px", marginBottom:18}}>
      <div style={{flex:1}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:4}}>
          <span className="mono" style={{fontSize:18, fontWeight:600, color:"#1652f0"}}>{version.label}</span>
          <span style={{fontSize:14, fontWeight:600}}>{version.title}</span>
        </div>
        <div style={{fontSize:12, color:"#5a6573"}}>
          建立於 <span className="mono">{version.createdAt}</span> · {version.author} · {version.note}
        </div>
      </div>
      <div style={{display:"flex", gap:14, alignItems:"center"}}>
        <div style={{textAlign:"right"}}>
          <div className="mono" style={{fontSize:10, color:"#8a93a0", letterSpacing:"0.06em", textTransform:"uppercase"}}>變動</div>
          <div className="mono" style={{fontSize:12}}>
            <span style={{color:"#0f6b55"}}>+{version.diff.added}</span>
            <span style={{color:"#5a6573", margin:"0 6px"}}>·</span>
            <span style={{color:"#8a5a0b"}}>~{version.diff.changed}</span>
          </div>
        </div>
        <div style={{height:32, width:1, background:"#e4e7ec"}}/>
        <button className="btn btn-sm"><Icon name="eye" size={12}/> 對照 X</button>
        <button className="btn btn-sm" onClick={() => openForm()}><Icon name="edit" size={12}/> 編輯表單</button>
      </div>
    </div>
  );
}

/* ---------- Tab 1: Field completion ---------- */

function FollowupQuestionsPanel({ questions, compact = false }) {
  const { Icon } = window.RU;
  if (!questions.length) return null;

  return (
    <div className="fg" style={{ marginBottom: compact ? 0 : 16 }}>
      <div className="fg-head">
        <h3>待詢問與現場確認</h3>
        <span className="meta mono">{questions.length} questions</span>
      </div>
      <ul style={{ listStyle: "none", padding: "6px 0", margin: 0 }}>
        {questions.map((item, index) => (
          <li key={`${item.field}-${index}`} style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 10, padding: "10px 16px", borderBottom: index === questions.length - 1 ? 0 : "1px solid var(--hairline)", fontSize: 13, alignItems: "start" }}>
            <span className="mono" style={{ color: "#8a93a0", fontSize: 11 }}>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <div>{item.question}</div>
              {!compact && <div style={{ color: "#5a6573", fontSize: 12, lineHeight: 1.5, marginTop: 3 }}>{item.reason}</div>}
              <div className="mono" style={{ color: "#8a93a0", fontSize: 11, marginTop: 3 }}>{item.field}</div>
            </div>
            <span className="badge badge-outline">{item.axis}</span>
          </li>
        ))}
      </ul>
      {!compact && (
        <div className="callout" style={{ margin: "0 16px 14px" }}>
          <span className="ic"><Icon name="info" size={14}/></span>
          <div>這些項目通常無法只靠 591 或平台文字判斷，需要詢問房東、看契約或現場查看。補齊後再重新建立版本，RHIR 與 RRI 才會更完整。</div>
        </div>
      )}
    </div>
  );
}

// Map RHIR schema-key prefix → form section id
const SCHEMA_PREFIX_TO_SECTION = {
  property: "property",
  cost: "cost",
  leaseTerms: "lease",
  safety: "safety",
  rights: "rights",
  locationContext: "property",
};
function sectionFromSchemaKey(key) {
  const prefix = String(key || "").split(".")[0];
  return SCHEMA_PREFIX_TO_SECTION[prefix] || "property";
}

function FieldCompletionView({ groups, rhir, recordId, setRoute }) {
  const { Icon, Badge } = window.RU;
  const openFormForField = (fieldKey) => {
    if (!recordId || !setRoute) return;
    setRoute({
      name: "form",
      mode: "new",
      editRecordId: recordId,
      section: sectionFromSchemaKey(fieldKey),
      versionLabel: "X-1",
    });
  };
  // counts across all groups
  const all = groups.flatMap(g => g.fields);
  const followupQuestions = window.RU.getFollowupQuestionsFromRhir(rhir);
  const tally = {
    disclosed: all.filter(f => f.status === "disclosed").length,
    partial: all.filter(f => f.status === "partial").length,
    missing: all.filter(f => f.status === "missing").length,
    inferred: all.filter(f => f.status === "inferred").length,
    conflict: all.filter(f => f.status === "conflict").length,
  };
  return (
    <>
      <div className="stat-row" style={{marginBottom:16}}>
        <Tally count={tally.disclosed} label="已揭露" status="disclosed"/>
        <Tally count={tally.partial} label="部分揭露" status="partial"/>
        <Tally count={tally.missing} label="未揭露" status="missing"/>
        <Tally count={tally.conflict + tally.inferred} label="衝突 / 推論" status="conflict"/>
      </div>

      <FollowupQuestionsPanel questions={followupQuestions}/>

      {groups.map(g => {
        const filled = g.fields.filter(f => f.status !== "missing").length;
        return (
          <div key={g.id} className="fg">
            <div className="fg-head">
              <h3>{g.title}</h3>
              <span className="meta">{filled}/{g.fields.length} · {g.id}</span>
            </div>
            {g.fields.map(f => (
              <div key={f.key} className="field">
                <div className="fname">
                  <div className="label">{f.label}</div>
                  <div className="key mono">{f.key}</div>
                </div>
                <div className={`fval ${f.value == null ? "missing" : ""}`}>
                  {f.value == null ? "— 尚未填寫" : f.value}
                </div>
                <div><Badge status={f.status}/></div>
                <div className="fsrc">{f.src}</div>
                <div className="factions">
                  <button className="btn btn-sm btn-ghost" title="編輯這個欄位" onClick={() => openFormForField(f.key)}>
                    <Icon name="edit" size={12}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <div className="callout" style={{marginTop:8}}>
        <span className="ic"><Icon name="info" size={14}/></span>
        <div>
          <strong>欄位狀態說明：</strong>
          <span className="badge badge-disclosed" style={{margin:"0 4px"}}><span className="dot"></span>已揭露</span>表示已明確填寫；
          <span className="badge badge-partial" style={{margin:"0 4px"}}><span className="dot"></span>部分揭露</span>表示資料不完整或界線模糊；
          <span className="badge badge-missing" style={{margin:"0 4px"}}><span className="dot"></span>未揭露</span>是空欄位；
          <span className="badge badge-inferred" style={{margin:"0 4px"}}><span className="dot"></span>推論</span>是系統自動推算；
          <span className="badge badge-conflict" style={{margin:"0 4px"}}><span className="dot"></span>衝突</span>表示資料與公開來源不一致。
        </div>
      </div>
    </>
  );
}

function Tally({ count, label, status }) {
  return (
    <div className="stat">
      <div className="stat-label" style={{display:"flex", alignItems:"center", gap:6}}>
        <span className={`dot`} style={{
          width:6, height:6, borderRadius:"50%",
          background: `var(--s-${status}-ink)`,
        }}/>
        {label}
      </div>
      <div className="stat-value mono">{count}</div>
    </div>
  );
}

/* ---------- Tab 2: RHIR JSON viewer ---------- */

function RHIRView({ data, recordId }) {
  const { Icon, copyJSON, downloadJSON, highlightJSON } = window.RU;
  const nodes = Object.keys(data);
  const [active, setActive] = useStateD("property");
  const [copyStatus, setCopyStatus] = useStateD("");
  const [uploadState, setUploadState] = useStateD("idle");
  const [uploadError, setUploadError] = useStateD("");
  const followupQuestions = window.RU.getFollowupQuestionsFromRhir(data);

  const subset = useMemoD(() => {
    return { [active]: data[active] };
  }, [active, data]);

  const handleCopy = async () => {
    const ok = await copyJSON(data);
    setCopyStatus(ok ? "已複製完整 RHIR" : "複製失敗，請改用下載");
    window.setTimeout(() => setCopyStatus(""), 1800);
  };

  const handleUpload = async () => {
    if (!window.RU_SUPABASE?.isConfigured()) {
      setUploadState("error");
      setUploadError("Supabase 尚未設定，請先在 supabase.jsx 填入 Project URL 和 Anon Key，然後重新整理頁面。");
      return;
    }
    setUploadState("uploading");
    setUploadError("");
    try {
      await window.RU_SUPABASE.uploadRhir(data);
      setUploadState("success");
    } catch (error) {
      setUploadState("error");
      setUploadError(error.message || "上傳失敗，請稍後再試。");
    }
  };

  return (
    <>
      <div className="json-shell">
        <div className="json-tree">
          <div style={{padding:"4px 14px", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", color:"#8a93a0"}}>
            RHIR Nodes
          </div>
          {nodes.map(n => {
            const fields = data[n];
            const count = typeof fields === "object" ? Object.keys(fields).length : 1;
            return (
              <div
                key={n}
                className={`node ${active === n ? "active" : ""}`}
                onClick={() => setActive(n)}
              >
                <span>{n}</span>
                <span className="c">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="json-body">
          <div className="json-toolbar">
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <span className="mono" style={{fontSize:11, color:"#5a6573"}}>
                rhir-v0.1.schema.json · <span style={{color:"#0e1116"}}>{active}</span>
              </span>
            </div>
            <div style={{display:"flex", gap:6}}>
              {copyStatus && <span className="mono" style={{fontSize:11, color:"#1652f0", alignSelf:"center"}}>{copyStatus}</span>}
              {uploadState === "error" && uploadError && <span className="mono" style={{fontSize:11, color:"var(--s-missing-ink)", alignSelf:"center"}}>{uploadError}</span>}
              {uploadState === "success" && <span className="mono" style={{fontSize:11, color:"var(--s-disclosed-ink)", alignSelf:"center"}}>已上傳</span>}
              <button className="btn btn-sm" onClick={handleUpload} disabled={uploadState === "uploading"}>
                {uploadState === "uploading" ? "上傳中..." : <><Icon name="database" size={12}/> 上傳資料庫</>}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={handleCopy}><Icon name="copy" size={12}/> 複製完整 JSON</button>
              <button className="btn btn-sm" onClick={() => downloadJSON(data, recordId)}><Icon name="download" size={12}/> 下載 .json</button>
            </div>
          </div>
          <pre dangerouslySetInnerHTML={{ __html: highlightJSON(subset) }}/>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:14}}>
        <RHIRNote title="value" body="實際填入的值。可以是字串、數字、布林、陣列、物件或 null。"/>
        <RHIRNote title="disclosureStatus" body="揭露狀態。可選 disclosed / partial / missing / inferred / supplemented / conflict / unknown。"/>
        <RHIRNote title="sourceType" body="此值的來源。MVP 通常為 user_input；推論欄位則為 systemInference。"/>
      </div>

      <div style={{ marginTop: 14 }}>
        <FollowupQuestionsPanel questions={followupQuestions} compact/>
      </div>
    </>
  );
}

function RHIRNote({ title, body }) {
  return (
    <div style={{border:"1px solid var(--hairline)", borderRadius:6, padding:"12px 14px", background:"var(--bg)"}}>
      <div className="mono" style={{fontSize:11, color:"#1652f0", marginBottom:4}}>{title}</div>
      <div style={{fontSize:12, color:"#5a6573", lineHeight:1.6}}>{body}</div>
    </div>
  );
}

/* ---------- Tab 3: Analysis report ---------- */

const RELATED_CASE_STATUS_LABELS = {
  conflict: "來源衝突",
  missing: "未揭露",
  unknown: "無法判斷",
  partial: "部分揭露",
  inferred: "系統推估",
  supplemented: "外部補足",
  disclosed: "已揭露"
};

const RELATED_CASE_SOURCE_LABELS = {
  gov: "政府案例",
  court: "法院裁判",
  research: "研究資料",
  interview: "訪談",
  social: "社群案例"
};

function useEvidenceRetrievalContext(rhir) {
  const [state, setState] = useStateD("loading");
  const [context, setContext] = useStateD(null);
  const [error, setError] = useStateD("");
  const [reloadToken, setReloadToken] = useStateD(0);

  React.useEffect(() => {
    let cancelled = false;

    if (!rhir) {
      setState("empty");
      setContext(null);
      return () => { cancelled = true; };
    }
    if (!window.RU_SUPABASE?.isConfigured()) {
      setState("error");
      setError("Supabase 尚未設定，無法查詢 Related Cases。");
      return () => { cancelled = true; };
    }

    setState("loading");
    setError("");
    window.RU_SUPABASE
      .buildEvidenceRetrievalContextFromRhir(rhir, {
        maxFindings: 6,
        limitPerFinding: 2
      })
      .then(result => {
        if (cancelled) return;
        setContext(result);
        setState(result?.findings?.length ? "done" : "empty");
      })
      .catch(retrievalError => {
        if (cancelled) return;
        setError(retrievalError?.message || String(retrievalError));
        setState("error");
      });

    return () => { cancelled = true; };
  }, [rhir, reloadToken]);

  return {
    state,
    context,
    error,
    reload: () => setReloadToken(value => value + 1)
  };
}

function RelatedCasesPanel({ retrieval }) {
  const { Icon } = window.RU;
  const { state, context, error, reload } = retrieval;
  const findings = context?.findings || [];
  const planner = context?.planner;
  const uniqueCaseCount = context?.stats?.uniqueCaseCount || 0;

  return (
    <div className="fg related-cases-panel" style={{marginTop:18}}>
      <div className="fg-head">
        <h3><Icon name="book" size={14}/> Related Cases · 對應案例</h3>
        <span className="meta mono">
          {state === "done" ? `${uniqueCaseCount} verified cases` : "DETERMINISTIC RETRIEVAL"}
        </span>
      </div>

      {state === "loading" && (
        <div className="related-cases-state">
          <Icon name="database" size={14}/>
          正在依 RHIR、揭露狀態與 Risk Type 查詢已驗證案例…
        </div>
      )}

      {state === "error" && (
        <div className="callout related-cases-callout">
          <span className="ic"><Icon name="alert" size={14}/></span>
          <div>
            <strong>案例查詢失敗</strong>
            <div className="related-cases-error">{error}</div>
            <button className="btn btn-sm" onClick={reload}>重新查詢</button>
          </div>
        </div>
      )}

      {state === "empty" && (
        <div className="related-cases-empty">
          <div>目前 RHIR 欄位與狀態沒有精確對應的 verified 案例。</div>
          <div className="t-meta">
            這不是「沒有風險」，而是目前 mapping 詞典尚無完全相符的三鍵組合；系統不會自動猜測近似案例。
          </div>
          <button className="btn btn-sm" onClick={reload}>重新查詢</button>
        </div>
      )}

      {state === "done" && (
        <>
          <div className="related-cases-summary">
            <div>
              從 <span className="mono">{planner?.inputFieldCount || 0}</span> 個 RHIR 欄位規劃出
              {" "}<span className="mono">{planner?.totalQueryCount || 0}</span> 組可追溯查詢，
              目前顯示 <span className="mono">{findings.length}</span> 組。
            </div>
            <button className="btn btn-sm" onClick={reload}>重新查詢</button>
          </div>

          <div className="related-findings">
            {findings.map((finding, findingIndex) => {
              const query = finding.query;
              return (
                <section
                  className="related-finding"
                  key={`${query.rhirField}-${query.disclosureStatus}-${query.riskType}`}
                >
                  <div className="related-finding-head">
                    <span className="related-finding-number mono">{String(findingIndex + 1).padStart(2, "0")}</span>
                    <div className="related-query">
                      <div className="related-query-field mono">{query.rhirField}</div>
                      <div className="related-query-tags">
                        <span className={`badge badge-${query.disclosureStatus}`}>
                          {RELATED_CASE_STATUS_LABELS[query.disclosureStatus] || query.disclosureStatus}
                        </span>
                        <span className="badge badge-outline mono">{query.riskType}</span>
                      </div>
                    </div>
                    <span className="related-match-count mono">{finding.totalMatches} matches</span>
                  </div>

                  <div className="related-case-list">
                    {finding.cases.map(evidenceCase => (
                      <article className="related-case-card" key={evidenceCase.id}>
                        <div className="related-case-head">
                          <div>
                            <div className="related-case-title">{evidenceCase.title}</div>
                            <div className="t-meta mono">
                              {RELATED_CASE_SOURCE_LABELS[evidenceCase.sourceType] || evidenceCase.sourceType}
                              {evidenceCase.year ? ` · ${evidenceCase.year}` : ""}
                              {evidenceCase.confidence ? ` · ${evidenceCase.confidence}` : ""}
                            </div>
                          </div>
                          <a href={evidenceCase.sourceUrl} target="_blank" rel="noreferrer" className="evidence-source-link">
                            查看來源 ↗
                          </a>
                        </div>
                        <p className="related-case-summary">{evidenceCase.summary}</p>
                        {evidenceCase.matchedMapping?.mappingNote && (
                          <div className="related-mapping-note">
                            <span className="mono">MAPPING</span>
                            {evidenceCase.matchedMapping.mappingNote}
                          </div>
                        )}
                        {evidenceCase.commonOutcome && (
                          <div className="related-case-outcome">
                            <strong>常見後果：</strong>{evidenceCase.commonOutcome}
                          </div>
                        )}
                        <div className="related-case-guidance">
                          {evidenceCase.actionHints?.length > 0 && (
                            <div>
                              <div className="related-case-label">可以怎麼做</div>
                              <ul>{evidenceCase.actionHints.slice(0, 2).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
                            </div>
                          )}
                          {evidenceCase.evidenceToKeep?.length > 0 && (
                            <div>
                              <div className="related-case-label">建議保存</div>
                              <ul>{evidenceCase.evidenceToKeep.slice(0, 2).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="callout related-cases-callout">
            <span className="ic"><Icon name="info" size={14}/></span>
            <div>
              案例用來說明資訊不清或條件衝突時可能出現的爭議脈絡，不代表目前房東違法，也不代表個案結果必然適用。
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const INSIGHT_ACTION_SOURCE = {
  mixed: {
    label: "AI × 案例一致",
    shortLabel: "一致",
    description: "AI 判斷與過去案例方向一致",
  },
  evidence_backed: {
    label: "案例支持",
    shortLabel: "案例",
    description: "建議可直接回溯到 verified 案例",
  },
  ai_assessment: {
    label: "AI 綜合判讀",
    shortLabel: "AI",
    description: "根據目前 RHIR 與 RRI 進行的判讀",
  },
};

const INSIGHT_ACTION_SOURCE_ORDER = {
  mixed: 0,
  evidence_backed: 1,
  ai_assessment: 2,
};

function sortInsightActionItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const sourceDifference =
        (INSIGHT_ACTION_SOURCE_ORDER[left.item?.sourceMode] ?? 99) -
        (INSIGHT_ACTION_SOURCE_ORDER[right.item?.sourceMode] ?? 99);
      if (sourceDifference !== 0) return sourceDifference;
      return Number(left.item?.priority || 99) - Number(right.item?.priority || 99)
        || left.index - right.index;
    })
    .map(entry => entry.item);
}

function InsightActionCard({ item, index }) {
  const { Icon } = window.RU;
  const [evidenceExpanded, setEvidenceExpanded] = useStateD(false);
  const sourceMode = Object.prototype.hasOwnProperty.call(INSIGHT_ACTION_SOURCE, item.sourceMode)
    ? item.sourceMode
    : "ai_assessment";
  const source = INSIGHT_ACTION_SOURCE[sourceMode];
  const references = Array.isArray(item.caseReferences) ? item.caseReferences : [];

  return (
    <article className={`insight-action-card insight-action-${sourceMode}`}>
      <div className="insight-action-rank mono">{String(index + 1).padStart(2, "0")}</div>
      <div className="insight-action-content">
        <div className="insight-action-head">
          <span className="insight-action-source">{source.label}</span>
          {references.length > 0 && (
            <span className="insight-action-case-count mono">{references.length} CASE{references.length > 1 ? "S" : ""}</span>
          )}
        </div>
        <h4>{item.title}</h4>
        <p>{item.rationale}</p>

        {references.length > 0 && (
          <div className="insight-action-evidence">
            <button
              className="insight-evidence-toggle"
              onClick={() => setEvidenceExpanded(expanded => !expanded)}
              aria-expanded={evidenceExpanded}
            >
              <span style={{
                display:"inline-flex",
                transform: evidenceExpanded ? "rotate(180deg)" : "none",
                transition:"transform 0.15s ease"
              }}>
                <Icon name="chevronDown" size={12}/>
              </span>
              {evidenceExpanded ? "收合案例依據" : "查看案例依據"}
            </button>

            {evidenceExpanded && (
              <div className="insight-evidence-box">
                {references.map((reference, referenceIndex) => (
                  <div className="insight-evidence-case" key={`${reference.caseId}-${referenceIndex}`}>
                    <div className="insight-evidence-case-head">
                      <div>
                        <span className="mono">{reference.caseId}</span>
                        <strong>{reference.title}</strong>
                      </div>
                      {reference.sourceUrl && (
                        <a href={reference.sourceUrl} target="_blank" rel="noreferrer">查看來源 ↗</a>
                      )}
                    </div>
                    <div className="t-meta">
                      {[reference.sourceName, reference.year, reference.confidence].filter(Boolean).join(" · ")}
                    </div>
                    {reference.relevance && <p>{reference.relevance}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function ReportView({ report, version, rhir, recordId }) {
  const { Icon } = window.RU;
  const [insightState, setInsightState] = useStateD("idle"); // "idle" | "loading" | "done" | "stub" | "error"
  const [insightResult, setInsightResult] = useStateD(null);
  const [insightCollapsed, setInsightCollapsed] = useStateD(false);
  const [insightSaveState, setInsightSaveState] = useStateD("loading");
  const [insightSaveMessage, setInsightSaveMessage] = useStateD("");
  const evidenceRetrieval = useEvidenceRetrievalContext(rhir);

  React.useEffect(() => {
    let cancelled = false;
    setInsightResult(null);
    setInsightState("idle");
    setInsightSaveState("loading");
    setInsightSaveMessage("正在讀取已儲存的 AI Insight…");

    if (!recordId || !version?.id || !window.RU_SUPABASE?.isConfigured()) {
      setInsightSaveState("idle");
      setInsightSaveMessage("");
      return () => { cancelled = true; };
    }

    window.RU_SUPABASE.getLatestAiInsight(recordId, version.id)
      .then(saved => {
        if (cancelled) return;
        if (!saved?.insight_result) {
          setInsightSaveState("idle");
          setInsightSaveMessage("尚未儲存 AI Insight");
          return;
        }

        setInsightResult(saved.insight_result);
        setInsightState("done");
        setInsightSaveState("saved");
        setInsightSaveMessage(`已載入 ${new Date(saved.created_at).toLocaleString("zh-TW")} 儲存的 Insight`);
      })
      .catch(loadError => {
        if (cancelled) return;
        setInsightSaveState("error");
        setInsightSaveMessage(`讀取已儲存 Insight 失敗：${loadError?.message || loadError}`);
      });

    return () => { cancelled = true; };
  }, [recordId, version?.id]);

  // Compute live range from RHIR bundle (no AI involved)
  const rri = (window.RU_RRI && rhir) ? window.RU_RRI.calculate(rhir) : null;
  if (!rri) {
    return (
      <div className="callout" style={{padding:"32px", justifyContent:"center", alignItems:"center", flexDirection:"column", textAlign:"center"}}>
        <Icon name="alert" size={28} className="ic"/>
        <h3 style={{margin:"8px 0 4px"}}>無法計算 RRI</h3>
        <p style={{color:"#5a6573", margin:"0 0 12px"}}>此版本缺少 RHIR 資料，請先補齊欄位。</p>
      </div>
    );
  }

  // Layer 2: template conclusion (deterministic, no AI)
  const conclusion = window.RU_CONCLUSION?.conclusionFromRri(rri);

  const minScore  = rri.minScore;
  const maxScore  = rri.maxScore;
  const midScore  = rri.midScore;
  const isCertain = rri.isCertain;
  const levelMin  = rri.levelMin;
  const levelMax  = rri.levelMax;
  const levelTag  = isCertain ? levelMin : (levelMin === levelMax ? levelMin : `${levelMin}～${levelMax}`);
  const pillType  = maxScore >= 61 ? "high" : maxScore >= 41 ? "mid" : "low";

  const dimEntries = Object.entries(rri.dimensions).map(([id, d]) => ({ id, name: d.label, min: d.min, max: d.max }));
  const insightActions = sortInsightActionItems(insightResult?.actionItems);

  async function handleGenerateInsight() {
    if (insightSaveState === "loading" || evidenceRetrieval.state === "loading") return;
    if (evidenceRetrieval.state === "error") {
      setInsightResult({
        status: "error",
        message: `Related Cases 查詢失敗，AI Insight 未送出：${evidenceRetrieval.error}`
      });
      setInsightState("error");
      return;
    }

    setInsightState("loading");
    try {
      const result = await window.RU_INSIGHT.generateInsight(
        conclusion,
        null,
        evidenceRetrieval.context
      );
      setInsightResult(result);
      if (result?.status === "not_implemented") setInsightState("stub");
      else if (result?.status === "error") setInsightState("error");
      else {
        setInsightState("done");
        setInsightSaveState("unsaved");
        setInsightSaveMessage("這份 Insight 尚未儲存");
      }
    } catch (e) {
      setInsightResult({ status: "error", message: String(e?.message || e) });
      setInsightState("error");
    }
  }

  async function handleSaveInsight() {
    if (!insightResult || insightState !== "done" || insightSaveState === "saving") return;

    setInsightSaveState("saving");
    setInsightSaveMessage("正在儲存 AI Insight…");
    try {
      const saved = await window.RU_SUPABASE.saveAiInsight({
        recordId,
        versionId: version.id,
        rriSnapshot: conclusion,
        evidenceContext: evidenceRetrieval.context || {
          retrievalMode: "deterministic-exact-v1",
          fallbackUsed: false,
          findings: [],
          uniqueCases: [],
          stats: {
            findingCount: 0,
            matchedFindingCount: 0,
            uniqueCaseCount: 0
          }
        },
        insightResult
      });
      setInsightSaveState("saved");
      setInsightSaveMessage(`已儲存 ${new Date(saved.created_at).toLocaleString("zh-TW")}`);
    } catch (saveError) {
      setInsightSaveState("error");
      setInsightSaveMessage(`儲存失敗：${saveError?.message || saveError}`);
    }
  }

  return (
    <>
      <div className="report-grid">
        <div className="rri-card">
          <div className="rri-head">
            <div className="rri-label">RRI · 租屋風險指數</div>
            <span className={`risk-pill risk-${pillType}`}>{levelTag}</span>
          </div>

          {/* Range score display */}
          <div className="rri-score mono">
            {isCertain
              ? <>{midScore}<span className="over">/ 100</span></>
              : <>{minScore}<span className="over" style={{fontSize:"0.55em", letterSpacing:0}}> – {maxScore} / 100</span></>
            }
          </div>

          {/* Bar: solid fill up to minScore, hatched band from minScore to maxScore */}
          <div className="rri-bar" style={{position:"relative"}}>
            <div className="fill" style={{width:`${minScore}%`}}/>
            {!isCertain && (
              <div style={{
                position:"absolute", top:0, bottom:0,
                left:`${minScore}%`, width:`${maxScore - minScore}%`,
                background:"repeating-linear-gradient(45deg, var(--accent) 0px, var(--accent) 2px, transparent 2px, transparent 6px)",
                opacity:0.35,
              }}/>
            )}
            <div className="seg" style={{left:"20%"}}/>
            <div className="seg" style={{left:"40%"}}/>
            <div className="seg" style={{left:"60%"}}/>
            <div className="seg" style={{left:"80%"}}/>
          </div>

          {!isCertain && (
            <div style={{fontSize:11, color:"#5a6573", marginTop:4}}>
              斜線區間（<span className="mono">{minScore}–{maxScore}</span>）為未揭露欄位的不確定範圍。補齊欄位後區間會縮小。
            </div>
          )}

          <div className="rri-meta">
            <div><div className="k">VERSION</div><div className="mono">{version.label}</div></div>
            <div><div className="k">GENERATED</div><div className="mono">{version.createdAt.slice(0,10)}</div></div>
            <div><div className="k">RULE SET</div><div className="mono">rri-v0.1</div></div>
            <div><div className="k">ENGINE</div><div className="mono">rule-based</div></div>
          </div>
          <div style={{borderTop:"1px solid var(--hairline)", paddingTop:12, fontSize:11, color:"#5a6573"}}>
            分數越高 = 風險越高 · <span className="mono">0–20</span> 低 · <span className="mono">21–40</span> 中低 · <span className="mono">41–60</span> 中 · <span className="mono">61–80</span> 高 · <span className="mono">81–100</span> 極高
          </div>
        </div>

        <div className="rri-axes">
          <h4>分面向分數（各滿分 20）</h4>
          {dimEntries.map(d => {
            const pctMin = (d.min / 20) * 100;
            const pctMax = (d.max / 20) * 100;
            const certain = d.min === d.max;
            const barColor = d.max >= 14 ? "var(--s-missing-ink)" : d.max >= 8 ? "var(--s-partial-ink)" : "var(--s-disclosed-ink)";
            return (
              <div className="axis" key={d.id}>
                <div className="aname">{d.name}</div>
                <div className="abar" style={{position:"relative"}}>
                  <div className="afill" style={{width:`${pctMin}%`, background: barColor}}/>
                  {!certain && (
                    <div style={{
                      position:"absolute", top:0, bottom:0,
                      left:`${pctMin}%`, width:`${pctMax - pctMin}%`,
                      background:"repeating-linear-gradient(45deg, var(--accent) 0px, var(--accent) 1px, transparent 1px, transparent 5px)",
                      opacity:0.3,
                    }}/>
                  )}
                </div>
                <div className="aval mono" style={{minWidth:52, textAlign:"right"}}>
                  {certain ? d.min.toFixed(1) : `${d.min.toFixed(0)}–${d.max.toFixed(0)}`}
                </div>
              </div>
            );
          })}
          {conclusion?.topIssues?.length > 0 && (
            <div style={{borderTop:"1px dashed var(--hairline)", paddingTop:10, marginTop:10}}>
              <div style={{fontSize:11, color:"#5a6573", marginBottom:6}}>主要風險原因（rule engine）</div>
              <ul className="risk-list">
                {conclusion.topIssues.slice(0,4).map((title, i) => (
                  <li key={i}>
                    <span className="num">{String(i+1).padStart(2,"0")}</span>
                    <div>
                      <div>{title}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Layer 2 — Template conclusion (always shown, no AI) */}
      {conclusion && (
        <div className="explain">
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8}}>
            <h4 style={{margin:0}}>RRI 結論</h4>
            <span className="mono" style={{fontSize:10, color:"#8a93a0", letterSpacing:"0.06em"}}>RULE-BASED · 固定格式</span>
          </div>
          <p style={{whiteSpace:"pre-line", margin:0}}>{conclusion.finalText}</p>
        </div>
      )}

      <RelatedCasesPanel retrieval={evidenceRetrieval}/>

      {/* Layer 3 — AI Insight (gated; pure風險脈絡解讀，不重算分數) */}
      <div className="fg" style={{marginTop:18}}>
        <div className="fg-head">
          <h3><Icon name="sparkle" size={14}/> AI Insight · 風險脈絡解讀</h3>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <span className="meta mono">
              {insightSaveState === "saved" ? "SAVED" : insightSaveState === "unsaved" ? "UNSAVED" : "OPTIONAL"}
            </span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setInsightCollapsed(collapsed => !collapsed)}
              aria-expanded={!insightCollapsed}
            >
              <span style={{
                display:"inline-flex",
                transform: insightCollapsed ? "none" : "rotate(180deg)",
                transition:"transform 0.15s ease"
              }}>
                <Icon name="chevronDown" size={11}/>
              </span>
              {insightCollapsed ? "展開" : "收合"}
            </button>
          </div>
        </div>
        {!insightCollapsed && (
          <>
          {insightSaveMessage && (
            <div style={{
              margin:"10px 16px 0",
              fontSize:11,
              color: insightSaveState === "error"
                ? "#dc2626"
                : insightSaveState === "saved"
                  ? "var(--s-disclosed-ink)"
                  : "#8a6500"
            }}>
              {insightSaveMessage}
            </div>
          )}

          {insightState === "idle" && (
          <div style={{padding:"18px 16px"}}>
            <p style={{color:"#5a6573", margin:"0 0 12px", fontSize:13, lineHeight:1.6}}>
              RRI 分數與結論已由 rule engine 產生（上方），AI Insight 不重算分數，只解讀風險之間的關聯、
              排出簽前最該問的問題，並使用上方 verified Related Cases 產生步驟、證據提醒與案例引用。
              <strong>需要手動觸發以節省算力。</strong>
            </p>
            <button
              className="btn btn-primary"
              onClick={handleGenerateInsight}
              disabled={
                insightSaveState === "loading"
                || evidenceRetrieval.state === "loading"
                || evidenceRetrieval.state === "error"
              }
            >
              <Icon name="sparkle" size={14}/>
              {insightSaveState === "loading"
                ? "讀取已儲存 Insight"
                : evidenceRetrieval.state === "loading"
                  ? "等待案例查詢"
                  : "生成 AI Insight"}
            </button>
            {evidenceRetrieval.state === "error" && (
              <div className="t-meta" style={{marginTop:8}}>
                請先在 Related Cases 區塊重新查詢，成功後才能產生有證據依據的 Insight。
              </div>
            )}
          </div>
        )}

        {insightState === "loading" && (
          <div style={{padding:"18px 16px", color:"#5a6573", display:"flex", alignItems:"center", gap:8}}>
            <Icon name="sparkle" size={14}/>
            正在呼叫 OpenRouter，解讀風險脈絡中…（首次呼叫可能 10–30 秒）
          </div>
        )}

        {insightState === "stub" && (
          <div className="callout" style={{margin:"12px 16px"}}>
            <span className="ic"><Icon name="info" size={14}/></span>
            <div>{insightResult?.message}</div>
          </div>
        )}

        {insightState === "error" && (
          <div className="callout" style={{margin:"12px 16px", background:"#fef2f2", borderColor:"#fecaca"}}>
            <span className="ic" style={{color:"#dc2626"}}><Icon name="alert" size={14}/></span>
            <div>
              <strong style={{color:"#dc2626"}}>AI Insight 失敗</strong>
              <div style={{whiteSpace:"pre-wrap", fontSize:12, marginTop:4, color:"#5a6573"}}>{insightResult?.message}</div>
              <button className="btn btn-sm" style={{marginTop:8}} onClick={handleGenerateInsight}>重試</button>
            </div>
          </div>
        )}

        {insightState === "done" && insightResult && (
          <div style={{padding:"6px 16px 16px"}}>
            {insightResult.insightSummary && (
              <p style={{margin:"6px 0 12px", lineHeight:1.7}}>{insightResult.insightSummary}</p>
            )}

            {insightResult.riskPattern?.length > 0 && (
              <div style={{margin:"12px 0"}}>
                <div className="mono" style={{fontSize:10, color:"#8a93a0", letterSpacing:"0.06em", marginBottom:6}}>RISK PATTERN</div>
                {insightResult.riskPattern.map((p, i) => (
                  <div key={i} style={{margin:"6px 0", padding:"10px 12px", background:"var(--accent-soft)", borderRadius:6, borderLeft:"3px solid var(--accent)"}}>
                    <div style={{fontWeight:600, fontSize:13, marginBottom:3}}>{p.title}</div>
                    <div style={{fontSize:12, color:"#2a313b", lineHeight:1.6}}>{p.explanation}</div>
                  </div>
                ))}
              </div>
            )}

            {insightResult.priorityQuestions?.length > 0 && (
              <div style={{margin:"14px 0"}}>
                <div className="mono" style={{fontSize:10, color:"#8a93a0", letterSpacing:"0.06em", marginBottom:6}}>PRIORITY QUESTIONS</div>
                <ol style={{margin:0, paddingLeft:20, fontSize:13, lineHeight:1.8}}>
                  {insightResult.priorityQuestions.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              </div>
            )}

            {insightActions.length > 0 && (
              <section className="insight-action-section">
                <div className="insight-action-section-head">
                  <div>
                    <div className="mono insight-section-label">PRIORITIZED ACTIONS</div>
                    <strong>重要行動</strong>
                  </div>
                  <div className="insight-action-legend" aria-label="建議來源顏色說明">
                    {Object.entries(INSIGHT_ACTION_SOURCE).map(([mode, source]) => (
                      <span className={`insight-legend-${mode}`} key={mode} title={source.description}>
                        <i></i>{source.shortLabel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="insight-action-list">
                  {insightActions.map((item, index) => (
                    <InsightActionCard
                      item={item}
                      index={index}
                      key={`${item.sourceMode}-${item.title}-${index}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {insightActions.length === 0 && insightResult.recommendedSteps?.length > 0 && (
              <div style={{margin:"14px 0"}}>
                <div className="mono" style={{fontSize:10, color:"#8a93a0", letterSpacing:"0.06em", marginBottom:6}}>RECOMMENDED STEPS · LEGACY</div>
                <ol style={{margin:0, paddingLeft:20, fontSize:13, lineHeight:1.8}}>
                  {insightResult.recommendedSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}

            {insightResult.evidenceToKeep?.length > 0 && (
              <div style={{margin:"14px 0"}}>
                <div className="mono" style={{fontSize:10, color:"#8a93a0", letterSpacing:"0.06em", marginBottom:6}}>EVIDENCE TO KEEP</div>
                <ul style={{margin:0, paddingLeft:20, fontSize:13, lineHeight:1.8}}>
                  {insightResult.evidenceToKeep.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            {insightActions.length === 0 && insightResult.evidenceReferences?.length > 0 && (
              <div className="insight-evidence-references">
                <div className="mono insight-section-label">VERIFIED CASE REFERENCES</div>
                {insightResult.evidenceReferences.map((reference, i) => (
                  <div className="insight-evidence-reference" key={`${reference.caseId || "case"}-${i}`}>
                    <div>
                      <span className="mono">{reference.caseId || "—"}</span>
                      {reference.title && <strong>{reference.title}</strong>}
                    </div>
                    {reference.relevance && <p>{reference.relevance}</p>}
                  </div>
                ))}
              </div>
            )}

            {insightResult.beginnerExplanation && (
              <div style={{margin:"14px 0", padding:"10px 12px", background:"#f8fafc", borderRadius:6, border:"1px solid var(--hairline)"}}>
                <div className="mono" style={{fontSize:10, color:"#8a93a0", letterSpacing:"0.06em", marginBottom:4}}>新手白話</div>
                <div style={{fontSize:13, lineHeight:1.6}}>{insightResult.beginnerExplanation}</div>
              </div>
            )}

            {insightResult.personalNote && (
              <div style={{margin:"14px 0", padding:"10px 12px", background:"#fff7ed", borderRadius:6, border:"1px solid #fed7aa"}}>
                <div className="mono" style={{fontSize:10, color:"#9a3412", letterSpacing:"0.06em", marginBottom:4}}>個人化提醒</div>
                <div style={{fontSize:13, lineHeight:1.6}}>{insightResult.personalNote}</div>
              </div>
            )}

            {insightResult.cautionNote && (
              <div style={{fontSize:11, color:"#8a93a0", fontStyle:"italic", marginTop:10, lineHeight:1.5}}>
                {insightResult.cautionNote}
              </div>
            )}

            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap", borderTop:"1px dashed var(--hairline)", marginTop:12, paddingTop:8, fontSize:10, color:"#8a93a0"}}>
              <div style={{display:"flex", alignItems:"center", gap:12, flexWrap:"wrap"}}>
                <span className="mono">MODEL · {insightResult.model || "—"}</span>
                {insightResult.usage && (
                  <span className="mono">
                    TOKENS · {insightResult.usage.total_tokens || (insightResult.usage.prompt_tokens + insightResult.usage.completion_tokens) || "—"}
                  </span>
                )}
              </div>
              <div style={{display:"flex", alignItems:"center", gap:8}}>
                <button
                  className="btn btn-sm"
                  onClick={handleSaveInsight}
                  disabled={insightSaveState === "saving" || insightSaveState === "saved"}
                >
                  <Icon name="database" size={11}/>
                  {insightSaveState === "saving"
                    ? "儲存中…"
                    : insightSaveState === "saved"
                      ? "已儲存"
                      : "儲存 Insight"}
                </button>
                <button className="btn btn-sm btn-ghost" onClick={handleGenerateInsight}><Icon name="sparkle" size={11}/> 重新生成</button>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* 建議簽前確認 — driven by conclusion.suggestedQuestions */}
      {conclusion?.suggestedQuestions?.length > 0 && (
        <div className="fg" style={{marginTop:18}}>
          <div className="fg-head">
            <h3>建議簽前確認</h3>
            <span className="meta mono">{conclusion.suggestedQuestions.length} questions</span>
          </div>
          <ul style={{listStyle:"none", padding:"6px 0", margin:0}}>
            {conclusion.suggestedQuestions.map((f, i) => (
              <li key={i} style={{display:"grid", gridTemplateColumns:"32px 1fr auto", gap:12, padding:"10px 16px", borderBottom: i === conclusion.suggestedQuestions.length-1 ? 0 : "1px solid var(--hairline)", fontSize:13, alignItems:"start"}}>
                <span className="mono" style={{color:"#8a93a0", fontSize:11}}>{String(i+1).padStart(2,"0")}</span>
                <div>
                  <div>{f.q}</div>
                  <div className="mono" style={{fontSize:11, color:"#8a93a0", marginTop:2}}>{f.field}</div>
                </div>
                <span className="badge badge-outline">{f.dimension}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="callout" style={{marginTop:18}}>
        <span className="ic"><Icon name="alert" size={14}/></span>
        <div>
          上方 RRI 與結論由 rule engine + template 產生，<strong>每次顯示都是即時重算</strong>，不消耗 AI 算力。AI Insight 是選擇性功能，需手動生成；儲存後會在同一瀏覽器再次開啟此版本時自動載入。本分析作為租屋決策輔助，不代表法律判定。
        </div>
      </div>
    </>
  );
}

/* ---------- Strategy analysis — personalized context + AI consultant ---------- */

const STRATEGY_DRAFT_STORAGE_PREFIX = "ru_strategy_draft_v1";
const STRATEGY_SPECIAL_NEEDS = [
  "需要租屋補助",
  "需要設籍／報稅",
  "攜帶寵物",
  "希望短租",
  "通勤時間重要",
  "無障礙需求",
];

function createDefaultStrategyProfile() {
  return {
    rentalGoal: "",
    moveUrgency: "一個月內",
    budgetFlexibility: "只能小幅調整",
    mustHaveConditions: "",
    negotiableConditions: "",
    redLines: "",
    specialNeeds: [],
    personalNote: "",
  };
}

function strategyStorageKey(recordId, versionId, suffix) {
  return `${STRATEGY_DRAFT_STORAGE_PREFIX}:${recordId}:${versionId}:${suffix}`;
}

function loadStrategyDraft(recordId, versionId) {
  try {
    const raw = window.localStorage.getItem(strategyStorageKey(recordId, versionId, "profile"));
    if (!raw) return createDefaultStrategyProfile();
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultStrategyProfile(),
      ...parsed,
      specialNeeds: Array.isArray(parsed?.specialNeeds) ? parsed.specialNeeds : [],
    };
  } catch (error) {
    return createDefaultStrategyProfile();
  }
}

function loadStrategyChatDraft(recordId, versionId) {
  try {
    const raw = window.localStorage.getItem(strategyStorageKey(recordId, versionId, "chat"));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function StrategyStatusCard({ label, value, state = "ready" }) {
  const { Icon } = window.RU;
  return (
    <div className={`strategy-status-card is-${state}`}>
      <span className="strategy-status-icon">
        <Icon name={state === "ready" ? "check" : state === "loading" ? "database" : "info"} size={13}/>
      </span>
      <div>
        <div className="strategy-status-label mono">{label}</div>
        <div className="strategy-status-value">{value}</div>
      </div>
    </div>
  );
}

const STRATEGY_SOURCE_META = {
  mixed: { label: "AI × 案例一致", className: "is-mixed" },
  evidence_backed: { label: "案例支持", className: "is-evidence" },
  ai_assessment: { label: "AI 判讀", className: "is-ai" },
};
const STRATEGY_PRIORITY_LABELS = {
  immediate: "立即處理",
  before_signing: "簽約前確認",
  negotiable: "可以談判",
  monitor: "持續觀察",
};

function getStrategyProfileCompletion(profile) {
  return [
    profile.rentalGoal,
    profile.moveUrgency,
    profile.budgetFlexibility,
    profile.mustHaveConditions,
    profile.negotiableConditions,
    profile.redLines,
    profile.specialNeeds.length > 0 ? "yes" : "",
    profile.personalNote,
  ].filter(value => String(value || "").trim()).length;
}

function hasPersonalStrategyInputs(profile) {
  return Boolean(
    profile.rentalGoal ||
    profile.mustHaveConditions ||
    profile.negotiableConditions ||
    profile.redLines ||
    profile.specialNeeds.length ||
    profile.personalNote
  );
}

function isStrategyProfileReady(profile) {
  const hasDecisionCondition = Boolean(
    profile.mustHaveConditions ||
    profile.negotiableConditions ||
    profile.redLines ||
    profile.specialNeeds.length ||
    profile.personalNote
  );
  return Boolean(
    profile.rentalGoal &&
    hasDecisionCondition &&
    getStrategyProfileCompletion(profile) >= 4
  );
}

function StrategyTraceDetails({ action }) {
  const trace = action.trace || {};
  return (
    <details className="strategy-trace">
      <summary>為什麼這樣建議？</summary>
      <div className="strategy-trace-grid">
        {trace.personalInputs?.length > 0 && (
          <div>
            <strong>你的條件</strong>
            {trace.personalInputs.map((input, index) => (
              <p key={`${input.field}-${index}`}>
                <span className="mono">{input.field}</span>：{input.value}
                {input.relevance ? `｜${input.relevance}` : ""}
              </p>
            ))}
          </div>
        )}
        {trace.rhirSignals?.length > 0 && (
          <div>
            <strong>物件訊號</strong>
            {trace.rhirSignals.map((signal, index) => (
              <p key={`${signal.field}-${index}`}>
                <span className="mono">{signal.field}</span>
                {signal.disclosureStatus ? ` · ${signal.disclosureStatus}` : ""}
              </p>
            ))}
          </div>
        )}
        {trace.rriSignals?.length > 0 && (
          <div>
            <strong>RRI 判讀</strong>
            {trace.rriSignals.map((signal, index) => <p key={index}>{signal}</p>)}
          </div>
        )}
        {trace.aiInsightActions?.length > 0 && (
          <div>
            <strong>AI Insight</strong>
            {trace.aiInsightActions.map((item, index) => (
              <p key={`${item.title}-${index}`}>{item.title}</p>
            ))}
          </div>
        )}
        {action.caseReferences?.length > 0 && (
          <div className="strategy-trace-wide">
            <strong>案例依據</strong>
            {action.caseReferences.map(reference => (
              <p key={reference.caseId}>
                {reference.sourceUrl
                  ? <a href={reference.sourceUrl} target="_blank" rel="noreferrer">{reference.title}</a>
                  : reference.title}
                {reference.relevance ? `｜${reference.relevance}` : ""}
              </p>
            ))}
          </div>
        )}
        <div className="strategy-trace-reason strategy-trace-wide">
          <strong>策略理由</strong>
          <p>{trace.reasonSummary}</p>
        </div>
      </div>
    </details>
  );
}

function StrategyResultPanel({
  result,
  state,
  message,
  canGenerate,
  needsRefresh,
  session,
  onGenerate,
  onRetrySave
}) {
  const { Icon } = window.RU;
  const isBusy = state === "generating" || state === "saving";
  const savedAt = session?.created_at
    ? new Date(session.created_at).toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <section className="strategy-result-card">
      <div className="strategy-card-head">
        <div>
          <div className="strategy-step mono">STEP 04</div>
          <h3><Icon name="sparkle" size={15}/> 我的個人策略</h3>
          <p>先產生並保存完整策略，之後才開放 AI 顧問針對這份策略繼續追問。</p>
        </div>
        {session && <span className="strategy-draft-state is-saved">已保存</span>}
      </div>

      {!result && (
        <div className="strategy-generate-empty">
          <span className="strategy-generate-icon"><Icon name="sparkle" size={20}/></span>
          <strong>{isBusy ? "正在整理你的個人策略…" : "情境填得差不多後，就可以生成"}</strong>
          <p>
            系統會整理優先行動、必問事項、談判點、紅線、證據清單與備用方案，
            並保留每項建議的來源依據。
          </p>
          <button
            className="btn btn-primary strategy-generate-btn"
            onClick={onGenerate}
            disabled={!canGenerate || isBusy}
          >
            <Icon name="sparkle" size={14}/>
            {state === "generating" ? "生成中…" : state === "saving" ? "保存中…" : "生成個人策略"}
          </button>
          {!canGenerate && !isBusy && (
            <span className="strategy-generate-hint">
              請至少選擇租屋目的，並填一項必要條件、紅線、特殊需求或補充說明。
            </span>
          )}
          {message && <div className="strategy-result-error">{message}</div>}
        </div>
      )}

      {result && (
        <div className="strategy-result-body">
          <div className="strategy-result-summary">
            <div>
              <span className="mono">DECISION DIRECTION</span>
              <p>{result.decisionSummary}</p>
            </div>
            <button className="btn btn-sm" onClick={onGenerate} disabled={!canGenerate || isBusy}>
              {isBusy ? "處理中…" : "重新生成"}
            </button>
          </div>

          {needsRefresh && (
            <div className="strategy-inline-note">
              你已修改個人情境；目前顯示的是上一份已保存策略。重新生成後才會套用新條件。
            </div>
          )}
          {message && (
            <div className="strategy-result-error">
              {message}
              {state === "unsaved" && (
                <button className="btn btn-sm" onClick={onRetrySave}>重試保存</button>
              )}
            </div>
          )}

          <div className="strategy-result-section">
            <div className="strategy-result-section-head">
              <h4>優先行動</h4>
              <span className="mono">{result.priorityActions?.length || 0} ACTIONS</span>
            </div>
            <div className="strategy-action-list">
              {(result.priorityActions || []).map((action, index) => {
                const source = STRATEGY_SOURCE_META[action.sourceMode] || STRATEGY_SOURCE_META.ai_assessment;
                return (
                  <article className={`strategy-action-card ${source.className}`} key={`${action.title}-${index}`}>
                    <div className="strategy-action-head">
                      <span className="strategy-action-index mono">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <div className="strategy-action-badges">
                          <span className="strategy-priority-badge">
                            {STRATEGY_PRIORITY_LABELS[action.priorityLevel] || action.priorityLevel}
                          </span>
                          <span className={`strategy-source-badge ${source.className}`}>{source.label}</span>
                        </div>
                        <h5>{action.title}</h5>
                      </div>
                    </div>
                    <p className="strategy-action-rationale">{action.rationale}</p>
                    <StrategyTraceDetails action={action}/>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="strategy-result-grid">
            <section>
              <h4>簽約／看房必問</h4>
              <ol>{(result.questionsToAsk || []).map((item, index) => <li key={index}>{item}</li>)}</ol>
            </section>
            <section>
              <h4>紅線提醒</h4>
              <ul>
                {(result.redLineWarnings || []).map((item, index) => (
                  <li key={index}><strong>{item.condition}</strong><span>{item.response}</span></li>
                ))}
              </ul>
            </section>
            <section>
              <h4>證據清單</h4>
              <ul>{(result.evidenceChecklist || []).map((item, index) => <li key={index}>{item}</li>)}</ul>
            </section>
            <section>
              <h4>備用方案</h4>
              <ul>{(result.fallbackPlan || []).map((item, index) => <li key={index}>{item}</li>)}</ul>
            </section>
          </div>

          {(result.negotiationPoints || []).length > 0 && (
            <div className="strategy-result-section">
              <div className="strategy-result-section-head"><h4>談判點</h4></div>
              <div className="strategy-negotiation-list">
                {result.negotiationPoints.map((item, index) => (
                  <article key={`${item.topic}-${index}`}>
                    <strong>{item.topic}</strong>
                    <p><span>目標</span>{item.target}</p>
                    <p><span>說法</span>{item.approach}</p>
                    <p><span>退路</span>{item.fallback}</p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {(result.copyMessages || []).length > 0 && (
            <details className="strategy-copy-messages">
              <summary>可複製的溝通草稿</summary>
              {result.copyMessages.map((item, index) => (
                <div key={`${item.label}-${index}`}>
                  <strong>{item.label}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
              <small>請依實際物件與對話情況調整後再使用。</small>
            </details>
          )}

          <div className="strategy-result-foot">
            <span>{savedAt ? `保存於 ${savedAt}` : "尚未完成資料庫保存"}</span>
            <span>{result.cautionNote}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function StrategyView({ version, rhir, recordId }) {
  const { Icon } = window.RU;
  const rri = (window.RU_RRI && rhir) ? window.RU_RRI.calculate(rhir) : null;
  const conclusion = rri ? window.RU_CONCLUSION?.conclusionFromRri(rri) : null;
  const evidenceRetrieval = useEvidenceRetrievalContext(rhir);
  const [profile, setProfile] = useStateD(() => loadStrategyDraft(recordId, version.id));
  const [draftState, setDraftState] = useStateD("saved");
  const [savedInsightRecord, setSavedInsightRecord] = useStateD(null);
  const [savedInsight, setSavedInsight] = useStateD(null);
  const [savedInsightState, setSavedInsightState] = useStateD("loading");
  const [chatMessages, setChatMessages] = useStateD(() => loadStrategyChatDraft(recordId, version.id));
  const [chatInput, setChatInput] = useStateD("");
  const [chatLoading, setChatLoading] = useStateD(false);
  const [strategyResult, setStrategyResult] = useStateD(null);
  const [strategySession, setStrategySession] = useStateD(null);
  const [strategyProfileSnapshot, setStrategyProfileSnapshot] = useStateD(null);
  const [strategyState, setStrategyState] = useStateD("loading");
  const [strategyMessage, setStrategyMessage] = useStateD("");
  const chatScrollRef = React.useRef(null);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        strategyStorageKey(recordId, version.id, "profile"),
        JSON.stringify(profile)
      );
      setDraftState("saved");
    } catch (error) {
      setDraftState("memory-only");
    }
  }, [profile, recordId, version.id]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(
        strategyStorageKey(recordId, version.id, "chat"),
        JSON.stringify(chatMessages)
      );
    } catch (error) {
      // Keep the current conversation in memory when local storage is unavailable.
    }
  }, [chatMessages, recordId, version.id]);

  React.useEffect(() => {
    let cancelled = false;
    setSavedInsight(null);
    setSavedInsightState("loading");

    if (!recordId || !version?.id || !window.RU_SUPABASE?.isConfigured()) {
      setSavedInsightState("missing");
      return () => { cancelled = true; };
    }

    window.RU_SUPABASE.getLatestAiInsight(recordId, version.id)
      .then(saved => {
        if (cancelled) return;
        if (!saved?.insight_result) {
          setSavedInsightState("missing");
          return;
        }
        setSavedInsightRecord(saved);
        setSavedInsight(saved.insight_result);
        setSavedInsightState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setSavedInsightState("error");
      });

    return () => { cancelled = true; };
  }, [recordId, version.id]);

  React.useEffect(() => {
    let cancelled = false;
    setStrategyState("loading");
    setStrategyMessage("");

    if (!recordId || !version?.id || !window.RU_SUPABASE?.isConfigured()) {
      setStrategyState("missing");
      return () => { cancelled = true; };
    }

    window.RU_SUPABASE.getLatestStrategySession(recordId, version.id)
      .then(saved => {
        if (cancelled) return;
        if (!saved?.strategy_result) {
          setStrategyState("missing");
          return;
        }
        setStrategySession(saved);
        setStrategyResult(saved.strategy_result);
        setStrategyProfileSnapshot(saved.strategy_profile);
        setChatMessages(Array.isArray(saved.consultation_messages) ? saved.consultation_messages : []);
        if (!hasPersonalStrategyInputs(profile) && saved.strategy_profile) {
          setProfile({
            ...createDefaultStrategyProfile(),
            ...saved.strategy_profile,
            specialNeeds: Array.isArray(saved.strategy_profile.specialNeeds)
              ? saved.strategy_profile.specialNeeds
              : [],
          });
        }
        setStrategyState("ready");
      })
      .catch(error => {
        if (cancelled) return;
        setStrategyState("load-error");
        setStrategyMessage(`讀取已保存策略失敗：${error.message}`);
      });

    return () => { cancelled = true; };
  }, [recordId, version.id]);

  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const updateProfile = (field, value) => {
    setDraftState("saving");
    setProfile(current => ({ ...current, [field]: value }));
  };

  const toggleSpecialNeed = (need) => {
    setDraftState("saving");
    setProfile(current => ({
      ...current,
      specialNeeds: current.specialNeeds.includes(need)
        ? current.specialNeeds.filter(item => item !== need)
        : [...current.specialNeeds, need],
    }));
  };

  const profileCompletion = getStrategyProfileCompletion(profile);
  const profileReady = isStrategyProfileReady(profile);
  const strategyNeedsRefresh = Boolean(
    strategyProfileSnapshot &&
    JSON.stringify(profile) !== JSON.stringify(strategyProfileSnapshot)
  );
  const generationDisabled =
    !profileReady ||
    strategyState === "generating" ||
    strategyState === "saving" ||
    savedInsightState === "loading" ||
    evidenceRetrieval.state === "loading" ||
    evidenceRetrieval.state === "error";

  const chatDisabled =
    !rri ||
    !strategyResult ||
    !strategySession ||
    strategyState !== "ready" ||
    strategyNeedsRefresh ||
    chatLoading ||
    savedInsightState === "loading" ||
    evidenceRetrieval.state === "loading" ||
    evidenceRetrieval.state === "error";

  async function handleSendStrategyChat() {
    const text = chatInput.trim();
    if (!text || chatDisabled) return;

    const nextMessages = [...chatMessages, { role: "user", content: text }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const history = chatMessages
        .filter(message => !message.error)
        .map(message => ({ role: message.role, content: message.content }));
      const result = await window.RU_INSIGHT.chatWithRri(
        conclusion,
        history,
        text,
        strategySession?.evidence_context || evidenceRetrieval.context,
        strategySession?.strategy_profile || profile,
        strategySession?.insight_snapshot || savedInsight,
        strategyResult
      );
      if (result.status === "ok") {
        const completedMessages = [...nextMessages, { role: "assistant", content: result.content }];
        setChatMessages(completedMessages);
        try {
          await window.RU_SUPABASE.updateStrategySessionMessages(
            strategySession.id,
            completedMessages
          );
        } catch (error) {
          setStrategyMessage(`對話已顯示，但同步保存失敗：${error.message}`);
        }
      } else {
        setChatMessages([
          ...nextMessages,
          { role: "assistant", content: result.message || "AI 顧問回應失敗", error: true }
        ]);
      }
    } catch (error) {
      setChatMessages([
        ...nextMessages,
        { role: "assistant", content: `呼叫失敗：${error.message}`, error: true }
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  async function saveGeneratedStrategy(generated, profileSnapshot = strategyProfileSnapshot) {
    setStrategyState("saving");
    setStrategyMessage("");
    setStrategyProfileSnapshot(profileSnapshot);
    try {
      const saved = await window.RU_SUPABASE.saveStrategySession({
        recordId,
        versionId: version.id,
        aiInsightId: savedInsightRecord?.id || null,
        strategyProfile: profileSnapshot,
        rriSnapshot: conclusion,
        evidenceContext: evidenceRetrieval.context,
        insightSnapshot: savedInsight,
        strategyResult: generated,
        consultationMessages: [],
      });
      setStrategySession(saved);
      setStrategyResult(saved.strategy_result);
      setChatMessages([]);
      setStrategyState("ready");
    } catch (error) {
      setStrategyResult(generated);
      setStrategyState("unsaved");
      setStrategyMessage(`策略已生成，但資料庫保存失敗：${error.message}`);
    }
  }

  async function handleGenerateStrategy() {
    if (generationDisabled) return;
    setStrategyState("generating");
    setStrategyMessage("");
    const profileSnapshot = JSON.parse(JSON.stringify(profile));

    try {
      const generated = await window.RU_INSIGHT.generateStrategy(
        conclusion,
        profileSnapshot,
        savedInsight,
        evidenceRetrieval.context
      );
      if (generated.status !== "ok") {
        setStrategyState(strategySession ? "ready" : "error");
        setStrategyMessage(generated.message || "個人策略生成失敗。");
        return;
      }
      await saveGeneratedStrategy(generated, profileSnapshot);
    } catch (error) {
      setStrategyState(strategySession ? "ready" : "error");
      setStrategyMessage(`個人策略生成失敗：${error.message}`);
    }
  }

  async function handleClearStrategyChat() {
    setChatMessages([]);
    if (!strategySession?.id) return;
    try {
      await window.RU_SUPABASE.updateStrategySessionMessages(strategySession.id, []);
    } catch (error) {
      setStrategyMessage(`本機對話已清除，但資料庫同步失敗：${error.message}`);
    }
  }

  function handleStrategyChatKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendStrategyChat();
    }
  }

  if (!rri) {
    return (
      <div className="callout strategy-blocked">
        <span className="ic"><Icon name="alert" size={16}/></span>
        <div>
          <strong>策略分析需要先完成 RRI</strong>
          <div>目前版本缺少可計算的 RHIR 資料，請先回到欄位填寫情形補齊資料。</div>
        </div>
      </div>
    );
  }

  return (
    <div className="strategy-page">
      <section className="strategy-hero">
        <div>
          <div className="strategy-eyebrow mono">PHASE 4 · PERSONAL STRATEGY</div>
          <h2>策略分析</h2>
          <p>
            前面的報告說明物件本身；這裡加入你的需求、限制與紅線，
            讓 AI 顧問協助整理適合你的確認與談判方向。
          </p>
        </div>
        <div className="strategy-privacy-note">
          <Icon name="info" size={14}/>
          個人情境只影響策略，不修改 RHIR、RRI 或案例來源。
        </div>
      </section>

      <div className="strategy-status-grid">
        <StrategyStatusCard label="RHIR" value="物件資料已提供"/>
        <StrategyStatusCard label="RRI" value={`${rri.minScore}–${rri.maxScore} · 已計算`}/>
        <StrategyStatusCard
          label="AI INSIGHT"
          value={
            savedInsightState === "loading"
              ? "正在讀取"
              : savedInsightState === "ready"
                ? "已載入保存版本"
                : "尚未保存，顧問仍可使用 RRI"
          }
          state={savedInsightState === "ready" ? "ready" : savedInsightState === "loading" ? "loading" : "optional"}
        />
        <StrategyStatusCard
          label="STRATEGY"
          value={
            strategyState === "loading"
              ? "正在讀取"
              : strategySession && strategyState === "ready"
                ? "已生成並保存"
                : `${profileCompletion}/8 情境項目`
          }
          state={
            strategySession && strategyState === "ready"
              ? "ready"
              : strategyState === "loading"
                ? "loading"
                : profileReady
                  ? "ready"
                  : "optional"
          }
        />
      </div>

      <div className="strategy-workspace">
        <section className="strategy-profile-card">
          <div className="strategy-card-head">
            <div>
              <div className="strategy-step mono">STEP 02</div>
              <h3>我的情況</h3>
              <p>先填會真正影響決策的條件，不必把自己塞進固定 persona。</p>
            </div>
            <span className={`strategy-draft-state is-${draftState}`}>
              {draftState === "saving" ? "儲存中" : draftState === "memory-only" ? "僅本次保留" : "本機已暫存"}
            </span>
          </div>

          <div className="strategy-profile-form">
            <label className="strategy-field">
              <span>租屋目的</span>
              <select value={profile.rentalGoal} onChange={event => updateProfile("rentalGoal", event.target.value)}>
                <option value="">請選擇</option>
                <option value="長期居住">長期居住</option>
                <option value="工作或通勤">工作或通勤</option>
                <option value="就學">就學</option>
                <option value="短期過渡">短期過渡</option>
                <option value="家庭居住">家庭居住</option>
              </select>
            </label>

            <label className="strategy-field">
              <span>搬家急迫度</span>
              <select value={profile.moveUrgency} onChange={event => updateProfile("moveUrgency", event.target.value)}>
                <option value="不急，可以繼續比較">不急，可以繼續比較</option>
                <option value="一個月內">一個月內</option>
                <option value="兩週內">兩週內</option>
                <option value="非常急迫">非常急迫</option>
              </select>
            </label>

            <label className="strategy-field">
              <span>預算彈性</span>
              <select value={profile.budgetFlexibility} onChange={event => updateProfile("budgetFlexibility", event.target.value)}>
                <option value="幾乎不能超出">幾乎不能超出</option>
                <option value="只能小幅調整">只能小幅調整</option>
                <option value="可為必要條件增加">可為必要條件增加</option>
              </select>
            </label>

            <fieldset className="strategy-field strategy-field-full">
              <legend>特殊需求</legend>
              <div className="strategy-need-options">
                {STRATEGY_SPECIAL_NEEDS.map(need => (
                  <label className={`strategy-need-chip ${profile.specialNeeds.includes(need) ? "is-active" : ""}`} key={need}>
                    <input
                      type="checkbox"
                      checked={profile.specialNeeds.includes(need)}
                      onChange={() => toggleSpecialNeed(need)}
                    />
                    {need}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="strategy-field strategy-field-full">
              <span>必要條件</span>
              <textarea
                rows={2}
                value={profile.mustHaveConditions}
                onChange={event => updateProfile("mustHaveConditions", event.target.value)}
                placeholder="例如：一定要能申請租補、必須有獨立電表"
              />
            </label>

            <label className="strategy-field strategy-field-full">
              <span>可以談判或妥協</span>
              <textarea
                rows={2}
                value={profile.negotiableConditions}
                onChange={event => updateProfile("negotiableConditions", event.target.value)}
                placeholder="例如：租金可小幅調整，但希望換取修繕或設備"
              />
            </label>

            <label className="strategy-field strategy-field-full">
              <span>不能接受的紅線</span>
              <textarea
                rows={2}
                value={profile.redLines}
                onChange={event => updateProfile("redLines", event.target.value)}
                placeholder="例如：拒絕書面確認費用、限制租補或押金條件不清"
              />
            </label>

            <label className="strategy-field strategy-field-full">
              <span>補充說明</span>
              <textarea
                rows={2}
                value={profile.personalNote}
                onChange={event => updateProfile("personalNote", event.target.value)}
                placeholder="還有哪些只有你自己知道、但會影響決定的事情？"
              />
            </label>
          </div>

          <div className="strategy-profile-foot">
            <span>{profileCompletion}/8 項 · 草稿保存在這個瀏覽器，不回寫分析報告。</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setDraftState("saving");
                setProfile(createDefaultStrategyProfile());
              }}
            >
              清除情境
            </button>
          </div>
        </section>

        <StrategyResultPanel
          result={strategyResult}
          state={strategyState}
          message={strategyMessage}
          canGenerate={!generationDisabled}
          needsRefresh={strategyNeedsRefresh}
          session={strategyState === "ready" ? strategySession : null}
          onGenerate={handleGenerateStrategy}
          onRetrySave={() => saveGeneratedStrategy(strategyResult)}
        />
      </div>

      {strategyResult && strategySession && strategyState === "ready" && !strategyNeedsRefresh ? (
        <section className="strategy-chat-card strategy-chat-followup">
          <div className="strategy-card-head">
            <div>
              <div className="strategy-step mono">FOLLOW-UP</div>
              <h3><Icon name="sparkle" size={15}/> AI 策略顧問</h3>
              <p>這裡只針對上方已生成並保存的個人策略繼續追問，對話會同步到同一個 session。</p>
            </div>
            <span className="strategy-context-chip mono">
              {evidenceRetrieval.state === "done"
                ? `${evidenceRetrieval.context?.stats?.uniqueCaseCount || 0} CASES`
                : evidenceRetrieval.state.toUpperCase()}
            </span>
          </div>

          {savedInsightState !== "ready" && savedInsightState !== "loading" && (
            <div className="strategy-inline-note">
              尚未載入已保存的 AI Insight；顧問仍會使用 RRI 與 verified cases。
              若要包含三來源 Insight，請先回分析報告儲存。
            </div>
          )}

          {evidenceRetrieval.state === "error" && (
            <div className="strategy-inline-error">
              案例查詢失敗：{evidenceRetrieval.error}
              <button className="btn btn-sm" onClick={evidenceRetrieval.reload}>重新查詢</button>
            </div>
          )}

          <div className="strategy-chat-body" ref={chatScrollRef}>
            {chatMessages.length === 0 && (
              <div className="strategy-chat-empty">
                <Icon name="sparkle" size={18}/>
                <strong>策略已準備好，可以繼續追問</strong>
                <span>你可以要求展開某個行動、修改溝通語氣，或討論房東拒絕時的下一步。</span>
              </div>
            )}
            {chatMessages.map((message, index) => (
              <div
                className={`strategy-message is-${message.role} ${message.error ? "is-error" : ""}`}
                key={`${message.role}-${index}`}
              >
                {message.content}
              </div>
            ))}
            {chatLoading && <div className="strategy-message is-assistant is-loading">AI 顧問正在整理你的情境…</div>}
          </div>

          {chatMessages.length === 0 && (
            <div className="strategy-quick-prompts">
              {[
                "把第一項優先行動拆成具體步驟。",
                "幫我把談判說法改得更自然。",
                "如果房東拒絕第一個要求，我下一步怎麼做？",
                "哪一條紅線最可能影響我是否承租？",
              ].map(question => (
                <button className="strategy-prompt" key={question} onClick={() => setChatInput(question)}>
                  {question}
                </button>
              ))}
            </div>
          )}

          <div className="strategy-chat-compose">
            <textarea
              value={chatInput}
              onChange={event => setChatInput(event.target.value)}
              onKeyDown={handleStrategyChatKeyDown}
              placeholder="例如：租補是我的紅線，我應該先要求房東提供什麼書面確認？"
              disabled={chatDisabled}
              rows={3}
            />
            <button
              className="btn btn-primary"
              onClick={handleSendStrategyChat}
              disabled={chatDisabled || !chatInput.trim()}
            >
              <Icon name="sparkle" size={13}/> 送出
            </button>
          </div>

          <div className="strategy-chat-foot">
            <span>Enter 送出 · Shift+Enter 換行</span>
            {chatMessages.length > 0 && (
              <button className="btn btn-sm btn-ghost" onClick={handleClearStrategyChat}>清空對話</button>
            )}
          </div>
        </section>
      ) : (
        <div className="callout strategy-chat-locked">
          <span className="ic"><Icon name="info" size={14}/></span>
          <div>
            <strong>先生成並保存個人策略，才會開放後續追問</strong>
            <div>
              {strategyNeedsRefresh
                ? "你的情境已改變，請重新生成策略後再繼續詢問。"
                : "這樣 AI 顧問的回答會固定依據同一份策略，不會在對話中悄悄改變方向。"}
            </div>
          </div>
        </div>
      )}

      <div className="callout strategy-next-stage">
        <span className="ic"><Icon name="info" size={14}/></span>
        <div>
          <strong>目前完成策略分析 Step 1–5</strong>
          <div>
            每次重新生成都會建立新的保存 session；歷史策略列表與版本比較保留在 Step 6。
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Add version modal ---------- */

function AddVersionModal({ onClose, nextLabel, recordId, setRoute }) {
  const { Icon } = window.RU;
  const goToForm = () => {
    onClose();
    setRoute({ name: "form", mode: "new", editRecordId: recordId, versionLabel: nextLabel });
  };
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>新增子版本 <span className="mono" style={{color:"#1652f0"}}>{nextLabel}</span></h3>
        </div>
        <div className="modal-body">
          <p style={{margin:"0 0 14px", color:"#5a6573", fontSize:14, lineHeight:1.6}}>
            新版本會延續目前版本的所有欄位內容，並開啟編輯表單讓你補件、修改或重新確認。
          </p>
          <div className="callout" style={{margin:"0 0 14px"}}>
            <span className="ic"><Icon name="info" size={14}/></span>
            <div>
              <strong>表單會預填現有資料</strong>，可逐欄修改後建立 <span className="mono">{nextLabel}</span>。
              原版本會保留為歷史紀錄，可隨時切換對照。
            </div>
          </div>
          <FieldInputCompat label="接下來會發生什麼">
            <ul style={{margin:0, paddingLeft:18, fontSize:13, color:"#2a313b", lineHeight:1.8}}>
              <li>跳到表單頁面，欄位已預填現有內容</li>
              <li>逐項修改 / 補件 / 標記新資訊</li>
              <li>建立後產生新的 RHIR 與 RRI 結論</li>
            </ul>
          </FieldInputCompat>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={goToForm}>
            <Icon name="edit" size={14}/> 開啟編輯表單
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldInputCompat({ label, hint, children }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:12, color:"#2a313b", marginBottom:6}}>{label}</div>
      {children}
      {hint && <div style={{fontSize:11, color:"#8a93a0", marginTop:4}}>{hint}</div>}
    </div>
  );
}

window.DetailPage = DetailPage;
