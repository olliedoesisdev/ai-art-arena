import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();

  // Get active contest
  const { data: activeContest } = await supabase
    .from("contests")
    .select("id")
    .eq("status", "active")
    .order("week_number", { ascending: false })
    .limit(1)
    .single();

  if (activeContest) {
    redirect(`/contest/${activeContest.id}`);
  }

  // No active contest - show coming soon
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Art Arena</h1>
        <p className="text-xl text-gray-600">
          No active contest right now. Check back soon!
        </p>
      </div>
    </div>
  );
}
