import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { subscriberSchema } from "@/lib/validators/join";
import { sendSubscriberWelcome } from "@/lib/email";
import { logger } from "@/lib/logger";
import { authRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const start = Date.now();
  logger.info({ requestId, path: "/api/subscribe" }, "subscribe request received");

  try {
    const ipHash = hashIP(getClientIP(request));
    const { success: allowed } = await authRateLimit.limit(`subscribe:${ipHash}`);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = subscriberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email } = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("subscribers")
      .insert({ name, email });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already subscribed." },
          { status: 409 }
        );
      }
      logger.error({ requestId, error }, "subscriber insert error");
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      );
    }

    void (async () => {
      try {
        await sendSubscriberWelcome({ name, email });
      } catch (emailError) {
        logger.warn({ requestId, emailError }, "welcome email failed");
      }
    })();

    logger.info({ requestId, ms: Date.now() - start, status: 201 }, "subscribe response sent");
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    logger.error({ requestId, error }, "subscribe route error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
