import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { logger, generateRequestId } from "@/lib/logger";
import { z } from "zod";

const Schema = z.object({
  email: z.string().email(),
  callbackUrl: z.string().optional(),
});

export async function POST(request: Request) {
  const requestId = generateRequestId();
  logger.info({ requestId }, "magic-link request received");

  try {
    const body = await request.json();
    const result = Schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { email, callbackUrl } = result.data;

    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check the user exists in our users table
    const { data: user } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("email", email)
      .single();

    // Always respond success to prevent email enumeration
    if (!user || !user.password_hash) {
      logger.info({ requestId }, "magic-link: unknown email or OAuth-only account");
      return NextResponse.json({ success: true });
    }

    // Generate a secure token valid for 1 hour
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Store token in system_config keyed by token (simple, no extra table needed)
    await supabase.from("system_config").upsert({
      key: `reset:${token}`,
      value: JSON.stringify({ email, expires, callbackUrl: callbackUrl ?? "/" }),
      description: "Password reset token",
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "AI Art Arena <no-reply@olliedoesis.dev>",
      to: [email],
      subject: "Reset your password — AI Art Arena",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#08080e;color:#eeeeff;border-radius:12px">
          <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 8px">Reset your password</h1>
          <p style="color:#7878a0;margin:0 0 24px">Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.9375rem">
            Reset password →
          </a>
          <p style="color:#3a3a58;font-size:0.75rem;margin:24px 0 0">If you didn't request this, ignore this email. Your password won't change.</p>
        </div>
      `,
    });

    logger.info({ requestId, email }, "magic-link sent");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ requestId, error }, "magic-link unhandled error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
