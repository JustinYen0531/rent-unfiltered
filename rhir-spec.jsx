function RHIRSpecPage({ setRoute }) {
  const { Crumbs, Icon } = window.RU;

  const disclosureStatuses = [
    ["disclosed", "已明確揭露"],
    ["partial", "有提到，但不完整"],
    ["missing", "應關注，但目前未揭露"],
    ["inferred", "由系統推估"],
    ["supplemented", "由公開資料補足"],
    ["conflict", "不同來源互相衝突"],
    ["unknown", "目前無法判斷"],
  ];

  const sourceTypes = [
    ["platform", "租屋平台提供"],
    ["provider", "房東、仲介或代管者提供"],
    ["publicData", "政府或公開資料"],
    ["systemInference", "系統推估"],
    ["userReport", "使用者回報"],
    ["user_input", "使用者輸入"],
    ["unknown", "來源未知"],
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
  "petsAllowed": {
    "value": true,
    "disclosureStatus": "disclosed",
    "sourceType": "platform",
    "sourceText": "寵物友善",
    "confidence": 0.9,
    "updatedAt": "2026-05-10",
    "conflicts": []
  }
}`;

  return (
    <>
      <Crumbs setRoute={setRoute} items={[
        { label: "租屋紀錄", to: { name: "home" } },
        { label: "RHIR 規格" },
      ]}/>

      <div className="page">
        <div className="page-header">
          <div>
            <div className="mono" style={{fontSize:11, color:"#5a6573", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6}}>
              RHIR SPEC · HUMAN READABLE
            </div>
            <h1 className="page-title">RHIR 規格</h1>
            <p className="page-sub">
              RHIR，Rental Housing Interoperability Resources，是 Rent Unfiltered 提出的租屋資訊交換格式。
              它的目的不是直接判斷物件好壞，而是先建立一個簡單、可讀、可交換的資料結構，讓 AI、人工整理者或未來系統能用一致方式記錄租屋資訊。
            </p>
          </div>
          <div style={{display:"flex", gap:8}}>
            <button className="btn"><Icon name="book" size={14}/> 人類可讀規範</button>
            <button className="btn"><Icon name="download" size={14}/> 下載 schema</button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="stat-label">規格宗旨</div>
            <div className="stat-value" style={{fontSize:18}}>可讀、可交換、可追溯</div>
          </div>
          <div className="stat">
            <div className="stat-label">核心問題</div>
            <div className="stat-value" style={{fontSize:18}}>未揭露不等於不存在</div>
          </div>
          <div className="stat">
            <div className="stat-label">重點單位</div>
            <div className="stat-value" style={{fontSize:18}}>FieldValue</div>
          </div>
          <div className="stat">
            <div className="stat-label">第一層區塊</div>
            <div className="stat-value" style={{fontSize:18}}>{topLevelBlocks.length} 個</div>
          </div>
        </div>

        <div className="fg" style={{marginTop:18}}>
          <div className="fg-head"><h3>RHIR 的宗旨</h3></div>
          <div style={{padding:"16px 18px", fontSize:14, lineHeight:1.8, color:"#2a313b"}}>
            <p style={{marginTop:0}}>
              RHIR 不只是記錄「房子有什麼」，而是記錄三件事：
            </p>
            <ul style={{margin:"0 0 12px 18px"}}>
              <li>欄位值是什麼</li>
              <li>這個欄位是誰提供的</li>
              <li>這個欄位揭露到什麼程度</li>
            </ul>
            <p style={{marginBottom:0}}>
              RHIR 特別強調：租屋資訊常常缺漏，因此資料格式必須允許 `null`、`missing`、`unknown` 與 `conflict`，
              避免把資訊空白直接誤判成「沒有」。
            </p>
          </div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:18, marginTop:18}}>
          <div className="fg">
            <div className="fg-head"><h3>FieldValue 基本格式</h3><span className="meta mono">每個重要欄位都使用同一種外殼</span></div>
            <div style={{padding:"0 18px 18px"}}>
              <pre style={{margin:0, background:"#0f1720", color:"#dce6f3", padding:"16px", borderRadius:"8px", overflow:"auto", fontSize:12, lineHeight:1.7}}>
{sampleFieldValue}
              </pre>
            </div>
          </div>

          <div className="fg">
            <div className="fg-head"><h3>RHIR 如何使用</h3></div>
            <div style={{padding:"16px 18px", fontSize:13, color:"#2a313b", lineHeight:1.8}}>
              <ol style={{margin:"0 0 0 18px", padding:0}}>
                <li>先將租屋表單、平台資料或人工整理結果轉成固定欄位</li>
                <li>每個欄位以 `FieldValue` 記錄值、來源、揭露狀態</li>
                <li>若資料缺漏，標示為 `missing` 或 `unknown`</li>
                <li>若不同來源不一致，保留 `conflict`，不要直接覆蓋</li>
                <li>之後再讓 AI 或風險模型讀取 RHIR 做分析</li>
              </ol>
            </div>
          </div>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginTop:18}}>
          <div className="fg">
            <div className="fg-head"><h3>disclosureStatus</h3><span className="meta mono">揭露狀態</span></div>
            <div style={{padding:"8px 18px 18px"}}>
              {disclosureStatuses.map(([key, desc]) => (
                <div key={key} style={{display:"grid", gridTemplateColumns:"140px 1fr", padding:"8px 0", borderBottom:"1px solid var(--hairline)", fontSize:13}}>
                  <span className="mono" style={{color:"#1652f0"}}>{key}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fg">
            <div className="fg-head"><h3>sourceType</h3><span className="meta mono">資料來源類型</span></div>
            <div style={{padding:"8px 18px 18px"}}>
              {sourceTypes.map(([key, desc]) => (
                <div key={key} style={{display:"grid", gridTemplateColumns:"140px 1fr", padding:"8px 0", borderBottom:"1px solid var(--hairline)", fontSize:13}}>
                  <span className="mono" style={{color:"#1652f0"}}>{key}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fg" style={{marginTop:18}}>
          <div className="fg-head"><h3>RHIR 第一層區塊</h3><span className="meta mono">v0.1 top-level blocks</span></div>
          <div style={{padding:"16px 18px"}}>
            <div style={{display:"flex", flexWrap:"wrap", gap:10}}>
              {topLevelBlocks.map((block) => (
                <span key={block} className="badge badge-outline mono">{block}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="callout" style={{marginTop:18}}>
          <span className="ic"><Icon name="info" size={14}/></span>
          <div>
            <strong>MVP 與完整 RHIR 的差異：</strong>
            MVP 不需要一次實作完整標準，但至少要保留固定欄位名稱、`FieldValue` 結構、`disclosureStatus`、`sourceType`，
            並讓表單欄位能一一對應到 RHIR JSON。
          </div>
        </div>
      </div>
    </>
  );
}

window.RHIRSpecPage = RHIRSpecPage;
