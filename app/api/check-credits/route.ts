import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getRemainingCredits } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "需要登录" }, { status: 401 });
  }
  const credits = await getRemainingCredits(userId);
  return NextResponse.json({
    hasApiKey: false,
    creditsRemaining: credits.remaining,
    resetTime: credits.reset,
    enforced: credits.enforced,
  });
}
