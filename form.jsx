// New rental form — create the initial version X

const { useState: useStateF } = React;

function FormPage({ setRoute, mode = "new", versionLabel = "X" }) {
  const { Icon } = window.RU;
  const [section, setSection] = useStateF("property");

  const SECTIONS = [
    { id: "property", title: "物件基本資料", step: "01", filled: 6, total: 8 },
    { id: "cost", title: "房屋與費用", step: "02", filled: 4, total: 8 },
    { id: "lease", title: "契約條件", step: "03", filled: 3, total: 5 },
    { id: "safety", title: "居住安全", step: "04", filled: 2, total: 6 },
    { id: "rights", title: "租客權益", step: "05", filled: 2, total: 4 },
  ];

  const totalFilled = SECTIONS.reduce((a, s) => a + s.filled, 0);
  const totalFields = SECTIONS.reduce((a, s) => a + s.total, 0);
  const pct = Math.round(totalFilled / totalFields * 100);

  return (
    <div className="page">
      <div className="page-header" style={{marginBottom: 18}}>
        <div>
          <div className="mono" style={{fontSize:11, color:"#5a6573", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6}}>
            NEW RECORD · 建立初始版本 <span style={{color:"#1652f0"}}>{versionLabel}</span>
          </div>
          <h1 className="page-title">新增租屋資訊</h1>
          <p className="page-sub">
            這份表單會直接被轉成一份完整的 RHIR JSON。請把你目前已知的資訊填寫進去，未填寫的欄位會被標示為
            {" "}<span className="badge badge-missing"><span className="dot"></span>未揭露</span>，後續可在子版本中補件。
          </p>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn" onClick={() => setRoute({name:"home"})}>取消</button>
          <button className="btn"><Icon name="file" size={14}/> 儲存為草稿</button>
          <button className="btn btn-primary"><Icon name="check" size={14}/> 建立版本 {versionLabel}</button>
        </div>
      </div>

      <div className="form-shell">
        {/* Section nav */}
        <aside className="form-side">
          <div className="side-title">表單章節</div>
          <ul>
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a className={section === s.id ? "active" : ""} onClick={() => setSection(s.id)}>
                  <span><span className="mono" style={{color:"#8a93a0", marginRight:8, fontSize:11}}>{s.step}</span>{s.title}</span>
                  <span className="ok mono">{s.filled}/{s.total}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="side-title" style={{marginTop:24}}>建立規則</div>
          <div style={{fontSize:11, color:"#5a6573", lineHeight:1.7, padding:"4px 10px"}}>
            初始版本 <span className="mono" style={{color:"#1652f0"}}>X</span> 是後續所有子版本的對照基準。建立後即可在詳細頁面新增 <span className="mono">X-1</span>、<span className="mono">X-2</span> 來補件或重新分析。
          </div>
        </aside>

        {/* Main form */}
        <div>
          <FormSection section={SECTIONS.find(s => s.id === section)}/>
        </div>

        {/* Summary side */}
        <aside>
          <div className="form-summary">
            <h4>表單完整度</h4>
            <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between"}}>
              <div className="mono" style={{fontSize:28, fontWeight:500, letterSpacing:"-0.02em"}}>{pct}<span style={{fontSize:14, color:"#8a93a0"}}>%</span></div>
              <div className="mono" style={{fontSize:11, color:"#5a6573"}}>{totalFilled}/{totalFields} 欄位</div>
            </div>
            <div className="meter"><div className="fill" style={{width:`${pct}%`}}/></div>

            <div className="row"><span className="l">將被標示為已揭露</span><span className="v">17</span></div>
            <div className="row"><span className="l">部分揭露</span><span className="v">2</span></div>
            <div className="row"><span className="l">將被標示為未揭露</span><span className="v">12</span></div>
            <div className="row"><span className="l">需追問項目</span><span className="v">5</span></div>

            <h4 style={{marginTop:18}}>送出後將觸發</h4>
            <ul style={{listStyle:"none", padding:0, margin:0, fontSize:12, color:"#2a313b"}}>
              <li style={{display:"flex", gap:8, padding:"5px 0"}}><Icon name="check" size={13} className="mono"/> 表單 → RHIR JSON 轉換</li>
              <li style={{display:"flex", gap:8, padding:"5px 0"}}><Icon name="check" size={13}/> 透明度層級分類</li>
              <li style={{display:"flex", gap:8, padding:"5px 0", color:"#5a6573"}}><Icon name="info" size={13}/> AI 分析報告（手動觸發）</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FormSection({ section }) {
  if (!section) return null;
  return (
    <div className="form-section">
      <div className="form-section-head">
        <h3>{section.title}</h3>
        <span className="step mono">SECTION {section.step} · {section.filled}/{section.total}</span>
      </div>
      <div className="form-section-body">
        {section.id === "property" && <PropertySection/>}
        {section.id === "cost" && <CostSection/>}
        {section.id === "lease" && <LeaseSection/>}
        {section.id === "safety" && <SafetySection/>}
        {section.id === "rights" && <RightsSection/>}
      </div>
    </div>
  );
}

function FieldInput({ label, hint, required, schemaKey, children }) {
  return (
    <div className="field-input">
      <label>
        {label}{required && <span className="req">*</span>}
        <span className="key mono">{schemaKey}</span>
      </label>
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Seg({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map(o => (
        <button key={o.v} className={value === o.v ? "active" : ""} onClick={() => onChange(o.v)} type="button">
          {o.l}
        </button>
      ))}
    </div>
  );
}

function PropertySection() {
  const [propType, setPropType] = useStateF("套房");
  const [bldg, setBldg] = useStateF("電梯大樓");
  const [furniture, setFurniture] = useStateF("yes");
  const [pet, setPet] = useStateF(null);
  return (
    <>
      <FieldInput label="房型" required schemaKey="property.propertyType">
        <Seg value={propType} onChange={setPropType} options={[
          {v:"套房", l:"套房"},
          {v:"雅房", l:"雅房"},
          {v:"分租套房", l:"分租套房"},
          {v:"整層住家", l:"整層住家"},
        ]}/>
      </FieldInput>
      <FieldInput label="物件類型" required schemaKey="property.buildingType">
        <Seg value={bldg} onChange={setBldg} options={[
          {v:"公寓", l:"公寓"},
          {v:"電梯大樓", l:"電梯大樓"},
          {v:"透天", l:"透天"},
        ]}/>
      </FieldInput>
      <FieldInput label="樓層" required schemaKey="property.floor">
        <input defaultValue="5"/>
      </FieldInput>
      <FieldInput label="總樓層" required schemaKey="property.totalFloor">
        <input defaultValue="12"/>
      </FieldInput>
      <FieldInput label="坪數" required schemaKey="property.sizePing" hint="室內實際坪數，不含公設">
        <input defaultValue="8"/>
      </FieldInput>
      <FieldInput label="行政區" required schemaKey="locationContext.district">
        <select defaultValue="文山區">
          {["文山區","大安區","信義區","中正區","北投區","士林區"].map(d => <option key={d}>{d}</option>)}
        </select>
      </FieldInput>
      <FieldInput label="是否附家具" schemaKey="property.hasFurniture">
        <Seg value={furniture} onChange={setFurniture} options={[
          {v:"yes", l:"是"},{v:"no", l:"否"},{v:"partial", l:"部分"}
        ]}/>
      </FieldInput>
      <FieldInput label="是否可養寵物" schemaKey="property.petAllowed" hint="若未確認，會被記錄為 missing">
        <Seg value={pet} onChange={setPet} options={[
          {v:"yes", l:"是"},{v:"no", l:"否"},{v:null, l:"未確認"}
        ]}/>
      </FieldInput>
    </>
  );
}

function CostSection() {
  return (
    <>
      <FieldInput label="租金" required schemaKey="cost.rent">
        <div className="field-input with-prefix" style={{margin:0}}>
          <span className="prefix mono">NT$</span>
          <input defaultValue="13500"/>
        </div>
      </FieldInput>
      <FieldInput label="押金" required schemaKey="cost.deposit" hint="通常為 2 個月房租">
        <div className="field-input with-prefix" style={{margin:0}}>
          <span className="prefix mono">NT$</span>
          <input defaultValue="27000"/>
        </div>
      </FieldInput>
      <FieldInput label="電費單價" schemaKey="cost.electricityRate" hint="台電夏季最高 4.05 元 / 度">
        <input defaultValue="5 元 / 度"/>
      </FieldInput>
      <FieldInput label="水費" schemaKey="cost.waterFee">
        <Seg value="包含" onChange={()=>{}} options={[
          {v:"包含", l:"包含"},{v:"自付", l:"自付"},{v:"split", l:"分攤"}
        ]}/>
      </FieldInput>
      <FieldInput label="管理費" schemaKey="cost.mgmtFee" hint="未填寫會被記錄為 missing">
        <input placeholder="尚未確認"/>
      </FieldInput>
      <FieldInput label="網路費" schemaKey="cost.internetFee">
        <input placeholder="尚未確認"/>
      </FieldInput>
      <FieldInput label="是否可申請租補" schemaKey="cost.eligibleForSubsidy">
        <Seg value={null} onChange={()=>{}} options={[
          {v:"yes", l:"是"},{v:"no", l:"否"},{v:null, l:"未確認"}
        ]}/>
      </FieldInput>
      <FieldInput label="是否可報稅" schemaKey="cost.eligibleForTaxFiling">
        <Seg value="no" onChange={()=>{}} options={[
          {v:"yes", l:"是"},{v:"no", l:"否（屋主表示）"},{v:null, l:"未確認"}
        ]}/>
      </FieldInput>
    </>
  );
}

function LeaseSection() {
  return (
    <>
      <FieldInput label="是否有書面契約" required schemaKey="leaseTerms.hasWrittenContract">
        <Seg value="yes" onChange={()=>{}} options={[{v:"yes",l:"是"},{v:"no",l:"否"}]}/>
      </FieldInput>
      <FieldInput label="是否有審閱期" schemaKey="leaseTerms.reviewPeriod">
        <input placeholder="天數 / 尚未確認"/>
      </FieldInput>
      <FieldInput label="修繕責任" schemaKey="leaseTerms.repairResponsibility" hint="若界線模糊，會被記為 partial">
        <input defaultValue="房客負擔小型維修"/>
      </FieldInput>
      <FieldInput label="提前解約條件" schemaKey="leaseTerms.earlyTerminationTerms">
        <input placeholder="違約金 / 提前通知期"/>
      </FieldInput>
      <FieldInput label="押金退還方式" schemaKey="leaseTerms.depositReturnTerms">
        <input defaultValue="退租後 30 日內"/>
      </FieldInput>
      <div className="full">
        <FieldInput label="其他契約備註" schemaKey="leaseTerms.notes">
          <textarea placeholder="可貼上條款重點，例如清潔費負擔、違約條款等"/>
        </FieldInput>
      </div>
    </>
  );
}

function SafetySection() {
  return (
    <>
      <FieldInput label="是否頂樓加蓋" required schemaKey="safety.rooftopAddition">
        <Seg value="no" onChange={()=>{}} options={[{v:"yes",l:"是"},{v:"no",l:"否"},{v:null,l:"未確認"}]}/>
      </FieldInput>
      <FieldInput label="是否違法隔間" schemaKey="safety.illegalPartition">
        <Seg value={null} onChange={()=>{}} options={[{v:"yes",l:"是"},{v:"no",l:"否"},{v:null,l:"未確認"}]}/>
      </FieldInput>
      <FieldInput label="逃生動線" schemaKey="safety.escapeRoute">
        <input defaultValue="僅一處主要逃生口"/>
      </FieldInput>
      <FieldInput label="消防設備" schemaKey="safety.fireEquipment">
        <input defaultValue="有滅火器、無偵煙器"/>
      </FieldInput>
      <FieldInput label="漏水狀況" schemaKey="safety.waterLeak">
        <input placeholder="實地看房時確認"/>
      </FieldInput>
      <FieldInput label="門鎖與出入安全" schemaKey="safety.doorLock">
        <input defaultValue="獨立門禁 + 房門鎖"/>
      </FieldInput>
    </>
  );
}

function RightsSection() {
  return (
    <>
      <FieldInput label="是否禁止報稅" required schemaKey="rights.forbidsTaxFiling">
        <Seg value="yes" onChange={()=>{}} options={[{v:"yes",l:"是"},{v:"no",l:"否"}]}/>
      </FieldInput>
      <FieldInput label="是否禁止遷戶籍" required schemaKey="rights.forbidsHouseholdRegistration">
        <Seg value="yes" onChange={()=>{}} options={[{v:"yes",l:"是"},{v:"no",l:"否"}]}/>
      </FieldInput>
      <FieldInput label="是否有稅負轉嫁條款" schemaKey="rights.taxBurdenShift">
        <Seg value={null} onChange={()=>{}} options={[{v:"yes",l:"是"},{v:"no",l:"否"},{v:null,l:"未確認"}]}/>
      </FieldInput>
      <FieldInput label="是否存在不合理條款" schemaKey="rights.unfairTerms">
        <Seg value={null} onChange={()=>{}} options={[{v:"yes",l:"是"},{v:"no",l:"否"},{v:null,l:"未確認"}]}/>
      </FieldInput>
    </>
  );
}

window.FormPage = FormPage;
