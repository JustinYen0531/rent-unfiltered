function GlossaryPage({ setRoute, tab = "rhir" }) {
  const { Crumbs, Icon } = window.RU;

  const tabs = [
    { key: "rhir", label: "RHIR 規格" },
    { key: "rri", label: "RRI 指標" },
  ];

  const disclosureStatuses = [
    ["disclosed", "已揭露，欄位有明確內容。"],
    ["partial", "部分揭露，資訊不完整。"],
    ["missing", "應該要有，但目前缺漏。"],
    ["inferred", "不是直接揭露，而是系統推得。"],
    ["supplemented", "後續補充進來的資訊。"],
    ["conflict", "不同來源之間互相矛盾。"],
    ["unknown", "目前無法確認。"],
  ];

  const sourceTypes = [
    ["platform", "平台或頁面原始揭露"],
    ["provider", "房東或出租方補充"],
    ["publicData", "公開資料來源"],
    ["systemInference", "系統推論結果"],
    ["userReport", "使用者回報"],
    ["manualInput", "手動輸入"],
    ["unknown", "來源不明"],
  ];

  const topLevelBlocks = [
    "metadata",
    "listing",
    "property",
    "layoutAndStructure",
    "locationContext",
    "amenities",
    "leaseTerms",
    "cost",
    "management",
    "provider",
    "ownershipLegalStatus",
    "marketingClaims",
    "transparencyLayer",
  ];

  const sampleFieldValue = `{
  "rent": {
    "value": 18000,
    "disclosureStatus": "disclosed",
    "sourceType": "manualInput"
  }
}`;

  return (
    <>
      <Crumbs
        setRoute={setRoute}
        items={[
          { label: "首頁", to: { name: "home" } },
          { label: "名詞解釋" },
        ]}
      />

      <div className="page">
        <div className="page-header">
          <div>
            <div
              className="mono"
              style={{
                fontSize: 11,
                color: "#5a6573",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              GLOSSARY · CORE TERMS
            </div>
            <h1 className="page-title">名詞解釋</h1>
            <p className="page-sub">
              這裡集中解釋專案裡最重要的兩個概念：RHIR 是資料格式，RRI 是風險判讀指標。
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => setRoute({ name: "project-guide" })}>
              <Icon name="arrowLeft" size={14} />
              返回專案導引
            </button>
          </div>
        </div>

        <div className="segmented" style={{ marginBottom: 18 }}>
          {tabs.map((item) => (
            <button
              key={item.key}
              className={`segmented-btn ${tab === item.key ? "active" : ""}`}
              onClick={() => setRoute({ name: "glossary", tab: item.key })}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "rhir" ? (
          <div style={{ display: "grid", gap: 18 }}>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-label">RHIR 是什麼</div>
                <div className="stat-value" style={{ fontSize: 18 }}>租屋資料格式</div>
              </div>
              <div className="stat">
                <div className="stat-label">主要用途</div>
                <div className="stat-value" style={{ fontSize: 18 }}>結構化整理</div>
              </div>
              <div className="stat">
                <div className="stat-label">核心特色</div>
                <div className="stat-value" style={{ fontSize: 18 }}>可追蹤缺漏</div>
              </div>
              <div className="stat">
                <div className="stat-label">第一層區塊</div>
                <div className="stat-value" style={{ fontSize: 18 }}>{topLevelBlocks.length} 個</div>
              </div>
            </div>

            <section className="fg">
              <div className="fg-head">
                <h3>RHIR 是什麼</h3>
                <span className="meta mono">Rental Housing Interoperability Resources</span>
              </div>
              <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
                <p style={{ marginTop: 0 }}>
                  RHIR 是 Rent Unfiltered 用來描述單一租屋物件的結構化格式。
                </p>
                <ul style={{ margin: "0 0 0 18px" }}>
                  <li>它不只記錄房子有什麼，也記錄哪些資訊缺漏。</li>
                  <li>它會標示每個欄位的揭露狀態與資料來源。</li>
                  <li>它讓後續分析、比較、下載與版本追蹤變得更穩定。</li>
                </ul>
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }}>
              <section className="fg">
                <div className="fg-head">
                  <h3>FieldValue 基本格式</h3>
                  <span className="meta mono">every important field uses the same wrapper</span>
                </div>
                <div style={{ padding: "0 18px 18px" }}>
                  <pre style={{ margin: 0, background: "#0f1720", color: "#dce6f3", padding: "16px", borderRadius: 8, overflow: "auto", fontSize: 12, lineHeight: 1.7 }}>
{sampleFieldValue}
                  </pre>
                </div>
              </section>

              <section className="fg">
                <div className="fg-head">
                  <h3>RHIR 怎麼用</h3>
                  <span className="meta mono">usage</span>
                </div>
                <div style={{ padding: "16px 18px", fontSize: 13, color: "#2a313b", lineHeight: 1.8 }}>
                  <ol style={{ margin: "0 0 0 18px", padding: 0 }}>
                    <li>先把租屋資訊填進表單。</li>
                    <li>系統把欄位轉成 RHIR JSON。</li>
                    <li>RHIR 保留值、揭露狀態、資料來源。</li>
                    <li>之後再讓分析模型讀取 RHIR 做判讀。</li>
                  </ol>
                </div>
              </section>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <section className="fg">
                <div className="fg-head">
                  <h3>disclosureStatus</h3>
                  <span className="meta mono">揭露狀態</span>
                </div>
                <div style={{ padding: "8px 18px 18px" }}>
                  {disclosureStatuses.map(([key, desc]) => (
                    <div key={key} style={{ display: "grid", gridTemplateColumns: "140px 1fr", padding: "8px 0", borderBottom: "1px solid var(--hairline)", fontSize: 13 }}>
                      <span className="mono" style={{ color: "#1652f0" }}>{key}</span>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="fg">
                <div className="fg-head">
                  <h3>sourceType</h3>
                  <span className="meta mono">資料來源類型</span>
                </div>
                <div style={{ padding: "8px 18px 18px" }}>
                  {sourceTypes.map(([key, desc]) => (
                    <div key={key} style={{ display: "grid", gridTemplateColumns: "140px 1fr", padding: "8px 0", borderBottom: "1px solid var(--hairline)", fontSize: 13 }}>
                      <span className="mono" style={{ color: "#1652f0" }}>{key}</span>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="fg">
              <div className="fg-head">
                <h3>RHIR 第一層區塊</h3>
                <span className="meta mono">v0.1 top-level blocks</span>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {topLevelBlocks.map((block) => (
                    <span key={block} className="badge badge-outline mono">{block}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-label">RRI 是什麼</div>
                <div className="stat-value" style={{ fontSize: 18 }}>風險指標</div>
              </div>
              <div className="stat">
                <div className="stat-label">輸入基礎</div>
                <div className="stat-value" style={{ fontSize: 18 }}>RHIR 資料</div>
              </div>
              <div className="stat">
                <div className="stat-label">用途</div>
                <div className="stat-value" style={{ fontSize: 18 }}>輔助判讀</div>
              </div>
              <div className="stat">
                <div className="stat-label">不是什麼</div>
                <div className="stat-value" style={{ fontSize: 18 }}>法律結論</div>
              </div>
            </div>

            <section className="fg">
              <div className="fg-head">
                <h3>RRI 指標</h3>
                <span className="meta mono">Rental Risk Index</span>
              </div>
              <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>RRI 是用來幫使用者快速理解租屋風險的指標。</li>
                  <li>它會根據目前版本的 RHIR 資料做整體判讀。</li>
                  <li>分數或等級的目的，是輔助閱讀，不是取代使用者判斷。</li>
                  <li>如果欄位缺漏很多，RRI 的可信度也會受影響。</li>
                </ul>
              </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <section className="fg">
                <div className="fg-head">
                  <h3>它會幫你看到什麼</h3>
                  <span className="meta mono">what it highlights</span>
                </div>
                <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li>哪些條件已揭露，哪些還沒說清楚。</li>
                    <li>租金、押金、管理費等成本是否容易忽略。</li>
                    <li>契約、修繕、租補、報稅等權益資訊是否完整。</li>
                    <li>是否存在高風險或值得追問的訊號。</li>
                  </ul>
                </div>
              </section>

              <section className="fg">
                <div className="fg-head">
                  <h3>它不會幫你做什麼</h3>
                  <span className="meta mono">what it does not do</span>
                </div>
                <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li>不直接替你做法律認定。</li>
                    <li>不保證房東一定有違法或一定沒問題。</li>
                    <li>不取代簽約前的人工確認與提問。</li>
                    <li>不代表資料缺漏時也能得出完全準確的結論。</li>
                  </ul>
                </div>
              </section>
            </div>

            <div className="callout">
              <span className="ic"><Icon name="info" size={14} /></span>
              <div>
                <strong>RRI 應該被理解成輔助閱讀層</strong>
                它的價值在於幫使用者更快看見重點、缺漏與風險訊號，而不是替使用者做最後決定。
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

window.GlossaryPage = GlossaryPage;
