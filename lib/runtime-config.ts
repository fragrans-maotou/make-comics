export type ProviderKind = "mock" | "together" | "openai" | "local";

function normalizeKind(value: string | undefined): ProviderKind | null {
  const kind = value?.trim().toLowerCase();
  if (!kind) return null;
  if (kind === "mock" || kind === "offline") return "mock";
  if (kind === "together") return "together";
  if (kind === "openai" || kind === "openai-compatible") return "openai";
  if (kind === "local") return "local";
  return null;
}

export function hasTextCredentials() {
  return Boolean(
    process.env.TEXT_API_KEY ||
      process.env.TOGETHER_API_KEY ||
      process.env.OPENAI_API_KEY,
  );
}

export function baseMode(): ProviderKind {
  const explicit = normalizeKind(process.env.AI_PROVIDER);
  if (explicit) return explicit;
  if (process.env.TOGETHER_API_KEY) return "together";
  if (process.env.OPENAI_API_KEY || process.env.TEXT_API_KEY) return "openai";
  return "mock";
}

export function textProviderKind(): ProviderKind {
  const explicit = normalizeKind(process.env.TEXT_PROVIDER);
  if (explicit) return explicit;
  if (process.env.LOCAL_TEXT_BASE_URL?.trim()) return "local";
  return baseMode();
}

export function imageProviderKind(): ProviderKind {
  const explicit = normalizeKind(process.env.IMAGE_PROVIDER);
  if (explicit) return explicit;
  if (process.env.LOCAL_IMAGE_BASE_URL?.trim()) return "local";
  return baseMode();
}

export function textModel() {
  const kind = textProviderKind();
  if (kind === "local") {
    return process.env.LOCAL_TEXT_MODEL?.trim() || process.env.TEXT_MODEL?.trim() || "local";
  }
  if (process.env.TEXT_MODEL?.trim()) return process.env.TEXT_MODEL.trim();
  if (kind === "together") return "Qwen/Qwen3-235B-A22B-Instruct-2507";
  if (kind === "openai") {
    const base = process.env.TEXT_BASE_URL || "";
    if (base.includes("deepseek")) return "deepseek-chat";
    return "gpt-4.1";
  }
  return "mock";
}

export function imageModel() {
  const kind = imageProviderKind();
  if (kind === "local") return localImageModelName() || "local";
  if (process.env.IMAGE_MODEL?.trim()) return process.env.IMAGE_MODEL.trim();
  if (kind === "together") return "google/flash-image-2.5";
  if (kind === "openai") return "gpt-image-1";
  return "mock";
}

export function localImageModelName() {
  return process.env.LOCAL_IMAGE_MODEL?.trim() || "";
}

export function localImageApiKey() {
  return process.env.LOCAL_IMAGE_API_KEY?.trim() || "";
}

export function localImageUsesEdits() {
  return /^(1|true|yes|on)$/i.test(process.env.LOCAL_IMAGE_EDITS?.trim() || "");
}

export function localImageTimeoutMs() {
  const value = Number(process.env.LOCAL_IMAGE_TIMEOUT_MS || 300_000);
  return Number.isFinite(value) && value >= 1000 ? value : 300_000;
}

export function localImageSizeString(width: number, height: number) {
  const configured = process.env.LOCAL_IMAGE_SIZE?.trim();
  if (configured) return configured;
  return `${width}x${height}`;
}

export function textApiKey() {
  return (
    process.env.TEXT_API_KEY ||
    process.env.TOGETHER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    ""
  );
}

export function imageApiKey() {
  return (
    process.env.IMAGE_API_KEY ||
    process.env.TOGETHER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    ""
  );
}

export function textBaseUrl() {
  return (process.env.TEXT_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
}

export function imageBaseUrl() {
  return (process.env.IMAGE_BASE_URL || process.env.TEXT_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
}

export function imageSize() {
  const width = Number(process.env.IMAGE_WIDTH || 1024);
  const height = Number(process.env.IMAGE_HEIGHT || 1024);
  return {
    width: Number.isFinite(width) && width >= 256 ? width : 1024,
    height: Number.isFinite(height) && height >= 256 ? height : 1024,
  };
}

export function clerkEnabled() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

export function s3Enabled() {
  return Boolean(
    process.env.S3_UPLOAD_KEY &&
      process.env.S3_UPLOAD_SECRET &&
      process.env.S3_UPLOAD_BUCKET &&
      process.env.S3_UPLOAD_REGION,
  );
}

export function rateLimitEnabled() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function publicConfig() {
  return {
    mode: baseMode(),
    textProvider: textProviderKind(),
    imageProvider: imageProviderKind(),
    textModel: textModel(),
    imageModel: imageModel(),
    clerk: clerkEnabled(),
    s3: s3Enabled(),
    rateLimit: rateLimitEnabled(),
    mock: textProviderKind() === "mock" && imageProviderKind() === "mock",
  };
}
