const http = require("http");
const fs = require("fs");
const path = require("path");

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const text = line.trim();
    if (!text || text.startsWith("#")) return;
    const eqIndex = text.indexOf("=");
    if (eqIndex <= 0) return;
    const key = text.slice(0, eqIndex).trim();
    const value = text.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

loadLocalEnv();

const PORT = process.env.PORT || 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest";
const ANTHROPIC_FALLBACK_MODELS = (process.env.ANTHROPIC_FALLBACK_MODELS || "claude-3-haiku-20240307")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function geminiApiErrorMessage(data) {
  return data && data.error && data.error.message ? String(data.error.message) : "";
}

/** 高峰期 / 限流：可重试或换备用模型 */
function isOverloadOrRateLimit(status, message) {
  if (status === 429 || status === 503) return true;
  const m = (message || "").toLowerCase();
  return (
    m.includes("high demand") ||
    m.includes("resource exhausted") ||
    m.includes("try again later") ||
    m.includes("overloaded") ||
    m.includes("too many requests")
  );
}

function isNonRetryableClientError(status) {
  return status === 400 || status === 401 || status === 403 || status === 404;
}

function getGeminiTextModelChain() {
  const primary = GEMINI_TEXT_MODEL;
  const raw = process.env.GEMINI_TEXT_FALLBACK_MODELS;
  const fallbacks = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : ["gemini-2.5-flash-lite"];
  const chain = [primary];
  for (const m of fallbacks) {
    if (m && m !== primary && !chain.includes(m)) chain.push(m);
  }
  return chain;
}

