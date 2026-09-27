import assert from "node:assert/strict";
import test from "node:test";
import { SAMPLE_IDEAS } from "./sample-ideas";
import { mockScript } from "./mock-script";
import { extractJson } from "./script";
import { validateScript, formatZodError } from "./script-schema";

test("sample ideas become valid 4 to 6 panel scripts", () => {
  for (const idea of SAMPLE_IDEAS) {
    for (const count of [4, 5, 6]) {
      const script = validateScript(mockScript(idea, count), count, { requireEnglishScene: true });
      assert.equal(script.panels[0].role, "setup");
      assert.equal(script.panels.at(-1)?.role, "punchline");
      assert.equal(script.panels.length, count);
      for (const panel of script.panels) {
        assert.match(panel.scene, /[A-Za-z]/);
        for (const line of panel.dialogue) {
          assert.ok(Array.from(line.text).length <= 15, `${idea} line too long: ${line.text}`);
        }
      }
    }
  }
});

test("extracts JSON wrapped in a fence and rejects overlong lines", () => {
  const raw = '```json\n{"title":"测试","panels":[]}\n```';
  assert.equal((extractJson(raw) as { title: string }).title, "测试");
  assert.throws(() =>
    validateScript(
      {
        title: "太长的一句",
        panels: [
          {
            index: 1,
            role: "setup",
            shot: "wide",
            scene: "A road",
            characters: ["唐僧"],
            dialogue: [{ speaker: "唐僧", text: "这句对白实在是太长了不应该通过校验" }],
          },
          {
            index: 2,
            role: "develop",
            shot: "medium",
            scene: "A road",
            characters: ["孙悟空"],
            dialogue: [{ speaker: "孙悟空", text: "好" }],
          },
          {
            index: 3,
            role: "turn",
            shot: "medium",
            scene: "A road",
            characters: ["猪八戒"],
            dialogue: [{ speaker: "猪八戒", text: "好" }],
          },
          {
            index: 4,
            role: "punchline",
            shot: "wide",
            scene: "A road",
            characters: ["白龙马"],
            dialogue: [{ speaker: "白龙马", text: "好" }],
          },
        ],
      },
      4,
    ),
  );
  assert.match(formatZodError(new Error("坏了")), /坏了/);
});
