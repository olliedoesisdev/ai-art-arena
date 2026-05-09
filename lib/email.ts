import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";

const SITE_URL_PUBLIC = process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL;

interface CommentNotificationData {
  commenterName: string;
  commenterEmail: string | null;
  commentBody: string;
  artworkTitle: string;
  weekNumber: number;
  contestId: string;
}

export async function sendCommentNotification(data: CommentNotificationData): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { commenterName, commenterEmail, commentBody, artworkTitle, weekNumber, contestId } = data;

  const pageUrl = `${SITE_URL}/contest/${contestId}`;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("ADMIN_EMAIL not set");

  const formattedTime = new Date().toLocaleString("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  });

  await resend.emails.send({
    from: "AI Art Arena <notifications@olliedoesis.dev>",
    to: adminEmail,
    subject: `New comment on "${artworkTitle}" — Week ${weekNumber}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;
                  background: #111119; color: #eeeeff; padding: 40px;
                  border-radius: 12px; border: 1px solid rgba(139,92,246,0.2);">

        <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600;
                  letter-spacing: 0.12em; text-transform: uppercase; color: #a78bfa;">
          AI Art Arena
        </p>
        <h1 style="font-size: 22px; font-weight: 800; color: #eeeeff;
                   margin: 0 0 6px 0; letter-spacing: -0.02em;">
          New comment
        </h1>
        <p style="font-size: 13px; color: #7878a0; margin: 0 0 32px 0;">
          Week ${weekNumber} &mdash; ${artworkTitle}
        </p>

        <div style="background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.2);
                    border-left: 3px solid #8b5cf6; padding: 20px 24px;
                    border-radius: 8px; margin-bottom: 28px;">
          <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.7; color: #eeeeff;">
            &ldquo;${commentBody}&rdquo;
          </p>
          <p style="margin: 0; font-size: 12px; color: #7878a0; font-family: monospace;">
            &mdash; ${commenterName}${commenterEmail ? ` &lt;${commenterEmail}&gt;` : " (no email provided)"}
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;
                      font-size: 13px;">
          <tr>
            <td style="padding: 10px 0; color: #7878a0; border-bottom: 1px solid rgba(139,92,246,0.1);">
              Posted at
            </td>
            <td style="padding: 10px 0; color: #eeeeff; text-align: right;
                       border-bottom: 1px solid rgba(139,92,246,0.1); font-family: monospace;">
              ${formattedTime} UTC
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #7878a0;">
              Artwork
            </td>
            <td style="padding: 10px 0; color: #eeeeff; text-align: right;">
              ${artworkTitle}
            </td>
          </tr>
        </table>

        <a href="${pageUrl}"
           style="display: inline-block; background: #8b5cf6; color: #ffffff;
                  padding: 12px 24px; text-decoration: none; font-size: 13px;
                  font-weight: 600; border-radius: 8px; letter-spacing: 0.02em;">
          View contest page &rarr;
        </a>

        <p style="margin: 32px 0 0 0; font-size: 11px; color: #3a3a58; font-family: monospace;">
          You are receiving this because you are the site admin of olliedoesis.dev.
        </p>
      </div>
    `,
  });
}

