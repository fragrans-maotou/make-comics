import { z } from "zod";
import { canonicalName, castNames } from "./characters";

export const SHOTS = ["wide", "medium", "close-up"] as const;
export const ROLES = ["setup", "develop", "turn", "punchline"] as const;
export const LAYOUTS = ["vertical", "grid"] as const;

export type Shot = (typeof SHOTS)[number];
export type PanelRole = (typeof ROLES)[number];
export type StripLayout = (typeof LAYOUTS)[number];

const names = castNames();

export const dialogueSchema = z.object({
  speaker: z.string().transform(canonicalName).refine((name) => names.includes(name), {
    message: "说话人必须是唐僧、孙悟空、猪八戒、沙僧或白龙马",
  }),
  text: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => Array.from(value).length > 0, "台词不能为空")
    .refine((value) => Array.from(value).length <= 15, "每句台词不能超过 15 个字"),
  side: z.enum(["left", "right"]).optional(),
});

export const panelSchema = z.object({
  index: z.number().int().min(1).max(6),
  role: z.enum(ROLES),
  scene: z.string().transform((value) => value.trim()).pipe(z.string().min(4, "画面描述太短")),
  shot: z.enum(SHOTS),
  characters: z
    .array(z.string().transform(canonicalName))
    .min(1, "每一格至少要有一个角色")
    .transform((list) => [...new Set(list)])
    .refine((list) => list.every((name) => names.includes(name)), "出现了未知角色"),
  dialogue: z.array(dialogueSchema).min(1).max(2),
});

export const scriptSchema = z.object({
  title: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => Array.from(value).length >= 1 && Array.from(value).length <= 20, "标题需要 1 到 20 个字"),
  summary: z.string().optional(),
  panels: z.array(panelSchema).min(4).max(6),
});

export type DialogueLine = z.infer<typeof dialogueSchema>;
export type ScriptPanel = z.infer<typeof panelSchema>;
export type ComicScript = z.infer<typeof scriptSchema>;

export function expectedShape(panelCount: number) {
  if (panelCount < 4 || panelCount > 6) {
    throw new Error("格数只能是 4、5 或 6");
  }
}

export function validateScript(input: unknown, panelCount: number, options?: { requireEnglishScene?: boolean }) {
  expectedShape(panelCount);
  const parsed = scriptSchema.parse(input);
  if (parsed.panels.length !== panelCount) {
    throw new Error(`需要恰好 ${panelCount} 格，实际得到 ${parsed.panels.length} 格`);
  }
  parsed.panels.forEach((panel, index) => {
    panel.index = index + 1;
    if (index === 0 && panel.role !== "setup") {
      throw new Error("第 1 格必须是铺垫（setup）");
    }
    if (index === parsed.panels.length - 1 && panel.role !== "punchline") {
      throw new Error("最后一格必须是包袱（punchline）");
    }
    if (index > 0 && index < parsed.panels.length - 1 && panel.role === "punchline") {
      throw new Error("包袱只能出现在最后一格");
    }
    if (options?.requireEnglishScene && !/[A-Za-z]/.test(panel.scene)) {
      throw new Error(`第 ${panel.index} 格的 scene 需要用英文写给图像模型`);
    }
    panel.dialogue.forEach((line, lineIndex) => {
      if (!line.side) line.side = lineIndex === 0 ? "left" : "right";
    });
  });
  return parsed;
}

export function formatZodError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  }
  return error instanceof Error ? error.message : "剧本格式不正确";
}
