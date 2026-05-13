// Shared chrome + small components

const { useState, useMemo, useRef, useEffect, Fragment } = React;

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

function TopBar({ route, setRoute }) {
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
          <button className="btn btn-ghost" title="通知">
            <Icon name="bell" size={16} />
          </button>
          <div className="avatar">CY</div>
        </div>
      </header>
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
  highlightJSON,
});
