import { writeFileSync } from "node:fs";
import { mockScript } from "../lib/mock-script";
import { validateScript } from "../lib/script-schema";
import { drawPlaceholderPanel } from "../lib/mock-art";
import { composeStrip } from "../lib/compose";

async function main() {
  const script = validateScript(mockScript("唐僧团队年底述职", 4), 4, {
    requireEnglishScene: true,
  });
  const png = await composeStrip({
    title: script.title,
    layout: "vertical",
    panels: script.panels.map((panel) => ({
      image: drawPlaceholderPanel(panel.characters, panel.index),
      dialogue: panel.dialogue,
    })),
  });
  writeFileSync("public/sample-strip.png", png);
  console.log("sample", png.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
