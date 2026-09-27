import { getImageProvider } from "./ai";
import { buildPanelPrompt } from "./panel-prompt";
import { composeStrip } from "./compose";
import {
  getStoryBundleById,
  updateComposedImage,
  updatePanelImage,
  type PanelView,
  type StoryBundle,
} from "./db-actions";
import { imageSize } from "./runtime-config";
import type { StripLayout } from "./script-schema";
import { readMedia, saveMedia } from "./storage";

async function drawPanel(panel: PanelView) {
  const { prompt, referenceImages } = buildPanelPrompt({
    index: panel.panelIndex,
    role: panel.role,
    scene: panel.scene,
    shot: panel.shot,
    characters: panel.characters,
    dialogue: panel.dialogue,
  });
  const size = imageSize();
  const provider = getImageProvider();
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await provider.generate({
        prompt,
        width: size.width,
        height: size.height,
        referenceImages,
        hint: { characters: panel.characters, index: panel.panelIndex },
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("画面生成失败");
}

export async function composeBundle(bundle: StoryBundle, layout?: StripLayout) {
  if (bundle.panels.some((panel) => !panel.imageUrl)) return bundle;
  const images = await Promise.all(bundle.panels.map((panel) => readMedia(panel.imageUrl!)));
  const png = await composeStrip({
    title: bundle.story.title,
    layout: layout ?? (bundle.story.layout === "grid" ? "grid" : "vertical"),
    panels: bundle.panels.map((panel, index) => ({
      image: images[index],
      dialogue: panel.dialogue,
    })),
  });
  const url = await saveMedia(`stories/${bundle.story.id}/strip.png`, png, "image/png");
  await updateComposedImage(bundle.story.id, url);
  return (await getStoryBundleById(bundle.story.id)) ?? bundle;
}

export async function generatePanels(storyId: string, onlyIndex?: number) {
  const bundle = await getStoryBundleById(storyId);
  if (!bundle) throw new Error("找不到这集漫画");
  const targets = bundle.panels.filter((panel) => (onlyIndex ? panel.panelIndex === onlyIndex : true));
  if (targets.length === 0) throw new Error("没有这一格");

  for (const panel of targets) {
    const png = await drawPanel(panel);
    const url = await saveMedia(
      `stories/${storyId}/panel-${panel.panelIndex}.png`,
      png,
      "image/png",
    );
    await updatePanelImage(panel.id, url);
  }

  const fresh = await getStoryBundleById(storyId);
  if (!fresh) throw new Error("找不到这集漫画");
  return composeBundle(fresh);
}
