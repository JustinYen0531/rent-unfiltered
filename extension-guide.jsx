function ExtensionGuidePage({ setRoute }) {
  const { Crumbs, Icon } = window.RU;

  const installSteps = [
    {
      title: "準備 extension 資料夾",
      body: "目前擴充功能原始檔放在專案的 extension 資料夾。測試版先用整個資料夾安裝，不需要打包成商店版本。",
      meta: "extension/",
    },
    {
      title: "打開 Chrome 擴充功能頁",
      body: "在 Chrome 網址列輸入 chrome://extensions，打開右上角的開發人員模式。",
      meta: "chrome://extensions",
    },
    {
      title: "載入未封裝項目",
      body: "按下「載入未封裝項目」，選擇專案裡的 extension 資料夾。安裝完成後，工具列會出現 Rent Unfiltered Capture。",
      meta: "Load unpacked",
    },
    {
      title: "在租屋頁面擷取文字",
      body: "開啟任一租屋頁面，點擴充功能，按「擷取目前頁面」。確認文字有抓到後，再按「送到 Rent Unfiltered」。",
      meta: "Capture",
    },
  ];

  const publishOptions = [
    {
      title: "比賽或小範圍測試",
      body: "把 extension 資料夾壓成 zip，放在 GitHub Release、雲端硬碟或專案下載頁。使用者下載解壓縮後，用 Chrome 的「載入未封裝項目」安裝。",
      fit: "最快，但需要使用者開啟開發人員模式。",
    },
    {
      title: "正式公開給一般使用者",
      body: "把擴充功能打包後送 Chrome Web Store 審核。通過後，使用者只要按「加到 Chrome」就能安裝。",
      fit: "最像正式產品，但需要商店審核與隱私權文件。",
    },
    {
      title: "自己網站提供下載",
      body: "可以提供 zip 下載，但 Chrome 不會像商店那樣一鍵安裝。一般使用者仍需要手動解壓縮並載入未封裝項目。",
      fit: "適合 demo，不適合作為長期正式安裝體驗。",
    },
  ];

  const releaseChecklist = [
    "把 extension/popup.js 裡送出的目標網址從本機測試網址改成正式部署網址。",
    "確認 manifest.json 的 name、description、version 都是正式文字。",
    "補上 16、48、128px icon，讓 Chrome 工具列與商店頁面看起來完整。",
    "寫清楚隱私權說明：目前擴充功能只擷取使用者主動點擊頁面的可見文字。",
    "壓縮 extension 資料夾時，只放 manifest.json、popup.html、popup.css、popup.js 與 icon，不放整個專案。",
  ];

  return (
    <>
      <Crumbs
        setRoute={setRoute}
        items={[
          { label: "首頁", to: { name: "home" } },
          { label: "擴充插件安裝" },
        ]}
      />

      <div className="page">
        <div className="page-header">
          <div>
            <div className="mono" style={{ fontSize: 11, color: "#5a6573", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              EXTENSION · INSTALL GUIDE
            </div>
            <h1 className="page-title">擴充插件安裝教學</h1>
            <p className="page-sub">
              Rent Unfiltered Capture 可以把租屋頁面的可見文字送回表單，讓使用者先匯入，再補齊 RHIR 欄位。
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button className="btn" onClick={() => setRoute({ name: "form", mode: "new" })}>
              <Icon name="plus" size={14} />
              新增租屋資訊
            </button>
            <button className="btn btn-primary" onClick={() => setRoute({ name: "project-guide" })}>
              <Icon name="book" size={14} />
              專案導引
            </button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="stat-label">目前狀態</div>
            <div className="stat-value" style={{ fontSize: 18 }}>測試版</div>
          </div>
          <div className="stat">
            <div className="stat-label">安裝方式</div>
            <div className="stat-value" style={{ fontSize: 18 }}>未封裝載入</div>
          </div>
          <div className="stat">
            <div className="stat-label">資料來源</div>
            <div className="stat-value" style={{ fontSize: 18 }}>頁面可見文字</div>
          </div>
          <div className="stat">
            <div className="stat-label">送回位置</div>
            <div className="stat-value" style={{ fontSize: 18 }}>表單匯入</div>
          </div>
        </div>

        <div className="extension-grid">
          <section className="fg">
            <div className="fg-head">
              <h3>安裝測試版</h3>
              <span className="meta mono">local install</span>
            </div>
            <div style={{ padding: "16px 18px", display: "grid", gap: 12 }}>
              {installSteps.map((step, index) => (
                <div key={step.title} className="guide-step">
                  <div className="guide-step-no mono">{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <div className="guide-step-title">{step.title}</div>
                    <div className="guide-step-body">{step.body}</div>
                    <div className="guide-step-meta mono">{step.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="fg">
            <div className="fg-head">
              <h3>使用流程</h3>
              <span className="meta mono">capture flow</span>
            </div>
            <div style={{ padding: "16px 18px", fontSize: 13, lineHeight: 1.8, color: "#2a313b" }}>
              <ol className="clean-list">
                <li>先開啟租屋平台或房源頁。</li>
                <li>點 Chrome 工具列的 Rent Unfiltered Capture。</li>
                <li>按下「擷取目前頁面」。</li>
                <li>確認內容後，按「送到 Rent Unfiltered」。</li>
                <li>Rent Unfiltered 會開啟表單，並把可辨識欄位先預填。</li>
              </ol>
              <div className="callout" style={{ marginTop: 14 }}>
                <span className="ic"><Icon name="info" size={14} /></span>
                <div>
                  擷取後仍要人工確認。插件只負責帶入可見文字，RHIR 欄位是否完整，還是以表單驗證與使用者補件為準。
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="fg" style={{ marginTop: 18 }}>
          <div className="fg-head">
            <h3>怎麼讓使用者下載</h3>
            <span className="meta mono">distribution</span>
          </div>
          <div className="extension-options">
            {publishOptions.map((option) => (
              <div className="mini-panel" key={option.title}>
                <div className="mini-panel-title">{option.title}</div>
                <div className="mini-panel-body">{option.body}</div>
                <div className="mini-panel-note">{option.fit}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="fg" style={{ marginTop: 18 }}>
          <div className="fg-head">
            <h3>正式釋出前檢查</h3>
            <span className="meta mono">release checklist</span>
          </div>
          <div style={{ padding: "16px 18px", fontSize: 13, lineHeight: 1.8, color: "#2a313b" }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {releaseChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

window.ExtensionGuidePage = ExtensionGuidePage;
