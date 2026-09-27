import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "整页一次出图已停用。请在首页生成分镜剧本，确认后再逐格出图。" },
    { status: 410 },
  );
}
