"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { UserProfile } from "@/lib/types";

interface Props {
  profile: UserProfile;
  onClose: () => void;
  onSaved: (updated: Partial<UserProfile>) => void;
}

export function EditProfileModal({ profile, onClose, onSaved }: Props) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile.website_url ?? "");
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [isSaving, setIsSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSave() {
    if (!displayName.trim()) {
      toast.error("Display name is required.");
      return;
    }
    if (bio.length > 300) {
      toast.error("Bio must be under 300 characters.");
      return;
    }
    if (websiteUrl && !/^https?:\/\/.+/.test(websiteUrl)) {
      toast.error("Website must be a valid URL starting with http:// or https://");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim() || undefined,
          bio: bio.trim(),
          website_url: websiteUrl.trim(),
          is_public: isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to save profile.");
        return;
      }
      onSaved({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        website_url: websiteUrl.trim() || null,
        is_public: isPublic,
      });
      toast.success("Profile updated.");
      onClose();
    } catch {
      toast.error("Network error - try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--color-bg-base)",
    border: "1px solid var(--color-border-mid)",
    borderRadius: "8px",
    color: "var(--color-text)",
    fontSize: "14px",
    fontFamily: "var(--font-syne)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-dm-mono)",
    marginBottom: "6px",
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--color-bg-surface)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: "14px",
          padding: "32px",
          width: "100%",
          maxWidth: "480px",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            color: "var(--color-text-muted)",
            fontSize: "18px",
            cursor: "pointer",
            lineHeight: 1,
            padding: "4px",
          }}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 style={{
          fontFamily: "var(--font-syne)",
          fontSize: "1.25rem",
          fontWeight: 800,
          color: "var(--color-text)",
          letterSpacing: "-0.02em",
          marginBottom: "24px",
        }}>
          Edit Profile
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Display name */}
          <div>
            <label style={labelStyle}>
              Display Name <span style={{ color: "var(--color-status-error)" }}>*</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              placeholder="Your display name"
              style={inputStyle}
            />
            <div style={{ fontSize: "11px", color: "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)", marginTop: "4px", textAlign: "right" }}>
              {displayName.length}/50
            </div>
          </div>

          {/* Bio */}
          <div>
            <label style={labelStyle}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Tell people about yourself..."
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
            />
            <div style={{ fontSize: "11px", color: bio.length > 270 ? "var(--color-status-warning)" : "var(--color-text-dim)", fontFamily: "var(--font-dm-mono)", marginTop: "4px", textAlign: "right" }}>
              {bio.length}/300
            </div>
          </div>

          {/* Website */}
          <div>
            <label style={labelStyle}>Website</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>

          {/* Public toggle */}
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            padding: "14px",
            background: "rgba(139,92,246,0.05)",
            border: "1px solid rgba(139,92,246,0.12)",
            borderRadius: "8px",
          }}>
            <div>
              <div style={{ fontSize: "14px", color: "var(--color-text)", fontWeight: 600, marginBottom: "4px" }}>
                Public profile
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                When off, only you can see your profile.
              </div>
            </div>
            <button
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(!isPublic)}
              style={{
                flexShrink: 0,
                width: "44px",
                height: "24px",
                borderRadius: "12px",
                background: isPublic ? "var(--color-purple)" : "var(--color-bg-surface3)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute",
                top: "2px",
                left: isPublic ? "22px" : "2px",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "white",
                transition: "left 0.2s",
              }} />
            </button>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              width: "100%",
              padding: "12px",
              background: isSaving ? "var(--color-purple-dim)" : "var(--color-purple)",
              border: "none",
              borderRadius: "8px",
              color: "var(--color-text)",
              fontSize: "12px",
              fontFamily: "var(--font-dm-mono)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: isSaving ? "wait" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
