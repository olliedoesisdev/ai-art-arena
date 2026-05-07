import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { logger, generateRequestId } from "@/lib/logger";
import { authRateLimit } from "@/lib/ratelimit";
import { getClientIP, hashIP } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  name: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  const requestId = generateRequestId();
  logger.info({ requestId }, "signup request received");

  try {
    const ipHash = hashIP(getClientIP(request));
    const { success } = await authRateLimit.limit(`signup:${ipHash}`);
    if (!success) {
      return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429 });
    }

    const body = await request.json();
    const result = SignUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Use service role to bypass RLS for admin operations
    const adminClient = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if email already exists in our users table
    const { data: existing } = await adminClient
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create the auth.users entry via Supabase Admin Auth API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      logger.error({ requestId, authError }, "auth user creation failed");
      if (authError?.message?.includes("already been registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    // Insert into our users table using the auth user's ID
    const { error: insertError } = await adminClient.from("users").insert({
      id: authData.user.id,
      email,
      name: name || null,
      password_hash,
      role: "user",
    });

    if (insertError) {
      logger.error({ requestId, insertError }, "users table insert failed");
      // Clean up the auth user we just created
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    logger.info({ requestId, email }, "signup success");
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ requestId, error }, "signup unhandled error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
