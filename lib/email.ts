import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";

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
