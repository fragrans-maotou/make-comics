import { clerkEnabled } from "./runtime-config";

export async function getUserId(): Promise<string | null> {
  if (!clerkEnabled()) return "local";
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId;
}

export async function requireUserId() {
  const userId = await getUserId();
  if (!userId) {
    return { ok: false as const, status: 401, error: "需要登录" };
  }
  return { ok: true as const, userId };
}
