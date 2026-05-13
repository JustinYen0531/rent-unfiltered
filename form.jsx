// New rental form - create the initial version X

const { useState: useStateF } = React;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildRandomFormSeed() {
  const propertyType = pick(["套房", "雅房", "整層住家", "分租住宅"]);
  const buildingType = pick(["公寓", "電梯大樓", "透天"]);
  const district = pick(["文山區", "大安區", "信義區", "中山區", "板橋區", "永和區"]);
  const floor = randInt(2, 12);
  const totalFloor = Math.max(floor, randInt(floor, floor + 10));
  const sizePing = randInt(4, 18);
  const rent = randInt(8500, 32000);
  const depositMonths = pick([1, 2]);
  const managementFee = pick(["500", "800", "1200", "尚未確認", "0"]);
  const internetFee = pick(["0", "300", "500", "尚未確認"]);
  const reviewPeriod = pick(["3 天", "5 天", "7 天", "尚未確認"]);
  const earlyTermination = pick(["提前 30 天通知", "違約金 1 個月租金", "提前 14 天通知", "尚未確認"]);
  const notes = pick([
    "可先線上看合約重點，入住前再確認清潔費與垃圾代收。",
    "房東表示可談短租，但需另外確認是否加價。",
    "目前僅確認基本條件，水電與修繕責任還要二次確認。",
    "房源主打近學區與捷運，但未提供完整附家具清單。",
  ]);

  return {
    propertyType,
    buildingType,
    floor: String(floor),
    totalFloor: String(totalFloor),
    sizePing: String(sizePing),
    district,
    hasFurniture: pick(["yes", "no", "partial"]),
    petAllowed: pick(["yes", "no", null]),

    rent: String(rent),
    deposit: String(rent * depositMonths),
    electricityRate: pick(["台電計價", "4.8 元 / 度", "5 元 / 度", "5.5 元 / 度"]),
    waterFee: pick(["台水計價", "固定 100", "均分"]),
    managementFee,
    internetFee,
    eligibleForSubsidy: pick(["yes", "no", null]),
    eligibleForTaxFiling: pick(["yes", "no", null]),

    hasWrittenContract: pick(["yes", "no"]),
    reviewPeriod,
    repairResponsibility: pick([
      "房客負擔小型維修",
      "房東負擔主要設備維修",
      "依合約條款分工",
      "尚未確認",
    ]),
    earlyTermination,
    depositReturnTerms: pick(["退租後 7 日內", "退租後 14 日內", "退租後 30 日內"]),
    notes,

    rooftopAddition: pick(["yes", "no", null]),
    illegalPartition: pick(["yes", "no", null]),
    escapeRoute: pick(["兩處逃生動線", "僅一處主要逃生口", "後陽台可作為第二出口"]),
    fireEquipment: pick(["有滅火器、無偵煙器", "有滅火器與偵煙器", "公共區域有消防設備"]),
    waterLeak: pick(["目前未見漏水", "浴室牆角疑似有水痕", "實地看房時確認"]),
    doorLock: pick(["獨立門禁 + 房門鎖", "磁扣門禁 + 電子鎖", "傳統門鎖 + 公共大門感應"]),

    forbidsTaxFiling: pick(["yes", "no"]),
    forbidsHouseholdRegistration: pick(["yes", "no"]),
    taxBurdenShift: pick(["yes", "no", null]),
    unfairTerms: pick(["yes", "no", null]),
  };
}

