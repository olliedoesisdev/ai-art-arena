"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function MarkdownText({ text }: { text: string }) {
  // Render markdown links [label](href) as anchor tags, **bold**, and line breaks
  const parts = text.split(/(\[([^\]]+)\]\(([^)]+)\)|\*\*[^*]+\*\*)/g);
  const nodes: React.ReactNode[] = [];
  let i = 0;
  for (const part of parts) {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (linkMatch) {
      nodes.push(
        <a
          key={i++}
          href={linkMatch[2]}
          style={{
            color: "var(--color-purple-light)",
            textDecoration: "underline",
            textDecorationColor: "rgba(167,139,250,0.4)",
          }}
        >
          {linkMatch[1]}
        </a>
      );
    } else if (boldMatch) {
      nodes.push(<strong key={i++} style={{ color: "var(--color-text)", fontWeight: 600 }}>{boldMatch[1]}</strong>);
    } else if (part) {
      // Split on newlines to render line breaks
      const lines = part.split("\n");
      lines.forEach((line, j) => {
        if (j > 0) nodes.push(<br key={`${i}-br-${j}`} />);
        if (line) nodes.push(<span key={`${i}-${j}`}>{line}</span>);
      });
      i++;
    }
  }
  return <>{nodes}</>;
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          maxWidth: "82%",
          padding: "9px 13px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser
            ? "var(--color-purple-DEFAULT)"
            : "var(--color-bg-surface2)",
          border: isUser ? "none" : "1px solid var(--color-border-subtle)",
          fontSize: "0.8125rem",
          lineHeight: 1.55,
          color: isUser ? "#fff" : "var(--color-text-muted)",
          wordBreak: "break-word",
        }}
      >
        <MarkdownText text={message.content} />
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "10px" }}>
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "14px 14px 14px 4px",
          background: "var(--color-bg-surface2)",
          border: "1px solid var(--color-border-subtle)",
          display: "flex",
          gap: "4px",
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--color-text-dim)",
              display: "inline-block",
              animation: "chatDot 1.2s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm the AI Art Arena assistant. Ask me anything about the site — how voting works, where to find past contests, or anything else.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages: Message[] = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    // Placeholder assistant message that we'll stream into
    const assistantPlaceholder: Message = { role: "assistant", content: "" };
    setMessages([...nextMessages, assistantPlaceholder]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Chat request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, messages, streaming]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Dot animation keyframes */}
      <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 100,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "var(--color-purple-DEFAULT)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(139,92,246,0.35)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          color: "#fff",
          fontSize: "1.25rem",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 30px rgba(139,92,246,0.50)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(139,92,246,0.35)";
        }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M17 11.5c0 1.1-.9 2-2 2H6l-3 3V4a2 2 0 012-2h10a2 2 0 012 2v7.5z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AI Art Arena chat assistant"
          style={{
            position: "fixed",
            bottom: "88px",
            right: "24px",
            zIndex: 99,
            width: "340px",
            maxWidth: "calc(100vw - 32px)",
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-mid)",
            borderRadius: "14px",
            boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "chatSlideUp 0.25s ease",
          }}
        >
          <style>{`
            @keyframes chatSlideUp {
              from { opacity: 0; transform: translateY(10px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--color-border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "var(--color-purple-dim)",
                border: "1px solid var(--color-border-mid)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M17 11.5c0 1.1-.9 2-2 2H6l-3 3V4a2 2 0 012-2h10a2 2 0 012 2v7.5z"
                  stroke="var(--color-purple-light)"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2 }}>
                Arena Assistant
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--color-status-success)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-status-success)", display: "inline-block" }} />
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px 14px 4px",
              minHeight: "240px",
              maxHeight: "340px",
            }}
          >
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {streaming && messages[messages.length - 1]?.content === "" && (
              <TypingIndicator />
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid var(--color-border-subtle)",
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
              flexShrink: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              rows={1}
              disabled={streaming}
              style={{
                flex: 1,
                background: "var(--color-bg-surface2)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "0.8125rem",
                color: "var(--color-text)",
                outline: "none",
                resize: "none",
                lineHeight: 1.4,
                fontFamily: "var(--font-syne)",
                maxHeight: "80px",
                overflowY: "auto",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-border-strong)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border-subtle)"; }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || streaming}
              aria-label="Send message"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                background: !input.trim() || streaming ? "var(--color-bg-surface3)" : "var(--color-purple-DEFAULT)",
                border: "none",
                cursor: !input.trim() || streaming ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
                color: !input.trim() || streaming ? "var(--color-text-dim)" : "#fff",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path d="M2 7.5h11M8.5 3l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
