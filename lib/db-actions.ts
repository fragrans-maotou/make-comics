import { and, desc, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "./db";
import { feedback, panels, stories, type Feedback, type Panel, type Story } from "./schema";
import { generateComicSlug } from "./slug-generator";
import type { ComicScript, DialogueLine, StripLayout } from "./script-schema";

export type PanelView = {
  id: string;
  panelIndex: number;
  role: ComicScript["panels"][number]["role"];
  scene: string;
  shot: ComicScript["panels"][number]["shot"];
  characters: string[];
  dialogue: DialogueLine[];
  imageUrl: string | null;
};

export type StoryBundle = {
  story: Story;
  panels: PanelView[];
};

function toView(panel: Panel): PanelView {
  return {
    id: panel.id,
    panelIndex: panel.panelIndex,
    role: panel.role as PanelView["role"],
    scene: panel.scene,
    shot: panel.shot as PanelView["shot"],
    characters: JSON.parse(panel.charactersJson) as string[],
    dialogue: JSON.parse(panel.dialogueJson) as DialogueLine[],
    imageUrl: panel.imageUrl,
  };
}

async function uniqueSlug() {
  let slug = generateComicSlug();
  for (let attempt = 0; attempt < 8; attempt++) {
    const existing = await db.select({ id: stories.id }).from(stories).where(eq(stories.slug, slug)).limit(1);
    if (existing.length === 0) return slug;
    slug = generateComicSlug();
  }
  return `story-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createStoryWithScript(input: {
  userId: string;
  idea: string;
  layout: StripLayout;
  script: ComicScript;
}) {
  const now = new Date();
  const slug = await uniqueSlug();
  const storyId = crypto.randomUUID();
  await db.insert(stories).values({
    id: storyId,
    title: input.script.title,
    slug,
    description: input.script.summary ?? input.idea,
    idea: input.idea,
    style: "xiyou-chibi",
    layout: input.layout,
    userId: input.userId,
    scriptJson: JSON.stringify(input.script),
    status: "script",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(panels).values(
    input.script.panels.map((panel) => ({
      id: crypto.randomUUID(),
      storyId,
      panelIndex: panel.index,
      role: panel.role,
      scene: panel.scene,
      shot: panel.shot,
      charactersJson: JSON.stringify(panel.characters),
      dialogueJson: JSON.stringify(panel.dialogue),
      createdAt: now,
      updatedAt: now,
    })),
  );

  const bundle = await getStoryBundleBySlug(slug);
  if (!bundle) throw new Error("保存剧本失败");
  return bundle;
}

export async function getStoryBundleBySlug(slug: string): Promise<StoryBundle | null> {
  const storyResult = await db.select().from(stories).where(eq(stories.slug, slug)).limit(1);
  if (storyResult.length === 0) return null;
  const story = storyResult[0];
  const rows = await db
    .select()
    .from(panels)
    .where(eq(panels.storyId, story.id))
    .orderBy(panels.panelIndex);
  return { story, panels: rows.map(toView) };
}

export async function getStoryBundleById(storyId: string): Promise<StoryBundle | null> {
  const storyResult = await db.select().from(stories).where(eq(stories.id, storyId)).limit(1);
  if (storyResult.length === 0) return null;
  return getStoryBundleBySlug(storyResult[0].slug);
}

export async function updateStoryScript(input: {
  storyId: string;
  title: string;
  description?: string;
  layout: StripLayout;
  panels: PanelView[];
}) {
  const now = new Date();
  const script: ComicScript = {
    title: input.title,
    summary: input.description,
    panels: input.panels.map((panel) => ({
      index: panel.panelIndex,
      role: panel.role,
      scene: panel.scene,
      shot: panel.shot,
      characters: panel.characters,
      dialogue: panel.dialogue,
    })),
  };
  await db
    .update(stories)
    .set({
      title: input.title,
      description: input.description,
      layout: input.layout,
      scriptJson: JSON.stringify(script),
      updatedAt: now,
    })
    .where(eq(stories.id, input.storyId));

  for (const panel of input.panels) {
    await db
      .update(panels)
      .set({
        scene: panel.scene,
        shot: panel.shot,
        charactersJson: JSON.stringify(panel.characters),
        dialogueJson: JSON.stringify(panel.dialogue),
        updatedAt: now,
      })
      .where(and(eq(panels.id, panel.id), eq(panels.storyId, input.storyId)));
  }
}

export async function updatePanelImage(panelId: string, imageUrl: string) {
  await db
    .update(panels)
    .set({ imageUrl, updatedAt: new Date() })
    .where(eq(panels.id, panelId));
}

export async function updateComposedImage(storyId: string, imageUrl: string) {
  await db
    .update(stories)
    .set({ composedImageUrl: imageUrl, status: "ready", updatedAt: new Date() })
    .where(eq(stories.id, storyId));
}

export async function listStoriesForUser(userId: string) {
  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      style: stories.style,
      createdAt: stories.createdAt,
      updatedAt: stories.updatedAt,
      composedImageUrl: stories.composedImageUrl,
      panelIndex: panels.panelIndex,
      imageUrl: panels.imageUrl,
    })
    .from(stories)
    .leftJoin(panels, eq(stories.id, panels.storyId))
    .where(eq(stories.userId, userId))
    .orderBy(desc(stories.updatedAt));

  const map = new Map<
    string,
    {
      id: string;
      title: string;
      slug: string;
      style: string;
      createdAt: Date;
      lastUpdated: Date;
      pageCount: number;
      coverImage: string | null;
    }
  >();

  for (const row of rows) {
    const current = map.get(row.id) ?? {
      id: row.id,
      title: row.title,
      slug: row.slug,
      style: row.style,
      createdAt: row.createdAt,
      lastUpdated: row.updatedAt,
      pageCount: 0,
      coverImage: row.composedImageUrl,
    };
    if (row.panelIndex) current.pageCount += 1;
    if (!current.coverImage && row.panelIndex === 1 && row.imageUrl) {
      current.coverImage = row.imageUrl;
    }
    map.set(row.id, current);
  }
  return [...map.values()];
}

export async function createFeedback(data: { message: string; userId?: string }): Promise<Feedback> {
  const [entry] = await db
    .insert(feedback)
    .values({ message: data.message, userId: data.userId, createdAt: new Date() })
    .returning();
  return entry;
}

export async function getPagesGeneratedLast24Hours() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await db
    .select({ id: panels.id })
    .from(panels)
    .where(and(isNotNull(panels.imageUrl), gte(panels.createdAt, since)));
  return rows.length;
}

export async function updateStory(storyId: string, data: { title?: string; description?: string }) {
  await db
    .update(stories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(stories.id, storyId));
}
