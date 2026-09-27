import { NextResponse } from "next/server";

export async function DELETE() {
  return NextResponse.json({ error: "删页接口已停用。" }, { status: 410 });
}
