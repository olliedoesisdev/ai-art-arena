import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/profile/me");
  }

  redirect(`/profile/${session.user.id}`);
}
