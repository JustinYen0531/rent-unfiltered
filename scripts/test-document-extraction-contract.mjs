import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const source = fs.readFileSync(path.join(rootDir, "documents.jsx"), "utf8");
const require = createRequire(import.meta.url);

function btoa(value) {
  return Buffer.from(value, "binary").toString("base64");
}

const context = {
  window: {
    crypto: crypto.webcrypto,
    btoa,
    fetch: async () => {
      throw new Error("unexpected network call");
    }
  },
  ArrayBuffer,
  Uint8Array,
  TextEncoder,
  console
};
vm.runInNewContext(source, context);
const documents = context.window.RU_DOCUMENTS;

assert.ok(documents);
assert.equal(documents.MAX_FILE_SIZE, 20 * 1024 * 1024);
assert.equal(documents.validateDocument({
  type: "application/pdf",
  size: 1024
}).valid, true);
assert.equal(documents.validateDocument({
  type: "text/plain",
  size: 1024
}).valid, false);
assert.equal(documents.validateDocument({
  type: "image/png",
  size: documents.MAX_FILE_SIZE + 1
}).valid, false);

const pdfBytes = new TextEncoder().encode("contract-test-pdf");
const pdfFile = {
  name: "contract.pdf",
  type: "application/pdf",
  size: pdfBytes.byteLength,
  arrayBuffer: async () => pdfBytes.buffer
};
assert.equal(
  await documents.sha256(pdfFile),
  crypto.createHash("sha256").update(pdfBytes).digest("hex")
);

const freeCalls = [];
const freeSuccess = await documents.extractDocument({
  file: pdfFile,
  fetchImpl: async (_url, options) => {
    const body = JSON.parse(options.body);
    freeCalls.push(body);
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          choices: [{
            message: {
              content: JSON.stringify({
                extractedText: "甲方出租房屋予乙方使用。".repeat(20),
                candidates: [{
                  rhirField: "lease.term",
                  value: "一年",
                  sourceText: "租賃期間為一年",
                  sourceLocator: "第 2 頁第 3 條",
                  confidence: 0.92
                }]
              }),
              annotations: [{
                type: "file",
                file: {
                  hash: "pdf-hash",
                  name: "contract.pdf",
                  content: [
                    { type: "text", text: "租賃期間為一年" },
                    { type: "image", image_url: "data:image/png;base64,SECRET" }
                  ]
                }
              }]
            }
          }]
        };
      }
    };
  }
});
assert.equal(freeSuccess.status, "ok");
assert.equal(freeSuccess.engine, "cloudflare-ai");
assert.equal(freeCalls.length, 1);
assert.equal(freeCalls[0].plugins[0].pdf.engine, "cloudflare-ai");
assert.equal(freeCalls[0].explicitPaidConsent, false);
assert.equal(freeSuccess.annotations[0].file.hash, "pdf-hash");
assert.equal(freeSuccess.annotations[0].file.content.length, 1);
assert.equal(JSON.stringify(freeSuccess.annotations).includes("base64"), false);

const paidRequired = await documents.extractDocument({
  file: pdfFile,
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    async json() {
      return {
        choices: [{
          message: {
            content: JSON.stringify({ extractedText: "太短", candidates: [] })
          }
        }]
      };
    }
  })
});
assert.equal(paidRequired.status, "paid_ocr_required");
assert.equal(paidRequired.freeResult.engine, "cloudflare-ai");

const paidCalls = [];
const paidSuccess = await documents.extractDocument({
  file: pdfFile,
  explicitPaidConsent: true,
  fetchImpl: async (_url, options) => {
    const body = JSON.parse(options.body);
    paidCalls.push(body);
    const paid = body.plugins[0].pdf.engine === "mistral-ocr";
    return {
      ok: true,
      status: 200,
      async json() {
        return {
          choices: [{
            message: {
              content: JSON.stringify(paid
                ? {
                    extractedText: "經 OCR 辨識後的完整租屋契約內容。".repeat(15),
                    candidates: [{
                      rhirField: "cost.deposit",
                      value: "兩個月",
                      sourceText: "押金為兩個月租金",
                      sourceLocator: "第 1 頁",
                      confidence: 0.8
                    }]
                  }
                : { extractedText: "", candidates: [] })
            }
          }]
        };
      }
    };
  }
});
assert.equal(paidCalls.length, 2);
assert.equal(paidCalls[0].plugins[0].pdf.engine, "cloudflare-ai");
assert.equal(paidCalls[1].plugins[0].pdf.engine, "mistral-ocr");
assert.equal(paidCalls[1].explicitPaidConsent, true);
assert.equal(paidSuccess.engine, "mistral-ocr");

