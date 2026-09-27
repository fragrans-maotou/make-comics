import { saveMedia } from "./storage";

export async function uploadImageToS3(imageUrl: string, key: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  return saveMedia(key, imageBuffer, "image/jpeg");
}