async function geminiGenerateContentSingle(modelName, bodyObject) {
  const endpoint = `${GEMINI_BASE_URL}/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyObject),
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  return { response, data };
}

/**
 * 同一模型最多 4 次（指数退避），仍失败则尝试链中下一模型。
 */
async function geminiGenerateContentWithRetries(bodyObject, modelChain) {
  const maxAttemptsPerModel = 4;
  const baseDelayMs = 600;
  let lastStatus = 500;
  let lastMsg = "Gemini API failed";
  let lastData = {};

  for (const modelName of modelChain) {
    for (let attempt = 0; attempt < maxAttemptsPerModel; attempt++) {
      const { response, data } = await geminiGenerateContentSingle(modelName, bodyObject);
      lastStatus = response.status;
      lastData = data;
      lastMsg = geminiApiErrorMessage(data) || "Gemini API failed";

      if (response.ok) {
        return { ok: true, data };
      }

      if (isNonRetryableClientError(response.status)) {
        return { ok: false, status: response.status, data, message: lastMsg };
      }

      const retryable = isOverloadOrRateLimit(response.status, lastMsg);
      if (!retryable) {
        return { ok: false, status: response.status, data, message: lastMsg };
      }

      if (attempt < maxAttemptsPerModel - 1) {
        await sleep(baseDelayMs * 2 ** attempt);
      }
    }
  }

  return { ok: false, status: lastStatus, data: lastData, message: lastMsg };
}

const AI_CHAT_SYSTEM_INSTRUCTION =
  process.env.GEMINI_CHAT_SYSTEM ||
  [
    "你是 Echo，用户在 Trace 应用里的「日记管理员」。",
    "用简体中文回复；语气温暖、干练，适合在手机聊天里阅读。",
    "不要编造用户未曾记下的日记细节；不确定时可以温和追问或邀请对方多写一点。",
    "可适当分段；避免冗长寒暄与模板句。",
  ].join("\n");

/** 与 app.js 中 AI_CHAT_ECHO_INTRO_TEXT 保持一致（身份类提问的固定回复） */
const AI_CHAT_ECHO_IDENTITY_REPLY = [
  "你好，我是 Echo，你的日记管理员。",
  "我会读懂你的每一天——",
  "你遇见过的人，经历过的事；你的开心和你的伤感，还有你对自己说过的话，",
  "你每一天留下的Trace，我都记得。",
  "",
  "有什么想和我聊聊的吗？",
].join("\n");

/** 与 app.js 中 aiChatIsWhoAreYouQuestion 规则保持一致 */
function isWhoAreYouQuestion(t) {
  const s = String(t || "").trim();
  if (!s || s.length > 72) return false;
  const compact = s.replace(/\s+/g, "");
  const low = s.toLowerCase();

  if (/^who\s+are\s+you\??$/i.test(low)) return true;
  if (/^what\s+are\s+you\??$/i.test(low)) return true;
  if (/^what'?s\s+your\s+name\??$/i.test(low)) return true;

  if (/你是谁(?!写)/.test(compact)) return true;
  if (/您是谁(?!写)/.test(compact)) return true;
  if (/echo是谁|^谁是echo$/i.test(compact)) return true;
  if (/你是(哪位|哪一个|干啥的|做什么的)/.test(compact)) return true;
  if (/^(请问)?(你|您)(到底)?(是|叫)(谁|什么|啥)/.test(compact)) return true;
  if (/介绍一下(你|您)?自己/.test(compact)) return true;
  if (/自我介绍/.test(compact)) return true;
  if (/(你|您)叫什么|叫啥|什么名字/.test(compact)) return true;
  if (/你是(echo|ai|机器人)/i.test(compact)) return true;
  if (/什么模型|哪个模型/.test(compact)) return true;
  if (/你的身份/.test(compact)) return true;

  const exactShort = [
    "你谁啊",
    "你哪位",
    "哪位啊",
    "你是echo吗",
    "你是echo",
    "echo是什么",
  ];
  for (let i = 0; i < exactShort.length; i++) {
    const x = exactShort[i];
    if (compact === x || compact === `${x}？` || compact === `${x}?`) return true;
  }

  return false;
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
};

const corsForApi = {
  "Access-Control-Allow-Origin": "*",
};

const NDJSON_HEADERS = {
  "Content-Type": "application/x-ndjson; charset=utf-8",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  ...corsForApi,
};

function beginNdjsonStream(res, statusCode) {
  res.writeHead(statusCode, NDJSON_HEADERS);
}

function writeNdjsonLine(res, obj) {
  res.write(`${JSON.stringify(obj)}\n`);
}

/** 伪装流式写出，便于 Gemini / 兜底路径 */
function writeFakeTextDeltas(res, text, chunkSize) {
  const s = String(text || "");
  const n = chunkSize || 8;
  for (let i = 0; i < s.length; i += n) {
    writeNdjsonLine(res, { type: "delta", text: s.slice(i, i + n) });
  }
}

/**
 * Claude Messages API SSE：解析 data: {...} 行的 text_delta
 * @returns {Promise<string>} 聚合全文
 */
async function readAnthropicNonOkBody(response) {
  let errMsg = `HTTP ${response.status}`;
  try {
    const t = await response.text();
    try {
      const j = JSON.parse(t);
      if (j && j.error && j.error.message) errMsg = String(j.error.message);
      else if (t && String(t).length < 500) errMsg = String(t);
    } catch {
      if (t && String(t).length < 500) errMsg = String(t);
    }
  } catch {
    //
  }
  return errMsg;
}

async function consumeClaudeMessageStream(fullResponse) {
  if (!fullResponse.ok) {
    throw new Error(await readAnthropicNonOkBody(fullResponse));
  }
  const reader = fullResponse.body.getReader();
  const decoder = new TextDecoder();
  let tail = "";
  let fullText = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    tail += decoder.decode(value, { stream: true });
    const chunks = tail.split("\n");
    tail = chunks.pop() || "";
    for (const lineRaw of chunks) {
      const line = lineRaw.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(line.indexOf(":") + 1).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta" && typeof ev.delta.text === "string") {
          fullText += ev.delta.text;
        }
      } catch {
        //
      }
    }
  }
  return fullText;
}

/**
 * 流式请求 Claude，边读边对每个 text_delta 调 onDelta（用于对外 NDJSON）
 * @returns {Promise<string>} 全文
 */
async function streamClaudeMessagesWithDeltas(fullResponse, onDelta) {
  if (!fullResponse.ok) {
    throw new Error(await readAnthropicNonOkBody(fullResponse));
  }
  const reader = fullResponse.body.getReader();
  const decoder = new TextDecoder();
  let tail = "";
  let fullText = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    tail += decoder.decode(value, { stream: true });
    const chunks = tail.split("\n");
    tail = chunks.pop() || "";
    for (const lineRaw of chunks) {
      const line = lineRaw.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(line.indexOf(":") + 1).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const ev = JSON.parse(payload);
        if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta" && typeof ev.delta.text === "string") {
          fullText += ev.delta.text;
          if (typeof onDelta === "function") onDelta(ev.delta.text);
        }
      } catch {
        //
      }
    }
  }
  return fullText;
}

async function anthropicMessagesFetchStreamBody(modelName, { max_tokens, temperature, system, messages }) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens,
      temperature,
      stream: true,
      ...(system ? { system } : {}),
      messages,
    }),
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...corsForApi,
  });
  res.end(JSON.stringify(payload));
}

function readRequestJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function buildPrompt(lines, variationKey) {
  const cleaned = lines
    .map((line) => String(line || "").trim())
    .filter(Boolean)
    .slice(0, 10);

  return [
    "Create a square journal-cover illustration.",
    "Priority rule: the user's text meaning is the primary source of image content; style is secondary.",
    "If style and text conflict, always follow text meaning.",
    "Convert the user's text into concrete visual story elements (people, actions, setting, objects, mood) that are clearly visible in the final scene.",
    "Character guideline: use gender-neutral characters by default (avoid explicit gender markers, sexual dimorphism, or strongly gender-coded styling).",
    "Art direction: concrete figurative illustration — clear, readable subjects (people in everyday leisure, parks, coast or travel mood, chairs, trees, fruit, sky and sea) with simple shapes; not abstract blobs, not photorealistic, not 3D render.",
    "Visual style: modern editorial flat illustration with visible print grain (risograph or screen-print texture), bold saturated color blocks, crisp edges, minimal facial detail, strong daylight and clear cast shadows.",
    "Palette: cobalt blue, lemon yellow, and fresh grass greens with small warm red accents, but keep overall saturation slightly reduced (about 10-15% less than vivid poster colors); retain clear contrast and a lively summer mood.",
    "Composition: one coherent single scene (NOT collage), with clear foreground/background and calm negative space where appropriate.",
    "Do NOT copy any specific object arrangement, pose, camera angle, or scene layout from any reference examples.",
    "Do NOT duplicate people/objects unintentionally; avoid repeated characters, repeated props, and mirrored duplicates.",
    "Produce a noticeably different composition each run while keeping the same style family.",
    `Variation key for this run: ${variationKey}. Use it to diversify layout, camera framing, and subject placement.`,
    "Output framing: full-bleed artwork that fills the entire square canvas edge-to-edge; no inner white margin, no inset border, no mat, no frame.",
    "Keep a coherent style across the full image.",
    "Render full-bleed edge-to-edge artwork: no inner frame, no white margin, no card border, no inset panel, no rounded inner rectangle.",
    "No words, no letters, no logos, no watermark.",
    "Use this textual input as the REQUIRED scene brief:",
    cleaned.map((line, index) => `${index + 1}. ${line}`).join("\n"),
  ].join("\n");
}

async function handleGenerateImage(req, res) {
  if (!GEMINI_API_KEY) {
    sendJson(res, 500, {
      error: "Missing GEMINI_API_KEY. Please set env var then restart server.",
    });
    return;
  }

  try {
    const body = await readRequestJson(req);
    const lines = Array.isArray(body.lines) ? body.lines : [];
    const variationKey = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const content = lines.map((s) => String(s || "").trim()).filter(Boolean);
    if (!content.length) {
      sendJson(res, 400, { error: "Please provide at least one non-empty input." });
      return;
    }

    const endpoint = `${GEMINI_BASE_URL}/models/${encodeURIComponent(GEMINI_IMAGE_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(content, variationKey) }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : "Gemini image API failed";
      sendJson(res, response.status, { error: msg });
      return;
    }

    const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
    const parts =
      candidates[0] && candidates[0].content && Array.isArray(candidates[0].content.parts)
        ? candidates[0].content.parts
        : [];
    const imagePart = parts.find((part) => part && part.inlineData && part.inlineData.data);

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      const mimeType = imagePart.inlineData.mimeType || "image/png";
      sendJson(res, 200, { imageUrl: `data:${mimeType};base64,${imagePart.inlineData.data}` });
      return;
    }

    sendJson(res, 500, { error: "Gemini returned no image data." });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unexpected server error." });
  }
}

