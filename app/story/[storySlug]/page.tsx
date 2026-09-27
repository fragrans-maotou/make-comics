import { Metadata } from "next";
import { getStoryBundleBySlug } from "@/lib/db-actions";
import { StoryEditorClient } from "./story-editor-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storySlug: string }>;
}): Promise<Metadata> {
  const { storySlug: slug } = await params;
  try {
    const result = await getStoryBundleBySlug(slug);
    if (!result) {
      return { title: "找不到这集 | 西游四格" };
    }
    const image = result.story.composedImageUrl || result.panels[0]?.imageUrl || "/placeholder.jpg";
    return {
      title: `${result.story.title} | 西游四格`,
      description: result.story.description || result.story.idea,
      openGraph: { images: [image] },
    };
  } catch {
    return { title: "西游四格" };
  }
}

export default function StoryEditorPage() {
  return <StoryEditorClient />;
}
