import fs from "node:fs";
import path from "node:path";

type CharacterConfig = {
  styleId: string;
  styleName: string;
  stylePrompt: string;
  referenceDir: string;
  characters: Array<{
    id: string;
    name: string;
    nameEn: string;
    aliases: string[];
    referenceFiles: string[];
    visualDescription: string;
  }>;
};

function characterConfig(): CharacterConfig {
  const file = path.join(process.cwd(), "config", "characters.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as CharacterConfig;
}

export type CharacterSheet = {
  id: string;
  name: string;
  nameEn: string;
  aliases: string[];
  visualDescription: string;
  references: Array<{
    source: string;
    mime: string;
    bytes?: Buffer;
    url?: string;
  }>;
};

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

let cached: { stamp: string; sheets: CharacterSheet[] } | null = null;

function referenceStamp(dir: string, files: string[]) {
  return files
    .map((file) => {
      if (/^https?:\/\//i.test(file)) return file;
      const full = path.join(dir, file);
      if (!fs.existsSync(full)) return `${file}:missing`;
      const stat = fs.statSync(full);
      return `${file}:${stat.mtimeMs}:${stat.size}`;
    })
    .join("|");
}

export function stylePrompt() {
  return characterConfig().stylePrompt;
}

export function styleName() {
  return characterConfig().styleName;
}

export function castNames() {
  return characterConfig().characters.map((character) => character.name);
}

export function canonicalName(name: string) {
  const trimmed = name.trim();
  for (const character of characterConfig().characters) {
    if (character.name === trimmed || character.aliases.includes(trimmed)) {
      return character.name;
    }
  }
  return trimmed;
}

export function loadCast(): CharacterSheet[] {
  const config = characterConfig();
  const dir = path.resolve(process.cwd(), config.referenceDir);
  const stamp = referenceStamp(
    dir,
    config.characters.flatMap((character) => character.referenceFiles),
  );
  if (cached?.stamp === stamp) return cached.sheets;
  const sheets = config.characters.map((character) => {
    const references: CharacterSheet["references"] = [];
    for (const file of character.referenceFiles) {
      if (/^https?:\/\//i.test(file)) {
        references.push({ source: file, mime: "image/png", url: file });
        continue;
      }
      const full = path.join(dir, file);
      if (!fs.existsSync(full)) continue;
      const ext = path.extname(full).toLowerCase();
      references.push({
        source: full,
        mime: MIME[ext] || "image/png",
        bytes: fs.readFileSync(full),
      });
    }
    return {
      id: character.id,
      name: character.name,
      nameEn: character.nameEn,
      aliases: character.aliases,
      visualDescription: character.visualDescription,
      references,
    };
  });
  cached = { stamp, sheets };
  return sheets;
}

export function resolveCast(names: string[]) {
  const wanted = new Set(names.map(canonicalName));
  return loadCast().filter((character) => wanted.has(character.name));
}

export function referenceDataUrl(reference: CharacterSheet["references"][number]) {
  if (reference.url) return reference.url;
  if (!reference.bytes) return null;
  return `data:${reference.mime};base64,${reference.bytes.toString("base64")}`;
}