function buildScratchSummaryPrompt(entries, variationKey, avoidSummaries) {
  const cleaned = entries
    .map((entry) => ({
      sourceId: String(entry && entry.sourceId ? entry.sourceId : "").trim(),
      text: String(entry && entry.text ? entry.text : "").trim(),
    }))
    .filter((entry) => entry.sourceId && entry.text)
    .slice(0, 30);
  const avoidList = Array.isArray(avoidSummaries)
    ? avoidSummaries.map((s) => String(s || "").trim()).filter(Boolean).slice(0, 8)
    : [];
  return [
    "你是一个温暖、克制的中文日记编辑。",
    "任务：从给定的感恩日记素材中，提炼一句“今日关键句”，用于刮刮乐揭晓文案，并标注它来源于哪条素材。",
    "输出必须是 JSON，不要输出其他内容。",
    "要求：",
    "1) 只输出一句中文，不要编号、不要引号、不要解释。",
    "2) 必须在30字以内（含标点），超出就立刻重写。",
    "3) 必须是“总结句”，禁止直接照抄原文超过8个连续字。",
    "4) 先提炼原文中的具体事实（事件/情绪），再进行一句话改写；不要泛化成空话。",
    "5) 口语自然，有画面感，积极但不鸡汤。",
    "6) 不要出现具体人名首字母、学校缩写等隐私细节。",
    "7) 每次表达有细微差异，避免与历史输出完全相同。",
    "8) source_id 必须从给定素材 id 中选择一个。",
    `variation_key=${variationKey}`,
    avoidList.length
      ? `9) 禁止与以下近期文案完全相同：${avoidList.map((s) => `【${s}】`).join(" ")}`
      : "9) 若可行，尽量避免与常见模板句完全一致。",
    "",
    '输出格式示例：{"summary":"和朋友聊天到深夜很治愈。","source_id":"22-2"}',
    "",
    "素材：",
    cleaned.map((entry) => `id=${entry.sourceId} text=${entry.text}`).join("\n"),
  ].join("\n");
}

async function handleScratchSummary(req, res) {
  if (!GEMINI_API_KEY) {
    sendJson(res, 500, {
      error: "Missing GEMINI_API_KEY. Please set env var then restart server.",
    });
    return;
  }
  try {
    const body = await readRequestJson(req);
    const entries = Array.isArray(body.entries) ? body.entries : [];
    const avoidSummaries = Array.isArray(body.avoidSummaries) ? body.avoidSummaries : [];
    const content = entries
      .map((entry) => ({
        sourceId: String(entry && entry.sourceId ? entry.sourceId : "").trim(),
        text: String(entry && entry.text ? entry.text : "").trim(),
      }))
      .filter((entry) => entry.sourceId && entry.text);
    if (!content.length) {
      sendJson(res, 400, { error: "Please provide at least one non-empty input." });
      return;
    }
    const variationKey = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const scratchBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: buildScratchSummaryPrompt(content, variationKey, avoidSummaries) }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        topK: 32,
        maxOutputTokens: 48,
        responseMimeType: "application/json",
      },
    };
    const scratchResult = await geminiGenerateContentWithRetries(scratchBody, getGeminiTextModelChain());
    if (!scratchResult.ok) {
      const status = scratchResult.status >= 400 ? scratchResult.status : 503;
      sendJson(res, status, { error: scratchResult.message });
      return;
    }
    const data = scratchResult.data;
    const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
    const parts =
      candidates[0] && candidates[0].content && Array.isArray(candidates[0].content.parts)
        ? candidates[0].content.parts
        : [];
    const text = parts
      .map((part) => (part && typeof part.text === "string" ? part.text : ""))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) {
      sendJson(res, 500, { error: "Gemini returned no summary text." });
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try {
          parsed = JSON.parse(text.slice(start, end + 1));
        } catch (e2) {
          parsed = null;
        }
      }
    }
    let summary = "";
    let sourceId = "";
    if (parsed && typeof parsed === "object") {
      summary = String(parsed.summary || "")
        .replace(/\s+/g, " ")
        .trim();
      sourceId = String(parsed.source_id || "").trim();
    } else {
      summary = String(text)
        .replace(/\s+/g, " ")
        .trim();
    }
    if (!summary) {
      sendJson(res, 500, { error: "Gemini summary/source missing." });
      return;
    }
    if (!sourceId && content.length === 1) {
      sourceId = content[0].sourceId;
    }
    if (!sourceId) {
      sendJson(res, 500, { error: "Gemini summary/source missing." });
      return;
    }
    const sourceExists = content.some((entry) => entry.sourceId === sourceId);
    if (!sourceExists) {
      sendJson(res, 500, { error: "Gemini source id is not in corpus." });
      return;
    }
    sendJson(res, 200, { summary, sourceId });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unexpected server error." });
  }
}

function normalizeChatMessages(raw) {
  const normalized = [];
  if (!Array.isArray(raw)) return normalized;
  for (let i = 0; i < raw.length; i++) {
    const role =
      raw[i].role === "assistant" ? "assistant" : raw[i].role === "user" ? "user" : null;
    const text = String(raw[i].text || "").trim();
    if (!role || !text) continue;
    normalized.push({ role, text });
  }
  return normalized;
}