function FormPage({ setRoute, mode = "new", versionLabel = "X" }) {
  const { Icon } = window.RU;
  const [section, setSection] = useStateF("property");
  const [seed, setSeed] = useStateF(() => buildRandomFormSeed());
  const [formResetKey, setFormResetKey] = useStateF(0);

  const SECTIONS = [
    { id: "property", title: "物件基本資訊", step: "01", filled: 6, total: 8 },
    { id: "cost", title: "租金與費用", step: "02", filled: 4, total: 8 },
    { id: "lease", title: "契約與條款", step: "03", filled: 3, total: 6 },
    { id: "safety", title: "安全與屋況", step: "04", filled: 2, total: 6 },
    { id: "rights", title: "權益限制", step: "05", filled: 2, total: 4 },
  ];

  const totalFilled = SECTIONS.reduce((a, s) => a + s.filled, 0);
  const totalFields = SECTIONS.reduce((a, s) => a + s.total, 0);
  const pct = Math.round((totalFilled / totalFields) * 100);

  const handleGenerate = () => {
    setSeed(buildRandomFormSeed());
    setFormResetKey((value) => value + 1);
  };

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 18 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "#5a6573", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            NEW RECORD · INITIAL VERSION <span style={{ color: "#1652f0" }}>{versionLabel}</span>
          </div>
          <h1 className="page-title">新增租屋資訊</h1>
          <p className="page-sub">
            這份表單會直接被轉成一份完整的 RHIR JSON。未填寫的欄位會被標示為{" "}
            <span className="badge badge-missing"><span className="dot"></span>missing</span>，
            方便之後補齊與追蹤。
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button className="btn" onClick={() => setRoute({ name: "home" })}>返回</button>
          <button className="btn" onClick={handleGenerate}>
            <Icon name="sparkle" size={14} />
            一鍵隨機生成
          </button>
          <button className="btn">
            <Icon name="file" size={14} />
            暫存草稿
          </button>
          <button className="btn btn-primary">
            <Icon name="check" size={14} />
            建立版本 {versionLabel}
          </button>
        </div>
      </div>

      <div className="form-shell">
        <aside className="form-side">
          <div className="side-title">表單章節</div>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a className={section === s.id ? "active" : ""} onClick={() => setSection(s.id)}>
                  <span><span className="mono" style={{ color: "#8a93a0", marginRight: 8, fontSize: 11 }}>{s.step}</span>{s.title}</span>
                  <span className="ok mono">{s.filled}/{s.total}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="side-title" style={{ marginTop: 24 }}>測試說明</div>
          <div style={{ fontSize: 11, color: "#5a6573", lineHeight: 1.7, padding: "4px 10px" }}>
            按下「一鍵隨機生成」會自動灌入一組測試資料，方便快速驗證 RHIR 轉換、版本建立與報告流程。
          </div>
        </aside>

        <div key={formResetKey}>
          <FormSection section={SECTIONS.find((s) => s.id === section)} seed={seed} />
        </div>

        <aside>
          <div className="form-summary">
            <h4>表單填寫進度</h4>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div className="mono" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>{pct}<span style={{ fontSize: 14, color: "#8a93a0" }}>%</span></div>
              <div className="mono" style={{ fontSize: 11, color: "#5a6573" }}>{totalFilled}/{totalFields} 欄位</div>
            </div>
            <div className="meter"><div className="fill" style={{ width: `${pct}%` }} /></div>

            <div className="row"><span className="l">已揭露</span><span className="v">17</span></div>
            <div className="row"><span className="l">部分揭露</span><span className="v">2</span></div>
            <div className="row"><span className="l">尚未確認</span><span className="v">12</span></div>
            <div className="row"><span className="l">推論欄位</span><span className="v">5</span></div>

            <h4 style={{ marginTop: 18 }}>完成後會發生什麼</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 12, color: "#2a313b" }}>
              <li style={{ display: "flex", gap: 8, padding: "5px 0" }}><Icon name="check" size={13} className="mono" /> 表單會轉成 RHIR JSON</li>
              <li style={{ display: "flex", gap: 8, padding: "5px 0" }}><Icon name="check" size={13} /> 可建立初始版本 X</li>
              <li style={{ display: "flex", gap: 8, padding: "5px 0", color: "#5a6573" }}><Icon name="info" size={13} /> AI 分析報告仍是手動觸發</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FormSection({ section, seed }) {
  if (!section) return null;
  return (
    <div className="form-section">
      <div className="form-section-head">
        <h3>{section.title}</h3>
        <span className="step mono">SECTION {section.step} · {section.filled}/{section.total}</span>
      </div>
      <div className="form-section-body">
        {section.id === "property" && <PropertySection seed={seed} />}
        {section.id === "cost" && <CostSection seed={seed} />}
        {section.id === "lease" && <LeaseSection seed={seed} />}
        {section.id === "safety" && <SafetySection seed={seed} />}
        {section.id === "rights" && <RightsSection seed={seed} />}
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
      {options.map((o) => (
        <button key={String(o.v)} className={value === o.v ? "active" : ""} onClick={() => onChange(o.v)} type="button">
          {o.l}
        </button>
      ))}
    </div>
  );
}

