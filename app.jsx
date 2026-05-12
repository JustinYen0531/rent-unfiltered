// Root app — routing between home, form, detail

const { useState: useStateA, useEffect: useEffectA } = React;

const ACCENT_PALETTES = {
  civic: { accent: "#1652f0", accentInk: "#0a3bc4", accentSoft: "#e8efff", label: "Civic Blue" },
  teal:  { accent: "#0d8a8a", accentInk: "#0a6d6d", accentSoft: "#dff2f2", label: "Open Teal" },
  indigo:{ accent: "#3b3f9f", accentInk: "#2a2d7a", accentSoft: "#e8e9f5", label: "Civic Indigo" },
  slate: { accent: "#334155", accentInk: "#1f2937", accentSoft: "#e7ebf1", label: "Slate" },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "civic",
  "density": "comfortable",
  "showSchemaKeys": true
}/*EDITMODE-END*/;

function App() {
  const { TopBar, GovFoot } = window.RU;
  const [route, setRoute] = useStateA({ name: "home" });
  const [t, setTweak] = (typeof useTweaks !== "undefined")
    ? useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  // apply tweaks → CSS vars
  useEffectA(() => {
    const p = ACCENT_PALETTES[t.accent] || ACCENT_PALETTES.civic;
    document.documentElement.style.setProperty("--accent", p.accent);
    document.documentElement.style.setProperty("--accent-ink", p.accentInk);
    document.documentElement.style.setProperty("--accent-soft", p.accentSoft);
    document.documentElement.setAttribute("data-density", t.density || "comfortable");
  }, [t.accent, t.density]);

  return (
    <div className="shell">
      <TopBar route={route} setRoute={setRoute}/>
      <div className="main">
        {route.name === "home" && <window.HomePage setRoute={setRoute}/>}
        {route.name === "form" && <window.FormPage setRoute={setRoute} mode={route.mode}/>}
        {route.name === "detail" && <window.DetailPage setRoute={setRoute} recordId={route.id}/>}
      </div>
      <GovFoot/>

      {typeof TweaksPanel !== "undefined" && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Accent color"/>
          <TweakColor
            label="Accent"
            value={ACCENT_PALETTES[t.accent]?.accent}
            options={Object.values(ACCENT_PALETTES).map(v => v.accent)}
            onChange={(hex) => {
              const key = Object.entries(ACCENT_PALETTES).find(([, v]) => v.accent === hex)?.[0] || "civic";
              setTweak("accent", key);
            }}
          />
          <TweakSection label="Density"/>
          <TweakRadio
            label="Row density"
            value={t.density}
            options={["comfortable", "compact"]}
            onChange={(v) => setTweak("density", v)}
          />
          <TweakSection label="Schema keys"/>
          <TweakToggle
            label="Show RHIR keys"
            value={t.showSchemaKeys}
            onChange={(v) => setTweak("showSchemaKeys", v)}
          />
        </TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
