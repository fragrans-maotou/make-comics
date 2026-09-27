export type ProviderKind = "mock" | "together" | "openai";

function normalizeKind(value: string | undefined): ProviderKind | null {
  const kind = value?.trim().toLowerCase();
  if (!kind) return null;
  if (kind === "mock" || kind === "offline") return "mock";
  if (kind === "together") return "together";
  if (kind === "openai" || kind === "openai-compatible") return "openai";
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
  return normalizeKind(process.env.TEXT_PROVIDER) ?? baseMode();
}

export function imageProviderKind(): ProviderKind {
  return normalizeKind(process.env.IMAGE_PROVIDER) ?? baseMode();
}

export function textModel() {
  if (process.env.TEXT_MODEL?.trim()) return process.env.TEXT_MODEL.trim();
  const kind = textProviderKind();
  if (kind === "together") return "Qwen/Qwen3-235B-A22B-Instruct-2507";
  if (kind === "openai") {
    const base = process.env.TEXT_BASE_URL || "";
    if (base.includes("deepseek")) return "deepseek-chat";
    return "gpt-4.1";
  }
  return "mock";
}

export function imageModel() {
  if (process.env.IMAGE_MODEL?.trim()) return process.env.IMAGE_MODEL.trim();
  const kind = imageProviderKind();
  if (kind === "together") return "google/flash-image-2.5";
  if (kind === "openai") return "gpt-image-1";
  return "mock";
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