function PropertySection({ seed }) {
  const [propType, setPropType] = useStateF(seed.propertyType);
  const [bldg, setBldg] = useStateF(seed.buildingType);
  const [furniture, setFurniture] = useStateF(seed.hasFurniture);
  const [pet, setPet] = useStateF(seed.petAllowed);

  return (
    <>
      <FieldInput label="房型" required schemaKey="property.propertyType">
        <Seg value={propType} onChange={setPropType} options={[
          { v: "套房", l: "套房" },
          { v: "雅房", l: "雅房" },
          { v: "整層住家", l: "整層住家" },
          { v: "分租住宅", l: "分租住宅" },
        ]} />
      </FieldInput>
      <FieldInput label="物件類型" required schemaKey="property.buildingType">
        <Seg value={bldg} onChange={setBldg} options={[
          { v: "公寓", l: "公寓" },
          { v: "電梯大樓", l: "電梯大樓" },
          { v: "透天", l: "透天" },
        ]} />
      </FieldInput>
      <FieldInput label="樓層" required schemaKey="property.floor">
        <input defaultValue={seed.floor} />
      </FieldInput>
      <FieldInput label="總樓層" required schemaKey="property.totalFloor">
        <input defaultValue={seed.totalFloor} />
      </FieldInput>
      <FieldInput label="坪數" required schemaKey="property.sizePing" hint="室內實際坪數，不含公設">
        <input defaultValue={seed.sizePing} />
      </FieldInput>
      <FieldInput label="行政區" required schemaKey="locationContext.district">
        <select defaultValue={seed.district}>
          {["文山區", "大安區", "信義區", "中山區", "板橋區", "永和區"].map((d) => <option key={d}>{d}</option>)}
        </select>
      </FieldInput>
      <FieldInput label="是否附家具" schemaKey="property.hasFurniture">
        <Seg value={furniture} onChange={setFurniture} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: "partial", l: "部分" },
        ]} />
      </FieldInput>
      <FieldInput label="是否可養寵物" schemaKey="property.petAllowed" hint="若未確認，會被記錄為 missing">
        <Seg value={pet} onChange={setPet} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
    </>
  );
}

function CostSection({ seed }) {
  const [subsidy, setSubsidy] = useStateF(seed.eligibleForSubsidy);
  const [taxFiling, setTaxFiling] = useStateF(seed.eligibleForTaxFiling);

  return (
    <>
      <FieldInput label="租金" required schemaKey="cost.rent">
        <div className="field-input with-prefix" style={{ margin: 0 }}>
          <span className="prefix mono">NT$</span>
          <input defaultValue={seed.rent} />
        </div>
      </FieldInput>
      <FieldInput label="押金" required schemaKey="cost.deposit" hint="通常為 1 到 2 個月房租">
        <div className="field-input with-prefix" style={{ margin: 0 }}>
          <span className="prefix mono">NT$</span>
          <input defaultValue={seed.deposit} />
        </div>
      </FieldInput>
      <FieldInput label="電費單價" schemaKey="cost.electricityRate" hint="若不是台電計價，可直接填單價">
        <input defaultValue={seed.electricityRate} />
      </FieldInput>
      <FieldInput label="水費" schemaKey="cost.waterFee">
        <input defaultValue={seed.waterFee} />
      </FieldInput>
      <FieldInput label="管理費" schemaKey="cost.mgmtFee" hint="未填寫會被記錄為 missing">
        <input defaultValue={seed.managementFee} />
      </FieldInput>
      <FieldInput label="網路費" schemaKey="cost.internetFee">
        <input defaultValue={seed.internetFee} />
      </FieldInput>
      <FieldInput label="是否可申請租補" schemaKey="cost.eligibleForSubsidy">
        <Seg value={subsidy} onChange={setSubsidy} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="是否可報稅" schemaKey="cost.eligibleForTaxFiling">
        <Seg value={taxFiling} onChange={setTaxFiling} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
    </>
  );
}

