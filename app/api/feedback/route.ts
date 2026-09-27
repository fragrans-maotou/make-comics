import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { createFeedback } from "@/lib/db-actions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const body = await request.json();
  const message = body?.message?.trim();
  if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  if (message.length > 2000) return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  await createFeedback({ message, userId: userId ?? undefined });
  return NextResponse.json({ success: true });
}
