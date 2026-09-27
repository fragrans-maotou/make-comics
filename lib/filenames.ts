export function attachmentDisposition(title: string, extension: string) {
  const cleaned = title.replace(/[\\/:*?"<>|\r\n]/g, "").trim() || "西游四格";
  const ascii = cleaned.replace(/[^\x20-\x7E]/g, "").trim() || "xiyou-comic";
  const encoded = encodeURIComponent(`${cleaned}.${extension}`);
  return `attachment; filename="${ascii}.${extension}"; filename*=UTF-8''${encoded}`;
}
