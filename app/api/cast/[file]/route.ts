import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-z0-9-]+\.png$/.test(file)) {
    return NextResponse.json({ error: "找不到设定图" }, { status: 404 });
  }
  try {
    const full = path.join(process.cwd(), "characters", "refs", file);
    const body = await fs.readFile(full);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "找不到设定图" }, { status: 404 });
  }
}
