"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { AvatarUpload } from "./AvatarUpload";
import { EditProfileButton } from "./EditProfileButton";

interface Props {
  profile: UserProfile;
  isOwnProfile: boolean;
  totalVotes: number;
  totalComments: number;
  weeksActive: number;
}

function StatBlock({ value, label, divider }: { value: number; label: string; divider?: boolean }) {
  return (
    <div style={{
      padding: "16px 20px",
      background: "var(--color-bg-base)",
      borderLeft: divider ? "1px solid var(--color-border-subtle)" : "none",
      textAlign: "center",
    }}>
      <div style={{
        fontFamily: "var(--font-dm-mono)",
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "var(--color-text)",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        marginBottom: "4px",
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-dm-mono)",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-text-muted)",
      }}>
        {label}
      </div>
    </div>
  );
}

export function ProfileHeaderClient({ profile, isOwnProfile, totalVotes, totalComments, weeksActive }: Props) {
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(profile.avatar_url);

  const displayName = profile.display_name || "Arena Member";
  const joinedDate = new Date(profile.joined_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ marginBottom: "48px" }}>
      {/* Banner */}
      <div style={{
        height: "120px",
        borderRadius: "16px 16px 0 0",
        background: "var(--color-profile-banner-bg)",
        border: "1px solid var(--color-profile-banner-border)",
        borderBottom: "none",
        position: "relative",
      }}>
        {/* Avatar overlapping banner bottom */}
        <div style={{
          position: "absolute",
          bottom: "-44px",
          left: "24px",
        }}>
          <AvatarUpload
            avatarUrl={currentAvatarUrl}
            displayName={profile.display_name}
            userId={profile.id}
            isOwnProfile={isOwnProfile}
            onAvatarChange={setCurrentAvatarUrl}
          />
        </div>

        {/* Edit button top-right */}
        {isOwnProfile && (
          <div style={{ position: "absolute", bottom: "-36px", right: "0" }}>
            <EditProfileButton
              profile={profile}
              onSaved={() => {
                if (typeof window !== "undefined") window.location.reload();
              }}
            />
          </div>
        )}
      </div>

      {/* Info block */}
      <div style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        borderTop: "none",
        borderRadius: "0 0 16px 16px",
        padding: "56px 24px 24px",
        marginBottom: "1px",
      }}>
        <h1 style={{
          fontFamily: "var(--font-syne)",
          fontSize: "1.625rem",
          fontWeight: 800,
          color: "var(--color-text)",
          letterSpacing: "-0.03em",
          margin: "0 0 2px",
        }}>
          {displayName}
        </h1>

        <div style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-purple-light)",
          margin: "0 0 6px",
        }}>
          AI Art Arena member
        </div>

        <div style={{
          fontFamily: "var(--font-dm-mono)",
          fontSize: "11px",
          color: "var(--color-text-muted)",
          letterSpacing: "0.06em",
          marginBottom: profile.bio || isOwnProfile ? "14px" : "0",
        }}>
          Member since {joinedDate}
        </div>

        {profile.bio ? (
          <p style={{
            color: "var(--color-text-muted)",
            fontSize: "14px",
            lineHeight: 1.65,
            margin: "0 0 14px",
            maxWidth: "560px",
          }}>
            {profile.bio}
          </p>
        ) : isOwnProfile ? (
          <p style={{
            color: "var(--color-text-dim)",
            fontSize: "13px",
            fontStyle: "italic",
            margin: "0 0 14px",
          }}>
            Add a bio to let people know who you are.
          </p>
        ) : null}

        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "var(--font-dm-mono)",
              fontSize: "11px",
              color: "var(--color-purple-light)",
              textDecoration: "none",
              marginBottom: "14px",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
              <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7M7 1h4m0 0v4m0-4L5.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {profile.website_url.replace(/^https?:\/\//, "")}
          </a>
        )}
      </div>

      {/* Stats bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        border: "1px solid var(--color-border-subtle)",
        borderTop: "none",
        borderRadius: "0 0 16px 16px",
        overflow: "hidden",
      }}>
        <StatBlock value={totalVotes} label="Votes Cast" />
        <StatBlock value={totalComments} label="Comments" divider />
        <StatBlock value={weeksActive} label="Weeks Active" divider />
      </div>

      <div style={{ height: "32px" }} />
      <div style={{ height: "1px", background: "var(--color-border-subtle)" }} />
    </div>
  );
}
