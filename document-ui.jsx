// Contract originals, AI extraction and human candidate review.

function formatDocumentBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function ContractDocumentsView({ recordId, activeVersion, onLifecycleSaved }) {
  const { Icon } = window.RU;
  const documentsApi = window.RU_DOCUMENTS;
  const [documents, setDocuments] = React.useState([]);
  const [file, setFile] = React.useState(null);
  const [sourceDocument, setSourceDocument] = React.useState(null);
  const [extraction, setExtraction] = React.useState(null);
  const [candidates, setCandidates] = React.useState([]);
  const [state, setState] = React.useState("loading");
  const [message, setMessage] = React.useState("");

  async function reloadDocuments() {
    if (!window.RU_SUPABASE?.isConfigured()) {
      setState("unconfigured");
      return;
    }
    try {
      setDocuments(await window.RU_SUPABASE.getSourceDocuments(recordId));
      setState("idle");
    } catch (error) {
      setState("error");
      setMessage(`文件列表讀取失敗：${error.message}`);
    }
  }

  React.useEffect(() => {
    reloadDocuments();
  }, [recordId]);

  function selectFile(selected) {
    setFile(selected || null);
    setSourceDocument(null);
    setExtraction(null);
    setCandidates([]);
    setMessage("");
    if (!selected) return;
    const validation = documentsApi.validateDocument(selected);
    if (!validation.valid) {
      setState("error");
      setMessage(validation.errors.join(" "));
    } else {
      setState("ready");
    }
  }

  async function parseUploadedFile(explicitPaidConsent = false) {
    if (!file) return;
    setState(explicitPaidConsent ? "paid-parsing" : "uploading");
    setMessage(explicitPaidConsent ? "正在使用付費 OCR 重新解析…" : "正在保存原檔並進行免費解析…");
    try {
      let savedDocument = sourceDocument;
      if (!savedDocument) {
        const checksum = await documentsApi.sha256(file);
        savedDocument = await window.RU_SUPABASE.uploadSourceDocument({
          recordId,
          eventId: activeVersion?.eventId || activeVersion?.id || null,
          file,
          checksum,
        });
        setSourceDocument(savedDocument);
      }
      await window.RU_SUPABASE.updateSourceDocument(savedDocument.id, { processingStatus: "parsing" });
      const signedUrl = await window.RU_SUPABASE.createSourceDocumentSignedUrl(savedDocument.storage_path, 300);
      const parseFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: signedUrl,
        arrayBuffer: () => file.arrayBuffer(),
      };
      const result = await documentsApi.extractDocument({
        file: parseFile,
        explicitPaidConsent,
      });

      if (result.status === "paid_ocr_required") {
        const freeResult = result.freeResult || {};
        const savedExtraction = await window.RU_SUPABASE.saveDocumentExtraction({
          documentId: savedDocument.id,
          engine: freeResult.engine || documentsApi.FREE_PDF_ENGINE,
          parserHash: result.documentHash,
          extractedText: freeResult.extractedText || null,
          candidates: freeResult.candidates || [],
          fileAnnotations: freeResult.annotations || [],
          status: "needs_paid_ocr",
        });
        await window.RU_SUPABASE.updateSourceDocument(savedDocument.id, { processingStatus: "needs_paid_ocr" });
        setExtraction(savedExtraction);
        setCandidates(freeResult.candidates || []);
        setState("paid-required");
        setMessage("免費解析不足。原檔已保存；只有你確認後才會使用付費 Mistral OCR。");
        await reloadDocuments();
        return;
      }
      if (result.status !== "ok") {
        await window.RU_SUPABASE.updateSourceDocument(savedDocument.id, { processingStatus: "failed" });
        throw new Error(result.message || "契約解析失敗");
      }

      const normalized = documentsApi.normalizeCandidates(result.candidates);
      const savedExtraction = await window.RU_SUPABASE.saveDocumentExtraction({
        documentId: savedDocument.id,
        engine: result.engine || "image-native",
        parserHash: result.documentHash,
        extractedText: result.extractedText,
        candidates: normalized,
        fileAnnotations: result.annotations,
        status: "parsed",
        paidOcr: result.engine === documentsApi.PAID_OCR_ENGINE,
      });
      await window.RU_SUPABASE.updateSourceDocument(savedDocument.id, {
        processingStatus: "parsed",
        reviewStatus: "in_review",
      });
      setExtraction(savedExtraction);
      setCandidates(normalized);
      setState("review");
      setMessage(`已取得 ${normalized.length} 個欄位候選；確認後才會寫入 RHIR。`);
      await reloadDocuments();
    } catch (error) {
      setState("error");
      setMessage(error.message || String(error));
    }
  }

  function updateCandidate(candidateId, status, edits = {}) {
    setCandidates(current => current.map(candidate =>
      candidate.id === candidateId
        ? documentsApi.reviewCandidate(candidate, status, edits)
        : candidate
    ));
  }

  async function confirmCandidates() {
    const flatDelta = documentsApi.toAcceptedRhirDelta(candidates);
    if (Object.keys(flatDelta).length === 0) {
      setMessage("至少接受或修改一個候選欄位。");
      return;
    }
    setState("saving-review");
    try {
      const nestedDelta = {};
      for (const [path, field] of Object.entries(flatDelta)) {
        window.RU_LIFECYCLE.writePath(nestedDelta, path, {
          ...field,
          disclosureStatus: "disclosed",
          sourceDocumentId: sourceDocument.id,
          observedAt: new Date().toISOString(),
        });
      }
      const event = window.RU_DATA.addLifecycleEvent(recordId, {
        stage: "Y4",
        title: "契約欄位人工校對",
        values: {
          eventType: "contract_extraction_review",
          "contract.version": sourceDocument.original_filename,
        },
        sourceType: "contract",
        rhirDelta: nestedDelta,
        sourceReferences: [{
          sourceDocumentId: sourceDocument.id,
          filename: sourceDocument.original_filename,
          checksum: sourceDocument.checksum,
        }],
      });
      await window.RU_SUPABASE.updateDocumentExtraction(extraction.id, candidates, "reviewed");
      await window.RU_SUPABASE.updateSourceDocument(sourceDocument.id, {
        eventId: event.id,
        reviewStatus: "confirmed",
      });
      setState("confirmed");
      setMessage(`已建立 ${event.displayCode}；只寫入已接受或人工修改的欄位。`);
      await reloadDocuments();
      onLifecycleSaved?.(event);
    } catch (error) {
      setState("error");
      setMessage(`保存校對結果失敗：${error.message}`);
    }
  }

  async function openOriginal(document) {
    try {
      const url = await window.RU_SUPABASE.createSourceDocumentSignedUrl(document.storage_path, 300);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMessage(`原始文件讀取失敗：${error.message}`);
    }
  }

  return (
    <div className="document-workspace">
      <section className="document-upload-card">
        <div>
          <span className="mono document-kicker">ORIGINAL</span>
          <h3>保存契約原始文件</h3>
          <p>接受 PDF、JPG、PNG，單檔 20 MB。原檔與 AI 擷取結果分開保存。</p>
        </div>
        <label className="document-file-picker">
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={event => selectFile(event.target.files?.[0])}
          />
          <Icon name="upload" size={15} />
          {file ? `${file.name} · ${formatDocumentBytes(file.size)}` : "選擇契約檔案"}
        </label>
        {file && ["ready", "error"].includes(state) && (
          <button className="btn btn-primary" disabled={state === "error"} onClick={() => parseUploadedFile(false)}>
            <Icon name="sparkle" size={14} /> 保存原檔並免費擷取
          </button>
        )}
        {state === "paid-required" && (
          <button className="btn document-paid-button" onClick={() => parseUploadedFile(true)}>
            明確同意使用付費 OCR
          </button>
        )}
        {["uploading", "paid-parsing", "saving-review"].includes(state) && (
          <div className="document-progress">{message}</div>
        )}
        {message && !["uploading", "paid-parsing", "saving-review"].includes(state) && (
          <div className={`document-message ${state === "error" ? "is-error" : ""}`}>{message}</div>
        )}
      </section>

      {candidates.length > 0 && (
        <section className="document-review-card">
          <div className="document-review-head">
            <div>
              <span className="mono document-kicker">FIELD REVIEW</span>
              <h3>欄位校對</h3>
            </div>
            <button className="btn btn-primary" onClick={confirmCandidates} disabled={state === "saving-review"}>
              確認並建立 Y4 事件
            </button>
          </div>
          <div className="document-candidates">
            {candidates.map(candidate => (
              <article key={candidate.id} className={`document-candidate is-${candidate.reviewStatus}`}>
                <div className="document-candidate-head">
                  <code>{candidate.rhirField}</code>
                  <span>{candidate.confidence == null ? "信心未知" : `${Math.round(candidate.confidence * 100)}%`}</span>
                </div>
                <input
                  value={candidate.value ?? ""}
                  onChange={event => updateCandidate(candidate.id, "edited", {
                    value: event.target.value,
                    reviewNote: "人工修改",
                  })}
                />
                <blockquote>{candidate.sourceText || "沒有提供原文片段"}</blockquote>
                <div className="document-locator">{candidate.sourceLocator || "未標示頁碼／段落"}</div>
                <div className="document-review-actions">
                  <button className="btn btn-sm" onClick={() => updateCandidate(candidate.id, "accepted")}>接受</button>
                  <button className="btn btn-sm" onClick={() => updateCandidate(candidate.id, "rejected")}>拒絕</button>
                  <span className="mono">{candidate.reviewStatus}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="document-list-card">
        <div className="document-review-head">
          <div>
            <span className="mono document-kicker">ARCHIVE</span>
            <h3>已保存原始文件</h3>
          </div>
          <button className="btn btn-sm" onClick={reloadDocuments}>重新整理</button>
        </div>
        {documents.length === 0
          ? <div className="document-empty">目前尚未保存契約文件。</div>
          : documents.map(document => (
              <div className="document-row" key={document.id}>
                <div>
                  <strong>{document.original_filename}</strong>
                  <span>{formatDocumentBytes(document.size_bytes)} · v{document.version} · {document.processing_status}</span>
                </div>
                <div>
                  <span className={`badge badge-${document.review_status === "confirmed" ? "disclosed" : "outline"}`}>
                    {document.review_status}
                  </span>
                  <button className="btn btn-sm" onClick={() => openOriginal(document)}>原始文件</button>
                </div>
              </div>
            ))
        }
      </section>
    </div>
  );
}

window.ContractDocumentsView = ContractDocumentsView;