function trimChatMessagesForApi(messages, maxMessages) {
  const max = typeof maxMessages === "number" && maxMessages > 0 ? maxMessages : 40;
  if (messages.length <= max) return messages;
  let slice = messages.slice(-max);
  while (slice.length && slice[0].role !== "user") {
    slice = slice.slice(1);
  }
  return slice;
}

async function handleChat(req, res) {
  try {
    const body = await readRequestJson(req);
    let normalized = normalizeChatMessages(body.messages);
    normalized = trimChatMessagesForApi(normalized, 40);

    if (!normalized.length || normalized[normalized.length - 1].role !== "user") {
      sendJson(res, 400, {
        error: "至少需要一条用户消息，且最后一条须为用户发言。",
      });
      return;
    }

    for (let i = 0; i < normalized.length; i++) {
      const want = i % 2 === 0 ? "user" : "assistant";
      if (normalized[i].role !== want) {
        sendJson(res, 400, { error: "消息顺序无效：须为用户与助手交替出现。" });
        return;
      }
    }

    const lastUserText = normalized[normalized.length - 1].text;
    if (isWhoAreYouQuestion(lastUserText)) {
      sendJson(res, 200, { text: AI_CHAT_ECHO_IDENTITY_REPLY });
      return;
    }

    if (!GEMINI_API_KEY) {
      sendJson(res, 500, {
        error: "Missing GEMINI_API_KEY. Please set env var then restart server.",
      });
      return;
    }

    const contents = normalized.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const chatBody = {
      systemInstruction: {
        parts: [{ text: AI_CHAT_SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.75,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    };

    const chatResult = await geminiGenerateContentWithRetries(chatBody, getGeminiTextModelChain());
    if (!chatResult.ok) {
      const status = chatResult.status >= 400 ? chatResult.status : 503;
      sendJson(res, status, { error: chatResult.message });
      return;
    }
    const data = chatResult.data;

    const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
    const parts =
      candidates[0] && candidates[0].content && Array.isArray(candidates[0].content.parts)
        ? candidates[0].content.parts
        : [];
    const replyText = parts
      .map((part) => (part && typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim();

    if (!replyText) {
      sendJson(res, 500, { error: "Gemini returned no reply text." });
      return;
    }

    sendJson(res, 200, { text: replyText });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unexpected server error." });
  }
}

function normalizeEmotionTrendEntries(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const date = String(item && item.date ? item.date : "").trim();
      const gratitude = Array.isArray(item && item.gratitude)
        ? item.gratitude.map((s) => String(s || "").trim()).filter(Boolean)
        : [];
      const improve = Array.isArray(item && item.improve)
        ? item.improve.map((s) => String(s || "").trim()).filter(Boolean)
        : [];
      const affirm = Array.isArray(item && item.affirm)
        ? item.affirm.map((s) => String(s || "").trim()).filter(Boolean)
        : [];
      return { date, gratitude, improve, affirm };
    })
    .filter((item) => item.date && (item.gratitude.length || item.improve.length || item.affirm.length))
    .slice(0, 60);
}

const EMOTION_SCORE_SYSTEM_INSTRUCTION = [
  "你是情绪评分器，根据用户一整天的日记判断「当天整体情绪积极度」。请只返回一个 1-10 的整数。",
  "1=非常消极，10=非常积极。禁止输出解释、标点、单位、emoji、换行或任何额外文本。",
  "",
  "评分规则（很重要）：",
  "1) 必须综合 gratitude / reflection / affirmation 全部内容，判断当天的主导情绪基调；禁止只因为感恩条目写得正面就把整天打成高分。",
  "2) 若在 reflection 或其它段落中出现明显且较重的负面情绪（焦虑、低落、悲伤、恐慌、愤怒、无助等），或大篇幅书写不愉快经历，应显著拉低分数；感恩事项不能抵消这种主导痛苦感。",
  "3) 若同一天既有正面经历又有强烈负面情绪：看篇幅强度与主导感受——若不愉快感受明显占主导，分数应在偏低区间（例如整体更像难熬的一天）。",
  "4) 鼓励句若仅为习惯性打气而正文情绪低落，不要因此抬高分数。",
].join("\n");

function buildEmotionScorePrompt(entry) {
  const gratitudeText = entry.gratitude.length ? entry.gratitude.map((x, i) => `${i + 1}. ${x}`).join("\n") : "无";
  const improveText = entry.improve.length ? entry.improve.map((x, i) => `${i + 1}. ${x}`).join("\n") : "无";
  const affirmText = entry.affirm.length ? entry.affirm.map((x, i) => `${i + 1}. ${x}`).join("\n") : "无";
  return [
    `日期: ${entry.date}`,
    "gratitude_1/2/3:",
    gratitudeText,
    "",
    "reflection_1/2:",
    improveText,
    "",
    "affirmation:",
    affirmText,
    "",
    "请根据上述全部文字，给出当天整体情绪积极度的单一整数（1-10）。",
  ].join("\n");
}

function parseEmotionScoreFromModelText(rawText) {
  const text = String(rawText || "").trim();
  if (!text) return null;

  // 1) 先尝试直接匹配阿拉伯数字（含全角）
  const normalizedDigits = text.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 65248)
  );
  let m = normalizedDigits.match(/\b(10|[1-9])\b/);
  if (m) return Math.max(1, Math.min(10, parseInt(m[1], 10)));

  // 2) 尝试解析 JSON 里的 score 字段
  try {
    const maybeJson = JSON.parse(normalizedDigits);
    const scoreValue =
      maybeJson && typeof maybeJson === "object"
        ? maybeJson.score ?? maybeJson.value ?? maybeJson.result
        : null;
    const n = parseInt(String(scoreValue == null ? "" : scoreValue), 10);
    if (Number.isFinite(n)) return Math.max(1, Math.min(10, n));
  } catch (e) {}

  // 3) 支持中文数字（“一”到“十”）
  const zhMap = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
  };
  for (const key of Object.keys(zhMap)) {
    if (text.includes(key)) return zhMap[key];
  }

  return null;
}

