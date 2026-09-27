import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import {
  getStoryBundleBySlug,
  updateStory,
  updateStoryScript,
  type PanelView,
} from "@/lib/db-actions";
import { composeBundle } from "@/lib/pipeline";
import { presentStory } from "@/lib/present";
import { formatZodError, validateScript, type StripLayout } from "@/lib/script-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ storySlug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { storySlug } = await params;
    const bundle = await getStoryBundleBySlug(storySlug);
    if (!bundle) return NextResponse.json({ error: "找不到这集漫画" }, { status: 404 });
    const auth = await requireUserId();
    const isOwner = auth.ok && bundle.story.userId === auth.userId;
    return NextResponse.json(presentStory(bundle, isOwner));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "读取漫画失败" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireUserId();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { storySlug } = await params;
    const bundle = await getStoryBundleBySlug(storySlug);
    if (!bundle) return NextResponse.json({ error: "找不到这集漫画" }, { status: 404 });
    if (bundle.story.userId !== auth.userId) {
      return NextResponse.json({ error: "只能修改自己的漫画" }, { status: 403 });
    }

    const body = await request.json();
    const layout: StripLayout = body.layout === "grid" ? "grid" : "vertical";
    const title = typeof body.title === "string" ? body.title : bundle.story.title;
    const incoming = Array.isArray(body.panels) ? body.panels : [];
    const merged: PanelView[] = bundle.panels.map((panel) => {
      const edit = incoming.find((item: { panelIndex?: number }) => item?.panelIndex === panel.panelIndex);
      if (!edit) return panel;
      return {
        ...panel,
        scene: typeof edit.scene === "string" ? edit.scene : panel.scene,
        shot: edit.shot === "wide" || edit.shot === "close-up" || edit.shot === "medium" ? edit.shot : panel.shot,
        characters: Array.isArray(edit.characters) ? edit.characters.map(String) : panel.characters,
        dialogue: Array.isArray(edit.dialogue)
          ? edit.dialogue.map((line: { speaker?: string; text?: string; side?: string }) => ({
              speaker: String(line.speaker ?? ""),
              text: String(line.text ?? ""),
              side: line.side === "right" ? "right" : "left",
            }))
          : panel.dialogue,
      };
    });

    const script = validateScript(
      {
        title,
        summary: bundle.story.description ?? undefined,
        panels: merged.map((panel) => ({
          index: panel.panelIndex,
          role: panel.role,
          scene: panel.scene,
          shot: panel.shot,
          characters: panel.characters,
          dialogue: panel.dialogue,
        })),
      },
      merged.length,
    );

    const nextPanels = merged.map((panel, index) => ({
      ...panel,
      scene: script.panels[index].scene,
      shot: script.panels[index].shot,
      characters: script.panels[index].characters,
      dialogue: script.panels[index].dialogue,
    }));

    await updateStoryScript({
      storyId: bundle.story.id,
      title: script.title,
      description: bundle.story.description ?? undefined,
      layout,
      panels: nextPanels,
    });

    let fresh = await getStoryBundleBySlug(storySlug);
    if (fresh && fresh.panels.every((panel) => panel.imageUrl)) {
      fresh = await composeBundle(fresh, layout);
    }
    if (!fresh) return NextResponse.json({ error: "保存后找不到漫画" }, { status: 500 });
    return NextResponse.json(presentStory(fresh, true));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const auth = await requireUserId();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { storySlug } = await params;
    const bundle = await getStoryBundleBySlug(storySlug);
    if (!bundle) return NextResponse.json({ error: "找不到这集漫画" }, { status: 404 });
    if (bundle.story.userId !== auth.userId) {
      return NextResponse.json({ error: "只能修改自己的漫画" }, { status: 403 });
    }
    const { title } = await request.json();
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
    }
    await updateStory(bundle.story.id, { title: title.trim() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "更新标题失败" }, { status: 500 });
  }
}
