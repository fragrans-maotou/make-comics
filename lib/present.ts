import type { StoryBundle } from "./db-actions";

export function presentStory(bundle: StoryBundle, isOwner: boolean) {
  return {
    story: {
      id: bundle.story.id,
      slug: bundle.story.slug,
      title: bundle.story.title,
      description: bundle.story.description,
      idea: bundle.story.idea,
      layout: bundle.story.layout,
      style: bundle.story.style,
      status: bundle.story.status,
      composedImageUrl: bundle.story.composedImageUrl,
      updatedAt: bundle.story.updatedAt.toISOString(),
      isOwner,
    },
    panels: bundle.panels,
  };
}