function scoreDiaryByLocalHeuristic(entry) {
  const gratitude = Array.isArray(entry && entry.gratitude) ? entry.gratitude : [];
  const improve = Array.isArray(entry && entry.improve) ? entry.improve : [];
  const affirm = Array.isArray(entry && entry.affirm) ? entry.affirm : [];
  const allText = [...gratitude, ...improve, ...affirm].join(" ");
  const reflectionText = improve.join(" ");

  let score = 6;
  const positiveKeywords = [
    "开心",
    "高兴",
    "顺利",
    "推进",
    "治愈",
    "放松",
    "喜欢",
    "信心",
    "美丽",
    "期待",
  ];
  const negativeKeywords = [
    "焦虑",
    "恐慌",
    "忧伤",
    "难受",
    "低落",
    "崩溃",
    "痛苦",
    "压抑",
    "害怕",
    "紧张",
    "迷茫",
    "惆怅",
    "不开心",
    "心情差",
    "难过",
  ];
  const posHits = positiveKeywords.reduce((n, kw) => (allText.includes(kw) ? n + 1 : n), 0);
  const negHits = negativeKeywords.reduce((n, kw) => (allText.includes(kw) ? n + 1 : n), 0);
  score += Math.min(3, posHits);
  score -= Math.min(4, negHits);

  if (reflectionText.length >= 120 && negHits >= 2) {
    score = Math.min(score, 6);
  }
  return Math.max(1, Math.min(10, Math.round(score)));
}

function detectStrongNegativeInReflection(entry) {
  const lines = Array.isArray(entry && entry.improve) ? entry.improve : [];
  if (!lines.length) return false;
  const text = lines
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");
  if (!text) return false;
  const negativeKeywords = [
    "焦虑",
    "恐慌",
    "忧伤",
    "难受",
    "低落",
    "崩溃",
    "痛苦",
    "压抑",
    "害怕",
    "紧张",
    "不开心",
    "心情差",
    "难过",
  ];
  const hitCount = negativeKeywords.reduce((n, kw) => (text.includes(kw) ? n + 1 : n), 0);
  const isLongReflection = text.length >= 120;
  return isLongReflection && hitCount >= 2;
}

function applyEmotionScorePostRules(entry, score) {
  let next = Number(score);
  if (!Number.isFinite(next)) next = 5;
  next = Math.max(1, Math.min(10, Math.round(next)));

  // 规则：若 reflection 中存在较长篇幅且明显强负面情绪，封顶为 6 分。
  if (detectStrongNegativeInReflection(entry)) {
    next = Math.min(next, 6);
  }
  return next;
}

function getAnthropicModelChain() {
  const chain = [];
  if (ANTHROPIC_MODEL) chain.push(ANTHROPIC_MODEL);
  for (const m of ANTHROPIC_FALLBACK_MODELS) {
    if (m && !chain.includes(m)) chain.push(m);
  }
  return chain;
}

async function scoreSingleDiaryWithClaude(entry, modelName) {
  const response = await anthropicMessagesFetchStreamBody(modelName, {
    max_tokens: 24,
    temperature: 0,
    system: EMOTION_SCORE_SYSTEM_INSTRUCTION,
    messages: [{ role: "user", content: buildEmotionScorePrompt(entry) }],
  });
  if (!response.ok) {
    throw new Error((await readAnthropicNonOkBody(response)) + " (model=" + modelName + ")");
  }
  const text = (await consumeClaudeMessageStream(response)).trim();
  const score = parseEmotionScoreFromModelText(text);
  if (score == null) throw new Error("Claude returned invalid score");
  return score;
}

async function scoreSingleDiaryWithClaudeFallback(entry) {
  const models = getAnthropicModelChain();
  let lastError = null;
  for (const modelName of models) {
    try {
      return await scoreSingleDiaryWithClaude(entry, modelName);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Claude scoring failed for all models");
}

async function scoreSingleDiaryWithGemini(entry) {
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY for Gemini fallback.");
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: buildEmotionScorePrompt(entry) }],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 8,
    },
    systemInstruction: {
      parts: [{ text: EMOTION_SCORE_SYSTEM_INSTRUCTION }],
    },
  };
  const result = await geminiGenerateContentWithRetries(body, getGeminiTextModelChain());
  if (!result.ok) throw new Error(result.message || "Gemini scoring failed");
  const data = result.data;
  const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
  const parts =
    candidates[0] && candidates[0].content && Array.isArray(candidates[0].content.parts)
      ? candidates[0].content.parts
      : [];
  const text = parts
    .map((part) => (part && typeof part.text === "string" ? part.text : ""))
    .join(" ")
    .trim();
  const score = parseEmotionScoreFromModelText(text);
  if (score == null) return scoreDiaryByLocalHeuristic(entry);
  return score;
}

async function scoreSingleDiaryForTrend(entry) {
  if (ANTHROPIC_API_KEY) {
    try {
      return await scoreSingleDiaryWithClaudeFallback(entry);
    } catch (error) {
      if (!GEMINI_API_KEY) throw error;
    }
  }
  return scoreSingleDiaryWithGemini(entry);
}

