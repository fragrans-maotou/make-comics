import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import characterConfig from "../config/characters.json";
import { drawCharacterSheet } from "../lib/mock-art";

const dir = path.join(process.cwd(), characterConfig.referenceDir);
mkdirSync(dir, { recursive: true });

for (const character of characterConfig.characters) {
  for (const file of character.referenceFiles) {
    if (/^https?:\/\//i.test(file)) continue;
    const facing = file.includes("-side") ? "side" : "front";
    const png = drawCharacterSheet(character.name, facing);
    const full = path.join(dir, file);
    writeFileSync(full, png);
    console.log(file, png.length);
  }
}
