import { referenceDataUrl, resolveCast, stylePrompt, type CharacterSheet } from "./characters";
import type { ScriptPanel } from "./script-schema";

const SPECIES: Record<string, string> = {
  唐僧: "Super-deformed Q-version, enormous head, tiny body, cute not solemn. He is a human monk: bald, no hair, no beard, deep-red robe. Do not draw him as a woman or with hair.",
  孙悟空: "Super-deformed Q-version, enormous head, tiny body, cute not solemn. He is a monkey, not a human: fur, round monkey ears, peach face, tail, golden staff. Do not draw a human boy.",
  猪八戒: "Super-deformed Q-version, enormous head, tiny body, cute not solemn. He is a pig, not a human: pink snout, floppy pig ears, rake. Do not draw a human man.",
  沙僧: "Super-deformed Q-version, enormous head, tiny body, cute not solemn. He has muted blue-gray skin, a short beard, prayer beads, and a crescent monk spade.",
  白龙马: "Super-deformed Q-version, enormous head, tiny legs, cute not solemn. It is a small white horse with tiny dragon horns and a red saddle, not a person and not a realistic horse.",
};

export function buildPanelPrompt(panel: ScriptPanel, options?: { attachReferences?: boolean }) {
  const attachReferences = options?.attachReferences !== false;
  const cast = resolveCast(panel.characters);
  const references: string[] = [];
  const lines: string[] = [];

  for (const character of cast) {
    const lock = SPECIES[character.name] ?? "";
    if (!attachReferences) {
      lines.push(`${character.nameEn} (${character.name}): ${character.visualDescription} ${lock}`);
      continue;
    }
    if (character.references.length === 0) {
      lines.push(
        `${character.nameEn} (${character.name}) has no reference image. Draw them only from this description: ${character.visualDescription} ${lock}`,
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
        `Reference image ${references.length} is ${character.nameEn} (${character.name})${sheet}. Match head shape, outfit, colors, species, and chibi proportions exactly. Appearance: ${character.visualDescription} ${lock}`,
      );
    });
  }

  const referenceNote =
    references.length > 0
      ? "Reference images are provided in this exact order. The first reference image is image 1, the second is image 2, and so on. Never swap them."
      : "No reference images are attached. Draw each character only from the written description. Keep costume, colors, face, and signature props consistent.";

  const prompt = `Single comic panel illustration, one frame only, not a full comic page.

CHARACTER IDENTITY, highest priority. Do not redesign them and do not swap species.
${lines.join("\n")}

ART STYLE:
${stylePrompt()}

ABSOLUTE RULES:
- NO text, NO letters, NO numbers, NO captions, NO speech bubbles, NO signs, NO logos, NO watermarks, NO written language of any kind
- Leave the upper third of the frame as clean empty background so dialogue can be added later
- Place the characters in the lower two thirds
- Do not add extra people
${referenceNote}

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