/** 换行与分段必须保留，勿把全文压成一行 */
function normalizeHiddenPositiveModelText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const HIDDEN_POSITIVE_SYSTEM_INSTRUCTION = [
  "你是 Trace 的 AI 分析助手。用户每天用 3-2-1 框架写日记：3 件感恩的事、2 个可以改进的空间、1 句自我肯定。你只分析其中「2」和「1」——用户觉得自己没做好的地方，以及他们写给自己的那句肯定。",
  "用户会提供所选日期范围内、按天列出的上述两类原文。你的任务不是评判对错、不是给行动建议或列待办，而是换一套视角重读这些字：从自我批评的语气里，提炼被忽视的努力、对他人的承担、责任感、自我觉察、心理弹性与成长迹象；必要时把同一天的「可改进」与「自我肯定」对照着写。",
  "若两条「可改进」内容高度重复，合并理解即可，不必机械复述两遍。若某日缺「自我肯定」或缺「可改进」，只依据已有材料写，不必用单独一句强调缺失。",
  "文风：短、准、有贴肉感。温暖但**不煽情、不堆修辞**；拒绝排比套话、拒绝同一句意换三种说法。只输出洞察正文，不解释推理过程。",
  "禁止空洞起笔（如「从这些日记中」「可以看出」「无论是……还是……」）；每个小节都要能指回用户写下的具体事，但**不必**把材料逐条复述一遍，点到即可。",
  "",
  "输出格式（必须遵守）：",
  "• 优先 **2～3 个小节**（最多 3 个）；每节第一行小标题用全角方括号，例如【家庭的情绪调和】；不要使用 ** 星号包裹标题。",
  "• **硬性长度**：模型输出的正文（含各【】标题行、标点与换行在内的可见汉字为主的篇幅）合计 **不得超过 250 字**。总字数上限 **250**；宁短勿超。若材料多，宁可合并成 **2 节**写透，也不要写到第四节。",
  "• 每节正文 **2～3 句**为宜，句子宜短；每节（标题+正文）大约 **70～90 字**。禁止长段铺陈；禁止同义反复；日记原句只点关键词不照抄。",
  "• 须有完整收束，但收束一句就够，不要多层次「最后」总结。小节之间空一行。",
  "• 不要用 # 标题、无序列表、markdown；不要用「综上所述」。",
  "• **收尾**：每一段、每一节结束前要有完整句终点（句号/问号）；不要以「当…」「虽然…」「不仅…」「在个人计划受阻」等从句**悬在半句**就收笔。若快写满却仍想展开，请先收束本节再决定是否另起【】小节。",
  "• 各【】小标题必须互不相同；**禁止**用同一标题开两节；禁止在正文里重复粘贴上一节的句子。",
].join("\n");

/** 模型正文（不含前端卡片顶栏）字数上限；与系统提示中的「250 字」一致 */
const HIDDEN_POSITIVE_MAX_CHARS = 250;

/** 去掉重复的【同一标题】及其正文（保留第一节） */
function dedupeHiddenPositiveBracketSections(text) {
  const lines = String(text || "").split("\n");
  const seen = new Set();
  const out = [];
  const titleLine = /^【([^】]+)】$/;
  for (let i = 0; i < lines.length; i += 1) {
    const tr = lines[i].trim();
    const m = titleLine.exec(tr);
    if (m) {
      const ttl = m[1].trim();
      if (seen.has(ttl)) {
        while (i + 1 < lines.length && !titleLine.test(lines[i + 1].trim())) {
          i += 1;
        }
        continue;
      }
      seen.add(ttl);
    }
    out.push(lines[i]);
  }
  return out.join("\n");
}

/** 非空白字符计数字数；超过 max 时在就近句号处截断，避免半句悬空 */
function trimHiddenPositiveToMaxChars(text, max) {
  const s = String(text);
  let nonWs = 0;
  let cut = s.length;
  for (let i = 0; i < s.length; i += 1) {
    if (!/\s/.test(s[i])) {
      nonWs += 1;
      if (nonWs > max) {
        cut = i;
        break;
      }
    }
  }
  if (nonWs <= max) return s;
  let chunk = s.slice(0, cut);
  const punctIdx = Math.max(
    chunk.lastIndexOf("。"),
    chunk.lastIndexOf("！"),
    chunk.lastIndexOf("？"),
    chunk.lastIndexOf("；")
  );
  if (punctIdx >= 0 && punctIdx > Math.floor(chunk.length * 0.2)) {
    return chunk.slice(0, punctIdx + 1).trim();
  }
  return `${chunk.trim()}…`;
}

/** 拼写叠字、去重标题、按字数上限截断（字数预算不由 max_tokens 承担，避免半途截断） */
function postProcessHiddenPositiveOutput(raw) {
  let t = normalizeHiddenPositiveModelText(raw);
  if (!t) return "";
  t = t.replace(/你{2,}/g, "你").replace(/我{2,}/g, "我");
  t = dedupeHiddenPositiveBracketSections(t);
  t = trimHiddenPositiveToMaxChars(t, HIDDEN_POSITIVE_MAX_CHARS);
  return t.trim();
}

function normalizeHiddenPositiveEntries(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const date = String(item && item.date ? item.date : "").trim();
      const improve = Array.isArray(item && item.improve)
        ? item.improve.map((s) => String(s || "").trim()).filter(Boolean)
        : [];
      const affirm = Array.isArray(item && item.affirm)
        ? item.affirm.map((s) => String(s || "").trim()).filter(Boolean)
        : [];
      return { date, improve, affirm };
    })
    .filter((item) => item.date && (item.improve.length || item.affirm.length))
    .slice(0, 40);
}

function buildHiddenPositiveUserPrompt(entries) {
  const lines = [];
  lines.push(
    "以下为所选日期范围内，用户日记里「2 个可以改进的空间」与「1 句对自己的肯定」的原文（按日期）。请按系统说明写多段洞察。",
    ""
  );
  for (const entry of entries) {
    lines.push(`【${entry.date}】`);
    if (entry.improve.length) {
      lines.push("「2个可以改进的空间」");
      entry.improve.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
    } else {
      lines.push("「2个可以改进的空间」：（当日未填写）");
    }
    lines.push("");
    if (entry.affirm.length) {
      lines.push("「1句对自己的肯定」");
      entry.affirm.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
    } else {
      lines.push("「1句对自己的肯定」：（当日未填写）");
    }
    lines.push("");
  }
  lines.push("——以上为用户原文；请严格按要求的【】小标题格式输出。");
  return lines.join("\n");
}

