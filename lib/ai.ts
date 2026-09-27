import Together from "together-ai";
import { generateLocalImage } from "./local-image";
import { drawPlaceholderPanel } from "./mock-art";
import {
  imageApiKey,
  imageBaseUrl,
  imageModel,
  imageProviderKind,
  textApiKey,
  textBaseUrl,
  textModel,
  textProviderKind,
  type ProviderKind,
} from "./runtime-config";

export type TextRequest = {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
};

export type ImageRequest = {
  prompt: string;
  width: number;
  height: number;
  referenceImages?: string[];
  hint?: {
    characters: string[];
    index: number;
  };
};

export interface TextProvider {
  kind: ProviderKind;
  model: string;
  complete(request: TextRequest): Promise<string>;
}

export interface ImageProvider {
  kind: ProviderKind;
  model: string;
  generate(request: ImageRequest): Promise<Buffer>;
}

async function togetherText(request: TextRequest) {
  const key = textApiKey();
  if (!key) throw new Error("缺少 TEXT_API_KEY 或 TOGETHER_API_KEY");
  const client = new Together({ apiKey: key });
  const body = {
    model: textModel(),
    messages: [
      { role: "system" as const, content: request.system },
      { role: "user" as const, content: request.user },
    ],
    temperature: request.temperature ?? 0.7,
    max_tokens: request.maxTokens ?? 2200,
  };
  try {
    const response = await client.chat.completions.create({
      ...body,
      reasoning: { enabled: false },
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/reasoning/i.test(message)) throw error;
    const response = await client.chat.completions.create(body);
    return response.choices[0]?.message?.content?.trim() || "";
  }
}

function localTextRoot() {
  let raw = (process.env.LOCAL_TEXT_BASE_URL || "").trim().replace(/\/+$/, "");
  raw = raw.replace(/\/chat\/completions$/i, "");
  return raw;
}

async function localText(request: TextRequest) {
  const root = localTextRoot();
  if (!root) throw new Error("未设置 LOCAL_TEXT_BASE_URL");
  const url = `${root}/chat/completions`;
  const key = process.env.LOCAL_TEXT_API_KEY?.trim() || "";
  const model = process.env.LOCAL_TEXT_MODEL?.trim() || textModel();
  console.error(`[local-text] POST ${url}`);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.user },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2200,
      }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`连不上本地文本服务 ${url}：${message}`);
  }
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`本地文本失败（${response.status}）${url}：${text.replace(/\s+/g, " ").trim().slice(0, 280)}`);
  }
  const json = JSON.parse(text) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() || "";
}

async function openAiText(request: TextRequest) {
  const key = textApiKey();
  if (!key) throw new Error("缺少 TEXT_API_KEY 或 OPENAI_API_KEY");
  const response = await fetch(`${textBaseUrl()}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: textModel(),
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.user },
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2200,
    }),
  });
  if (!response.ok) {
    throw new Error(`文本模型请求失败：${response.status} ${await response.text()}`);
  }
  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() || "";
}

async function togetherImage(request: ImageRequest) {
  const key = imageApiKey();
  if (!key) throw new Error("缺少 IMAGE_API_KEY 或 TOGETHER_API_KEY");
  const client = new Together({ apiKey: key });
  const response = await client.images.generate({
    model: imageModel(),
    prompt: request.prompt,
    width: request.width,
    height: request.height,
    response_format: "base64",
    output_format: "png",
    reference_images: request.referenceImages?.length ? request.referenceImages : undefined,
  });
  const item = response.data[0] as { b64_json?: string; url?: string } | undefined;
  if (item?.b64_json) {
    return Buffer.from(item.b64_json, "base64");
  }
  if (item?.url) {
    const downloaded = await fetch(item.url);
    if (!downloaded.ok) throw new Error("下载生成图片失败");
    return Buffer.from(await downloaded.arrayBuffer());
  }
  throw new Error("图像模型没有返回图片");
}

async function openAiImage(request: ImageRequest) {
  const key = imageApiKey();
  if (!key) throw new Error("缺少 IMAGE_API_KEY 或 OPENAI_API_KEY");
  const response = await fetch(`${imageBaseUrl()}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: imageModel(),
      prompt: request.prompt,
      size: `${request.width}x${request.height}`,
      width: request.width,
      height: request.height,
      response_format: "b64_json",
      reference_images: request.referenceImages,
    }),
  });
  if (!response.ok) {
    throw new Error(`图像模型请求失败：${response.status} ${await response.text()}`);
  }
  const json = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const item = json.data?.[0];
  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
  if (item?.url) {
    const downloaded = await fetch(item.url);
    if (!downloaded.ok) throw new Error("下载生成图片失败");
    return Buffer.from(await downloaded.arrayBuffer());
  }
  throw new Error("图像模型没有返回图片");
}

export function getTextProvider(): TextProvider {
  const kind = textProviderKind();
  return {
    kind,
    model: textModel(),
    async complete(request) {
      if (kind === "mock") {
        throw new Error("mock 文本提供者不应直接调用 complete");
      }
      const content =
        kind === "together"
          ? await togetherText(request)
          : kind === "local"
            ? await localText(request)
            : await openAiText(request);
      if (!content) throw new Error("文本模型返回为空");
      return content;
    },
  };
}

export function getImageProvider(): ImageProvider {
  const kind = imageProviderKind();
  return {
    kind,
    model: imageModel(),
    async generate(request) {
      if (kind === "mock") {
        return drawPlaceholderPanel(request.hint?.characters ?? [], request.hint?.index ?? 1);
      }
      if (kind === "local") return generateLocalImage(request);
      return kind === "together" ? togetherImage(request) : openAiImage(request);
    },
  };
}
