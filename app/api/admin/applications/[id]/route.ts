import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { logger, generateRequestId } from "@/lib/logger";
import { adminRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import { Resend } from "resend";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  status: z.enum(["approved", "rejected", "waitlisted", "pending"]),
  admin_notes: z.string().max(1000).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const requestId = generateRequestId();
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ipHash = hashIP(getClientIP(request));
  const { success: rateLimitOk } = await adminRateLimit.limit(`admin:${ipHash}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = PatchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { status, admin_notes } = result.data;
  const supabase = createAdminClient();

  const { data: application, error: fetchError } = await supabase
    .from("artist_applications")
    .select("id, name, email, submission_title, status")
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("artist_applications")
    .update({
      status,
      admin_notes: admin_notes ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    logger.error({ requestId, id, error: updateError }, "application update failed");
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  // Send email notification on terminal status changes
  if (status === "approved" || status === "rejected") {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const isApproved = status === "approved";

      await resend.emails.send({
        from: "AI Art Arena <no-reply@olliedoesis.dev>",
        to: [application.email],
        subject: isApproved
          ? `Your application was accepted — AI Art Arena`
          : `Update on your AI Art Arena application`,
        html: isApproved
          ? `
            <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#08080e;color:#eeeeff;border-radius:12px">
              <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 8px;color:#34d399">You're in! 🎉</h1>
              <p style="color:#7878a0;margin:0 0 16px">Hi ${application.name}, your submission <strong style="color:#eeeeff">"${application.submission_title}"</strong> has been accepted into AI Art Arena.</p>
              <p style="color:#7878a0;margin:0 0 24px">We'll be in touch with details about which week your artwork will appear in. Keep an eye on your inbox.</p>
              ${admin_notes ? `<p style="color:#7878a0;margin:0 0 24px;padding:12px 16px;background:#181820;border-radius:8px;border-left:3px solid #8b5cf6">${admin_notes}</p>` : ""}
              <a href="https://olliedoesis.dev" style="display:inline-block;background:#8b5cf6;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none">Visit the Arena →</a>
            </div>
          `
          : `
            <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#08080e;color:#eeeeff;border-radius:12px">
              <h1 style="font-size:1.5rem;font-weight:800;margin:0 0 8px">Thanks for applying</h1>
              <p style="color:#7878a0;margin:0 0 16px">Hi ${application.name}, we reviewed your submission <strong style="color:#eeeeff">"${application.submission_title}"</strong> and we're not able to include it in an upcoming contest at this time.</p>
              ${admin_notes ? `<p style="color:#7878a0;margin:0 0 24px;padding:12px 16px;background:#181820;border-radius:8px;border-left:3px solid #3a3a58">${admin_notes}</p>` : ""}
              <p style="color:#7878a0;margin:0">You're welcome to submit again in the future. Thanks for being part of the community.</p>
            </div>
          `,
      });
    } catch (emailError) {
      // Non-fatal — status was updated, email failure shouldn't roll back
      logger.error({ requestId, id, emailError }, "application email notification failed");
    }
  }

  logger.info({ requestId, id, status }, "application updated");
  return NextResponse.json({ success: true, status });
}
