import { rateLimitEnabled } from "./runtime-config";

type LimitResult = {
  enforced: boolean;
  ok: boolean;
  remaining: number | "unlimited";
  reset: number | null;
};

async function limiter() {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, "7 d"),
    analytics: true,
    prefix: "ratelimit:free-comics",
  });
}

export async function getRemainingCredits(userId: string): Promise<LimitResult> {
  if (!rateLimitEnabled()) {
    return { enforced: false, ok: true, remaining: "unlimited", reset: null };
  }
  const result = await (await limiter()).getRemaining(userId);
  return {
    enforced: true,
    ok: result.remaining > 0,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export async function consumeCredit(userId: string): Promise<LimitResult> {
  if (!rateLimitEnabled()) {
    return { enforced: false, ok: true, remaining: "unlimited", reset: null };
  }
  const result = await (await limiter()).limit(userId);
  return {
    enforced: true,
    ok: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}
