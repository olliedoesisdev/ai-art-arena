import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { logger, generateRequestId } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { z } from "zod";

const Schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  const requestId = generateRequestId();
  logger.info({ requestId }, "reset-password request received");

  try {
    const body = await request.json();
    const result = Schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = result.data;
    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Look up token
    const { data: config } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", `reset:${token}`)
      .single();

    if (!config) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    const { email, expires } = JSON.parse(config.value) as {
      email: string;
      expires: string;
      callbackUrl: string;
    };

    if (new Date(expires) < new Date()) {
      await supabase.from("system_config").delete().eq("key", `reset:${token}`);
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash })
      .eq("email", email);

    if (updateError) {
      logger.error({ requestId, updateError }, "password update failed");
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    // Consume the token
    await supabase.from("system_config").delete().eq("key", `reset:${token}`);

    logger.info({ requestId, email }, "password reset success");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ requestId, error }, "reset-password unhandled error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
