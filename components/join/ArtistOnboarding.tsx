"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

// ── Shared styles ──────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#0d0d0d",
  border: "1px solid #1f1f1f",
  borderRadius: "6px",
  color: "#f5f5f5",
  fontSize: "15px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-dm-mono)",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#555",
  marginBottom: "6px",
};

const primaryBtn: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "14px",
  background: "#e8d5b7",
  borderRadius: "6px",
  color: "#0a0a0a",
  fontFamily: "var(--font-dm-mono)",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  textAlign: "center",
  cursor: "pointer",
  userSelect: "none",
  transition: "opacity 0.15s",
  border: "none",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #1f1f1f",
  borderRadius: "6px",
  color: "#555",
  fontFamily: "var(--font-dm-mono)",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: "10px 20px",
  cursor: "pointer",
  transition: "border-color 0.15s, color 0.15s",
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  location: string;
  artist_bio: string;
  art_style: string;
  primary_tools: string[];
  years_using_ai: string;
  portfolio_url: string;
  social_handle: string;
  submission_title: string;
  submission_prompt: string;
}

interface UploadedImage {
  url: string;
  path: string;
  preview: string;
}

// ── Progress bar ───────────────────────────────────────────────────────────────

const STEP_LABELS = ["About You", "Your Practice", "Your Submission", "Review"];

