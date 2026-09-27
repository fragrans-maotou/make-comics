import { getTextProvider } from "./ai";
import { castNames } from "./characters";
import { mockScript } from "./mock-script";
import { formatZodError, validateScript, type ComicScript } from "./script-schema";
import { textProviderKind } from "./runtime-config";

const SYSTEM = `你是短篇四格漫画编剧，专门写《西游记》取经路上的现代人吐槽笑话。
角色只有：唐僧、孙悟空、猪八戒、沙僧、白龙马。他们穿着古典造型，想法却是现代上班族，可以调侃 KPI、打卡、加班、外卖、导航、团建、996、直播带货。
只输出一个 JSON 对象，不要 markdown，不要解释。`;

function userPrompt(idea: string, panelCount: number, error?: string) {
  return `点子：${idea}
格数：恰好 ${panelCount} 格。

JSON 结构：
{
  "title": "不超过20字的中文标题",
  "summary": "一句话简介",
  "panels": [
    {
      "index": 1,
      "role": "setup",
      "shot": "wide",
      "characters": ["唐僧", "孙悟空"],
      "scene": "English description of the action, expressions, and simple background for the image model. No request for text, signs, or speech bubbles.",
      "dialogue": [{ "speaker": "唐僧", "text": "不超过15字", "side": "left" }]
    }
  ]
}

硬性要求：
- 第 1 格 role 是 setup，最后一格 role 是 punchline，中间格只能是 develop 或 turn
- 笑点放在最后一格，前面只铺垫
- 每格 1 到 2 句对白，每句 text 最多 15 个字符
- speaker 只能是：${castNames().join("、")}
- scene 必须是英文，描述动作和表情，禁止要求画面里出现文字、招牌、对话框
- shot 只能是 wide、medium、close-up
- characters 只放这一格出镜的角色
${error ? `\n上一次输出不合格，请只重新输出修正后的 JSON。问题：${error}` : ""}`;
}

export function extractJson(text: string) {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fence ? fence[1] : trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("没有找到 JSON");
  return JSON.parse(body.slice(start, end + 1)) as unknown;
}

export async function generateScript(idea: string, panelCount: number): Promise<ComicScript> {
  if (textProviderKind() === "mock") {
    return validateScript(mockScript(idea, panelCount), panelCount, { requireEnglishScene: true });
  }

  const provider = getTextProvider();
  let lastError = "剧本格式不正确";
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await provider.complete({
      system: SYSTEM,
      user: userPrompt(idea, panelCount, attempt === 0 ? undefined : lastError),
      temperature: 0.7,
      maxTokens: 2400,
    });
    try {
      return validateScript(extractJson(raw), panelCount, { requireEnglishScene: true });
    } catch (error) {
      lastError = formatZodError(error);
    }
  }
  throw new Error(lastError);
}
