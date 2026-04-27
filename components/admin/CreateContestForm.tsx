"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateContestFormProps {
  suggestedWeekNumber: number;
}

export function CreateContestForm({
  suggestedWeekNumber,
}: CreateContestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate default dates (today to 7 days from now)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  const [formData, setFormData] = useState({
    weekNumber: suggestedWeekNumber,
    startDate: formatDateForInput(today),
    endDate: formatDateForInput(nextWeek),
    status: "active" as "active" | "archived",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate dates
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      setError("End date must be after start date");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/contests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          week_number: formData.weekNumber,
          start_date: new Date(formData.startDate).toISOString(),
          end_date: new Date(formData.endDate).toISOString(),
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create contest");
      }

      // Success! Redirect to the new contest or contests list
      router.push(`/admin/contests`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Week Number */}
      <div>
        <label
          htmlFor="weekNumber"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Week Number *
        </label>
        <input
          type="number"
          id="weekNumber"
          min="1"
          required
          value={formData.weekNumber}
          onChange={(e) =>
            setFormData({ ...formData, weekNumber: parseInt(e.target.value) })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Sequential number for this contest (suggested: {suggestedWeekNumber})
        </p>
      </div>

      {/* Start Date */}
      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Start Date & Time *
        </label>
        <input
          type="datetime-local"
          id="startDate"
          required
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          When voting opens for this contest
        </p>
      </div>

      {/* End Date */}
      <div>
        <label
          htmlFor="endDate"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          End Date & Time *
        </label>
        <input
          type="datetime-local"
          id="endDate"
          required
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          When voting closes (typically 7 days after start)
        </p>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Status *
        </label>
        <select
          id="status"
          required
          value={formData.status}
          onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as "active" | "archived",
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="active">Active (Live Now)</option>
          <option value="archived">Archived (Not Accepting Votes)</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Set to "Active" to make the contest live immediately
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">Error creating contest:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Creating Contest..." : "Create Contest"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Next Steps Reminder */}
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
        <p className="font-medium text-sm">⚠️ Remember:</p>
        <p className="text-sm">
          After creating the contest, you'll need to upload artworks for users
          to vote on!
        </p>
      </div>
    </form>
  );
}
