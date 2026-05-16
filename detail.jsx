// Detail page — left version list + right content with 3 tabs

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
            <VersionHeader version={activeVersion}/>

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
            </div>

            {tab === "fields" && <FieldCompletionView groups={fieldGroups} rhir={rhir}/>}
            {tab === "rhir" && <RHIRView data={rhir} recordId={record.id}/>}
            {tab === "report" && <ReportView report={report} version={activeVersion} rhir={rhir}/>}
          </main>
        </div>
      </div>

      {showAddModal && <AddVersionModal onClose={() => setShowAddModal(false)} nextLabel={`X-${versions.length}`}/>}
    </>
  );
}

function VersionHeader({ version }) {
  const { Icon } = window.RU;
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
        <button className="btn btn-sm"><Icon name="edit" size={12}/> 編輯表單</button>
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

function FieldCompletionView({ groups, rhir }) {
  const { Icon, Badge } = window.RU;
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
                  <button className="btn btn-sm btn-ghost"><Icon name="edit" size={12}/></button>
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
  const followupQuestions = window.RU.getFollowupQuestionsFromRhir(data);

  const subset = useMemoD(() => {
    return { [active]: data[active] };
  }, [active, data]);

  const handleCopy = async () => {
    const ok = await copyJSON(data);
    setCopyStatus(ok ? "已複製完整 RHIR" : "複製失敗，請改用下載");
    window.setTimeout(() => setCopyStatus(""), 1800);
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
        <RHIRNote title="sourceType" body="此值的來源。MVP 通常為 manualInput；推論欄位則為 systemInference。"/>
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

function ReportView({ report, version, rhir }) {
  const { Icon } = window.RU;
  const [insightState, setInsightState] = useStateD("idle"); // "idle" | "loading" | "done" | "stub"
  const [insightResult, setInsightResult] = useStateD(null);

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

  async function handleGenerateInsight() {
    setInsightState("loading");
    try {
      const result = await window.RU_INSIGHT.generateInsight(conclusion);
      setInsightResult(result);
      setInsightState(result?.status === "not_implemented" ? "stub" : "done");
    } catch (e) {
      setInsightResult({ status: "error", message: String(e?.message || e) });
      setInsightState("done");
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

      {/* Layer 3 — AI Insight (gated; pure風險脈絡解讀，不重算分數) */}
      <div className="fg" style={{marginTop:18}}>
        <div className="fg-head">
          <h3><Icon name="sparkle" size={14}/> AI Insight · 風險脈絡解讀</h3>
          <span className="meta mono">OPTIONAL</span>
        </div>
        {insightState === "idle" && (
          <div style={{padding:"18px 16px"}}>
            <p style={{color:"#5a6573", margin:"0 0 12px", fontSize:13, lineHeight:1.6}}>
              RRI 分數與結論已由 rule engine 產生（上方），AI Insight 不重算分數，只解讀風險之間的關聯、
              排出簽前最該問的問題，並把技術性欄位翻成生活情境。<strong>需要手動觸發以節省算力。</strong>
            </p>
            <button className="btn btn-primary" onClick={handleGenerateInsight}>
              <Icon name="sparkle" size={14}/> 生成 AI Insight
            </button>
          </div>
        )}
        {insightState === "loading" && (
          <div style={{padding:"18px 16px", color:"#5a6573"}}>正在解讀風險脈絡…</div>
        )}
        {insightState === "stub" && (
          <div className="callout" style={{margin:"12px 16px"}}>
            <span className="ic"><Icon name="info" size={14}/></span>
            <div>{insightResult?.message}</div>
          </div>
        )}
        {insightState === "done" && insightResult?.insightSummary && (
          <div style={{padding:"6px 16px 14px"}}>
            <p style={{margin:"6px 0 10px"}}>{insightResult.insightSummary}</p>
            {insightResult.riskPattern?.map((p, i) => (
              <div key={i} style={{margin:"8px 0", padding:"8px 10px", background:"var(--accent-soft)", borderRadius:6}}>
                <div style={{fontWeight:600, fontSize:13}}>{p.title}</div>
                <div style={{fontSize:12, color:"#2a313b"}}>{p.explanation}</div>
              </div>
            ))}
          </div>
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
          上方 RRI 與結論由 rule engine + template 產生，<strong>每次顯示都是即時重算</strong>，不消耗 AI 算力。AI Insight 是選擇性功能，需手動觸發。本分析作為租屋決策輔助，不代表法律判定。
        </div>
      </div>
    </>
  );
}

/* ---------- Add version modal ---------- */

function AddVersionModal({ onClose, nextLabel }) {
  const { Icon } = window.RU;
  const [base, setBase] = useStateD("X");
  const [reAnalyze, setReAnalyze] = useStateD(false);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>新增子版本 <span className="mono" style={{color:"#1652f0"}}>{nextLabel}</span></h3>
        </div>
        <div className="modal-body">
          <p style={{margin:"0 0 14px", color:"#5a6573", fontSize:13}}>
            子版本是前一份資料的延伸。建議只在你補充欄位、修改錯誤、或希望重新分析時新增。
          </p>
          <FieldInputCompat label="複製自" hint="新版本會繼承這個版本的所有欄位">
            <div className="seg">
              {["X","X-1","X-2"].map(v => (
                <button key={v} className={base === v ? "active mono" : "mono"} onClick={() => setBase(v)}>
                  {v}
                </button>
              ))}
            </div>
          </FieldInputCompat>
          <FieldInputCompat label="建立後動作">
            <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13}}>
              <input type="checkbox" checked={reAnalyze} onChange={e => setReAnalyze(e.target.checked)}/>
              建立後立即重新生成 AI 分析報告
            </label>
            <div style={{fontSize:11, color:"#8a93a0", marginTop:4}}>
              若僅修改少量欄位，可先不重新分析。
            </div>
          </FieldInputCompat>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={onClose}><Icon name="check" size={14}/> 建立 {nextLabel}</button>
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
