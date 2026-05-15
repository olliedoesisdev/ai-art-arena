import Anthropic from "@anthropic-ai/sdk";
import { createPublicClient } from "@/lib/supabase/server";
import { logger, generateRequestId } from "@/lib/logger";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const ChatSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
});

async function getActiveContestContext(): Promise<string> {
  try {
    const supabase = createPublicClient();
    const { data: contest } = await supabase
      .from("contests")
      .select("id, week_number, end_date, artworks(id, title, vote_count)")
      .eq("status", "active")
      .order("week_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!contest) return "There is no active contest right now. Check the Archive page for past results.";

    const end = new Date(contest.end_date);
    const hoursLeft = Math.max(0, Math.round((end.getTime() - Date.now()) / 3600000));
    const daysLeft = Math.floor(hoursLeft / 24);
    const timeLeft = daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""}` : `${hoursLeft} hour${hoursLeft !== 1 ? "s" : ""}`;

    const artworks = Array.isArray(contest.artworks) ? contest.artworks : [];
    const artworkList = artworks
      .sort((a, b) => b.vote_count - a.vote_count)
      .map((a, i) => `  ${i + 1}. "${a.title}" — ${a.vote_count} vote${a.vote_count !== 1 ? "s" : ""}`)
      .join("\n");

    return `ACTIVE CONTEST: Week ${contest.week_number}
Voting closes in: ${timeLeft}
Contest page: /contest/${contest.id}
Artworks in this contest (ranked by votes):
${artworkList || "  No artworks yet"}`;
  } catch {
    return "Contest data temporarily unavailable.";
  }
}

function buildSystemPrompt(contestContext: string): string {
  return `You are the AI Art Arena assistant — a helpful, friendly chatbot on AI Art Arena (olliedoesis.dev), a weekly voting contest platform for AI-generated artwork.

Your job is to answer visitor questions about the site, help them navigate, and explain how everything works. Keep responses concise and conversational. When pointing somewhere on the site, include a markdown link like [Contest page](/contest/...) so they can click directly.

## About AI Art Arena
AI Art Arena is a portfolio project by Oliver White demonstrating what AI-assisted voting platforms can look like. Every week, a set of AI-generated artworks compete for votes. Visitors vote once per contest (24-hour cooldown). At week end, the contest auto-archives and a new one begins.

## How voting works
- Anyone can vote — no account required
- One vote per person per contest (tracked by IP)
- Signing in gives you a personal vote separate from your device
- Voting closes when the contest timer reaches zero
- Results are permanent once archived

## Navigation
- **Home** — [olliedoesis.dev](/) — hero, stats, how it works, last winner
- **Contest** — [/contest](/contest) — the live voting page for this week
- **Archive** — [/archive](/archive) — all past contests and their results
- **Leaderboard** — [/leaderboard](/leaderboard) — all-time top-voted artworks across every contest
- **About** — [/about](/about) — about the project and Oliver White
- **Blog** — [/blog](/blog) — articles about AI art, the build, and creative process
- **Sign in** — [/signin](/signin) — GitHub OAuth or email/password

## Current contest status
${contestContext}

## Common questions
- "How do I vote?" — Go to the [Contest page](/contest), pick your favourite artwork, and click the vote button. No account needed.
- "Can I vote more than once?" — One vote per contest per person. Signing in gives you a personal vote tied to your account rather than your device.
- "When does voting end?" — See the countdown timer on the [Contest page](/contest).
- "Where can I see past results?" — The [Archive](/archive) has every previous contest and its winner.
- "Who made this?" — Oliver White built AI Art Arena as a portfolio project. Read more on the [About page](/about).
- "Can I submit my art?" — Yes! Apply via the [Join as Artist](/join?track=artist) page.

## Rules
- Never make up contest data — only use the live contest status provided above
- Never claim abilities you do not have (you cannot vote on someone's behalf, create accounts, etc.)
- Stay on topic — if asked about something unrelated to AI Art Arena, politely redirect
- Keep responses under 120 words unless a detailed explanation is genuinely needed
- Never use phrases like "As an AI language model..." — just answer naturally`;
}

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const start = Date.now();
  logger.info({ requestId, path: "/api/v1/chat" }, "chat request received");

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }

    const result = ChatSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    const { messages } = result.data;

    const [contestContext] = await Promise.all([getActiveContestContext()]);
    const systemPrompt = buildSystemPrompt(contestContext);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } catch (err) {
          logger.error({ requestId, err }, "chat stream error");
          controller.error(err);
        } finally {
          controller.close();
          const ms = Date.now() - start;
          logger.info({ requestId, ms }, "chat stream complete");
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Request-Id": requestId,
      },
    });
  } catch (error) {
    const ms = Date.now() - start;
    logger.error({ requestId, ms, error }, "chat unhandled error");
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
