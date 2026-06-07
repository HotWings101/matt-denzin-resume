"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, Sparkles, Square, BookOpen, RotateCcw } from "lucide-react";
import { getVisitorId, cn } from "@/lib/utils";
import { track } from "@/lib/track-client";
import { suggestedQuestions } from "@/data/knowledge";
import { ThinkingDots } from "@/components/ui/spinner";

interface Citation {
  topic: string;
  source: string | null;
}

function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function citationsOf(message: UIMessage): Citation[] {
  const parts = (message.parts ?? []) as Array<{ type: string; data?: unknown }>;
  const part = parts.find((p) => p.type === "data-citations");
  return part?.data ? (part.data as Citation[]) : [];
}

/** Light, safe formatter: paragraphs + "- " bullet lists. No HTML injection. */
function FormattedText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter(Boolean);
  return (
    <>
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*[-*]\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="my-1.5 space-y-1 pl-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  <span>{l.replace(/^\s*[-*]\s+/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="my-1.5 first:mt-0 last:mb-0">
            {block}
          </p>
        );
      })}
    </>
  );
}

export function CareerChat({ className }: { className?: string }) {
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ids = useState(() => ({
    visitorId: typeof window !== "undefined" ? getVisitorId() : "server",
    chatSessionId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : "",
  }))[0];

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: ids }),
    [ids],
  );

  const { messages, sendMessage, status, stop, error } = useChat({ transport });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  function submit(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    if (!started) {
      setStarted(true);
      track("chat_started", { firstQuestion: q });
    }
    sendMessage({ text: q });
    setInput("");
  }

  const hasConversation = messages.length > 0;

  return (
    <div
      className={cn(
        "card-paper glow-accent overflow-hidden rounded-2xl",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <span className="eyebrow !text-foreground">Interview my career</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            live
          </span>
        </div>
      </div>

      {/* Conversation */}
      {hasConversation && (
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-label="Conversation with Matt's career assistant"
          className="scroll-slim max-h-[42vh] space-y-4 overflow-y-auto px-5 py-4"
        >
          {messages.map((m) => {
            const isUser = m.role === "user";
            const citations = isUser ? [] : citationsOf(m);
            return (
              <div
                key={m.id}
                className={cn("flex", isUser ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] text-[0.95rem] leading-relaxed",
                    isUser
                      ? "rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-background"
                      : "text-foreground",
                  )}
                >
                  {isUser ? (
                    textOf(m)
                  ) : (
                    <>
                      <FormattedText text={textOf(m)} />
                      {citations.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {citations.map((c, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[0.7rem] text-muted"
                              title={c.source ?? undefined}
                            >
                              <BookOpen className="size-3 text-accent" />
                              {c.topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {status === "submitted" && (
            <div
              className="flex justify-start"
              role="status"
              aria-label="Generating answer"
            >
              <ThinkingDots className="text-accent" />
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-clay">
              Something went wrong. Please try again or email Matt directly.
            </p>
          )}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-surface/60 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-end gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasConversation
                ? "Ask a follow-up…"
                : "Ask my career anything — e.g. “Is Matt a fit for an AI PM role?”"
            }
            aria-label="Ask about Matt's career"
            className="h-11 flex-1 rounded-xl border border-transparent bg-transparent px-3 text-[0.95rem] text-foreground placeholder:text-faint focus:outline-none"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              aria-label="Stop"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-foreground transition hover:bg-border"
            >
              <Square className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground transition hover:bg-accent-strong disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </form>

        {/* Suggested questions (empty state) */}
        {!hasConversation && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => submit(q)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-left text-[0.8rem] text-muted transition hover:border-accent hover:text-accent"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {hasConversation && (
          <div className="mt-2 flex items-center justify-between px-1">
            <p className="text-[0.7rem] text-faint">
              Grounded in Matt&apos;s résumé · may summarize
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 text-[0.7rem] text-faint transition hover:text-muted"
            >
              <RotateCcw className="size-3" /> reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
