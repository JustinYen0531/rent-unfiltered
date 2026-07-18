(function initDocuments(global) {
  "use strict";

  const MAX_FILE_SIZE = 20 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = Object.freeze([
    "application/pdf",
    "image/jpeg",
    "image/png"
  ]);
  const REVIEW_STATUSES = Object.freeze([
    "pending",
    "accepted",
    "edited",
    "rejected"
  ]);
  const PAID_OCR_ENGINE = "mistral-ocr";
  const FREE_PDF_ENGINE = "cloudflare-ai";
  const DEFAULT_PROXY_URL = "/api/openrouter";
  const DEFAULT_MODEL = "google/gemini-2.5-flash";
  const MIN_USEFUL_TEXT_LENGTH = 120;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function normalizeMimeType(value) {
    return String(value || "").trim().toLowerCase();
  }

  function validateDocument(file) {
    const mimeType = normalizeMimeType(file?.type || file?.mimeType);
    const size = Number(file?.size);
    const errors = [];

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      errors.push(`不支援的檔案格式：${mimeType || "未知"}。僅接受 PDF、JPG、PNG。`);
    }
    if (!Number.isFinite(size) || size < 0) {
      errors.push("無法確認檔案大小。");
    } else if (size > MAX_FILE_SIZE) {
      errors.push("檔案超過 20 MB 上限。");
    }

    return {
      valid: errors.length === 0,
      errors,
      mimeType,
      size
    };
  }

  async function toArrayBuffer(input) {
    if (input instanceof ArrayBuffer) return input;
    if (ArrayBuffer.isView(input)) {
      return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
    }
    if (input && typeof input.arrayBuffer === "function") {
      return input.arrayBuffer();
    }
    if (typeof input === "string") {
      return new TextEncoder().encode(input).buffer;
    }
    throw new Error("無法將輸入轉換為 SHA-256 所需的二進位資料。");
  }

  async function sha256(input) {
    assert(global.crypto?.subtle, "此環境不支援 Web Crypto SHA-256。");
    const digest = await global.crypto.subtle.digest("SHA-256", await toArrayBuffer(input));
    return Array.from(new Uint8Array(digest))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function getFileName(file) {
    return String(file?.name || file?.filename || "rental-document").slice(0, 255);
  }

  async function fileToDataUrl(file, mimeType) {
    if (typeof file?.dataUrl === "string") return file.dataUrl;
    if (typeof file?.url === "string") return file.url;
    const buffer = await toArrayBuffer(file);
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    assert(typeof global.btoa === "function", "此環境無法建立檔案 Data URL。");
    return `data:${mimeType};base64,${global.btoa(binary)}`;
  }

  function extractionPrompt() {
    return [
      "你是租屋契約欄位擷取器。請保留原意，不做法律判定。",
      "只輸出 JSON，格式為：",
      '{"extractedText":"可讀全文或重要原文","candidates":[{"rhirField":"欄位路徑","value":"擷取值","sourceText":"逐字段落","sourceLocator":"頁碼或段落","confidence":0.0}]}',
      "無法確認的欄位不要猜測；confidence 必須介於 0 與 1。"
    ].join("\n");
  }

  async function buildMessages(file, validation) {
    const fileData = await fileToDataUrl(file, validation.mimeType);
    const content = [{ type: "text", text: extractionPrompt() }];

    if (validation.mimeType === "application/pdf") {
      content.push({
        type: "file",
        file: {
          filename: getFileName(file),
          file_data: fileData
        }
      });
    } else {
      content.push({
        type: "image_url",
        image_url: { url: fileData }
      });
    }

    return [{ role: "user", content }];
  }

  function parseJsonContent(content) {
    if (content && typeof content === "object" && !Array.isArray(content)) return content;
    let text = "";
    if (typeof content === "string") {
      text = content;
    } else if (Array.isArray(content)) {
      text = content
        .filter(part => part?.type === "text" && typeof part.text === "string")
        .map(part => part.text)
        .join("\n");
    }
    const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    if (!trimmed) return {};
    return JSON.parse(trimmed);
  }

  function clampConfidence(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return Math.min(1, Math.max(0, number));
  }

  function normalizeCandidate(candidate, index = 0) {
    const rhirField = String(candidate?.rhirField || candidate?.field || "").trim();
    assert(rhirField, `第 ${index + 1} 筆候選缺少 rhirField。`);
    assert(
      /^[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)+$/.test(rhirField) &&
        !rhirField.split(".").some(key => ["__proto__", "prototype", "constructor"].includes(key)),
      `第 ${index + 1} 筆候選的 rhirField 不安全或格式錯誤。`
    );
    const requestedStatus = String(candidate?.reviewStatus || "pending").toLowerCase();
    const reviewStatus = REVIEW_STATUSES.includes(requestedStatus) ? requestedStatus : "pending";

    return {
      id: String(candidate?.id || `candidate-${index + 1}`),
      rhirField,
      value: candidate?.value ?? null,
      originalValue: candidate?.originalValue ?? candidate?.value ?? null,
      sourceText: String(candidate?.sourceText || "").trim(),
      sourceLocator: String(candidate?.sourceLocator || "").trim(),
      confidence: clampConfidence(candidate?.confidence),
      reviewStatus,
      reviewNote: String(candidate?.reviewNote || "").trim()
    };
  }

  function normalizeCandidates(candidates) {
    if (!Array.isArray(candidates)) return [];
    const normalized = [];
    candidates.forEach((candidate, index) => {
      try {
        normalized.push(normalizeCandidate(candidate, index));
      } catch (_) {
        // A malformed AI candidate is discarded instead of entering RHIR.
      }
    });
    return normalized;
  }

  function reviewCandidate(candidate, reviewStatus, edits = {}) {
    assert(REVIEW_STATUSES.includes(reviewStatus), `未知審核狀態：${reviewStatus}`);
    if (reviewStatus === "edited") {
      assert(Object.prototype.hasOwnProperty.call(edits, "value"), "edited 候選必須提供修改後 value。");
    }
    return normalizeCandidate({
      ...candidate,
      ...edits,
      id: candidate?.id,
      originalValue: candidate?.originalValue ?? candidate?.value ?? null,
      reviewStatus
    });
  }

  function toAcceptedRhirDelta(candidates) {
    return normalizeCandidates(candidates)
      .filter(candidate => candidate.reviewStatus === "accepted" || candidate.reviewStatus === "edited")
      .reduce((delta, candidate) => {
        delta[candidate.rhirField] = {
          value: candidate.value,
          sourceType: "contract_extraction",
          sourceText: candidate.sourceText,
          sourceLocator: candidate.sourceLocator,
          confidence: candidate.confidence,
          reviewStatus: candidate.reviewStatus
        };
        return delta;
      }, {});
  }

  function sanitizeAnnotations(annotations) {
    if (!Array.isArray(annotations)) return [];
    return annotations.map(annotation => {
      const file = annotation?.file || {};
      const textParts = Array.isArray(file.content)
        ? file.content
            .filter(part => part?.type === "text" && typeof part.text === "string")
            .map(part => ({ type: "text", text: part.text }))
        : [];
      return {
        type: "file",
        file: {
          hash: String(file.hash || ""),
          content: textParts
        }
      };
    }).filter(annotation => annotation.file.hash || annotation.file.content.length);
  }

  function extractAnnotations(payload) {
    return sanitizeAnnotations(
      payload?.choices?.[0]?.message?.annotations ||
      payload?.error?.metadata?.file_annotations ||
      []
    );
  }

  function textFromAnnotations(annotations) {
    return annotations
      .flatMap(annotation => annotation.file?.content || [])
      .filter(part => part.type === "text")
      .map(part => part.text)
      .join("\n")
      .trim();
  }

  function isFreeExtractionInsufficient(result) {
    const text = String(result?.extractedText || "").trim();
    return Boolean(result?.requiresPaidOcr) ||
      text.length < MIN_USEFUL_TEXT_LENGTH ||
      (result?.candidates || []).every(candidate => !candidate.sourceText);
  }

  async function callParser({
    file,
    validation,
    engine,
    explicitPaidConsent,
    model,
    proxyUrl,
    fetchImpl
  }) {
    if (engine === PAID_OCR_ENGINE && explicitPaidConsent !== true) {
      return {
        status: "paid_ocr_consent_required",
        engine,
        message: "Mistral OCR 是付費服務，必須先取得明確同意。"
      };
    }

    const requestBody = {
      model,
      messages: await buildMessages(file, validation),
      temperature: 0,
      response_format: { type: "json_object" },
      explicitPaidConsent: explicitPaidConsent === true
    };
    if (validation.mimeType === "application/pdf") {
      requestBody.plugins = [{
        id: "file-parser",
        pdf: { engine }
      }];
    }

    const response = await fetchImpl(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });
    const payload = await response.json();
    const annotations = extractAnnotations(payload);
    if (!response.ok) {
      return {
        status: "error",
        engine,
        message: payload?.error?.message || payload?.error || `文件解析失敗（HTTP ${response.status}）。`,
        annotations
      };
    }

    let parsed;
    try {
      parsed = parseJsonContent(payload?.choices?.[0]?.message?.content);
    } catch (error) {
      parsed = { extractedText: textFromAnnotations(annotations), candidates: [] };
    }
    return {
      status: "ok",
      engine,
      extractedText: String(parsed?.extractedText || textFromAnnotations(annotations) || "").trim(),
      candidates: normalizeCandidates(parsed?.candidates),
      annotations
    };
  }

  async function extractDocument(options) {
    const file = options?.file;
    const validation = validateDocument(file);
    if (!validation.valid) {
      return { status: "invalid_document", validation };
    }

    const fetchImpl = options?.fetchImpl || global.fetch;
    assert(typeof fetchImpl === "function", "缺少 fetch 實作。");
    const documentHash = await sha256(file);
    const common = {
      file,
      validation,
      model: options?.model || DEFAULT_MODEL,
      proxyUrl: options?.proxyUrl || DEFAULT_PROXY_URL,
      fetchImpl
    };

    if (validation.mimeType !== "application/pdf") {
      const imageResult = await callParser({
        ...common,
        engine: null,
        explicitPaidConsent: false
      });
      return { ...imageResult, documentHash, validation };
    }

    const freeResult = await callParser({
      ...common,
      engine: FREE_PDF_ENGINE,
      explicitPaidConsent: false
    });
    const needsPaidOcr = freeResult.status !== "ok" || isFreeExtractionInsufficient(freeResult);
    if (!needsPaidOcr) {
      return { ...freeResult, documentHash, validation };
    }
    if (options?.explicitPaidConsent !== true) {
      return {
        status: "paid_ocr_required",
        engine: FREE_PDF_ENGINE,
        documentHash,
        validation,
        message: "免費 PDF 解析結果不足。若要使用付費 Mistral OCR，請先取得使用者明確同意。",
        freeResult
      };
    }

    const paidResult = await callParser({
      ...common,
      engine: PAID_OCR_ENGINE,
      explicitPaidConsent: true
    });
    return {
      ...paidResult,
      documentHash,
      validation,
      freeResult
    };
  }

  global.RU_DOCUMENTS = Object.freeze({
    MAX_FILE_SIZE,
    ALLOWED_MIME_TYPES,
    REVIEW_STATUSES,
    FREE_PDF_ENGINE,
    PAID_OCR_ENGINE,
    validateDocument,
    sha256,
    buildMessages,
    normalizeCandidate,
    normalizeCandidates,
    reviewCandidate,
    toAcceptedRhirDelta,
    sanitizeAnnotations,
    isFreeExtractionInsufficient,
    extractDocument
  });
})(window);
