"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";

type StoryCard = {
  id: string;
  title: string;
  slug: string;
  pageCount: number;
  coverImage: string | null;
  createdAt: string;
};

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "读取失败");
        setStories(data.stories);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "读取失败"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">我的漫画</h1>
          <Button asChild>
            <Link href="/">新的一集</Link>
          </Button>
        </div>
        {loading && <p className="text-sm text-muted-foreground">正在读取…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && stories.length === 0 && (
          <p className="text-sm text-muted-foreground">还没有漫画。回到首页，用一个点子生成剧本。</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Link key={story.id} href={`/story/${story.slug}`} className="overflow-hidden rounded-xl border border-border bg-card">
              {story.coverImage ? (
                <img src={story.coverImage} alt="" className="h-48 w-full object-cover object-top" />
              ) : (
                <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">还没有画面</div>
              )}
              <div className="p-3">
                <p className="font-medium">{story.title}</p>
                <p className="text-xs text-muted-foreground">{story.pageCount} 格</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
