function ProjectGuidePage({ setRoute }) {
  const { Crumbs, Icon } = window.RU;

  const motivePoints = [
    "租屋資訊常常分散、模糊、難比較。",
    "很多人看了房源，還是不知道哪些地方有風險。",
    "Rent Unfiltered 想做的，是把資訊攤開、整理清楚、讓風險更容易被看見。",
    "使用者可以用更少的時間，理解一間房子的租屋條件。",
  ];

  const problemPoints = [
    "房源資訊常有缺漏，重要條件不一定先寫清楚。",
    "使用者常靠截圖、對話、筆記自己整理資料。",
    "同一物件補充資訊後，很難追蹤前後差異。",
    "想做分析時，原始資料通常不夠結構化。",
  ];

  const solutionPoints = [
    "用表單先把租屋資訊整理成固定欄位。",
    "把資料轉成可追蹤的 RHIR 結構。",
    "一筆物件先建立初始版本，再往下延伸子版本。",
    "分析報告和表單儲存拆開，避免每次小改都重跑。",
    "讓使用者能同時看到欄位、結構化資料、分析結果。",
  ];

  const positioningPoints = [
    "這是一個比賽型 MVP，不是完整商業產品。",
    "目前重點是驗證「租屋資訊透明化」能不能被做成清楚流程。",
    "核心價值是整理資訊、保留版本、輔助判讀。",
    "RHIR 是專案的重要基礎，方便後續分析、下載與擴充。",
    "這不是法律認定工具，也不是最終簽約保證。",
    "它比較像是一個租屋資訊整理與風險輔助閱讀工具。",
  ];

  return (
    <>
      <Crumbs
        setRoute={setRoute}
        items={[
          { label: "首頁", to: { name: "home" } },
          { label: "專案導引" },
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
              PROJECT GUIDE · QUICK START
            </div>
            <h1 className="page-title">專案導引</h1>
            <p className="page-sub">
              這一頁用最短的方式說明 Rent Unfiltered 在做什麼、想解決什麼問題，以及這個專案在 MVP 階段的定位。
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => setRoute({ name: "glossary", tab: "rhir" })}>
              <Icon name="book" size={14} />
              前往名詞解釋
            </button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="stat-label">文件用途</div>
            <div className="stat-value" style={{ fontSize: 18 }}>快速理解專案</div>
          </div>
          <div className="stat">
            <div className="stat-label">適合誰看</div>
            <div className="stat-value" style={{ fontSize: 18 }}>第一次使用者</div>
          </div>
          <div className="stat">
            <div className="stat-label">閱讀風格</div>
            <div className="stat-value" style={{ fontSize: 18 }}>簡單短句</div>
          </div>
          <div className="stat">
            <div className="stat-label">下一步</div>
            <div className="stat-value" style={{ fontSize: 18 }}>看名詞解釋</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
          <section className="fg">
            <div className="fg-head">
              <h3>動機與理念</h3>
              <span className="meta mono">why this exists</span>
            </div>
            <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {motivePoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <section className="fg">
              <div className="fg-head">
                <h3>問題</h3>
                <span className="meta mono">what is broken</span>
              </div>
              <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {problemPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="fg">
              <div className="fg-head">
                <h3>解方</h3>
                <span className="meta mono">how we respond</span>
              </div>
              <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {solutionPoints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <section className="fg">
            <div className="fg-head">
              <h3>專案定位</h3>
              <span className="meta mono">project position</span>
            </div>
            <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {positioningPoints.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

window.ProjectGuidePage = ProjectGuidePage;
