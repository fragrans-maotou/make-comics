import { NextRequest, NextResponse } from "next/server";
import { getStoryBundleBySlug } from "@/lib/db-actions";
import { attachmentDisposition } from "@/lib/filenames";
import { pngToPdf } from "@/lib/pdf";
import { readMedia } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const storySlug = new URL(request.url).searchParams.get("storySlug");
  if (!storySlug) return NextResponse.json({ error: "缺少 storySlug" }, { status: 400 });
  const bundle = await getStoryBundleBySlug(storySlug);
  if (!bundle?.story.composedImageUrl) {
    return NextResponse.json({ error: "还没有可导出的长图" }, { status: 400 });
  }
  const png = await readMedia(bundle.story.composedImageUrl);
  const pdf = await pngToPdf(png);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": attachmentDisposition(bundle.story.title, "pdf"),
    },
  });
}
