// Homepage — records list

const { useState: useStateH } = React;

function HomePage({ setRoute }) {
  const records = window.RU_DATA.getVisibleRecords?.() || window.RU_DATA.SAMPLE_RECORDS;
  const { Icon, RiskPill } = window.RU;
  const [filter, setFilter] = useStateH("all");

  const filtered = records.filter(r =>
    filter === "all" ? true :
    filter === "analyzed" ? r.rri != null :
    filter === "pending" ? r.rri == null :
    filter === "highrisk" ? (r.rri != null && r.rri < 50) :
    true
  );

  const stats = {
    total: records.length,
    analyzed: records.filter(r => r.rri != null).length,
    pending: records.filter(r => r.rri == null).length,
    avgCompletion: Math.round(records.reduce((a, r) => a + r.completion, 0) / records.length * 100),
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="mono" style={{fontSize:11, color:"#5a6573", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6}}>
            RECORDS · 物件紀錄
          </div>
          <h1 className="page-title">租屋紀錄</h1>
          <p className="page-sub">
            管理你已建立的物件紀錄，檢視欄位填寫情形、RHIR 結構與分析報告。每筆物件先有一份完整的初始版本 <span className="mono">X</span>，再逐次補充為子版本。
          </p>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn"><Icon name="download" size={14}/> 匯出全部 RHIR</button>
          <button className="btn btn-primary btn-lg" onClick={() => setRoute({ name: "form", mode: "new" })}>
            <Icon name="plus" size={16}/> 新增租屋資訊
          </button>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <div className="stat-label">紀錄總數</div>
          <div className="stat-value">{stats.total}<span className="delta mono">+1 本週</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">已完成 RRI 評分</div>
          <div className="stat-value">{stats.analyzed}<span className="delta mono">/ {stats.total}</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">尚未評分</div>
          <div className="stat-value">{stats.pending}<span className="delta mono">等待 RRI</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">平均欄位完整度</div>
          <div className="stat-value">{stats.avgCompletion}<span className="delta mono">%</span></div>
        </div>
      </div>

      <div className="toolbar">
        {[
          {id:"all", label:"全部", count: records.length},
          {id:"analyzed", label:"已評分", count: stats.analyzed},
          {id:"pending", label:"未評分", count: stats.pending},
          {id:"highrisk", label:"高風險", count: records.filter(r => r.rri != null && r.rri < 50).length},
        ].map(c => (
          <button key={c.id} className={`chip ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>
            {c.label} <span className="count mono">{c.count}</span>
          </button>
        ))}
        <div className="grow"/>
        <div className="mono" style={{fontSize:11, color:"#8a93a0"}}>
          排序：最近更新 ↓
        </div>
      </div>

      <div className="tablewrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{width:170}}>RHIR ID</th>
              <th>物件</th>
              <th style={{width:140}}>房型 / 區域</th>
              <th style={{width:110, textAlign:"right"}}>租金 / 月</th>
              <th style={{width:90}}>版本</th>
              <th style={{width:140}}>欄位完整度</th>
              <th style={{width:130}}>RRI</th>
              <th style={{width:130}}>最近更新</th>
              <th style={{width:32}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="clickable" onClick={() => setRoute({ name: "detail", id: r.id })}>
                <td className="t-id mono">{r.id}</td>
                <td>
                  <div className="t-title">{r.title}</div>
                  <div className="t-meta">{r.address}</div>
                </td>
                <td>
                  <div>{r.summary.split(" · ")[0]}</div>
                  <div className="t-meta">{r.district}</div>
                </td>
                <td style={{textAlign:"right"}} className="mono">
                  <div>NT$ {r.rent.toLocaleString()}</div>
                </td>
                <td>
                  <span className="badge badge-outline mono">{r.versions[0]}</span>
                  <span className="t-meta" style={{marginLeft:4}}>共 {r.versions.length}</span>
                </td>
                <td>
                  <div style={{display:"flex", alignItems:"center", gap:8}}>
                    <div style={{flex:1, height:4, background:"#eceef1", borderRadius:2, overflow:"hidden"}}>
                      <div style={{width:`${Math.round(r.completion*100)}%`, height:"100%", background: r.completion >= 0.75 ? "var(--s-disclosed-ink)" : r.completion >= 0.55 ? "var(--s-partial-ink)" : "var(--s-missing-ink)"}}/>
                    </div>
                    <span className="mono" style={{fontSize:11, color:"#5a6573"}}>{Math.round(r.completion*100)}%</span>
                  </div>
                </td>
                <td><RiskPill score={r.rri} level={r.riskLevel}/></td>
                <td className="t-meta mono">{r.updatedAt}</td>
                <td><Icon name="chevron" size={14}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="callout" style={{marginTop:18}}>
        <span className="ic"><Icon name="info" size={14}/></span>
        <div>
          <strong>什麼是 RHIR？</strong> Rental Housing Information Record 是 Rent Unfiltered 用來描述單一物件的結構化格式。每一個表單欄位都對應到一個 RHIR 節點，且都會記錄
          {" "}<span className="mono">value</span>、<span className="mono">disclosureStatus</span>、<span className="mono">sourceType</span>。這讓使用者在比較不同版本時，知道每個欄位是「已揭露」、「未揭露」、「部分揭露」、「推論」、「衝突」還是「待追問」。
        </div>
      </div>
    </div>
  );
}

window.HomePage = HomePage;
