"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import characterConfig from "@/config/characters.json";
import type { DialogueLine, PanelRole, Shot } from "@/lib/script-schema";

const CAST = characterConfig.characters.map((character) => character.name);
const ROLE_LABEL: Record<PanelRole, string> = {
  setup: "起",
  develop: "承",
  turn: "转",
  punchline: "合",
};
const SHOTS: Array<{ id: Shot; label: string }> = [
  { id: "wide", label: "远景" },
  { id: "medium", label: "中景" },
  { id: "close-up", label: "特写" },
];

type PanelForm = {
  id: string;
  panelIndex: number;
  role: PanelRole;
  scene: string;
  shot: Shot;
  characters: string[];
  dialogue: DialogueLine[];
  imageUrl: string | null;
};

type StoryForm = {
  title: string;
  slug: string;
  idea: string;
  layout: "vertical" | "grid";
  composedImageUrl: string | null;
  updatedAt: string;
  isOwner: boolean;
};

function charCount(text: string) {
  return Array.from(text).length;
}

export function StoryEditorClient() {
  const params = useParams();
  const slug = params.storySlug as string;
  const { toast } = useToast();
  const [story, setStory] = useState<StoryForm | null>(null);
  const [panels, setPanels] = useState<PanelForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState<number | null>(null);

  const apply = (data: { story: StoryForm & { description?: string | null }; panels: PanelForm[] }) => {
    setStory({
      title: data.story.title,
      slug: data.story.slug,
      idea: data.story.idea,
      layout: data.story.layout === "grid" ? "grid" : "vertical",
      composedImageUrl: data.story.composedImageUrl,
      updatedAt: data.story.updatedAt,
      isOwner: data.story.isOwner,
    });
    setPanels(data.panels);
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stories/${slug}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "读取失败");
        if (!cancelled) apply(data);
      })
      .catch((error) => {
        toast({
          title: "没有打开这集漫画",
          description: error instanceof Error ? error.message : "",
          variant: "destructive",
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, toast]);

  const payload = () => ({
    title: story?.title,
    layout: story?.layout,
    panels: panels.map((panel) => ({
      panelIndex: panel.panelIndex,
      scene: panel.scene,
      shot: panel.shot,
      characters: panel.characters,
      dialogue: panel.dialogue,
    })),
  });

  const persist = async () => {
    const response = await fetch(`/api/stories/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存失败");
    apply(data);
    return data;
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = await persist();
      toast({ title: data.story.composedImageUrl ? "对白已更新到长图" : "剧本已保存" });
    } catch (error) {
      toast({
        title: "没有保存",
        description: error instanceof Error ? error.message : "",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      await persist();
      const response = await fetch(`/api/stories/${slug}/generate`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "出图失败");
      apply(data);
      toast({ title: "长图已经合成" });
    } catch (error) {
      toast({
        title: "画面没有生成",
        description: error instanceof Error ? error.message : "",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const regenerate = async (panelIndex: number) => {
    setRegenerating(panelIndex);
    try {
      await persist();
      const response = await fetch(`/api/stories/${slug}/panels/${panelIndex}/regenerate`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "重画失败");
      apply(data);
      toast({ title: `第 ${panelIndex} 格已重画` });
    } catch (error) {
      toast({
        title: "这一格没有重画",
        description: error instanceof Error ? error.message : "",
        variant: "destructive",
      });
    } finally {
      setRegenerating(null);
    }
  };

  const updatePanel = (index: number, patch: Partial<PanelForm>) => {
    setPanels((current) => current.map((panel) => (panel.panelIndex === index ? { ...panel, ...patch } : panel)));
  };

  if (loading || !story) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          正在打开剧本
        </div>
      </div>
    );
  }

  const preview = story.composedImageUrl
    ? `${story.composedImageUrl}${story.composedImageUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(story.updatedAt)}`
    : null;
  const locked = !story.isOwner;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">点子：{story.idea}</p>
            <input
              value={story.title}
              disabled={locked}
              onChange={(event) => setStory({ ...story, title: event.target.value })}
              className="mt-1 w-full bg-transparent text-3xl font-semibold outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={locked || saving || generating}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              保存对白
            </Button>
            <Button onClick={generate} disabled={locked || generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              生成画面
            </Button>
            <Button
              variant="secondary"
              disabled={!preview}
              onClick={() => {
                window.location.href = `/api/stories/${slug}/export?format=png`;
              }}
            >
              下载长图 PNG
            </Button>
            <Button
              variant="secondary"
              disabled={!preview}
              onClick={() => {
                window.location.href = `/api/stories/${slug}/export?format=pdf`;
              }}
            >
              下载 PDF
            </Button>
            <button
              type="button"
              disabled={locked}
              onClick={() => setStory({ ...story, layout: story.layout === "grid" ? "vertical" : "grid" })}
              className="rounded-md bg-secondary px-3 text-xs"
            >
              {story.layout === "grid" ? "当前：田字格" : "当前：竖条长图"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            人物按
            <Link href="/characters" className="mx-1 underline">
              角色设定
            </Link>
            来画，Q 版大头小身。改对白后点「保存对白」，气泡会重画，格子画面不动。
          </p>
          {panels.map((panel) => (
            <article key={panel.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium">
                  第 {panel.panelIndex} 格 · {ROLE_LABEL[panel.role]}
                </h2>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={locked || regenerating === panel.panelIndex || generating}
                  onClick={() => regenerate(panel.panelIndex)}
                >
                  {regenerating === panel.panelIndex ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  重画这一格
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {SHOTS.map((shot) => (
                  <button
                    key={shot.id}
                    type="button"
                    disabled={locked}
                    onClick={() => updatePanel(panel.panelIndex, { shot: shot.id })}
                    className={`rounded-md px-2 py-1 ${panel.shot === shot.id ? "bg-white text-black" : "bg-secondary"}`}
                  >
                    {shot.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {CAST.map((name) => {
                  const on = panel.characters.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      disabled={locked}
                      onClick={() =>
                        updatePanel(panel.panelIndex, {
                          characters: on
                            ? panel.characters.filter((item) => item !== name)
                            : [...panel.characters, name],
                        })
                      }
                      className={`rounded-full border px-2 py-1 ${on ? "border-indigo text-white" : "border-border text-muted-foreground"}`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
              <label className="block text-xs text-muted-foreground">
                画面描述（给图像模型，建议英文）
                <textarea
                  value={panel.scene}
                  disabled={locked}
                  rows={3}
                  onChange={(event) => updatePanel(panel.panelIndex, { scene: event.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              {panel.dialogue.map((line, lineIndex) => (
                <div key={lineIndex} className="grid grid-cols-[7rem_1fr_auto] items-center gap-2">
                  <select
                    value={line.speaker}
                    disabled={locked}
                    onChange={(event) => {
                      const dialogue = panel.dialogue.map((item, index) =>
                        index === lineIndex ? { ...item, speaker: event.target.value } : item,
                      );
                      updatePanel(panel.panelIndex, { dialogue });
                    }}
                    className="rounded-md border border-border bg-background px-2 py-2 text-sm"
                  >
                    {CAST.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                  <input
                    value={line.text}
                    disabled={locked}
                    onChange={(event) => {
                      const dialogue = panel.dialogue.map((item, index) =>
                        index === lineIndex ? { ...item, text: event.target.value } : item,
                      );
                      updatePanel(panel.panelIndex, { dialogue });
                    }}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                  <span className={charCount(line.text) > 15 ? "text-xs text-red-400" : "text-xs text-muted-foreground"}>
                    {charCount(line.text)}/15
                  </span>
                </div>
              ))}
              {panel.imageUrl && (
                <img
                  src={`${panel.imageUrl}?v=${encodeURIComponent(story.updatedAt)}`}
                  alt={`第 ${panel.panelIndex} 格画面`}
                  className="h-28 rounded-md border border-border object-cover"
                />
              )}
            </article>
          ))}
        </section>
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-3">
            <h2 className="mb-2 text-sm">合成预览</h2>
            {preview ? (
              <div className="max-h-[80vh] overflow-y-auto">
                <img src={preview} alt={story.title} className="w-full rounded-md" />
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">确认剧本后，再生成画面。</p>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
