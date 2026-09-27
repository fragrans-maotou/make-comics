import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { getStoryBundleBySlug } from "@/lib/db-actions";
import { generatePanels } from "@/lib/pipeline";
import { presentStory } from "@/lib/present";
import { consumeCredit } from "@/lib/rate-limit";
import { imageProviderKind } from "@/lib/runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 1200;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ storySlug: string; index: string }> },
) {
  try {
    const auth = await requireUserId();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { storySlug, index } = await params;
    const panelIndex = Number(index);
    if (!Number.isInteger(panelIndex)) {
      return NextResponse.json({ error: "格号不正确" }, { status: 400 });
    }
    const bundle = await getStoryBundleBySlug(storySlug);
    if (!bundle) return NextResponse.json({ error: "找不到这集漫画" }, { status: 404 });
    if (bundle.story.userId !== auth.userId) {
      return NextResponse.json({ error: "只能重画自己的漫画" }, { status: 403 });
    }
    if (imageProviderKind() !== "mock") {
      const credit = await consumeCredit(auth.userId);
      if (!credit.ok) return NextResponse.json({ error: "免费额度已用完" }, { status: 429 });
    }
    const fresh = await generatePanels(bundle.story.id, panelIndex);
    return NextResponse.json(presentStory(fresh, true));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "重画失败" },
      { status: 500 },
    );
  }
}
