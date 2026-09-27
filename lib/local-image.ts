import type { ImageRequest } from "./ai";
import {
  imageStyle,
  localImageApiKey,
  localImageModelName,
  localImageSizeString,
  localImageTimeoutMs,
  localImageUsesEdits,
} from "./runtime-config";

export class LocalImageError extends Error {
  readonly fatal = true;

  constructor(message: string) {
    super(message);
    this.name = "LocalImageError";
  }
}

export type LocalImageEndpoints = {
  apiRoot: string;
  generationsUrl: string;
  editsUrl: string;
};

export function normalizeLocalImageBase(input: string): LocalImageEndpoints {
  let raw = input.trim();
  if (!raw) throw new LocalImageError("未设置 LOCAL_IMAGE_BASE_URL");
  if (!/^https?:\/\//i.test(raw)) {
    throw new LocalImageError(`LOCAL_IMAGE_BASE_URL 需要以 http:// 或 https:// 开头：${raw}`);
  }
  raw = raw.replace(/\/+$/, "");
  raw = raw.replace(/\/images\/(generations|edits)$/i, "");
  raw = raw.replace(/\/+$/, "");
  return {
    apiRoot: raw,
    generationsUrl: `${raw}/images/generations`,
    editsUrl: `${raw}/images/edits`,
  };
}

export function resolveImageUrl(url: string, apiRoot: string) {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = apiRoot.endsWith("/") ? apiRoot : `${apiRoot}/`;
  return new URL(trimmed, base).href;
}

export type ParsedImage =
  | { kind: "b64"; data: string }
  | { kind: "url"; url: string };

export function parseImageResponse(body: unknown): ParsedImage {
  const data = (body as { data?: unknown } | null)?.data;
  const item = Array.isArray(data) ? (data[0] as { b64_json?: unknown; url?: unknown } | undefined) : undefined;
  if (typeof item?.b64_json === "string" && item.b64_json.length > 0) {
    return { kind: "b64", data: item.b64_json };
  }
  if (typeof item?.url === "string" && item.url.trim()) {
    return { kind: "url", url: item.url.trim() };
  }
  throw new LocalImageError("本地生图没有返回 data[0].b64_json 或 data[0].url");
}

function snippet(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 280);
}

function unreachable(url: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return new LocalImageError(`连不上本地生图服务 ${url}：${message}`);
}

function dataUrlToBlob(dataUrl: string) {
  const match = /^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) return null;
  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  return new Blob([bytes], { type: match[1] });
}

async function readImage(url: string, timeoutMs: number) {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    throw unreachable(url, error);
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new LocalImageError(`下载本地生图失败（${response.status}）${url}：${snippet(text)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function generateLocalImage(request: ImageRequest) {
  const configured = process.env.LOCAL_IMAGE_BASE_URL?.trim() || "";
  const endpoints = normalizeLocalImageBase(configured);
  const timeoutMs = localImageTimeoutMs();
  const size = localImageSizeString(request.width, request.height);
  const model = localImageModelName();
  const key = localImageApiKey();
  const headers: Record<string, string> = {};
  if (key) headers.Authorization = `Bearer ${key}`;

  const blobs = (request.referenceImages ?? [])
    .map(dataUrlToBlob)
    .filter((blob): blob is Blob => Boolean(blob));
  const useEdits = localImageUsesEdits() && blobs.length > 0;
  const endpoint = useEdits ? endpoints.editsUrl : endpoints.generationsUrl;

  console.error(`[local-image] POST ${endpoint}`);

  let response: Response;
  try {
    if (useEdits) {
      const form = new FormData();
      form.set("prompt", request.prompt);
      form.set("n", "1");
      form.set("size", size);
      form.set("response_format", "b64_json");
      if (model) form.set("model", model);
      blobs.forEach((blob, index) => {
        form.append("image", blob, `ref-${index + 1}.png`);
      });
      response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: form,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } else {
      const body: Record<string, unknown> = {
        prompt: request.prompt,
        n: 1,
        size,
        response_format: "b64_json",
        negative_prompt:
          "blurry, low quality, distorted, watermark, text, signature, child, loli, shota, underage, realistic photo, extra limbs, business suit, t-shirt, wrong species",
      };
      if (model) body.model = model;
      const style = imageStyle();
      if (style) body.style = style;
      response = await fetch(endpoint, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
    }
  } catch (error) {
    throw unreachable(endpoint, error);
  }

  const text = await response.text();
  if (!response.ok) {
    throw new LocalImageError(`本地生图失败（${response.status}）${endpoint}：${snippet(text)}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new LocalImageError(`本地生图返回的不是 JSON ${endpoint}：${snippet(text)}`);
  }

  const parsed = parseImageResponse(json);
  if (parsed.kind === "b64") return Buffer.from(parsed.data, "base64");
  const imageUrl = resolveImageUrl(parsed.url, endpoints.apiRoot);
  console.error(`[local-image] GET ${imageUrl}`);
  return readImage(imageUrl, timeoutMs);
}
