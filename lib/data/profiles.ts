import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  UserProfile,
  ActivityFeedItem,
  ProfilePageData,
} from "@/lib/types";

export async function getProfileById(
  profileId: string,
  currentUserId: string | null
): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, display_name, bio, website_url, avatar_url, is_public, joined_at")
    .eq("id", profileId)
    .single();

  if (error || !data) return null;

  if (!data.is_public && currentUserId !== profileId) return null;

  return data as UserProfile;
}

export async function getActivityFeed(
  userId: string,
  limit = 40
): Promise<ActivityFeedItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_activity_feed")
    .select("*")
    .eq("user_id", userId)
    .order("activity_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as ActivityFeedItem[];
}

export async function getFullProfilePageData(
  profileId: string,
  currentUserId: string | null
): Promise<ProfilePageData | null> {
  const profile = await getProfileById(profileId, currentUserId);
  if (!profile) return null;

  const activityFeed = await getActivityFeed(profileId);

  return {
    profile,
    activityFeed,
    totalVotes: activityFeed.filter((a) => a.activity_type === "vote").length,
    totalComments: activityFeed.filter((a) => a.activity_type === "comment").length,
    isOwnProfile: currentUserId === profileId,
  };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "display_name" | "bio" | "website_url" | "is_public" | "avatar_url">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
