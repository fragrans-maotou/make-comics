import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "续页接口已停用。一集短漫就是一条 4 到 6 格的长图。" },
    { status: 410 },
  );
}