export async function sendSubscriberWelcome(data: {
  name: string;
  email: string;
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "AI Art Arena <notifications@olliedoesis.dev>",
    to: data.email,
    subject: "You are on the list — AI Art Arena",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;
                  background: #0a0a0a; color: #f5f5f5; padding: 40px;
                  border-radius: 8px; border: 1px solid #1f1f1f;">
        <h1 style="font-size: 22px; color: #e8d5b7; margin: 0 0 8px 0;">
          Welcome to AI Art Arena
        </h1>
        <p style="font-family: monospace; color: #666; font-size: 12px;
                  letter-spacing: 0.05em; margin: 0 0 28px 0;">
          olliedoesis.dev
        </p>
        <p style="line-height: 1.8; color: #aaa; margin: 0 0 20px 0;">
          Hi ${data.name} — you are subscribed. Every week a new contest goes
          live, and you will hear about it first.
        </p>
        <p style="line-height: 1.8; color: #aaa; margin: 0 0 32px 0;">
          Head over to the arena any time to vote on this week's AI artworks.
        </p>
        <a href="${SITE_URL_PUBLIC}"
           style="display: inline-block; background: #e8d5b7; color: #0a0a0a;
                  padding: 12px 24px; text-decoration: none; font-family: monospace;
                  font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
                  border-radius: 4px; font-weight: bold;">
          Enter the Arena
        </a>
        <p style="margin: 32px 0 0 0; font-size: 11px; color: #333;
                  font-family: monospace;">
          olliedoesis.dev — reply to this email to unsubscribe at any time.
        </p>
      </div>
    `,
  });
}

export async function sendArtistApplicationNotification(data: {
  applicantName: string;
  applicantEmail: string;
  artStyle: string;
  submissionTitle: string;
  submissionPrompt: string;
  submissionImageUrl: string;
  primaryTools: string[];
  yearsUsingAi: string;
  portfolioUrl: string | null;
  socialHandle: string | null;
}): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error("ADMIN_EMAIL not set");

  const toolsList = data.primaryTools.join(", ");

  await resend.emails.send({
    from: "AI Art Arena <notifications@olliedoesis.dev>",
    to: adminEmail,
    subject: `New artist application — ${data.applicantName}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;
                  background: #0a0a0a; color: #f5f5f5; padding: 40px;
                  border-radius: 8px; border: 1px solid #1f1f1f;">

        <h1 style="font-size: 22px; color: #e8d5b7; margin: 0 0 8px 0;">
          New Artist Application
        </h1>
        <p style="font-family: monospace; color: #666; font-size: 12px;
                  letter-spacing: 0.05em; margin: 0 0 32px 0;">
          AI Art Arena
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 10px 0; font-family: monospace; font-size: 11px;
                       color: #555; text-transform: uppercase; letter-spacing: 0.06em;
                       border-bottom: 1px solid #1f1f1f; width: 40%;">Name</td>
            <td style="padding: 10px 0; font-size: 14px; color: #f5f5f5;
                       border-bottom: 1px solid #1f1f1f;">${data.applicantName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-family: monospace; font-size: 11px;
                       color: #555; text-transform: uppercase; letter-spacing: 0.06em;
                       border-bottom: 1px solid #1f1f1f;">Email</td>
            <td style="padding: 10px 0; font-size: 14px; color: #f5f5f5;
                       border-bottom: 1px solid #1f1f1f;">
              <a href="mailto:${data.applicantEmail}" style="color: #e8d5b7; text-decoration: none;">
                ${data.applicantEmail}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-family: monospace; font-size: 11px;
                       color: #555; text-transform: uppercase; letter-spacing: 0.06em;
                       border-bottom: 1px solid #1f1f1f;">Style</td>
            <td style="padding: 10px 0; font-size: 14px; color: #f5f5f5;
                       border-bottom: 1px solid #1f1f1f;">${data.artStyle}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-family: monospace; font-size: 11px;
                       color: #555; text-transform: uppercase; letter-spacing: 0.06em;
                       border-bottom: 1px solid #1f1f1f;">Tools</td>
            <td style="padding: 10px 0; font-size: 14px; color: #f5f5f5;
                       border-bottom: 1px solid #1f1f1f;">${toolsList}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-family: monospace; font-size: 11px;
                       color: #555; text-transform: uppercase; letter-spacing: 0.06em;
                       border-bottom: 1px solid #1f1f1f;">Experience</td>
            <td style="padding: 10px 0; font-size: 14px; color: #f5f5f5;
                       border-bottom: 1px solid #1f1f1f;">${data.yearsUsingAi}</td>
          </tr>
          ${data.portfolioUrl ? `
          <tr>
            <td style="padding: 10px 0; font-family: monospace; font-size: 11px;
                       color: #555; text-transform: uppercase; letter-spacing: 0.06em;
                       border-bottom: 1px solid #1f1f1f;">Portfolio</td>
            <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid #1f1f1f;">
              <a href="${data.portfolioUrl}" style="color: #e8d5b7;" target="_blank">
                ${data.portfolioUrl}
              </a>
            </td>
          </tr>` : ""}
          ${data.socialHandle ? `
          <tr>
            <td style="padding: 10px 0; font-family: monospace; font-size: 11px;
                       color: #555; text-transform: uppercase; letter-spacing: 0.06em;">Social</td>
            <td style="padding: 10px 0; font-size: 14px; color: #f5f5f5;">${data.socialHandle}</td>
          </tr>` : ""}
        </table>

        <div style="background: #111; border-left: 3px solid #e8d5b7;
                    padding: 18px 22px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0 0 6px 0; font-family: monospace; font-size: 11px;
                    color: #555; text-transform: uppercase; letter-spacing: 0.06em;">
            Submission Title
          </p>
          <p style="margin: 0 0 18px 0; font-size: 16px; color: #f5f5f5;">
            ${data.submissionTitle}
          </p>
          <p style="margin: 0 0 6px 0; font-family: monospace; font-size: 11px;
                    color: #555; text-transform: uppercase; letter-spacing: 0.06em;">
            Prompt Used
          </p>
          <p style="margin: 0; font-size: 14px; color: #aaa; line-height: 1.7;">
            ${data.submissionPrompt}
          </p>
        </div>

        <img src="${data.submissionImageUrl}"
             alt="Submitted artwork"
             style="width: 100%; border-radius: 4px; border: 1px solid #1f1f1f;
                    margin-bottom: 28px;" />

        <a href="${SITE_URL_PUBLIC}/admin/applications"
           style="display: inline-block; background: #e8d5b7; color: #0a0a0a;
                  padding: 12px 24px; text-decoration: none; font-family: monospace;
                  font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
                  border-radius: 4px; font-weight: bold;">
          Review in Admin
        </a>

        <p style="margin: 32px 0 0 0; font-size: 11px; color: #333; font-family: monospace;">
          olliedoesis.dev — admin notification
        </p>
      </div>
    `,
  });
}
