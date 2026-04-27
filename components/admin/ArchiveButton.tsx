"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ArchiveButton({ contestId }: { contestId: string }) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);

  async function handleArchive() {
    if (
      !confirm(
        "Are you sure you want to archive this contest? This will end voting."
      )
    ) {
      return;
    }

    setIsArchiving(true);

    try {
      const response = await fetch(`/api/admin/contests/${contestId}/archive`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to archive contest");
      }

      toast.success("Contest archived successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to archive contest");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <button
      onClick={handleArchive}
      disabled={isArchiving}
      className="text-orange-600 hover:text-orange-900 disabled:text-gray-400 disabled:cursor-not-allowed"
    >
      {isArchiving ? "Archiving..." : "Archive"}
    </button>
  );
}
