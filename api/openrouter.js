const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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

  const allowedBody = {
    model: body.model,
    messages: body.messages,
    temperature: body.temperature,
    response_format: body.response_format,
  };

  if (!allowedBody.model || !Array.isArray(allowedBody.messages)) {
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
