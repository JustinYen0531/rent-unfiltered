// Shared chrome + small components

const { Fragment, useEffect, useMemo, useRef, useState } = React;

const RU_SETTINGS_KEY = "ru_openrouter_api_key";

function getStoredApiKey() {
  try {
    return window.localStorage.getItem(RU_SETTINGS_KEY) || "";
  } catch (error) {
    return "";
  }
}

function setStoredApiKey(value) {
  try {
    if (value) {
      window.localStorage.setItem(RU_SETTINGS_KEY, value);
    } else {
      window.localStorage.removeItem(RU_SETTINGS_KEY);
    }
    return true;
  } catch (error) {
    return false;
  }
}

function maskApiKey(value) {
  if (!value) return "未設定";
  if (value.length <= 10) return "已設定";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getRhirRecordId(rhir) {
  return rhir?.metadata?.rhirRecordId?.value || "rhir-record";
}

function makeJsonFileName(baseName) {
  return `${String(baseName || "rhir-record").replace(/[^\w.-]+/g, "-")}.json`;
}

function downloadJSON(data, baseName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = makeJsonFileName(baseName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyJSON(data) {
  const text = JSON.stringify(data, null, 2);
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Some embedded browsers block clipboard writes even after a user click.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  return ok;
}

const RRI_FOLLOWUP_RULES = {
  "cost.eligibleForSubsidy": { axis: "租客權益", priority: "high", question: "這個物件是否可以申請租金補貼？如果不行，原因是什麼？", reason: "租補資格會影響實際負擔，也常與報稅、戶籍條件一起影響租客權益。" },
  "leaseTerms.hasWrittenContract": { axis: "契約透明度", priority: "high", question: "是否會簽正式書面租賃契約？可以先看契約草稿嗎？", reason: "沒有書面契約會讓修繕、押金、提前解約等責任難以追溯。" },
  "leaseTerms.reviewPeriod": { axis: "契約透明度", priority: "medium", question: "簽約前是否有契約審閱期？可以帶回或線上先看嗎？", reason: "審閱期可以避免看房當下被迫立即簽約。" },
  "leaseTerms.repairResponsibility": { axis: "契約透明度", priority: "high", question: "設備故障、漏水、冷氣與熱水器維修責任由誰負擔？", reason: "修繕責任不清楚時，入住後最容易產生費用爭議。" },
  "leaseTerms.earlyTerminationClause": { axis: "契約透明度", priority: "medium", question: "提前解約需要提前多久告知？是否有違約金？", reason: "提前解約條款會影響搬離彈性與潛在成本。" },
  "leaseTerms.depositRefundTerms": { axis: "費用透明度", priority: "medium", question: "押金何時退還？哪些情況會被扣押金？", reason: "押金退還方式不明會提高退租爭議風險。" },
  "leaseTerms.taxRegistrationAllowed": { axis: "租客權益", priority: "high", question: "是否可以報稅？契約是否會限制申報租金支出？", reason: "報稅是租客重要權益，也會影響租金扣除與租補申請。" },
  "leaseTerms.householdRegistrationAllowed": { axis: "租客權益", priority: "high", question: "是否可以遷入戶籍？如果不行，房東理由是什麼？", reason: "戶籍會影響租補、稅務與居住權益。" },
  "rights.taxBurdenShift": { axis: "租客權益", priority: "high", question: "契約是否要求房客負擔因報稅或設籍增加的稅費？", reason: "稅負轉嫁條款可能是不合理或高風險條件。" },
  "rights.unfairTerms": { axis: "租客權益", priority: "high", question: "契約是否有禁止報稅、禁止戶籍、任意進入房間等不合理條款？", reason: "不合理條款會直接影響租客權益與爭議風險。" },
  "safety.rooftopAddition": { axis: "居住安全", priority: "high", question: "是否為頂樓加蓋或增建空間？可以確認建物合法性嗎？", reason: "頂樓加蓋可能牽涉隔熱、防水、消防與合法性風險。" },
  "safety.illegalPartition": { axis: "居住安全", priority: "high", question: "是否為隔間套房？隔間材質與消防逃生是否符合安全需求？", reason: "違法或不良隔間會提高火災、噪音與逃生風險。" },
  "safety.escapeRoute": { axis: "居住安全", priority: "high", question: "看房時請確認逃生路線是否暢通，是否有第二出口或可開啟鐵窗。", reason: "逃生動線通常需要現場查看，平台文字很難完整判斷。" },
  "safety.fireEquipment": { axis: "居住安全", priority: "high", question: "現場是否有滅火器、偵煙器、緊急照明或出口標示？設備是否堪用？", reason: "消防設備多半要現場確認，會直接影響居住安全分數。" },
  "safety.waterLeak": { axis: "居住安全", priority: "medium", question: "看房時請檢查天花板、牆角、浴室與窗框是否有漏水或壁癌痕跡。", reason: "漏水常被平台照片避開，需要使用者現場確認。" },
  "safety.doorLock": { axis: "居住安全", priority: "medium", question: "門鎖、門禁與公共出入口是否安全？是否曾更換門鎖？", reason: "出入安全通常無法只靠租屋頁文字判斷。" },
};

function createFollowupQuestions(fieldKeys) {
  const seen = new Set();
  const weight = { high: 0, medium: 1, low: 2 };
  return fieldKeys
    .map((fieldKey) => {
      const rule = RRI_FOLLOWUP_RULES[fieldKey];
      if (!rule || seen.has(fieldKey)) return null;
      seen.add(fieldKey);
      return { field: fieldKey, ...rule };
    })
    .filter(Boolean)
    .sort((a, b) => (weight[a.priority] ?? 9) - (weight[b.priority] ?? 9));
}

function getFollowupQuestionsFromRhir(rhir) {
  const explicit = rhir?.transparencyLayer?.followupQuestions?.value;
  if (Array.isArray(explicit)) return explicit;
  const fields = rhir?.transparencyLayer?.fieldsNeedingUserQuestion?.value;
  return Array.isArray(fields) ? createFollowupQuestions(fields) : [];
}

function Icon({ name, size = 14, className = "" }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };
  const paths = {
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    edit: <><path d="M4 20h4l11-11-4-4L4 16v4z" /></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
    code: <><path d="m8 7-5 5 5 5" /><path d="m16 7 5 5-5 5" /></>,
    chart: <><path d="M4 20V8" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" /></>,
    check: <path d="m5 12 5 5 9-11" />,
    x: <><path d="M5 5l14 14" /><path d="M19 5l-14 14" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01" /><path d="M11 12h1v5h1" /></>,
    alert: <><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></>,
    arrowLeft: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    sliders: <><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><circle cx="4" cy="12" r="2" /><circle cx="12" cy="10" r="2" /><circle cx="20" cy="14" r="2" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
    git: <><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="12" r="2" /><path d="M6 8v8" /><path d="M18 10c-4 0-6-2-6-4" /><path d="M18 14c-4 0-6 2-6 4" /></>,
    sparkle: <><path d="M12 3v3" /><path d="M12 18v3" /><path d="M3 12h3" /><path d="M18 12h3" /><path d="m5.6 5.6 2.1 2.1" /><path d="m16.3 16.3 2.1 2.1" /><path d="m5.6 18.4 2.1-2.1" /><path d="m16.3 7.7 2.1-2.1" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="1.5" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></>,
    book: <><path d="M4 4h11a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z" /><path d="M4 16a4 4 0 0 1 4-4h11" /></>,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
}

function Badge({ status, children }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="dot"></span>
      {children || (window.RU_DATA.STATUS[status]?.ko ?? status)}
    </span>
  );
}

function RiskPill({ score, level }) {
  if (score == null) {
    return (
      <span className="risk-pill risk-mid" style={{ background: "#eceef1", color: "#5a6573" }}>
        未評分
      </span>
    );
  }
  const cls = score >= 70 ? "risk-low" : score >= 50 ? "risk-mid" : "risk-high";
  return (
    <span className={`risk-pill ${cls}`}>
      <span className="mono" style={{ fontWeight: 600 }}>{score}</span>
      <span style={{ opacity: 0.75 }}>級別 {level}</span>
    </span>
  );
}

function SettingsModal({ onClose }) {
  const inputRef = useRef(null);
  const [draftKey, setDraftKey] = useState(getStoredApiKey());
  const [savedMask, setSavedMask] = useState(maskApiKey(getStoredApiKey()));
  const [status, setStatus] = useState("");
  const hasValue = draftKey.trim().length > 0;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    const nextValue = draftKey.trim();
    const ok = setStoredApiKey(nextValue);
    if (!ok) {
      setStatus("這個瀏覽器目前無法寫入本機設定。");
      return;
    }
    setSavedMask(maskApiKey(nextValue));
    setStatus(nextValue ? "API Key 已儲存在這個瀏覽器。" : "API Key 已清除。");
  };

  const handleClear = () => {
    const ok = setStoredApiKey("");
    if (!ok) {
      setStatus("這個瀏覽器目前無法清除本機設定。");
      return;
    }
    setDraftKey("");
    setSavedMask("未設定");
    setStatus("API Key 已清除。");
    inputRef.current?.focus();
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal settings-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>設定</h3>
        </div>
        <div className="modal-body">
          <div className="settings-summary">
            <div>
              <div className="settings-label">目前狀態</div>
              <div className="settings-value mono">{savedMask}</div>
            </div>
            <span className={`settings-chip ${savedMask === "未設定" ? "is-empty" : "is-ready"}`}>
              {savedMask === "未設定" ? "未設定" : "已設定"}
            </span>
          </div>

          <div className="field-input" style={{ marginTop: 16 }}>
            <label>
              OpenRouter API Key
              <span className="key mono">localStorage</span>
            </label>
            <input
              ref={inputRef}
              type="password"
              autoComplete="off"
              spellCheck="false"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="貼上你的 API Key"
              className="mono settings-secret"
            />
            <div className="hint">
              只會儲存在你目前這台裝置的瀏覽器，不會自動寫進 repo，也不會跟著 commit。
            </div>
          </div>

          <div className="callout settings-note">
            <span className="ic"><Icon name="alert" size={14} /></span>
            <div>
              不要把真實 API Key 直接寫進前端原始碼。任何被 commit 的 key 都應視為外洩並立即撤換。
            </div>
          </div>

          {status && <div className="settings-status">{status}</div>}
        </div>
        <div className="modal-foot settings-actions">
          <button className="btn btn-danger" onClick={handleClear} disabled={!hasValue && savedMask === "未設定"}>
            清除
          </button>
          <button className="btn" onClick={onClose}>關閉</button>
          <button className="btn btn-primary" onClick={handleSave}>
            <Icon name="check" size={14} />
            儲存設定
          </button>
        </div>
      </div>
    </div>
  );
}

function TopBar({ route, setRoute }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div>
      <div className="gov-strip" />
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"></div>
          <div className="brand-name">Rent Unfiltered</div>
          <div className="brand-tag mono">v0.1 · MVP</div>
        </div>
        <nav className="topnav">
          <a className={route.name === "home" ? "active" : ""} onClick={() => setRoute({ name: "home" })}>首頁</a>
          <a className={route.name === "project-guide" ? "active" : ""} onClick={() => setRoute({ name: "project-guide" })}>專案導引</a>
          <a className={route.name === "glossary" || route.name === "rhir-spec" ? "active" : ""} onClick={() => setRoute({ name: "glossary", tab: "rhir" })}>名詞解釋</a>
        </nav>
        <div className="topbar-right">
          <div className="search">
            <Icon name="search" size={14} />
            <input placeholder="搜尋頁面或紀錄" />
            <span className="kbd mono">/</span>
          </div>
          <button className="btn btn-ghost" title="設定" onClick={() => setShowSettings(true)}>
            <Icon name="sliders" size={16} />
          </button>
          <button className="btn btn-ghost" title="通知">
            <Icon name="bell" size={16} />
          </button>
          <div className="avatar">CY</div>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function Crumbs({ items, setRoute }) {
  return (
    <div className="crumbs">
      {items.map((it, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {it.to ? (
            <a onClick={() => setRoute(it.to)}>{it.label}</a>
          ) : (
            <span className="current">{it.label}</span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

function GovFoot() {
  return (
    <footer className="gov-foot">
      <div>RENT UNFILTERED · 租屋資訊透明化 MVP</div>
      <div>SCHEMA <span className="mono">rhir-v0.1.schema.json</span> · BUILD <span className="mono">2026-05-12</span></div>
    </footer>
  );
}

// JSON syntax highlighter - small, status-aware
function highlightJSON(obj) {
  const json = JSON.stringify(obj, null, 2);
  const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escape(json)
    .replace(/&quot;(disclosureStatus)&quot;: &quot;(\w+)&quot;/g, (m, k, v) =>
      `<span class="tk-key">"${k}"</span>: <span class="tk-status-${v}">"${v}"</span>`)
    .replace(/&quot;(\w+)&quot;(\s*):/g, '<span class="tk-key">"$1"</span>$2:')
    .replace(/: &quot;([^&]*)&quot;/g, ': <span class="tk-str">"$1"</span>')
    .replace(/: (true|false)/g, ': <span class="tk-bool">$1</span>')
    .replace(/: null/g, ': <span class="tk-null">null</span>')
    .replace(/: (-?\d+\.?\d*)(,|\n)/g, ': <span class="tk-num">$1</span>$2');
}

window.RU = Object.assign(window.RU || {}, {
  Icon,
  Badge,
  RiskPill,
  TopBar,
  Crumbs,
  GovFoot,
  getStoredApiKey,
  setStoredApiKey,
  getRhirRecordId,
  downloadJSON,
  copyJSON,
  createFollowupQuestions,
  getFollowupQuestionsFromRhir,
  highlightJSON,
});
