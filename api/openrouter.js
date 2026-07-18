const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const ALLOWED_FILE_PARSER_ENGINES = new Set(["cloudflare-ai", "mistral-ocr"]);
const ALLOWED_CONTENT_TYPES = new Set(["text", "file", "image_url"]);
const ALLOWED_ROLES = new Set(["system", "user", "assistant"]);

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") return request.body;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "Missing model or messages.";
  }

  for (const message of messages) {
    if (!message || !ALLOWED_ROLES.has(message.role)) {
      return "Messages contain an unsupported role.";
    }
    if (typeof message.content === "string") continue;
    if (!Array.isArray(message.content)) {
      return "Message content must be text or a multimodal content array.";
    }
    for (const part of message.content) {
      if (!part || !ALLOWED_CONTENT_TYPES.has(part.type)) {
        return "Messages contain an unsupported multimodal content type.";
      }
      if (part.type === "text" && typeof part.text !== "string") {
        return "Text content is malformed.";
      }
      if (part.type === "file") {
        const data = part.file?.file_data;
        if (typeof part.file?.filename !== "string" || typeof data !== "string") {
          return "File content is malformed.";
        }
        if (!data.startsWith("data:application/pdf;base64,") && !/^https:\/\//i.test(data)) {
          return "Only PDF data URLs or HTTPS file URLs are allowed.";
        }
      }
      if (part.type === "image_url") {
        const url = part.image_url?.url;
        if (typeof url !== "string" ||
          (!/^data:image\/(?:jpeg|png);base64,/i.test(url) && !/^https:\/\//i.test(url))) {
          return "Only JPG/PNG data URLs or HTTPS image URLs are allowed.";
        }
      }
    }
  }
  return null;
}

function sanitizeMessages(messages) {
  return messages.map(message => {
    if (typeof message.content === "string") {
      return { role: message.role, content: message.content };
    }
    return {
      role: message.role,
      content: message.content.map(part => {
        if (part.type === "text") {
          return { type: "text", text: part.text };
        }
        if (part.type === "file") {
          return {
            type: "file",
            file: {
              filename: part.file.filename,
              file_data: part.file.file_data,
            },
          };
        }
        return {
          type: "image_url",
          image_url: { url: part.image_url.url },
        };
      }),
    };
  });
}

function validatePlugins(plugins, explicitPaidConsent) {
  if (plugins === undefined) return null;
  if (!Array.isArray(plugins) || plugins.length !== 1) {
    return "Only one file-parser plugin is allowed.";
  }
  const plugin = plugins[0];
  const engine = plugin?.pdf?.engine;
  if (plugin?.id !== "file-parser" || !ALLOWED_FILE_PARSER_ENGINES.has(engine)) {
    return "Only file-parser with cloudflare-ai or mistral-ocr is allowed.";
  }
  if (engine === "mistral-ocr" && explicitPaidConsent !== true) {
    return "mistral-ocr requires explicitPaidConsent=true.";
  }
  return null;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    sendJson(response, 500, {
      error: "OPENROUTER_API_KEY is not configured on Vercel.",
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    sendJson(response, 400, { error: `Invalid JSON body: ${error.message}` });
    return;
  }

  const messageError = validateMessages(body.messages);
  if (messageError) {
    sendJson(response, 400, { error: messageError });
    return;
  }
  const pluginError = validatePlugins(body.plugins, body.explicitPaidConsent);
  if (pluginError) {
    sendJson(response, 400, { error: pluginError });
    return;
  }

  const allowedBody = {
    model: body.model,
    messages: sanitizeMessages(body.messages),
    temperature: body.temperature,
    response_format: body.response_format,
  };
  if (body.plugins !== undefined) {
    allowedBody.plugins = [{
      id: "file-parser",
      pdf: { engine: body.plugins[0].pdf.engine },
    }];
  }

  if (!allowedBody.model) {
    sendJson(response, 400, { error: "Missing model or messages." });
    return;
  }

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": request.headers.origin || "https://rent-unfiltered.vercel.app",
        "X-Title": body.title || "Rent Unfiltered",
      },
      body: JSON.stringify(allowedBody),
    });

    const text = await upstream.text();
    response.statusCode = upstream.status;
    response.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json; charset=utf-8");
    response.end(text);
  } catch (error) {
    sendJson(response, 502, { error: `OpenRouter proxy failed: ${error.message}` });
  }
};
