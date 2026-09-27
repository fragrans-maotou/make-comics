import { jsPDF } from "jspdf";
import { loadImage } from "@napi-rs/canvas";

export async function pngToPdf(png: Buffer) {
  const image = await loadImage(png);
  const mmW = image.width * 0.264583;
  const mmH = image.height * 0.264583;
  const pdf = new jsPDF({
    unit: "mm",
    format: [mmW, mmH],
    orientation: mmW > mmH ? "landscape" : "portrait",
  });
  pdf.addImage(`data:image/png;base64,${png.toString("base64")}`, "PNG", 0, 0, mmW, mmH);
  return Buffer.from(pdf.output("arraybuffer"));
}