function StepProgress({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {[1, 2, 3, 4].map((n, i) => {
          const done = step > n;
          const active = step === n;
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : 0 }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: done
                    ? "rgba(232,213,183,0.4)"
                    : active
                    ? "#e8d5b7"
                    : "#111",
                  border: done || active ? "none" : "1px solid #1f1f1f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? "#0a0a0a" : "#e8d5b7"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: active ? "#0a0a0a" : "#333",
                    }}
                  >
                    {String(n).padStart(2, "0")}
                  </span>
                )}
              </div>
              {i < 3 && (
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: step > n ? "rgba(232,213,183,0.4)" : "#1f1f1f",
                    transition: "background 0.2s",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
        {STEP_LABELS.map((label, i) => (
          <span
            key={label}
            style={{
              fontFamily: "var(--font-dm-mono)",
              fontSize: "9px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: step === i + 1 ? "#e8d5b7" : "#333",
              flex: i < 3 ? 1 : 0,
              textAlign: i === 0 ? "left" : i === 3 ? "right" : "center",
              transition: "color 0.2s",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Step 1 ─────────────────────────────────────────────────────────────────────

function Step1({
  data,
  onNext,
}: {
  data: Partial<FormData>;
  onNext: (d: Partial<FormData>) => void;
}) {
  const [name, setName] = useState(data.name ?? "");
  const [email, setEmail] = useState(data.email ?? "");
  const [location, setLocation] = useState(data.location ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim() || !email.includes("@")) e.email = "Valid email required.";
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({ name: name.trim(), email: email.trim(), location: location.trim() });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <label style={labelStyle}>Full Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
          style={{ ...inputStyle, borderColor: errors.name ? "#f87171" : "#1f1f1f" }}
          placeholder="Your name"
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.name ? "#f87171" : "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.name ? "#f87171" : "#1f1f1f"; }}
        />
        {errors.name && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-dm-mono)" }}>{errors.name}</p>}
      </div>
      <div>
        <label style={labelStyle}>Email Address *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
          style={{ ...inputStyle, borderColor: errors.email ? "#f87171" : "#1f1f1f" }}
          placeholder="you@example.com"
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.email ? "#f87171" : "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.email ? "#f87171" : "#1f1f1f"; }}
        />
        {errors.email && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-dm-mono)" }}>{errors.email}</p>}
      </div>
      <div>
        <label style={labelStyle}>Location <span style={{ color: "#333" }}>(optional)</span></label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={inputStyle}
          placeholder="City, Country"
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#1f1f1f"; }}
        />
      </div>
      <div style={{ marginTop: "8px" }}>
        <div role="button" tabIndex={0} onClick={handleNext} onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }} style={primaryBtn}>
          Next — Your Practice →
        </div>
      </div>
    </div>
  );
}

// ── Step 2 ─────────────────────────────────────────────────────────────────────

const AI_TOOLS = [
  "Midjourney", "DALL-E", "Stable Diffusion", "Adobe Firefly",
  "Ideogram", "Flux", "Leonardo AI", "Kling", "RunwayML", "Other",
];

const EXPERIENCE_OPTIONS = [
  "Less than 6 months", "6-12 months", "1-2 years", "3+ years",
];

function Step2({
  data,
  onNext,
  onBack,
}: {
  data: Partial<FormData>;
  onNext: (d: Partial<FormData>) => void;
  onBack: () => void;
}) {
  const [bio, setBio] = useState(data.artist_bio ?? "");
  const [style, setStyle] = useState(data.art_style ?? "");
  const [tools, setTools] = useState<string[]>(data.primary_tools ?? []);
  const [years, setYears] = useState(data.years_using_ai ?? "");
  const [portfolio, setPortfolio] = useState(data.portfolio_url ?? "");
  const [social, setSocial] = useState(data.social_handle ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleTool(tool: string) {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
    setErrors((p) => ({ ...p, tools: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (bio.trim().length < 20) e.bio = "Bio must be at least 20 characters.";
    if (!style.trim()) e.style = "Please describe your style.";
    if (tools.length === 0) e.tools = "Select at least one tool.";
    if (!years) e.years = "Please select an option.";
    if (portfolio && !portfolio.startsWith("http")) e.portfolio = "Must be a valid URL starting with http.";
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({
      artist_bio: bio.trim(),
      art_style: style.trim(),
      primary_tools: tools,
      years_using_ai: years,
      portfolio_url: portfolio.trim(),
      social_handle: social.trim(),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Tell us about yourself and your art *</label>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: bio.length > 550 ? "#f87171" : "#333" }}>
            {bio.length}/600
          </span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => { setBio(e.target.value); setErrors((p) => ({ ...p, bio: "" })); }}
          rows={4}
          maxLength={600}
          placeholder="I make dark fantasy portraits using..."
          style={{ ...inputStyle, resize: "vertical", borderColor: errors.bio ? "#f87171" : "#1f1f1f" }}
          onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = errors.bio ? "#f87171" : "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = errors.bio ? "#f87171" : "#1f1f1f"; }}
        />
        {errors.bio && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-dm-mono)" }}>{errors.bio}</p>}
      </div>

      <div>
        <label style={labelStyle}>How would you describe your visual style? *</label>
        <input
          type="text"
          value={style}
          onChange={(e) => { setStyle(e.target.value); setErrors((p) => ({ ...p, style: "" })); }}
          style={{ ...inputStyle, borderColor: errors.style ? "#f87171" : "#1f1f1f" }}
          placeholder="Surrealist, photorealistic, anime-inspired..."
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.style ? "#f87171" : "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.style ? "#f87171" : "#1f1f1f"; }}
        />
        {errors.style && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-dm-mono)" }}>{errors.style}</p>}
      </div>

      <div>
        <label style={labelStyle}>Which AI tools do you use? *</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
          {AI_TOOLS.map((tool) => {
            const selected = tools.includes(tool);
            return (
              <div
                key={tool}
                role="checkbox"
                aria-checked={selected}
                tabIndex={0}
                onClick={() => toggleTool(tool)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTool(tool); } }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: `1px solid ${selected ? "#e8d5b7" : "#1f1f1f"}`,
                  background: selected ? "rgba(232,213,183,0.12)" : "transparent",
                  color: selected ? "#e8d5b7" : "#555",
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.15s",
                }}
              >
                {tool}
              </div>
            );
          })}
        </div>
        {errors.tools && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "8px", fontFamily: "var(--font-dm-mono)" }}>{errors.tools}</p>}
      </div>

      <div>
        <label style={labelStyle}>How long have you been creating with AI? *</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
          {EXPERIENCE_OPTIONS.map((opt) => {
            const selected = years === opt;
            return (
              <div
                key={opt}
                role="radio"
                aria-checked={selected}
                tabIndex={0}
                onClick={() => { setYears(opt); setErrors((p) => ({ ...p, years: "" })); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setYears(opt); setErrors((p) => ({ ...p, years: "" })); } }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  border: `1px solid ${selected ? "#e8d5b7" : "#1f1f1f"}`,
                  background: selected ? "rgba(232,213,183,0.06)" : "transparent",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: `1.5px solid ${selected ? "#e8d5b7" : "#333"}`,
                    background: selected ? "#e8d5b7" : "transparent",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                />
                <span style={{ fontSize: "14px", color: selected ? "#f5f5f5" : "#888" }}>{opt}</span>
              </div>
            );
          })}
        </div>
        {errors.years && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-dm-mono)" }}>{errors.years}</p>}
      </div>

      <div>
        <label style={labelStyle}>Portfolio URL <span style={{ color: "#333" }}>(optional)</span></label>
        <input
          type="url"
          value={portfolio}
          onChange={(e) => { setPortfolio(e.target.value); setErrors((p) => ({ ...p, portfolio: "" })); }}
          style={{ ...inputStyle, borderColor: errors.portfolio ? "#f87171" : "#1f1f1f" }}
          placeholder="https://..."
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.portfolio ? "#f87171" : "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.portfolio ? "#f87171" : "#1f1f1f"; }}
        />
        {errors.portfolio && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-dm-mono)" }}>{errors.portfolio}</p>}
      </div>

      <div>
        <label style={labelStyle}>Social Handle <span style={{ color: "#333" }}>(optional)</span></label>
        <input
          type="text"
          value={social}
          onChange={(e) => setSocial(e.target.value)}
          style={inputStyle}
          placeholder="@yourhandle"
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#1f1f1f"; }}
        />
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <button onClick={onBack} style={ghostBtn}>← Back</button>
        <div role="button" tabIndex={0} onClick={handleNext} onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }} style={{ ...primaryBtn, flex: 1 }}>
          Next — Your Submission →
        </div>
      </div>
    </div>
  );
}

