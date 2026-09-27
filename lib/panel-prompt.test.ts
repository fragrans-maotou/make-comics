import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { buildPanelPrompt } from "./panel-prompt";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test("character references stay in sheet order and match the prompt", () => {
  const dir = path.join(process.cwd(), "characters", "refs");
  fs.mkdirSync(dir, { recursive: true });
  const files = ["tangseng.png", "wukong.png"].map((name) => path.join(dir, name));
  const created: string[] = [];
  for (const file of files) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, PNG);
      created.push(file);
    }
  }
  try {
    const { prompt, referenceImages } = buildPanelPrompt({
      index: 1,
      role: "setup",
      shot: "medium",
      scene: "Sun Wukong talks to Tang Sanzang on a road",
      characters: ["孙悟空", "唐僧"],
      dialogue: [{ speaker: "唐僧", text: "开会", side: "left" }],
    });
    assert.ok(referenceImages.length >= 2);
    assert.match(prompt, /Reference image 1 is Tang Sanzang/);
    assert.match(prompt, /Reference image 2 is Sun Wukong/);
    assert.ok(
      prompt.indexOf("Reference image 1 is Tang Sanzang") < prompt.indexOf("Reference image 2 is Sun Wukong"),
    );
    assert.match(prompt, /NO text, NO letters/);
    assert.ok(!/TEXT AND LETTERING/.test(prompt));
    for (const reference of referenceImages) {
      assert.match(reference, /^data:image\/png;base64,/);
    }
  } finally {
    for (const file of created) fs.unlinkSync(file);
  }
});
