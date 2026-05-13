import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fullArtistApplicationSchema } from "@/lib/validators/join";
import { sendArtistApplicationNotification } from "@/lib/email";
import { logger, generateRequestId, jsonResponse } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: "/api/artist-application" }, "application request received");

  try {
    const body = await request.json();
    const parsed = fullArtistApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return jsonResponse(requestId, 
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = await createClient();

    const { error } = await supabase
      .from("artist_applications")
      .insert({
        name: data.name,
        email: data.email,
        location: data.location || null,
        artist_bio: data.artist_bio,
        art_style: data.art_style,
        primary_tools: data.primary_tools,
        years_using_ai: data.years_using_ai,
        portfolio_url: data.portfolio_url || null,
        social_handle: data.social_handle || null,
        submission_title: data.submission_title,
        submission_prompt: data.submission_prompt,
        submission_image_url: data.submission_image_url,
        submission_image_path: data.submission_image_path,
        status: "pending",
      });

    if (error) {
      logger.error({ requestId, error }, "application insert error");
      return jsonResponse(requestId, 
        { error: "Failed to save application. Please try again." },
        { status: 500 }
      );
    }

    void (async () => {
      try {
        await sendArtistApplicationNotification({
          applicantName: data.name,
          applicantEmail: data.email,
          artStyle: data.art_style,
          submissionTitle: data.submission_title,
          submissionPrompt: data.submission_prompt,
          submissionImageUrl: data.submission_image_url,
          primaryTools: data.primary_tools,
          yearsUsingAi: data.years_using_ai,
          portfolioUrl: data.portfolio_url || null,
          socialHandle: data.social_handle || null,
        });
      } catch (emailError) {
        logger.warn({ requestId, emailError }, "admin notification email failed");
      }
    })();

    logger.info({ requestId, ms: Date.now() - start, status: 201 }, "application response sent");
    return jsonResponse(requestId, { success: true }, { status: 201 });
  } catch (error) {
    logger.error({ requestId, error }, "application route error");
    return jsonResponse(requestId, { error: "Internal server error" }, { status: 500 });
  }
}
