import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  gateway,
  type UIMessage,
} from "ai";
import { CHAT_MODEL } from "@/lib/ai/models";
import {
  retrieveContext,
  formatContext,
  toCitations,
  type Citation,
  type RetrievedChunk,
} from "@/lib/ai/retrieval";
import { chatSystemPrompt } from "@/lib/ai/prompts";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { recordEvent } from "@/lib/tracking";

export const maxDuration = 30;

function textFromMessage(m: UIMessage | undefined): string {
  if (!m) return "";
  return (m.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();
}

async function persistExchange(
  sessionId: string | undefined,
  question: string,
  answer: string,
  citations: Citation[],
  visitorId: string | undefined,
  userAgent: string | null,
  referrer: string | null,
) {
  if (!isSupabaseConfigured() || !sessionId) return;
  try {
    const supabase = getAdminClient();
    await supabase
      .from("chat_sessions")
      .upsert(
        {
          id: sessionId,
          visitor_id: visitorId ?? null,
          user_agent: userAgent,
          referrer,
        },
        { onConflict: "id" },
      );
    await supabase.from("chat_messages").insert([
      { session_id: sessionId, role: "user", content: question },
      { session_id: sessionId, role: "assistant", content: answer, citations },
    ]);
    await recordEvent({
      type: "chat_question",
      path: "/",
      visitorId,
      meta: { question },
      userAgent,
      referrer,
    });
  } catch (err) {
    console.error("[chat] persist failed:", err);
  }
}

export async function POST(req: Request) {
  let body: {
    messages: UIMessage[];
    visitorId?: string;
    chatSessionId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  const { messages, visitorId, chatSessionId } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("No messages provided", { status: 400 });
  }
  if (messages.length > 50) {
    return new Response("Too many messages", { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const query = textFromMessage(lastUser).slice(0, 4000);

  const userAgent = req.headers.get("user-agent");
  const referrer = req.headers.get("referer");

  let chunks: RetrievedChunk[] = [];
  try {
    chunks = query ? await retrieveContext(query) : [];
  } catch (err) {
    console.error("[chat] retrieval threw:", err);
    chunks = [];
  }
  const citations = toCitations(chunks);
  const system = chatSystemPrompt(formatContext(chunks), chunks.length > 0);
  const modelMessages = await convertToModelMessages(messages.slice(-20));

  try {
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        if (citations.length > 0) {
          writer.write({ type: "data-citations", data: citations });
        }
        const result = streamText({
          model: gateway(CHAT_MODEL),
          system,
          messages: modelMessages,
          temperature: 0.3,
          onFinish: async ({ text }) => {
            await persistExchange(
              chatSessionId,
              query,
              text,
              citations,
              visitorId,
              userAgent,
              referrer,
            );
          },
        });
        writer.merge(result.toUIMessageStream());
      },
      onError: (error) => {
        console.error("[chat] stream error:", error);
        return "Sorry — I hit a problem answering that. Please try again, or email Matt directly.";
      },
    });
    return createUIMessageStreamResponse({ stream });
  } catch (err) {
    console.error("[chat] fatal:", err);
    return new Response(
      "The career chat is temporarily unavailable. Please email Matt directly.",
      { status: 503 },
    );
  }
}
