import fs from "node:fs";
import path from "node:path";
import { createCanvas, GlobalFonts, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import type { DialogueLine, StripLayout } from "./script-schema";

const PANEL_W = 720;
const PANEL_H = 720;
const GUTTER = 18;
const MARGIN = 28;
const TITLE_H = 120;

const SPEAKER_COLOR: Record<string, string> = {
  唐僧: "#b43333",
  孙悟空: "#c98400",
  猪八戒: "#c45b86",
  沙僧: "#3e6d8c",
  白龙马: "#3d8fb5",
};

let fontReady = false;

export function ensureComicFont() {
  if (fontReady) return;
  const fontPath = path.join(process.cwd(), "assets/fonts/NotoSansSC-Regular.woff");
  if (!fs.existsSync(fontPath)) {
    throw new Error(`缺少中文字体：${fontPath}`);
  }
  GlobalFonts.registerFromPath(fontPath, "Noto Sans SC");
  fontReady = true;
}

function roundRect(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBubble(
  ctx: SKRSContext2D,
  line: DialogueLine,
  box: { x: number; y: number; w: number },
) {
  ensureComicFont();
  const text = line.text;
  const size = Array.from(text).length <= 8 ? 34 : Array.from(text).length <= 12 ? 30 : 26;
  ctx.font = `${size}px "Noto Sans SC"`;
  const textWidth = ctx.measureText(text).width;
  const bubbleW = Math.min(box.w - 36, Math.max(180, textWidth + 56));
  const bubbleH = 78;
  const left =
    line.side === "right" ? box.x + box.w - bubbleW - 24 : box.x + 24;
  const top = box.y;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#161616";
  ctx.lineWidth = 4;
  roundRect(ctx, left, top, bubbleW, bubbleH, 22);
  ctx.fill();
  ctx.stroke();

  const tailX = line.side === "right" ? left + bubbleW * 0.72 : left + bubbleW * 0.28;
  ctx.beginPath();
  ctx.moveTo(tailX - 12, top + bubbleH - 2);
  ctx.lineTo(tailX + 14, top + bubbleH - 2);
  ctx.lineTo(tailX + (line.side === "right" ? 20 : -8), top + bubbleH + 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = SPEAKER_COLOR[line.speaker] || "#333";
  ctx.font = `18px "Noto Sans SC"`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(line.speaker, left + 18, top + 8);

  ctx.fillStyle = "#161616";
  ctx.font = `${size}px "Noto Sans SC"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, left + bubbleW / 2, top + 48);
}

function slots(count: number, layout: StripLayout) {
  if (layout === "vertical" || count <= 3) {
    return {
      cols: 1,
      width: MARGIN * 2 + PANEL_W,
      height: MARGIN * 2 + TITLE_H + count * PANEL_H + (count - 1) * GUTTER,
      positions: Array.from({ length: count }, (_, index) => ({
        x: MARGIN,
        y: MARGIN + TITLE_H + index * (PANEL_H + GUTTER),
      })),
    };
  }
  const cols = 2;
  const rows = Math.ceil(count / cols);
  const width = MARGIN * 2 + cols * PANEL_W + (cols - 1) * GUTTER;
  const height = MARGIN * 2 + TITLE_H + rows * PANEL_H + (rows - 1) * GUTTER;
  const positions = Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const rowCount = row === rows - 1 ? count - row * cols : cols;
    const rowWidth = rowCount * PANEL_W + (rowCount - 1) * GUTTER;
    const offset = (width - MARGIN * 2 - rowWidth) / 2;
    return {
      x: MARGIN + offset + col * (PANEL_W + GUTTER),
      y: MARGIN + TITLE_H + row * (PANEL_H + GUTTER),
    };
  });
  return { cols, width, height, positions };
}

export async function composeStrip(input: {
  title: string;
  layout: StripLayout;
  panels: Array<{ image: Buffer; dialogue: DialogueLine[] }>;
}) {
  ensureComicFont();
  const layout = slots(input.panels.length, input.layout);
  const canvas = createCanvas(layout.width, layout.height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f6f1e4";
  ctx.fillRect(0, 0, layout.width, layout.height);

  ctx.fillStyle = "#161616";
  ctx.font = `48px "Noto Sans SC"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(input.title, layout.width / 2, MARGIN + TITLE_H / 2);

  for (let index = 0; index < input.panels.length; index++) {
    const slot = layout.positions[index];
    const panel = input.panels[index];
    const image = await loadImage(panel.image);
    ctx.fillStyle = "#d7ebf8";
    ctx.fillRect(slot.x, slot.y, PANEL_W, PANEL_H);
    const scale = Math.min(PANEL_W / image.width, PANEL_H / image.height);
    const dw = image.width * scale;
    const dh = image.height * scale;
    ctx.drawImage(image, slot.x + (PANEL_W - dw) / 2, slot.y + (PANEL_H - dh) / 2, dw, dh);
    ctx.strokeStyle = "#161616";
    ctx.lineWidth = 6;
    ctx.strokeRect(slot.x + 3, slot.y + 3, PANEL_W - 6, PANEL_H - 6);
    panel.dialogue.slice(0, 2).forEach((line, lineIndex) => {
      drawBubble(ctx, line, {
        x: slot.x,
        y: slot.y + 16 + lineIndex * 104,
        w: PANEL_W,
      });
    });
  }

  ctx.strokeStyle = "#161616";
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, layout.width - 10, layout.height - 10);
  return canvas.toBuffer("image/png");
}
