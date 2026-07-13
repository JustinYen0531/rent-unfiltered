function ProjectGuidePage({ setRoute }) {
  const { Crumbs, Icon } = window.RU;

  const guideBlocks = [
    {
      title: "專案摘要",
      meta: "PROJECT SUMMARY",
      lead: "Rent Unfiltered 不是另一個租屋刊登平台，而是一套面向租客的租屋資訊透明化與風險輔助判讀工具。",
      points: [
        "把 591、房東回覆、契約與看屋紀錄整理成可記錄、可比較、可追溯的資料。",
        "用 RHIR 保存欄位值、揭露狀態、資料來源與版本差異。",
        "用 RRI 把契約透明度、費用透明度、居住安全與租客權益轉成可閱讀的風險訊號。",
        "用 AI Insight 將結構化結果轉成白話說明、待追問事項與簽約前檢查方向。",
      ],
    },
    {
      title: "理念與動機",
      meta: "WHY THIS EXISTS",
      lead: "租屋不是單純比較租金，而是一段持續的居住服務關係；對學生、新鮮人與第一次租屋者來說，查核成本與承擔風險往往更高。",
      points: [
        "自住者通常能投入更多時間評估房屋品質與長期風險，租屋者卻常受限於預算、時間與經驗。",
        "押金、電費、修繕責任、報稅、遷戶籍與居住安全等資訊，常被藏在零散對話與複雜條款中。",
        "專案希望讓租屋變得更安全、更容易理解，也更容易被理性比較。",
        "Unfiltered 的意思不是毫無篩選，而是不讓廣告、流量與市場權力替租客過濾重要資訊。",
      ],
    },
    {
      title: "問題分析",
      meta: "WHAT IS BROKEN",
      lead: "租屋市場存在資訊不對稱，品質與風險雖然存在差異，租客卻常難以在簽約前準確判斷。",
      points: [
        "刊登頁面常強調價格、地點與照片，但水電計價、押金返還、修繕責任與提前解約等關鍵條件未必完整揭露。",
        "搜尋成本不平均，風險容易落在經驗較少、預算較低或時間有限的租客身上。",
        "便宜不一定合理，昂貴也不一定安全；真正的居住成本還包含資訊不透明所帶來的風險成本。",
        "當租客無法分辨風險時，劣質物件可能靠包裝取得交易機會，透明且條件合理的物件也不一定被看見。",
      ],
    },
    {
      title: "解決方案",
      meta: "HOW WE RESPOND",
      lead: "以固定資料結構、可解釋規則與受證據約束的 AI，建立從找房到簽約前確認的決策支援流程。",
      points: [
        "RHIR：把分散資訊轉成固定欄位，標記 disclosed、missing、partial、conflict 等狀態，並保留來源與版本。",
        "RRI：根據 RHIR 欄位計算風險訊號與分面向結果，讓租客看見租金之外的契約、費用、安全與權益風險。",
        "AI Insight：將 RHIR、RRI 與已確認案例整理成白話報告、待追問清單、談判話術與簽約前 Action Plan。",
        "案例證據層：讓押金、電費、修繕與提前解約等風險能回溯到真實來源，而不是只給一個沒有脈絡的分數。",
      ],
    },
    {
      title: "可行性評估",
      meta: "FEASIBILITY",
      lead: "專案採漸進式資料與產品策略，先完成可操作的 MVP，再逐步擴充資料來源與服務場景。",
      points: [
        "技術上已具備表單、RHIR JSON、RRI v0.1 規則引擎、AI Insight、版本管理、Chrome 擴充插件與 Supabase 保存雛形。",
        "資料上先使用使用者主動輸入、租屋頁可見文字、房東或仲介提供的資訊，再逐步接入契約、政府公開資料與租賃糾紛統計。",
        "成本上先由規則引擎處理固定風險，AI 只負責解釋與追問，不需要一開始建置大型平台或大量模型服務。",
        "倫理與法律上，系統定位為資訊整理與風險輔助判讀，不提供法律判決、安全保證或交易背書。",
      ],
    },
    {
      title: "社會影響力",
      meta: "SOCIAL IMPACT",
      lead: "讓租客在租金之外看見契約、費用、安全與權益，降低資訊落差帶來的不合理居住風險。",
      points: [
        "協助學生、新鮮人與第一次租屋者，在簽約前理解哪些條件需要確認、哪些證據需要保留。",
        "讓透明、安全且條件合理的出租方更容易被看見，增加供給端主動揭露資訊的誘因。",
        "降低搜尋成本與資訊不對稱，讓租屋選擇從只看價格，轉向租金加風險的綜合判斷。",
        "呼應 SDG 11.1 對安全、適足與可負擔住宅的追求，也以降低租屋資訊落差回應 SDG 10。",
      ],
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
            <div className="mono" style={{ fontSize: 11, color: "#5a6573", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              PROJECT GUIDE · PROJECT PLAN
            </div>
            <h1 className="page-title">專案導引</h1>
            <p className="page-sub">
              從計畫書的摘要、問題、解法與影響出發，快速理解 Rent Unfiltered 為什麼存在，以及 RHIR、RRI、AI Insight 如何共同支援租屋決策。
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => setRoute({ name: "glossary", tab: "rhir" })}>
              <Icon name="book" size={14} />
              查看名詞與階段
            </button>
          </div>
        </div>

        <div className="stat-row">
          <div className="stat"><div className="stat-label">計畫書板塊</div><div className="stat-value" style={{ fontSize: 18 }}>6 個</div></div>
          <div className="stat"><div className="stat-label">核心資料格式</div><div className="stat-value" style={{ fontSize: 18 }}>RHIR</div></div>
          <div className="stat"><div className="stat-label">風險判讀</div><div className="stat-value" style={{ fontSize: 18 }}>RRI</div></div>
          <div className="stat"><div className="stat-label">說明與行動</div><div className="stat-value" style={{ fontSize: 18 }}>AI Insight</div></div>
        </div>

        <div style={{ display: "grid", gap: 18, marginTop: 18 }}>
          {guideBlocks.map((block) => (
            <section className="fg" key={block.title}>
              <div className="fg-head">
                <h3>{block.title}</h3>
                <span className="meta mono">{block.meta}</span>
              </div>
              <div style={{ padding: "16px 18px", fontSize: 14, lineHeight: 1.8, color: "#2a313b" }}>
                <p style={{ margin: "0 0 10px" }}>{block.lead}</p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {block.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

window.ProjectGuidePage = ProjectGuidePage;
