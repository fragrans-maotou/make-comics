import { createCanvas, type SKRSContext2D } from "@napi-rs/canvas";

const SKIES = ["#c5e4f7", "#f6d7a8", "#e7d2f2", "#d7efd4", "#f8d0c4", "#d5e2f6"];
const GROUNDS = ["#e6d3a3", "#e8c99a", "#d9c4ae", "#cfe0b8", "#efd2b0", "#d8d0ea"];

type Figure = {
  skin: string;
  cloth: string;
  extra?: "monkey" | "pig" | "beads" | "horse" | "monk";
};

const LOOKS: Record<string, Figure> = {
  唐僧: { skin: "#f3d2b3", cloth: "#c0392b", extra: "monk" },
  孙悟空: { skin: "#f0c27a", cloth: "#d35400", extra: "monkey" },
  猪八戒: { skin: "#f4b6c6", cloth: "#1f6f78", extra: "pig" },
  沙僧: { skin: "#8ea4b8", cloth: "#8d5a32", extra: "beads" },
  白龙马: { skin: "#f7f7f7", cloth: "#d64545", extra: "horse" },
};

function drawFigure(
  ctx: SKRSContext2D,
  name: string,
  x: number,
  ground: number,
  scale: number,
) {
  const look = LOOKS[name] ?? { skin: "#f3d2b3", cloth: "#666", extra: "monk" as const };
  if (look.extra === "horse") {
    ctx.fillStyle = look.skin;
    ctx.beginPath();
    ctx.ellipse(x, ground - 28 * scale, 46 * scale, 24 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x + 42 * scale, ground - 48 * scale, 18 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = look.cloth;
    ctx.fillRect(x - 10 * scale, ground - 40 * scale, 28 * scale, 10 * scale);
    ctx.strokeRect(x - 10 * scale, ground - 40 * scale, 28 * scale, 10 * scale);
    return;
  }

  ctx.fillStyle = look.cloth;
  ctx.beginPath();
  ctx.roundRect(x - 22 * scale, ground - 70 * scale, 44 * scale, 48 * scale, 10 * scale);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = look.skin;
  ctx.beginPath();
  ctx.arc(x, ground - 96 * scale, 26 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(x - 8 * scale, ground - 98 * scale, 2.2 * scale, 0, Math.PI * 2);
  ctx.arc(x + 8 * scale, ground - 98 * scale, 2.2 * scale, 0, Math.PI * 2);
  ctx.fill();

  if (look.extra === "monkey") {
    ctx.strokeStyle = "#e1b000";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(x, ground - 108 * scale, 18 * scale, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 18 * scale, ground - 40 * scale);
    ctx.quadraticCurveTo(x + 48 * scale, ground - 70 * scale, x + 36 * scale, ground - 20 * scale);
    ctx.stroke();
  }
  if (look.extra === "pig") {
    ctx.fillStyle = "#f08aa4";
    ctx.beginPath();
    ctx.ellipse(x, ground - 88 * scale, 10 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x - 22 * scale, ground - 108 * scale, 8 * scale, 10 * scale, -0.4, 0, Math.PI * 2);
    ctx.ellipse(x + 22 * scale, ground - 108 * scale, 8 * scale, 10 * scale, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (look.extra === "monk") {
    ctx.strokeStyle = "#e1b000";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(x, ground - 112 * scale, 16 * scale, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 4;
  }
  if (look.extra === "beads") {
    ctx.fillStyle = "#f2e2c4";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x - 12 * scale + i * 8 * scale, ground - 74 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

export function drawPlaceholderPanel(characters: string[], index: number) {
  const size = 768;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1a1a1a";
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

  ctx.fillStyle = index % 2 === 0 ? "#f4e7b0" : "#fff6d8";
  ctx.beginPath();
  ctx.arc(size * 0.82, size * 0.2, 36, 0, Math.PI * 2);
  ctx.fill();

  const cast = characters.length > 0 ? characters : ["唐僧"];
  const groundY = size * 0.8;
  cast.forEach((name, i) => {
    const x = ((i + 1) / (cast.length + 1)) * size;
    drawFigure(ctx, name, x, groundY, cast.length > 3 ? 0.85 : 1);
  });

  return canvas.toBuffer("image/png");
}
