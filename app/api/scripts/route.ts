import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { createStoryWithScript } from "@/lib/db-actions";
import { presentStory } from "@/lib/present";
import { formatZodError } from "@/lib/script-schema";
import { generateScript } from "@/lib/script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await requireUserId();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const body = await request.json();
    const idea = typeof body.idea === "string" ? body.idea.trim() : "";
    const panelCount = Number(body.panelCount ?? 4);
    const layout = body.layout === "grid" ? "grid" : "vertical";
    if (!idea) {
      return NextResponse.json({ error: "请先写一个点子" }, { status: 400 });
    }
    if (Array.from(idea).length > 200) {
      return NextResponse.json({ error: "点子请控制在 200 字以内" }, { status: 400 });
    }
    if (![4, 5, 6].includes(panelCount)) {
      return NextResponse.json({ error: "格数只能是 4、5 或 6" }, { status: 400 });
    }
    const script = await generateScript(idea, panelCount);
    const bundle = await createStoryWithScript({
      userId: auth.userId,
      idea,
      layout,
      script,
    });
    return NextResponse.json(presentStory(bundle, true));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
  }
}
