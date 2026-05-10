import type { UserProfile } from "@/lib/types";
import { ProfileHeaderClient } from "./ProfileHeaderClient";

interface Props {
  profile: UserProfile;
  isOwnProfile: boolean;
  totalVotes: number;
  totalComments: number;
  weeksActive: number;
}

export function ProfileHeader(props: Props) {
  return <ProfileHeaderClient {...props} />;
}
