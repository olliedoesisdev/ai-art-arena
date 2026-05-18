import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { authRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import { sendSubscriberWelcome } from "@/lib/email";

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const log = logger.child({ requestId, route: "POST /api/v1/notify" });

  log.info("notify subscribe request received");

  const ipHash = hashIP(getClientIP(request));
  const { success: allowed } = await authRateLimit.limit(`notify:${ipHash}`);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { email } = parsed.data;
  const name = email.split("@")[0] ?? "Arena member";

  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").insert({ name, email });

  if (error) {
    if (error.code === "23505") {
      // Already subscribed — treat as success so no info leakage
      return NextResponse.json({ success: true }, { status: 200 });
    }
    log.error({ error }, "subscriber insert error");
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  void sendSubscriberWelcome({ name, email }).catch((err) =>
    log.warn({ err }, "welcome email failed")
  );

  log.info({ ms: 0 }, "notify subscribe success");
  return NextResponse.json({ success: true }, { status: 201 });
}