const pending = documents.normalizeCandidate({
  rhirField: "cost.deposit",
  value: "兩個月",
  sourceText: "押金為兩個月租金",
  confidence: 3
});
assert.equal(pending.reviewStatus, "pending");
assert.equal(pending.confidence, 1);
assert.equal(documents.normalizeCandidates([{
  rhirField: "__proto__.polluted",
  value: "yes"
}]).length, 0);
const accepted = documents.reviewCandidate(pending, "accepted");
const edited = documents.reviewCandidate(pending, "edited", {
  value: "一個月",
  reviewNote: "人工依原文修正"
});
const rejected = documents.reviewCandidate(pending, "rejected");
const delta = documents.toAcceptedRhirDelta([accepted, edited, rejected, pending]);
assert.equal(delta["cost.deposit"].value, "一個月");
assert.equal(delta["cost.deposit"].reviewStatus, "edited");
assert.equal(Object.keys(delta).length, 1);

const apiPath = path.join(rootDir, "api", "openrouter.js");
const apiSource = fs.readFileSync(apiPath, "utf8");
assert.match(apiSource, /ALLOWED_FILE_PARSER_ENGINES/);
assert.match(apiSource, /explicitPaidConsent !== true/);
assert.match(apiSource, /messages: sanitizeMessages\(body\.messages\)/);
assert.match(apiSource, /allowedBody\.plugins = \[\{/);

async function callProxy(body) {
  const originalFetch = global.fetch;
  const originalKey = process.env.OPENROUTER_API_KEY;
  let upstreamBody = null;
  global.fetch = async (_url, options) => {
    upstreamBody = JSON.parse(options.body);
    return {
      status: 200,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify({ ok: true })
    };
  };
  process.env.OPENROUTER_API_KEY = "test-key";
  delete require.cache[require.resolve(apiPath)];
  const handler = require(apiPath);
  const response = {
    statusCode: 0,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.body = value; }
  };
  try {
    await handler({
      method: "POST",
      body,
      headers: { origin: "https://test.local" }
    }, response);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
  }
  return { response, upstreamBody };
}

const baseMessages = [{
  role: "user",
  content: [{
    type: "file",
    file: {
      filename: "contract.pdf",
      file_data: "data:application/pdf;base64,AAAA",
      ignored_secret: "must-not-forward"
    }
  }],
  ignored_secret: "must-not-forward"
}];
const rejectedPlugin = await callProxy({
  model: "test-model",
  messages: baseMessages,
  plugins: [{ id: "web" }]
});
assert.equal(rejectedPlugin.response.statusCode, 400);
assert.equal(rejectedPlugin.upstreamBody, null);

const rejectedPaidWithoutConsent = await callProxy({
  model: "test-model",
  messages: baseMessages,
  plugins: [{ id: "file-parser", pdf: { engine: "mistral-ocr" } }]
});
assert.equal(rejectedPaidWithoutConsent.response.statusCode, 400);
assert.equal(rejectedPaidWithoutConsent.upstreamBody, null);

const forwardedFreeParser = await callProxy({
  model: "test-model",
  messages: baseMessages,
  plugins: [{ id: "file-parser", pdf: { engine: "cloudflare-ai" } }]
});
assert.equal(forwardedFreeParser.response.statusCode, 200);
assert.equal(forwardedFreeParser.upstreamBody.plugins[0].pdf.engine, "cloudflare-ai");
assert.equal("explicitPaidConsent" in forwardedFreeParser.upstreamBody, false);
assert.equal("ignored_secret" in forwardedFreeParser.upstreamBody.messages[0], false);
assert.equal(
  "ignored_secret" in forwardedFreeParser.upstreamBody.messages[0].content[0].file,
  false
);

const forwardedPaidParser = await callProxy({
  model: "test-model",
  messages: baseMessages,
  explicitPaidConsent: true,
  plugins: [{ id: "file-parser", pdf: { engine: "mistral-ocr" } }]
});
assert.equal(forwardedPaidParser.response.statusCode, 200);
assert.equal(forwardedPaidParser.upstreamBody.plugins[0].pdf.engine, "mistral-ocr");
assert.equal("explicitPaidConsent" in forwardedPaidParser.upstreamBody, false);

const documentUiSource = fs.readFileSync(path.join(rootDir, "document-ui.jsx"), "utf8");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
assert.match(documentUiSource, /uploadSourceDocument/);
assert.match(documentUiSource, /createSourceDocumentSignedUrl/);
assert.match(documentUiSource, /explicitPaidConsent/);
assert.match(documentUiSource, /toAcceptedRhirDelta/);
assert.match(documentUiSource, /addLifecycleEvent\(recordId/);
assert.ok(indexSource.indexOf('src="documents.jsx"') < indexSource.indexOf('src="document-ui.jsx"'));

console.log("契約原文與 AI 擷取模組契約驗證通過");
console.log("- MIME 與 20 MB：已驗證");
console.log("- SHA-256：已驗證");
console.log("- PDF cloudflare-ai 優先：已驗證");
console.log("- mistral-ocr 明確付費同意：模組與 proxy 雙層驗證");
console.log("- 候選 pending/accepted/edited/rejected：已驗證");
console.log("- RHIR delta：僅 accepted/edited");
console.log("- annotations：僅文字與 hash，未保留 base64 images");
console.log("- proxy plugin 白名單與 multimodal 轉送：已驗證");
