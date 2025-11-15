import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get active contest with its artworks
    const { data: contest, error: contestError } = await supabase
      .rpc("get_active_contest")
      .single();

    if (contestError) {
      if (contestError.code === "PGRST116") {
        // No active contest found
        return NextResponse.json({ contest: null, artworks: [] });
      }
      throw contestError;
    }

    if (!contest) {
      return NextResponse.json({ contest: null, artworks: [] });
    }

    // Get artworks for the active contest
    const { data: artworks, error: artworksError } = await supabase
      .from("artworks")
      .select("*")
      .eq("contest_id", contest.contest_id)
      .order("created_at", { ascending: true });

    if (artworksError) throw artworksError;

    return NextResponse.json({
      contest,
      artworks: artworks || [],
    });
  } catch (error) {
    console.error("Error fetching active contest:", error);
    return NextResponse.json(
      { error: "Failed to fetch active contest" },
      { status: 500 }
    );
  }
}
