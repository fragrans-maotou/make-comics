import characterConfig from "@/config/characters.json";

const NOTES: Record<string, string> = {
  tangseng: "光头、红袈裟、短手杖。头要占一半。",
  wukong: "猴子，圆耳朵、尾巴、金箍棒。",
  bajie: "猪鼻子、大耳朵、小钉耙。",
  shaseng: "蓝灰皮肤、小胡子、念珠、月牙铲。",
  bailongma: "大头小白马，短腿、小角、红鞍。",
};

export function CastGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {characterConfig.characters.map((character) => {
        const file = character.referenceFiles.find((name) => !name.includes("-side")) ?? character.referenceFiles[0];
        return (
          <figure key={character.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img
              src={`/api/cast/${file}`}
              alt={`${character.name}设定图`}
              className="aspect-[3/4] w-full bg-[#f7f1e6] object-contain"
            />
            <figcaption className="space-y-1 px-4 py-3">
              <p className="text-base font-medium">{character.name}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{NOTES[character.id]}</p>
              <p className="text-xs text-muted-foreground">characters/refs/{file}</p>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
