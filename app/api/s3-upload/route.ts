import { NextRequest, NextResponse } from "next/server";
import { s3Enabled } from "@/lib/runtime-config";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!s3Enabled()) {
    return NextResponse.json(
      { error: "当前使用本地文件存储，浏览器不需要直传 S3。" },
      { status: 400 },
    );
  }
  const mod = await import("next-s3-upload/route");
  return mod.POST(request);
}
