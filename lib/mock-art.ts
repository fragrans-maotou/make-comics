import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";

const SKIES = ["#c5e4f7", "#f6d7a8", "#e7d2f2", "#d7efd4", "#f8d0c4", "#d5e2f6"];
const GROUNDS = ["#e6d3a3", "#e8c99a", "#d9c4ae", "#cfe0b8", "#efd2b0", "#d8d0ea"];

type Facing = "front" | "side";

function strokeFill(ctx: SKRSContext2D) {
  ctx.fill();
  ctx.stroke();
}

function eye(ctx: SKRSContext2D, x: number, y: number, r = 2.4) {
  ctx.fillStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawTang(ctx: SKRSContext2D, facing: Facing) {
  ctx.fillStyle = "#9e2a2b";
  ctx.beginPath();
  ctx.roundRect(-26, -78, 52, 62, 12);
  strokeFill(ctx);
  ctx.fillStyle = "#f4e2c4";
  ctx.fillRect(-16, -78, 32, 14);
  ctx.strokeRect(-16, -78, 32, 14);
  ctx.fillStyle = "#e1b000";
  ctx.fillRect(-18, -66, 36, 5);

  ctx.fillStyle = "#f6d7b8";
  ctx.beginPath();
  ctx.arc(0, -108, 28, 0, Math.PI * 2);
  strokeFill(ctx);
  ctx.strokeStyle = "#e1b000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -116, 16, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 4;

  const shift = facing === "side" ? 8 : 0;
  eye(ctx, -8 + shift, -110);
  if (facing === "front") eye(ctx, 8, -110);
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(shift, -100, 6, 0.15, Math.PI - 0.15);
  ctx.stroke();
  ctx.lineWidth = 4;

  ctx.strokeStyle = "#8a5a2b";
  ctx.beginPath();
  ctx.moveTo(30, -70);
  ctx.lineTo(34, 4);
  ctx.stroke();
  ctx.strokeStyle = "#1c1c1c";
  ctx.fillStyle = "#c9843a";
  ctx.beginPath();
  ctx.arc(34, 2, 5, 0, Math.PI * 2);
  strokeFill(ctx);
}

function drawWukong(ctx: SKRSContext2D, facing: Facing) {
  ctx.fillStyle = "#d35400";
  ctx.beginPath();
  ctx.roundRect(-24, -72, 48, 36, 8);
  strokeFill(ctx);
  ctx.fillStyle = "#f0c27a";
  ctx.fillRect(-22, -40, 44, 22);
  ctx.strokeRect(-22, -40, 44, 22);
  ctx.strokeStyle = "#6b3a1f";
  ctx.lineWidth = 3;
  for (const y of [-34, -26]) {
    ctx.beginPath();
    ctx.moveTo(-18, y);
    ctx.lineTo(18, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 4;

  ctx.fillStyle = "#e1b000";
  ctx.beginPath();
  ctx.ellipse(-30, -108, 8, 11, -0.4, 0, Math.PI * 2);
  if (facing === "front") ctx.ellipse(30, -108, 8, 11, 0.4, 0, Math.PI * 2);
  strokeFill(ctx);

  ctx.fillStyle = "#c9843a";
  ctx.beginPath();
  ctx.arc(0, -104, 28, 0, Math.PI * 2);
  strokeFill(ctx);
  ctx.fillStyle = "#f6d7b8";
  ctx.beginPath();
  ctx.ellipse(facing === "side" ? 8 : 0, -100, 16, 18, 0, 0, Math.PI * 2);
  strokeFill(ctx);
  ctx.fillStyle = "#e1b000";
  ctx.beginPath();
  ctx.moveTo(-8, -128);
  ctx.lineTo(0, -142);
  ctx.lineTo(8, -128);
  ctx.closePath();
  strokeFill(ctx);
  ctx.strokeStyle = "#e1b000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -112, 18, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 4;

  const shift = facing === "side" ? 8 : 0;
  eye(ctx, -7 + shift, -104);
  if (facing === "front") eye(ctx, 7, -104);

  ctx.beginPath();
  ctx.moveTo(18, -30);
  ctx.quadraticCurveTo(56, -70, 40, 2);
  ctx.stroke();

  ctx.strokeStyle = "#e1b000";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-46, 4);
  ctx.lineTo(-42, -86);
  ctx.stroke();
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 4;
}

function drawBajie(ctx: SKRSContext2D, facing: Facing) {
  ctx.fillStyle = "#1f6f78";
  ctx.beginPath();
  ctx.roundRect(-26, -70, 52, 34, 8);
  strokeFill(ctx);
  ctx.fillStyle = "#8d5a32";
  ctx.beginPath();
  ctx.roundRect(-22, -40, 44, 24, 6);
  strokeFill(ctx);

  ctx.fillStyle = "#f4b6c6";
  ctx.beginPath();
  ctx.ellipse(-24, -132, 10, 14, -0.5, 0, Math.PI * 2);
  if (facing === "front") ctx.ellipse(24, -132, 10, 14, 0.5, 0, Math.PI * 2);
  strokeFill(ctx);
  ctx.beginPath();
  ctx.arc(0, -104, 30, 0, Math.PI * 2);
  strokeFill(ctx);

  const shift = facing === "side" ? 10 : 0;
  ctx.fillStyle = "#f08aa4";
  ctx.beginPath();
  ctx.ellipse(shift, -94, 12, 8, 0, 0, Math.PI * 2);
  strokeFill(ctx);
  eye(ctx, shift - 4, -96, 1.4);
  if (facing === "front") eye(ctx, shift + 4, -96, 1.4);
  eye(ctx, -8 + shift, -108);
  if (facing === "front") eye(ctx, 8, -108);

  ctx.strokeStyle = "#8d5a32";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(32, -78);
  ctx.lineTo(32, 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, -78);
  ctx.lineTo(32, -78);
  ctx.lineTo(44, -78);
  ctx.moveTo(20, -78);
  ctx.lineTo(20, -90);
  ctx.moveTo(32, -78);
  ctx.lineTo(32, -92);
  ctx.moveTo(44, -78);
  ctx.lineTo(44, -90);
  ctx.stroke();
  ctx.strokeStyle = "#1c1c1c";
}

function drawSha(ctx: SKRSContext2D, facing: Facing) {
  ctx.fillStyle = "#8d5a32";
  ctx.beginPath();
  ctx.roundRect(-24, -78, 48, 64, 10);
  strokeFill(ctx);
  ctx.fillStyle = "#c9843a";
  ctx.fillRect(-14, -78, 28, 12);

  ctx.fillStyle = "#8ea4b8";
  ctx.beginPath();
  ctx.arc(0, -108, 26, 0, Math.PI * 2);
  strokeFill(ctx);
  const shift = facing === "side" ? 6 : 0;
  ctx.strokeStyle = "#5c6b78";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(shift - 7, -100);
  ctx.quadraticCurveTo(shift, -94, shift + 7, -100);
  ctx.stroke();
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineWidth = 4;

  eye(ctx, -7 + shift, -110);
  if (facing === "front") eye(ctx, 7, -110);

  ctx.fillStyle = "#f2e2c4";
  const beads = facing === "front" ? [-12, -4, 4, 12] : [-4, 4, 12];
  for (const x of beads) {
    ctx.beginPath();
    ctx.arc(x, -78, 3.2, 0, Math.PI * 2);
    strokeFill(ctx);
  }

  ctx.strokeStyle = "#6b3a1f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-34, -60);
  ctx.lineTo(-34, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-34, -66, 10, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();
  ctx.strokeStyle = "#1c1c1c";
}

function drawHorse(ctx: SKRSContext2D) {
  ctx.fillStyle = "#f7f7f7";
  ctx.beginPath();
  ctx.ellipse(0, -36, 52, 26, 0, 0, Math.PI * 2);
  strokeFill(ctx);
  ctx.beginPath();
  ctx.ellipse(48, -62, 20, 16, 0, 0, Math.PI * 2);
  strokeFill(ctx);
  ctx.fillStyle = "#d8ecf8";
  ctx.beginPath();
  ctx.moveTo(36, -70);
  ctx.quadraticCurveTo(20, -96, 8, -58);
  ctx.quadraticCurveTo(24, -64, 36, -70);
  strokeFill(ctx);
  ctx.fillStyle = "#f7f7f7";
  ctx.beginPath();
  ctx.moveTo(34, -74);
  ctx.lineTo(30, -92);
  ctx.lineTo(40, -74);
  ctx.moveTo(44, -76);
  ctx.lineTo(46, -94);
  ctx.lineTo(52, -74);
  ctx.fill();
  ctx.stroke();
  eye(ctx, 54, -64, 2);
  ctx.strokeStyle = "#1c1c1c";
  ctx.beginPath();
  ctx.moveTo(-48, -28);
  ctx.quadraticCurveTo(-70, -48, -62, -8);
  ctx.stroke();
  ctx.fillStyle = "#d64545";
  ctx.fillRect(-16, -48, 30, 10);
  ctx.strokeRect(-16, -48, 30, 10);
  for (const x of [-28, -10, 16, 30]) {
    ctx.beginPath();
    ctx.moveTo(x, -16);
    ctx.lineTo(x - 2, 4);
    ctx.stroke();
  }
}

function drawCharacter(ctx: SKRSContext2D, name: string, facing: Facing) {
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (name === "孙悟空") drawWukong(ctx, facing);
  else if (name === "猪八戒") drawBajie(ctx, facing);
  else if (name === "沙僧") drawSha(ctx, facing);
  else if (name === "白龙马") drawHorse(ctx);
  else drawTang(ctx, facing);
  ctx.restore();
}

export function drawCharacterSheet(name: string, facing: Facing = "front") {
  const canvas = createCanvas(768, 1024);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f7f1e6";
  ctx.fillRect(0, 0, 768, 1024);
  ctx.fillStyle = "#efe4d0";
  ctx.beginPath();
  ctx.ellipse(384, 860, 220, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(384, 820);
  ctx.scale(2.35, 2.35);
  drawCharacter(ctx, name, facing);
  ctx.restore();
  return canvas.toBuffer("image/png");
}

export function drawPlaceholderPanel(characters: string[], index: number) {
  const size = 768;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1c1c1c";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const sky = SKIES[(index - 1) % SKIES.length];
  const ground = GROUNDS[(index - 1) % GROUNDS.length];
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.ellipse(size / 2, size * 0.92, size * 0.62, size * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  const cast = characters.length > 0 ? characters : ["唐僧"];
  const groundY = size * 0.78;
  const scale = cast.length > 3 ? 1.15 : 1.45;
  cast.forEach((name, i) => {
    const x = ((i + 1) / (cast.length + 1)) * size;
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);
    drawCharacter(ctx, name, "front");
    ctx.restore();
  });

  return canvas.toBuffer("image/png");
}
