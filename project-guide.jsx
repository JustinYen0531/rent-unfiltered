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

  const stages = [
    {
      number: "01",
      title: "找房與刊登資訊初篩",
      subtitle: "FIND · LISTING REVIEW",
      goal: "把 591 等平台的房源資訊整理成可比較、可追蹤的候選物件。",
      flow: "591 刊登頁 → 欄位擷取 → 缺漏、矛盾與初步風險",
      rhir: "RHIR 在這裡是資料骨架：把租金、押金、電費、房型、地區與揭露狀態固定下來，保存原始來源與初始版本。",
      rri: "RRI 在這裡是初步篩檢：根據已揭露、部分揭露、未揭露與衝突欄位，指出哪些風險需要進一步確認。",
      ai: "AI 在這裡不是替使用者做決定，而是協助整理刊登文字、產生白話摘要與第一批追問清單。",
      output: "候選物件、RHIR 初始版本、RRI 初步風險與待確認欄位。",
    },
    {
      number: "02A",
      title: "條款與費用談判",
      subtitle: "NEGOTIATION · ACTION PLAN",
      goal: "把案例與風險轉成簽約前可以直接使用的詢問、談判與證據保存行動。",
      flow: "房東／仲介回覆 → 條件補充 → 談判前後版本比較",
      rhir: "RHIR 在這裡是版本紀錄：保留房東回覆、談判結果、來源與時間，形成物件的談判子版本，不覆蓋刊登初始資料。",
      rri: "RRI 在這裡是風險聚焦：重新計算押金、電費、修繕、提前解約、報稅與遷戶籍等欄位在補充資訊後的風險狀態。",
      ai: "AI 在這裡是溝通助手：根據 RRI 與已確認案例產生要問的問題、應保留的證據與可複製的詢問話術。",
      output: "談判清單、條件紅線、證據保存清單與 Action Plan。",
    },
    {
      number: "02B",
      title: "契約審閱與簽約前確認",
      subtitle: "CONTRACT · CONSISTENCY REVIEW",
      goal: "確認刊登內容、房東／仲介說法與契約條文是否一致，找出簽約前仍需修改的地方。",
      flow: "刊登內容 + 對話紀錄 + 契約草稿 → 三方欄位比對 → 簽約前決策",
      rhir: "RHIR 在這裡是契約版本：把契約條文與來源文件掛回同一組欄位，保留 X（刊登）、N（談判）、C（契約）版本差異。",
      rri: "RRI 在這裡是條款一致性檢查：若押金返還、電費或修繕責任在不同來源中不一致，就標記為 conflict，而不是自行判定違法。",
      ai: "AI 在這裡是解釋與整理層：說明衝突位置、整理簽約前追問與修改建議，但不取代法律專業或替使用者簽約。",
      output: "已確認條件、尚未寫明條款、衝突欄位與簽約前 Action Plan。",
    },
    {
      number: "03",
      title: "入住、租期與退租追蹤",
      subtitle: "TENANCY · HANDOVER · MOVE-OUT",
      goal: "把簽約後的屋況、修繕、費用與押金返還紀錄保存下來，形成可追溯的租屋歷程。",
      flow: "簽約交屋 → 租期事件 → 退租點交與押金結算",
      rhir: "RHIR 在這裡是事件與證據紀錄：保存入住照片、設備狀態、報修通知、電表與退租點交資料。",
      rri: "RRI 在這裡是持續風險追蹤：根據實際發生的修繕、費用或押金事件更新風險脈絡，不只停留在簽約前預測。",
      ai: "AI 在這裡是紀錄整理助手：協助整理事件時間線、提醒應保存的證據與說明可能的下一步，但不自行作法律判斷。",
      output: "交屋紀錄、租期事件時間線、退租檢查清單與押金爭議證據包。",
    },
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
              這一頁說明 Rent Unfiltered 如何從找房初篩，延伸到條款談判、契約審閱與租期追蹤，以及 RHIR、RRI、AI 在每個階段的分工。
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
            <div className="stat-value" style={{ fontSize: 18 }}>看三階段流程</div>
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
              <h3>三階段產品流程</h3>
              <span className="meta mono">product stages · RHIR · RRI · AI</span>
            </div>
            <div style={{ display: "grid", gap: 14, padding: 18 }}>
              <p style={{ margin: 0, color: "#2a313b", lineHeight: 1.8 }}>
                目前的 591 匯入與欄位審查主要是第一階段。完整流程會一路延伸到談判、契約審閱、簽約與租期追蹤；每一階段都使用 RHIR、RRI 與 AI，但三者的任務不同。
              </p>
              {stages.map((stage) => (
                <article key={stage.number} style={{ border: "1px solid #e2e5e9", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "13px 16px", background: "#f7f8fa", borderBottom: "1px solid #e2e5e9" }}>
                    <span className="mono" style={{ color: "var(--accent)", fontSize: 12 }}>{stage.number}</span>
                    <h4 style={{ margin: 0, fontSize: 16, color: "#1f2933" }}>{stage.title}</h4>
                    <span className="meta mono">{stage.subtitle}</span>
                  </div>
                  <div style={{ padding: "14px 16px", display: "grid", gap: 10, color: "#2a313b", lineHeight: 1.75 }}>
                    <div><strong>這一階段要做什麼：</strong>{stage.goal}</div>
                    <div><strong>流程：</strong><span className="mono" style={{ fontSize: 12 }}>{stage.flow}</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                      <div style={{ padding: "10px 12px", background: "#f7fbff", borderLeft: "3px solid #5b8def" }}><strong>RHIR</strong><br />{stage.rhir}</div>
                      <div style={{ padding: "10px 12px", background: "#f8fbf8", borderLeft: "3px solid #4f9d69" }}><strong>RRI</strong><br />{stage.rri}</div>
                      <div style={{ padding: "10px 12px", background: "#fffaf2", borderLeft: "3px solid #d79738" }}><strong>AI</strong><br />{stage.ai}</div>
                    </div>
                    <div><strong>階段輸出：</strong>{stage.output}</div>
                  </div>
                </article>
              ))}
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
