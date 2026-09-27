import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { listStoriesForUser } from "@/lib/db-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireUserId();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const stories = await listStoriesForUser(auth.userId);
    return NextResponse.json({ stories });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "读取漫画列表失败" }, { status: 500 });
  }
}