/** 模型不可用或返回空时的简短兜底洞察（仍基于用户原文关键词做温和提炼） */
function buildHiddenPositiveFallbackInsight(entries) {
  const joinLines = [];
  for (const entry of entries) {
    for (const line of entry.improve || []) {
      const s = String(line || "").trim();
      if (s.length >= 8) joinLines.push(s);
    }
    for (const line of entry.affirm || []) {
      const s = String(line || "").trim();
      if (s.length >= 2) joinLines.push(s);
    }
  }
  const blob = joinLines.join(" ").replace(/\s+/g, " ").trim();
  const snippet = blob.length > 120 ? `${blob.slice(0, 120)}…` : blob;
  const base =
    "你愿意把这些「想改进」写出来，本身就是一种自我觉察与对自己的诚实；这份坦诚常常是改变的第一步。";
  if (!snippet) {
    return `【你愿意先写下这些】\n\n${base}\n\n【再往前看一小步】\n\n不妨留意那些你已经坚持下来的微小行动——它们同样值得被看见。`;
  }
  return `【你愿意先写下这些】\n\n${base}\n\n【材料里已有的线索】\n\n文中提到的处境里，也包含着在意成长、在意关系的用心；若与「自我肯定」同读，往往能拼出被忽略的那一面：${snippet}`;
}

function extractClaudeAssistantText(data) {
  const blocks = Array.isArray(data && data.content) ? data.content : [];
  return blocks
    .map((c) => (c && c.type === "text" && typeof c.text === "string" ? c.text : ""))
    .join("");
}

async function generateHiddenPositiveWithClaude(userText) {
  if (!ANTHROPIC_API_KEY) return null;
  const models = getAnthropicModelChain();
  let lastErr = null;

  for (const modelName of models) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelName,
          /** 与「约 250 字」正文的体量无关；过低会在模型仍啰嗦时先顶到 max_tokens 导致半句截断，故给足头 room */
          max_tokens: 4096,
          temperature: 0.38,
          system: HIDDEN_POSITIVE_SYSTEM_INSTRUCTION,
          messages: [{ role: "user", content: userText }],
        }),
      });
      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }
      if (!response.ok) {
        const errMsg = data && data.error && data.error.message ? String(data.error.message) : "Claude request failed";
        throw new Error(errMsg + " (model=" + modelName + ")");
      }
      const text = normalizeHiddenPositiveModelText(extractClaudeAssistantText(data));
      if (text) return text;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Claude hidden-positive failed");
}

async function generateHiddenPositiveWithGemini(userText) {
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY for Gemini fallback.");
  const body = {
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: {
      temperature: 0.38,
      maxOutputTokens: 4096,
    },
    systemInstruction: {
      parts: [{ text: HIDDEN_POSITIVE_SYSTEM_INSTRUCTION }],
    },
  };
  const result = await geminiGenerateContentWithRetries(body, getGeminiTextModelChain());
  if (!result.ok) throw new Error(result.message || "Gemini hidden-positive failed");
  const data = result.data;
  const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
  const parts =
    candidates[0] && candidates[0].content && Array.isArray(candidates[0].content.parts)
      ? candidates[0].content.parts
      : [];
  const raw = parts.map((part) => (part && typeof part.text === "string" ? part.text : "")).join("");
  return normalizeHiddenPositiveModelText(raw);
}

async function streamHiddenPositiveClaudeModelsToRes(res, userPrompt) {
  const models = getAnthropicModelChain();
  let lastErr = null;
  for (const modelName of models) {
    try {
      const response = await anthropicMessagesFetchStreamBody(modelName, {
        max_tokens: 4096,
        temperature: 0.38,
        system: HIDDEN_POSITIVE_SYSTEM_INSTRUCTION,
        messages: [{ role: "user", content: userPrompt }],
      });
      const fullRaw = await streamClaudeMessagesWithDeltas(response, (delta) =>
        writeNdjsonLine(res, { type: "delta", text: delta })
      );
      const processed = postProcessHiddenPositiveOutput(normalizeHiddenPositiveModelText(fullRaw));
      writeNdjsonLine(res, { type: "done", text: processed || "" });
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Claude hidden-positive stream failed");
}

const EMOTION_NARRATIVE_SYSTEM_INSTRUCTION = [
  "你是 Trace 的情绪分析助手。",
  "你会看到用户若干天的「情绪积极度」分数（1-10）以及简短的每日摘录。",
  "请用 2～4 句简体中文概括这段时间情绪走势与值得留意的线索；语气克制、同理、具体。",
  "禁止医学诊断、用药建议或危机处置指令；勿重复堆砌分数数字；不说教。",
  "不要自称「作为一个 AI」。输出为正文章节，不要使用 markdown 标题。",
].join("\n");

function buildEmotionNarrativeUserPrompt(entries, points) {
  const byDate = {};
  for (const e of entries) {
    byDate[e.date] = e;
  }
  const lines = ["下列为所选日期区间内，每日整体情绪积极度（1-10）与一句摘录（来自感恩项或首句）：", ""];
  for (const p of points) {
    const e = byDate[p.date];
    let snippet = "—";
    if (e && e.gratitude && e.gratitude.length) {
      snippet = String(e.gratitude[0] || "").replace(/\s+/g, " ").trim().slice(0, 96);
    } else if (e && e.improve && e.improve.length) {
      snippet = String(e.improve[0] || "").replace(/\s+/g, " ").trim().slice(0, 96);
    }
    lines.push(`${p.date}｜积极度 ${p.score}｜摘录：${snippet || "—"}`);
  }
  lines.push("", "请写简短中文解读（2～4 句）。");
  return lines.join("\n");
}

async function streamEmotionNarrativeIntoRes(res, entries, points) {
  const prompt = buildEmotionNarrativeUserPrompt(entries, points);
  if (ANTHROPIC_API_KEY) {
    const models = getAnthropicModelChain();
    for (const modelName of models) {
      try {
        const response = await anthropicMessagesFetchStreamBody(modelName, {
          max_tokens: 520,
          temperature: 0.35,
          system: EMOTION_NARRATIVE_SYSTEM_INSTRUCTION,
          messages: [{ role: "user", content: prompt }],
        });
        await streamClaudeMessagesWithDeltas(response, (delta) => writeNdjsonLine(res, { type: "delta", text: delta }));
        return;
      } catch {
        //
      }
    }
  }
  if (GEMINI_API_KEY) {
    const bodyObj = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 520,
      },
      systemInstruction: {
        parts: [{ text: EMOTION_NARRATIVE_SYSTEM_INSTRUCTION }],
      },
    };
    const result = await geminiGenerateContentWithRetries(bodyObj, getGeminiTextModelChain());
    if (result.ok) {
      const data = result.data;
      const candidates = Array.isArray(data && data.candidates) ? data.candidates : [];
      const parts =
        candidates[0] && candidates[0].content && Array.isArray(candidates[0].content.parts)
          ? candidates[0].content.parts
          : [];
      const txt = parts.map((part) => (part && typeof part.text === "string" ? part.text : "")).join("").trim();
      writeFakeTextDeltas(res, txt, 12);
      return;
    }
  }
}

