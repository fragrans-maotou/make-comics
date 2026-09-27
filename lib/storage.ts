import fs from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { s3Enabled } from "./runtime-config";

const MEDIA_ROOT = path.resolve(process.cwd(), "data", "media");

function safePath(relativePath: string) {
  const cleaned = relativePath.replace(/^\/+/, "");
  if (cleaned.includes("..")) throw new Error("非法路径");
  const full = path.resolve(MEDIA_ROOT, cleaned);
  if (full !== MEDIA_ROOT && !full.startsWith(MEDIA_ROOT + path.sep)) {
    throw new Error("非法路径");
  }
  return full;
}

let s3: S3Client | null = null;

function s3Client() {
  if (!s3Enabled()) return null;
  if (!s3) {
    s3 = new S3Client({
      region: process.env.S3_UPLOAD_REGION,
      credentials: {
        accessKeyId: process.env.S3_UPLOAD_KEY!,
        secretAccessKey: process.env.S3_UPLOAD_SECRET!,
      },
    });
  }
  return s3;
}

export async function saveMedia(relativePath: string, body: Buffer, contentType: string) {
  const full = safePath(relativePath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, body);
  const client = s3Client();
  if (client) {
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_UPLOAD_BUCKET!,
          Key: `comics/${relativePath}`,
          Body: body,
          ContentType: contentType,
        }),
      );
      return `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com/comics/${relativePath}`;
    } catch (error) {
      console.error("S3 upload failed, keeping local file", error);
    }
  }
  const encoded = relativePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `/api/media/${encoded}`;
}

export async function readMedia(urlOrPath: string) {
  if (urlOrPath.startsWith("/api/media/")) {
    const relative = urlOrPath
      .slice("/api/media/".length)
      .split("/")
      .map((part) => decodeURIComponent(part))
      .join("/");
    return fs.readFile(safePath(relative));
  }
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    const response = await fetch(urlOrPath);
    if (!response.ok) throw new Error(`读取图片失败：${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }
  return fs.readFile(urlOrPath);
}

export function mediaFile(relativeParts: string[]) {
  return safePath(relativeParts.map((part) => decodeURIComponent(part)).join("/"));
}

export function mediaRoot() {
  return MEDIA_ROOT;
}
