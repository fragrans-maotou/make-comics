import assert from "node:assert/strict";
import test from "node:test";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { drawPlaceholderPanel } from "./mock-art";
import { composeStrip, ensureComicFont } from "./compose";

test("composed strip renders Chinese dialogue as ink, not as part of the panel art", async () => {
  ensureComicFont();
  const measure = createCanvas(32, 32).getContext("2d");
  measure.font = '32px "Noto Sans SC"';
  assert.ok(measure.measureText("唐").width > 20);

  const raw = drawPlaceholderPanel(["唐僧", "孙悟空"], 1);
  const rawImage = await loadImage(raw);
  const rawCanvas = createCanvas(rawImage.width, rawImage.height);
  const rawCtx = rawCanvas.getContext("2d");
  rawCtx.drawImage(rawImage, 0, 0);
  const sky = rawCtx.getImageData(0, 0, rawImage.width, Math.floor(rawImage.height * 0.25)).data;
  let skyDark = 0;
  for (let i = 0; i < sky.length; i += 4) {
    if (sky[i] < 50 && sky[i + 1] < 50 && sky[i + 2] < 50) skyDark++;
  }
  assert.ok(skyDark < 30, "placeholder panels should not draw text or bubbles");

  const png = await composeStrip({
    title: "年底述职",
    layout: "vertical",
    panels: [1, 2, 3, 4].map((index) => ({
      image: drawPlaceholderPanel(["唐僧", "孙悟空", "猪八戒", "沙僧"], index),
      dialogue: [
        { speaker: "唐僧", text: "今年KPI看取经", side: "left" as const },
        { speaker: "孙悟空", text: "路程完成百分之八", side: "right" as const },
      ],
    })),
  });
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  const image = await loadImage(png);
  assert.ok(image.height > image.width);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const title = ctx.getImageData(0, 20, image.width, 90).data;
  let titleDark = 0;
  for (let i = 0; i < title.length; i += 4) {
    if (title[i] < 40 && title[i + 1] < 40 && title[i + 2] < 40) titleDark++;
  }
  assert.ok(titleDark > 80, "Chinese title should paint dark pixels");
});
