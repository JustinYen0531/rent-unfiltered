// Stage-aware XYZ progress wizard.

const { useMemo: useMemoP, useState: useStateP } = React;

function ProgressField({ spec, value, onChange }) {
  const common = {
    value: value ?? "",
    onChange: event => onChange(event.target.value),
  };
  if (spec.type === "textarea") {
    return <textarea {...common} rows="3" placeholder={`填寫${spec.label}`} />;
  }
  if (spec.type === "select") {
    return (
      <select {...common}>
        <option value="">尚未填寫</option>
        {(spec.options || []).map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }
  return <input {...common} type={spec.type || "text"} placeholder={`填寫${spec.label}`} />;
}

function ProgressWizard({ recordId, currentSnapshot, existingEvents, initialStage = "Y1", onClose, onSaved }) {
  const lifecycle = window.RU_LIFECYCLE;
  const { Icon } = window.RU;
  const selectableStages = Object.values(lifecycle.STAGES).filter(stage => stage.code !== "X");
  const [stage, setStage] = useStateP(initialStage);
  const [sourceType, setSourceType] = useStateP(
    initialStage === "Y2" ? "on_site_observation" : initialStage === "Y4" ? "contract" : "user_input"
  );
  const [values, setValues] = useStateP({});
  const [occurredAt, setOccurredAt] = useStateP(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [error, setError] = useStateP("");

  const specs = lifecycle.FIELD_SPECS[stage] || [];
  const missingPrerequisites = useMemoP(
    () => lifecycle.getMissingPrerequisites(stage, currentSnapshot),
    [stage, currentSnapshot]
  );

  function changeStage(nextStage) {
    setStage(nextStage);
    setValues({});
    setError("");
    setSourceType(nextStage === "Y2"
      ? "on_site_observation"
      : nextStage === "Y4"
        ? "contract"
        : nextStage.startsWith("Z")
          ? "user_input"
          : "landlord_statement"
    );
  }

  function save() {
    const filled = specs.filter(spec => values[spec.key] != null && values[spec.key] !== "");
    if (filled.length === 0) {
      setError("至少填寫一個本次進度欄位。");
      return;
    }
    const missingRequired = specs.filter(spec => spec.required && !values[spec.key]);
    if (missingRequired.length > 0) {
      setError(`請先填寫：${missingRequired.map(spec => spec.label).join("、")}`);
      return;
    }
    const event = window.RU_DATA.addLifecycleEvent(recordId, {
      stage,
      values: {
        ...values,
        eventType: `${stage.toLowerCase()}_progress`,
      },
      sourceType,
      occurredAt: occurredAt ? new Date(occurredAt).toISOString() : new Date().toISOString(),
      title: lifecycle.STAGES[stage].label,
    });
    if (!event) {
      setError("新增進度失敗，請確認案件仍存在。");
      return;
    }
    onSaved?.(event);
  }

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal progress-modal" onClick={event => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>新增進度</h3>
            <div className="progress-modal-subtitle">選擇目前情境，只填這次新增或確認的資訊。</div>
          </div>
          <button className="btn btn-sm" onClick={onClose}><Icon name="x" size={13} /></button>
        </div>
        <div className="modal-body progress-modal-body">
          <section>
            <div className="progress-step-label">1 · 所在階段</div>
            <div className="stage-picker">
              {selectableStages.map(item => (
                <button
                  key={item.code}
                  type="button"
                  className={`stage-card ${stage === item.code ? "active" : ""}`}
                  onClick={() => changeStage(item.code)}
                >
                  <span className="mono">{item.code}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          {missingPrerequisites.length > 0 && (
            <div className="progress-warning">
              <Icon name="info" size={14} />
              <div>
                <strong>可以直接補登，但前面仍缺：</strong>
                {missingPrerequisites.map(item => item.label).join("、")}
              </div>
            </div>
          )}

          <section>
            <div className="progress-step-label">2 · 來源與時間</div>
            <div className="progress-grid two">
              <label>
                <span>資料來源</span>
                <select value={sourceType} onChange={event => setSourceType(event.target.value)}>
                  {lifecycle.SOURCE_TYPES.map(source => (
                    <option key={source.value} value={source.value}>{source.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>發生時間</span>
                <input type="datetime-local" value={occurredAt} onChange={event => setOccurredAt(event.target.value)} />
              </label>
            </div>
          </section>

          <section>
            <div className="progress-step-label">3 · {lifecycle.STAGES[stage].label}</div>
            <div className="progress-grid">
              {specs.map(spec => (
                <label key={spec.key} className={spec.type === "textarea" ? "wide" : ""}>
                  <span>{spec.label}{spec.required ? " *" : ""}</span>
                  <ProgressField
                    spec={spec}
                    value={values[spec.key]}
                    onChange={value => setValues(current => ({ ...current, [spec.key]: value }))}
                  />
                  <small className="mono">{spec.key}</small>
                </label>
              ))}
            </div>
          </section>

          {error && <div className="progress-error">{error}</div>}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={save}>
            <Icon name="check" size={14} /> 保存不可變事件
          </button>
        </div>
      </div>
    </div>
  );
}

window.ProgressWizard = ProgressWizard;
