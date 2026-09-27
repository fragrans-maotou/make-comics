import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { mediaFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: parts } = await params;
    const file = mediaFile(parts);
    const body = await fs.readFile(file);
    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "找不到文件" }, { status: 404 });
  }
}
