import { NextResponse } from "next/server";
import { getStoryBundleBySlug } from "@/lib/db-actions";
import { attachmentDisposition } from "@/lib/filenames";
import { pngToPdf } from "@/lib/pdf";
import { readMedia } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ storySlug: string }> }) {
  try {
    const { storySlug } = await params;
    const format = new URL(request.url).searchParams.get("format") === "pdf" ? "pdf" : "png";
    const bundle = await getStoryBundleBySlug(storySlug);
    if (!bundle) return NextResponse.json({ error: "找不到这集漫画" }, { status: 404 });
    if (!bundle.story.composedImageUrl) {
      return NextResponse.json({ error: "还没有合成长图，请先生成画面" }, { status: 400 });
    }
    const png = await readMedia(bundle.story.composedImageUrl);
    if (format === "png") {
      return new NextResponse(new Uint8Array(png), {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": attachmentDisposition(bundle.story.title, "png"),
          "Cache-Control": "no-store",
        },
      });
    }
    const pdf = await pngToPdf(png);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": attachmentDisposition(bundle.story.title, "pdf"),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "导出失败" }, { status: 500 });
  }
}