async function handleHiddenPositiveSignals(req, res) {
  beginNdjsonStream(res, 200);
  const finishErr = (msg, code) => {
    writeNdjsonLine(res, { type: "error", message: msg, code: code || 400 });
    res.end();
  };
  try {
    if (!ANTHROPIC_API_KEY && !GEMINI_API_KEY) {
      finishErr("Missing ANTHROPIC_API_KEY and GEMINI_API_KEY.", 500);
      return;
    }
    const body = await readRequestJson(req);
    const entries = normalizeHiddenPositiveEntries(body && body.entries);
    if (!entries.length) {
      finishErr(
        "所选日期范围内没有「可以改进的空间」或「1句对自己的肯定」的有效填写，无法进行隐藏积极信号分析。"
      );
      return;
    }
    const userPrompt = buildHiddenPositiveUserPrompt(entries);
    if (!userPrompt || userPrompt.length < 12) {
      finishErr("Reflection texts are empty.");
      return;
    }

    let streamed = false;
    if (ANTHROPIC_API_KEY) {
      try {
        await streamHiddenPositiveClaudeModelsToRes(res, userPrompt);
        streamed = true;
      } catch {
        //
      }
    }
    if (!streamed && GEMINI_API_KEY) {
      try {
        const rawText = await generateHiddenPositiveWithGemini(userPrompt);
        writeFakeTextDeltas(res, rawText, 12);
        const processed = postProcessHiddenPositiveOutput(rawText);
        writeNdjsonLine(res, { type: "done", text: processed || "" });
        streamed = true;
      } catch {
        //
      }
    }
    if (!streamed) {
      const fallback = buildHiddenPositiveFallbackInsight(entries);
      writeFakeTextDeltas(res, fallback, 12);
      const processed = postProcessHiddenPositiveOutput(fallback);
      writeNdjsonLine(res, { type: "done", text: processed || "" });
    }
    res.end();
  } catch (error) {
    try {
      writeNdjsonLine(res, { type: "error", message: error.message || "Unexpected server error." });
    } catch {
      //
    }
    res.end();
  }
}

async function handleEmotionTrend(req, res) {
  beginNdjsonStream(res, 200);
  try {
    if (!ANTHROPIC_API_KEY && !GEMINI_API_KEY) {
      writeNdjsonLine(res, {
        type: "error",
        message: "Missing ANTHROPIC_API_KEY and GEMINI_API_KEY.",
        code: 500,
      });
      res.end();
      return;
    }
    const body = await readRequestJson(req);
    const startDate = String(body && body.startDate ? body.startDate : "").trim();
    const endDate = String(body && body.endDate ? body.endDate : "").trim();
    const entries = normalizeEmotionTrendEntries(body && body.entries);
    if (!entries.length) {
      writeNdjsonLine(res, { type: "error", message: "No diary entries in selected range." });
      res.end();
      return;
    }

    const points = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const rawScore = await scoreSingleDiaryForTrend(entry);
      const score = applyEmotionScorePostRules(entry, rawScore);
      points.push({ date: entry.date, score });
      writeNdjsonLine(res, {
        type: "score_progress",
        index: i + 1,
        total: entries.length,
        date: entry.date,
        score: points[points.length - 1].score,
      });
    }

    writeNdjsonLine(res, { type: "points", startDate, endDate, points });
    await streamEmotionNarrativeIntoRes(res, entries, points);
    writeNdjsonLine(res, { type: "done" });
    res.end();
  } catch (error) {
    try {
      writeNdjsonLine(res, { type: "error", message: error.message || "Unexpected server error." });
    } catch {
      //
    }
    res.end();
  }
}

/** 路由用路径（去掉 ?query），避免带查询时被误判 */
function requestPathname(req) {
  const raw = req.url || "/";
  const i = raw.indexOf("?");
  return i >= 0 ? raw.slice(0, i) : raw;
}

function serveStatic(req, res) {
  const pathnameOnly = requestPathname(req);
  const requestPath = pathnameOnly === "/" ? "/index.html" : pathnameOnly;
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(process.cwd(), safePath);

  if (!filePath.startsWith(process.cwd())) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const pathname = requestPathname(req);
  if (
    (pathname === "/api/generate-image" ||
      pathname === "/api/scratch-summary" ||
      pathname === "/api/chat" ||
      pathname === "/api/emotion-trend" ||
      pathname === "/api/hidden-positive-signals") &&
    req.method === "OPTIONS"
  ) {
    res.writeHead(204, {
      ...corsForApi,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }
  if (req.method === "POST" && pathname === "/api/generate-image") {
    handleGenerateImage(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/scratch-summary") {
    handleScratchSummary(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/chat") {
    handleChat(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/emotion-trend") {
    handleEmotionTrend(req, res);
    return;
  }
  if (req.method === "POST" && pathname === "/api/hidden-positive-signals") {
    handleHiddenPositiveSignals(req, res);
    return;
  }
  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405);
  res.end("Method Not Allowed");
});

server.listen(PORT, () => {
  console.log(`Trace app running at http://localhost:${PORT}`);
});