// ── Step 3 ─────────────────────────────────────────────────────────────────────

function Step3({
  data,
  uploadedImage,
  onNext,
  onBack,
  onImageUpload,
  onImageRemove,
}: {
  data: Partial<FormData>;
  uploadedImage: UploadedImage | null;
  onNext: (d: Partial<FormData>) => void;
  onBack: () => void;
  onImageUpload: (img: UploadedImage) => void;
  onImageRemove: () => void;
}) {
  const [title, setTitle] = useState(data.submission_title ?? "");
  const [prompt, setPrompt] = useState(data.submission_prompt ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Only JPEG, PNG, or WebP images are allowed."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB."); return; }

    setIsUploading(true);
    setErrors((p) => ({ ...p, image: "" }));

    const preview = URL.createObjectURL(file);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload/submission", { method: "POST", body: fd });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error ?? "Upload failed."); setIsUploading(false); return; }
      onImageUpload({ url: result.url, path: result.path, preview });
    } catch {
      toast.error("Network error during upload.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!uploadedImage) e.image = "Please upload your artwork.";
    if (!title.trim()) e.title = "Title is required.";
    if (prompt.trim().length < 10) e.prompt = "Please share more about the prompt you used.";
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({ submission_title: title.trim(), submission_prompt: prompt.trim() });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <p style={{ color: "#555", fontSize: "14px", fontStyle: "italic", margin: 0, lineHeight: 1.6 }}>
        Submit one piece for this application. If selected, this is the artwork that will enter the contest.
      </p>

      {/* Drop zone */}
      <div>
        {!uploadedImage ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "#e8d5b7" : errors.image ? "#f87171" : "#1f1f1f"}`,
              borderRadius: "10px",
              padding: "48px 24px",
              textAlign: "center",
              cursor: isUploading ? "wait" : "pointer",
              background: isDragging ? "rgba(232,213,183,0.04)" : "transparent",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            {isUploading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  border: "2px solid #1f1f1f", borderTopColor: "#e8d5b7",
                  animation: "spin 0.8s linear infinite",
                }} />
                <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "#555", letterSpacing: "0.08em" }}>
                  Uploading...
                </span>
              </div>
            ) : (
              <>
                <svg style={{ margin: "0 auto 16px", display: "block" }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "13px", color: "#555", margin: "0 0 6px", letterSpacing: "0.04em" }}>
                  Drag and drop or click to upload
                </p>
                <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "#333", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  JPEG, PNG, or WebP — max 10MB
                </p>
              </>
            )}
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "1", maxHeight: "300px", borderRadius: "8px", overflow: "hidden", border: "1px solid #1f1f1f" }}>
              <Image
                src={uploadedImage.preview}
                alt="Uploaded artwork preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={onImageRemove}
              onKeyDown={(e) => { if (e.key === "Enter") onImageRemove(); }}
              style={{
                marginTop: "8px",
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "#f87171",
                cursor: "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Remove image
            </div>
          </div>
        )}
        {errors.image && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "6px", fontFamily: "var(--font-dm-mono)" }}>{errors.image}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      <div>
        <label style={labelStyle}>Submission Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
          style={{ ...inputStyle, borderColor: errors.title ? "#f87171" : "#1f1f1f" }}
          placeholder="Give your piece a title"
          maxLength={100}
          onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.title ? "#f87171" : "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = errors.title ? "#f87171" : "#1f1f1f"; }}
        />
        {errors.title && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-dm-mono)" }}>{errors.title}</p>}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>The prompt or process you used *</label>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: prompt.length > 900 ? "#f87171" : "#333" }}>
            {prompt.length}/1000
          </span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setErrors((p) => ({ ...p, prompt: "" })); }}
          rows={4}
          maxLength={1000}
          placeholder="Describe the prompt, style references, settings, or technique — as much detail as you like."
          style={{ ...inputStyle, resize: "vertical", borderColor: errors.prompt ? "#f87171" : "#1f1f1f" }}
          onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = errors.prompt ? "#f87171" : "#e8d5b7"; }}
          onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = errors.prompt ? "#f87171" : "#1f1f1f"; }}
        />
        {errors.prompt && <p style={{ color: "#f87171", fontSize: "12px", marginTop: "4px", fontFamily: "var(--font-dm-mono)" }}>{errors.prompt}</p>}
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <button onClick={onBack} style={ghostBtn}>← Back</button>
        <div role="button" tabIndex={0} onClick={handleNext} onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }} style={{ ...primaryBtn, flex: 1 }}>
          Next — Review Your Application →
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Step 4 — Review ────────────────────────────────────────────────────────────

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: "8px", padding: "20px 24px", marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>{title}</span>
        <span
          role="button"
          tabIndex={0}
          onClick={onEdit}
          onKeyDown={(e) => { if (e.key === "Enter") onEdit(); }}
          style={{ fontFamily: "var(--font-dm-mono)", fontSize: "10px", color: "#e8d5b7", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}
        >
          Edit
        </span>
      </div>
      {children}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
      <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "#444", width: "120px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#bbb", lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

function Step4({
  data,
  uploadedImage,
  onSubmit,
  onBack,
  onGoToStep,
  isSubmitting,
}: {
  data: Partial<FormData>;
  uploadedImage: UploadedImage | null;
  onSubmit: () => void;
  onBack: () => void;
  onGoToStep: (n: number) => void;
  isSubmitting: boolean;
}) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const bio = data.artist_bio ?? "";
  const bioTruncated = bio.length > 180;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.5rem", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
        Everything look right?
      </h2>
      <p style={{ color: "#555", fontSize: "14px", margin: "0 0 28px" }}>Review your application before sending.</p>

      <ReviewSection title="About You" onEdit={() => onGoToStep(1)}>
        <ReviewRow label="Name" value={data.name} />
        <ReviewRow label="Email" value={data.email} />
        <ReviewRow label="Location" value={data.location || "Not provided"} />
      </ReviewSection>

      <ReviewSection title="Your Practice" onEdit={() => onGoToStep(2)}>
        <div style={{ marginBottom: "8px" }}>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "#444", display: "block", marginBottom: "4px" }}>Bio</span>
          <p style={{ fontSize: "13px", color: "#bbb", lineHeight: 1.6, margin: 0 }}>
            {bioTruncated && !bioExpanded ? bio.slice(0, 180) + "..." : bio}
            {bioTruncated && (
              <span
                role="button"
                tabIndex={0}
                onClick={() => setBioExpanded(!bioExpanded)}
                onKeyDown={(e) => { if (e.key === "Enter") setBioExpanded(!bioExpanded); }}
                style={{ color: "#e8d5b7", cursor: "pointer", marginLeft: "4px", fontFamily: "var(--font-dm-mono)", fontSize: "11px" }}
              >
                {bioExpanded ? "show less" : "show more"}
              </span>
            )}
          </p>
        </div>
        <ReviewRow label="Style" value={data.art_style} />
        <ReviewRow label="Tools" value={data.primary_tools?.join(", ")} />
        <ReviewRow label="Experience" value={data.years_using_ai} />
        {data.portfolio_url && <ReviewRow label="Portfolio" value={data.portfolio_url} />}
        {data.social_handle && <ReviewRow label="Social" value={data.social_handle} />}
      </ReviewSection>

      <ReviewSection title="Your Submission" onEdit={() => onGoToStep(3)}>
        {uploadedImage && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
            <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, border: "1px solid #1f1f1f" }}>
              <Image src={uploadedImage.preview} alt="Submission" fill className="object-cover" unoptimized />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "#555", margin: "0 0 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Uploaded
              </p>
              <p style={{ fontSize: "13px", color: "#bbb", margin: 0 }}>Image ready</p>
            </div>
          </div>
        )}
        <ReviewRow label="Title" value={data.submission_title} />
        <div>
          <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "#444", display: "block", marginBottom: "4px" }}>Prompt</span>
          <p style={{ fontSize: "13px", color: "#bbb", lineHeight: 1.5, margin: 0 }}>
            {(data.submission_prompt ?? "").slice(0, 100)}{(data.submission_prompt?.length ?? 0) > 100 ? "..." : ""}
          </p>
        </div>
      </ReviewSection>

      <p style={{ fontSize: "12px", color: "#333", lineHeight: 1.6, margin: "20px 0 24px", fontStyle: "italic" }}>
        By submitting you confirm this artwork is your own original AI-generated work and that you grant AI Art Arena the right to display it in the contest.
      </p>

      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={onBack} style={ghostBtn}>← Back</button>
        <div
          role="button"
          tabIndex={0}
          onClick={isSubmitting ? undefined : onSubmit}
          onKeyDown={(e) => { if (e.key === "Enter" && !isSubmitting) onSubmit(); }}
          style={{ ...primaryBtn, flex: 1, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "wait" : "pointer" }}
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </div>
      </div>
    </div>
  );
}

// ── Success screen ─────────────────────────────────────────────────────────────

function SuccessScreen({ email }: { email: string }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{
        fontFamily: "var(--font-dm-mono)",
        fontSize: "28px",
        fontWeight: 700,
        color: "#e8d5b7",
        letterSpacing: "0.2em",
        marginBottom: "28px",
      }}>
        PENDING
      </div>
      <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "2rem", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-0.03em", margin: "0 0 16px" }}>
        Application received.
      </h2>
      <p style={{ color: "#888", fontSize: "15px", lineHeight: 1.7, margin: "0 0 8px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
        Your work is under review. We will be in touch at {email} once a decision has been made.
      </p>
      <p style={{ color: "#555", fontSize: "14px", lineHeight: 1.7, margin: "0 0 36px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
        New contests open every week — keep creating.
      </p>
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "12px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#e8d5b7",
          textDecoration: "none",
          borderBottom: "1px solid rgba(232,213,183,0.4)",
          paddingBottom: "2px",
        }}
      >
        Watch the Current Contest →
      </Link>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ArtistOnboarding() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  function mergeData(partial: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...partial }));
  }

  if (isDone) {
    return <SuccessScreen email={formData.email ?? ""} />;
  }

  async function handleSubmit() {
    if (!uploadedImage) { toast.error("Image is required."); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        submission_image_url: uploadedImage.url,
        submission_image_path: uploadedImage.path,
      };

      const res = await fetch("/api/artist-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "Submission failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
      setIsDone(true);
    } catch {
      toast.error("Network error — please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "1.75rem", fontWeight: 800, color: "#f5f5f5", letterSpacing: "-0.03em", margin: "0 0 8px" }}>
        Compete as an Artist
      </h2>
      <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, margin: "0 0 36px" }}>
        Tell us about your work and submit a piece for consideration. If selected, it enters the next weekly contest.
      </p>

      <StepProgress step={step} />

      {step === 1 && (
        <Step1
          data={formData}
          onNext={(d) => { mergeData(d); setStep(2); }}
        />
      )}
      {step === 2 && (
        <Step2
          data={formData}
          onNext={(d) => { mergeData(d); setStep(3); }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          data={formData}
          uploadedImage={uploadedImage}
          onNext={(d) => { mergeData(d); setStep(4); }}
          onBack={() => setStep(2)}
          onImageUpload={setUploadedImage}
          onImageRemove={() => setUploadedImage(null)}
        />
      )}
      {step === 4 && (
        <Step4
          data={formData}
          uploadedImage={uploadedImage}
          onSubmit={handleSubmit}
          onBack={() => setStep(3)}
          onGoToStep={(n) => setStep(n as 1 | 2 | 3 | 4)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
