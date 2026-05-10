import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getFullProfilePageData } from "@/lib/data/profiles";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const session = await auth();
  const data = await getFullProfilePageData(id, session?.user?.id ?? null);

  if (!data) return { title: "Profile not found — AI Art Arena" };

  const name = data.profile.display_name || "Arena Member";
  return {
    title: `${name} — AI Art Arena`,
    description: data.profile.bio || `${name} votes and comments on AI Art Arena.`,
    alternates: { canonical: `${SITE_URL}/profile/${id}` },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const data = await getFullProfilePageData(id, session?.user?.id ?? null);

  if (!data) notFound();

  const { profile, activityFeed, totalVotes, totalComments, isOwnProfile } = data;
  const weeksActive = new Set(
    activityFeed.filter((a) => a.activity_type === "vote").map((a) => a.contest_week)
  ).size;

  return (
    <div className="animate-page" style={{ paddingTop: "48px", paddingBottom: "80px" }}>
      <div className="shell">
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          totalVotes={totalVotes}
          totalComments={totalComments}
          weeksActive={weeksActive}
        />
        <ActivityFeed
          activityFeed={activityFeed}
          totalVotes={totalVotes}
          totalComments={totalComments}
        />
      </div>
    </div>
  );
}
