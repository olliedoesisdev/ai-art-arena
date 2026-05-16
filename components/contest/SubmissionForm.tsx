"use client";
// components/contest/SubmissionForm.tsx [CLIENT]
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ThemeBadge } from "./ThemeBadge";

interface SubmissionFormProps {
  contestId: string;
  contestTitle: string;
  theme?: string | null;
  themeDescription?: string | null;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--color-bg-surface2)",
  border: "1px solid rgba(139,92,246,0.25)",
  borderRadius: "8px",
  color: "var(--color-text)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  colorScheme: "dark",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--color-text-muted)",
  marginBottom: "6px",
};

export function SubmissionForm({
  contestId,
  contestTitle,
  theme,
  themeDescription,
}: SubmissionFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((selected: File) => {
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error("Only JPEG, PNG, and WebP images are accepted.");
      return;
    }
    if (selected.size > MAX_BYTES) {
      toast.error("Image must be under 8 MB.");
      return;
    }
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreview(url);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a photo to upload.");
      return;
    }
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("contest_id", contestId);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/contests/photo/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
      } else {
        toast.error(data.error ?? "Submission failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Network error — please try again.");
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          background: "var(--color-status-successDim)",
          border: "1px solid rgba(52,211,153,0.25)",
          borderRadius: "14px",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>✓</div>
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "var(--color-text)",
            marginBottom: "10px",
          }}
        >
          Submission received
        </h2>
        <p style={{ fontSize: "0.9375rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          Your submission is pending review. You will be notified when it goes live.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Contest context header */}
      <div style={{ marginBottom: "32px" }}>
        {theme && (
          <div style={{ marginBottom: "8px" }}>
            <ThemeBadge theme={theme} />
          </div>
        )}
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontWeight: 800,
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            marginBottom: theme && themeDescription ? "8px" : "0",
          }}
        >
          {theme ?? contestTitle}
        </h1>
        {theme && themeDescription && (
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)", lineHeight: 1.55, maxWidth: "480px" }}>
            {themeDescription}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "560px" }}>
        {/* File upload */}
        <div>
          <label style={labelStyle}>Photo</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              cursor: "pointer",
              border: `2px dashed ${preview ? "rgba(139,92,246,0.4)" : "rgba(139,92,246,0.2)"}`,
              borderRadius: "12px",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
          >
            {preview ? (
              <div style={{ position: "relative", aspectRatio: "4/3" }}>
                <Image
                  src={preview}
                  alt="Selected photo preview"
                  fill
                  sizes="560px"
                  className="object-cover"
                  unoptimized
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    background: "rgba(8,8,14,0.75)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontFamily: "var(--font-dm-mono)",
                    fontSize: "11px",
                    color: "var(--color-purple-light)",
                  }}
                >
                  Click to change
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "var(--color-bg-surface2)",
                }}
              >
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "6px" }}>
                  Click to select a photo
                </p>
                <p style={{ fontSize: "12px", color: "var(--color-text-dim)" }}>
                  JPEG, PNG or WebP &middot; max 8 MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>
            Title <span style={{ color: "var(--color-text-dim)", fontWeight: 400 }}>({title.length}/100)</span>
          </label>
          <input
            type="text"
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your photo a title"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>
            Description <span style={{ color: "var(--color-text-dim)", fontWeight: 400 }}>optional &middot; {description.length}/300</span>
          </label>
          <textarea
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about this shot — location, technique, story."
            rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !file}
          style={{
            padding: "12px",
            background: isSubmitting || !file ? "var(--color-text-dim)" : "var(--color-purple)",
            border: "none",
            borderRadius: "8px",
            color: "var(--color-text)",
            fontFamily: "var(--font-syne)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            cursor: isSubmitting || !file ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {isSubmitting ? "Uploading..." : "Submit photo"}
        </button>
      </form>
    </div>
  );
}
