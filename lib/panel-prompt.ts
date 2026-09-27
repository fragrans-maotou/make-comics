import { referenceDataUrl, resolveCast, stylePrompt, type CharacterSheet } from "./characters";
import type { ScriptPanel } from "./script-schema";

export function buildPanelPrompt(panel: ScriptPanel, options?: { attachReferences?: boolean }) {
  const attachReferences = options?.attachReferences !== false;
  const cast = resolveCast(panel.characters);
  const references: string[] = [];
  const lines: string[] = [];

  for (const character of cast) {
    if (!attachReferences) {
      lines.push(`${character.nameEn} (${character.name}): ${character.visualDescription}`);
      continue;
    }
    if (character.references.length === 0) {
      lines.push(
        `${character.nameEn} (${character.name}) has no reference image. Draw them only from this description: ${character.visualDescription}`,
      );
      continue;
    }
    character.references.forEach((reference, refIndex) => {
      const dataUrl = referenceDataUrl(reference);
      if (!dataUrl) return;
      references.push(dataUrl);
      const sheet =
        character.references.length > 1 ? `, character sheet ${refIndex + 1}` : "";
      lines.push(
        `Reference image ${references.length} is ${character.nameEn} (${character.name})${sheet}. Match head shape, outfit, colors, and chibi proportions exactly. Appearance: ${character.visualDescription}`,
      );
    });
  }

  const prompt = `Single comic panel illustration, one frame only, not a full comic page.

ABSOLUTE RULES:
- NO text, NO letters, NO numbers, NO captions, NO speech bubbles, NO signs, NO logos, NO watermarks, NO written language of any kind
- Leave the upper third of the frame as clean empty background so dialogue can be added later
- Place the characters in the lower two thirds

ART STYLE:
${stylePrompt()}

CAST CONSISTENCY (highest priority):
${
  references.length > 0
    ? "Reference images are provided in this exact order. The first reference image is image 1, the second is image 2, and so on. Never swap them."
    : "No reference images are attached. Draw each character only from the written description. Keep costume, colors, face, and signature props consistent."
}
${lines.join("\n")}

SHOT: ${panel.shot} shot
SCENE:
${panel.scene}

Only draw these characters: ${cast.map((character) => character.nameEn).join(", ")}.`;

  return { prompt, referenceImages: references, cast };
}

export function referenceOrderLabels(cast: CharacterSheet[] = []) {
  return buildPanelPrompt({
    index: 1,
    role: "setup",
    scene: "test",
    shot: "medium",
    characters: cast.map((character) => character.name),
    dialogue: [{ speaker: cast[0]?.name || "唐僧", text: "好", side: "left" }],
  });
}
