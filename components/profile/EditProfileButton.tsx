"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { EditProfileModal } from "./EditProfileModal";

interface Props {
  profile: UserProfile;
  onSaved: (updated: Partial<UserProfile>) => void;
}

export function EditProfileButton({ profile, onSaved }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "7px 16px",
          background: "transparent",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: "100px",
          color: "#a78bfa",
          fontSize: "11px",
          fontFamily: "var(--font-dm-mono)",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
          flexShrink: 0,
        }}
      >
        Edit Profile
      </button>

      {isOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsOpen(false)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
