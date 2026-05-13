"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

function getInitial(name: string | null): string {
  if (!name) return "?";
  return name.trim()[0].toUpperCase();
}

interface Props {
  avatarUrl: string | null;
  displayName: string | null;
  userId: string;
  isOwnProfile: boolean;
  onAvatarChange: (newUrl: string | null) => void;
}

export function AvatarUpload({ avatarUrl, displayName, isOwnProfile, onAvatarChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displaySrc = previewUrl ?? avatarUrl;

  async function handleAvatarUpload(file: File) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP, or GIF images are accepted.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Profile picture must be under 3MB.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setIsUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setPreviewUrl(null);
        toast.error(data.error ?? "Upload failed.");
      } else {
        onAvatarChange(data.avatarUrl);
        setPreviewUrl(null);
        toast.success("Profile picture updated.");
      }
    } catch {
      setPreviewUrl(null);
      toast.error("Network error — please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove() {
    try {
      const res = await fetch("/api/profile/avatar", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to remove photo.");
      } else {
        onAvatarChange(null);
        toast.success("Profile picture removed.");
      }
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setConfirmingRemove(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      {/* Avatar circle */}
      <div
        style={{ position: "relative", width: "88px", height: "88px", cursor: isOwnProfile ? "pointer" : "default" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => isOwnProfile && !isUploading && fileInputRef.current?.click()}
      >
        {/* Image or initials */}
        <div style={{
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          overflow: "hidden",
          background: "var(--color-bg-surface2)",
          border: "3px solid var(--color-bg-base)",
          boxShadow: "0 0 0 2px var(--color-border-mid)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {displaySrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displaySrc}
              alt={displayName ?? "Avatar"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{
              fontFamily: "var(--font-dm-mono)",
              fontWeight: 700,
              fontSize: "1.75rem",
              color: "var(--color-purple-light)",
              letterSpacing: "-0.02em",
            }}>
              {getInitial(displayName)}
            </span>
          )}
        </div>

        {/* Hover / upload overlay */}
        {isOwnProfile && (
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            opacity: (isUploading || hovered) ? 1 : 0,
            transition: "opacity 0.15s",
            pointerEvents: "none",
          }}>
            {isUploading ? (
              <div style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.2)",
                borderTopColor: "white",
                animation: "avatarSpin 0.7s linear infinite",
              }} />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{
                  fontFamily: "var(--font-dm-mono)",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "white",
                }}>
                  Change
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Remove photo link */}
      {isOwnProfile && avatarUrl && (
        <div style={{ marginTop: "8px" }}>
          {confirmingRemove ? (
            <span style={{ fontFamily: "var(--font-dm-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
              Sure?{" "}
              <span
                onClick={handleRemove}
                style={{ color: "var(--color-status-error)", cursor: "pointer", textDecoration: "underline" }}
              >
                Yes
              </span>
              {" / "}
              <span
                onClick={() => setConfirmingRemove(false)}
                style={{ color: "var(--color-text-muted)", cursor: "pointer", textDecoration: "underline" }}
              >
                Cancel
              </span>
            </span>
          ) : (
            <span
              onClick={() => setConfirmingRemove(true)}
              style={{
                fontFamily: "var(--font-dm-mono)",
                fontSize: "11px",
                color: "var(--color-text-dim)",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              Remove photo
            </span>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleAvatarUpload(f);
        }}
      />

      <style>{`@keyframes avatarSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
