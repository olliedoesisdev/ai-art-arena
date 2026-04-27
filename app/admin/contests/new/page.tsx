import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CreateContestForm } from "@/components/admin/CreateContestForm";

export const metadata = {
  title: "Create New Contest - Admin",
};

export default async function NewContestPage() {
  const session = await auth();
  const supabase = await createClient();

  // Check if user is admin
  if (!session?.user) {
    redirect("/signin");
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (user?.role !== "admin") {
    redirect("/");
  }

  // Get the latest contest to suggest next week number
  const { data: latestContest } = await supabase
    .from("contests")
    .select("week_number")
    .order("week_number", { ascending: false })
    .limit(1)
    .single();

  const suggestedWeekNumber = latestContest ? latestContest.week_number + 1 : 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Contest
        </h2>
        <p className="text-gray-600">
          Set up a new weekly art battle for your community to vote on.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
        <CreateContestForm suggestedWeekNumber={suggestedWeekNumber} />
      </div>

      {/* Quick Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          📝 Contest Setup Guide
        </h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>
            • <strong>Week Number:</strong> Unique identifier for this contest
            (auto-incremented)
          </li>
          <li>
            • <strong>Start Date:</strong> When voting begins
          </li>
          <li>
            • <strong>End Date:</strong> When voting closes (typically 7 days
            later)
          </li>
          <li>
            • <strong>Status:</strong> Set to "active" to make it live
            immediately
          </li>
        </ul>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-blue-900 text-sm font-medium">
            💡 After creating the contest, you'll need to upload artworks for
            users to vote on!
          </p>
        </div>
      </div>
    </div>
  );
}
