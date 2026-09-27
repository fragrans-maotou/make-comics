"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_IDEAS } from "@/lib/sample-ideas";

export function ComicCreationForm({
  idea,
  setIdea,
  panelCount,
  setPanelCount,
  layout,
  setLayout,
  isLoading,
  setIsLoading,
}: {
  idea: string;
  setIdea: (idea: string) => void;
  panelCount: number;
  setPanelCount: (count: number) => void;
  layout: "vertical" | "grid";
  setLayout: (layout: "vertical" | "grid") => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [banner, setBanner] = useState<"mock" | "local" | "live">("mock");

  useEffect(() => {
    fetch("/api/config")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.imageProvider === "local") setBanner("local");
        else if (data.mock === false) setBanner("live");
        else setBanner("mock");
      })
      .catch(() => {});
  }, []);

  const createScript = async () => {
    if (!idea.trim()) {
      toast({ title: "先写一个点子", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, panelCount, layout }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "生成剧本失败");
      router.push(`/story/${data.story.slug}`);
    } catch (error) {
      toast({
        title: "剧本没有写成",
        description: error instanceof Error ? error.message : "请再试一次",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SAMPLE_IDEAS.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => setIdea(sample)}
            className={`rounded-full border px-3 py-1 text-left text-xs transition-colors ${
              idea === sample
                ? "border-indigo bg-indigo/15 text-white"
                : "border-border text-muted-foreground hover:text-white"
            }`}
          >
            {sample}
          </button>
        ))}
      </div>

      <textarea
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") createScript();
        }}
        rows={4}
        maxLength={200}
        placeholder="例如：唐僧团队年底述职"
        className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-indigo"
      />

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>格数</span>
        {[4, 5, 6].map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => setPanelCount(count)}
            className={`rounded-md px-2 py-1 ${panelCount === count ? "bg-white text-black" : "bg-secondary"}`}
          >
            {count} 格
          </button>
        ))}
        <span className="ml-2">版式</span>
        <button
          type="button"
          onClick={() => setLayout("vertical")}
          className={`rounded-md px-2 py-1 ${layout === "vertical" ? "bg-white text-black" : "bg-secondary"}`}
        >
          竖条长图
        </button>
        <button
          type="button"
          onClick={() => setLayout("grid")}
          className={`rounded-md px-2 py-1 ${layout === "grid" ? "bg-white text-black" : "bg-secondary"}`}
        >
          田字格
        </button>
      </div>

      {banner === "mock" && (
        <p className="text-xs text-muted-foreground">
          当前是离线示例模式：剧本和分格画面都在本地生成，用来检查气泡里的中文。配好模型钥匙后会改走真实模型。
        </p>
      )}
      {banner === "local" && (
        <p className="text-xs text-muted-foreground">
          画面由你自己的本地生图服务绘制，请求从服务器发出。没有文本钥匙时，剧本仍用示例稿。
        </p>
      )}

      <Button onClick={createScript} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
        生成剧本
      </Button>
    </div>
  );
}