function LeaseSection({ seed }) {
  const [writtenContract, setWrittenContract] = useStateF(seed.hasWrittenContract);

  return (
    <>
      <FieldInput label="是否有書面契約" required schemaKey="leaseTerms.hasWrittenContract">
        <Seg value={writtenContract} onChange={setWrittenContract} options={[
          { v: "yes", l: "有" },
          { v: "no", l: "沒有" },
        ]} />
      </FieldInput>
      <FieldInput label="是否有審閱期" schemaKey="leaseTerms.reviewPeriod">
        <input defaultValue={seed.reviewPeriod} />
      </FieldInput>
      <FieldInput label="修繕責任" schemaKey="leaseTerms.repairResponsibility" hint="若界線模糊，會被記為 partial">
        <input defaultValue={seed.repairResponsibility} />
      </FieldInput>
      <FieldInput label="提前解約條件" schemaKey="leaseTerms.earlyTerminationTerms">
        <input defaultValue={seed.earlyTermination} />
      </FieldInput>
      <FieldInput label="押金退還方式" schemaKey="leaseTerms.depositReturnTerms">
        <input defaultValue={seed.depositReturnTerms} />
      </FieldInput>
      <div className="full">
        <FieldInput label="其他契約備註" schemaKey="leaseTerms.notes">
          <textarea defaultValue={seed.notes} />
        </FieldInput>
      </div>
    </>
  );
}

function SafetySection({ seed }) {
  const [rooftopAddition, setRooftopAddition] = useStateF(seed.rooftopAddition);
  const [illegalPartition, setIllegalPartition] = useStateF(seed.illegalPartition);

  return (
    <>
      <FieldInput label="是否頂樓加蓋" required schemaKey="safety.rooftopAddition">
        <Seg value={rooftopAddition} onChange={setRooftopAddition} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="是否違法隔間" schemaKey="safety.illegalPartition">
        <Seg value={illegalPartition} onChange={setIllegalPartition} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="逃生動線" schemaKey="safety.escapeRoute">
        <input defaultValue={seed.escapeRoute} />
      </FieldInput>
      <FieldInput label="消防設備" schemaKey="safety.fireEquipment">
        <input defaultValue={seed.fireEquipment} />
      </FieldInput>
      <FieldInput label="漏水狀況" schemaKey="safety.waterLeak">
        <input defaultValue={seed.waterLeak} />
      </FieldInput>
      <FieldInput label="門鎖與出入安全" schemaKey="safety.doorLock">
        <input defaultValue={seed.doorLock} />
      </FieldInput>
    </>
  );
}

function RightsSection({ seed }) {
  const [forbidsTaxFiling, setForbidsTaxFiling] = useStateF(seed.forbidsTaxFiling);
  const [forbidsHouseholdRegistration, setForbidsHouseholdRegistration] = useStateF(seed.forbidsHouseholdRegistration);
  const [taxBurdenShift, setTaxBurdenShift] = useStateF(seed.taxBurdenShift);
  const [unfairTerms, setUnfairTerms] = useStateF(seed.unfairTerms);

  return (
    <>
      <FieldInput label="是否禁止報稅" required schemaKey="rights.forbidsTaxFiling">
        <Seg value={forbidsTaxFiling} onChange={setForbidsTaxFiling} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
        ]} />
      </FieldInput>
      <FieldInput label="是否禁止遷戶籍" required schemaKey="rights.forbidsHouseholdRegistration">
        <Seg value={forbidsHouseholdRegistration} onChange={setForbidsHouseholdRegistration} options={[
          { v: "yes", l: "是" },
          { v: "no", l: "否" },
        ]} />
      </FieldInput>
      <FieldInput label="是否有稅負轉嫁條款" schemaKey="rights.taxBurdenShift">
        <Seg value={taxBurdenShift} onChange={setTaxBurdenShift} options={[
          { v: "yes", l: "有" },
          { v: "no", l: "沒有" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
      <FieldInput label="是否存在不合理條款" schemaKey="rights.unfairTerms">
        <Seg value={unfairTerms} onChange={setUnfairTerms} options={[
          { v: "yes", l: "有" },
          { v: "no", l: "沒有" },
          { v: null, l: "未確認" },
        ]} />
      </FieldInput>
    </>
  );
}

window.FormPage = FormPage;
