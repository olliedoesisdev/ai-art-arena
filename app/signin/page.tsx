import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // Already signed in - check role and redirect appropriately
  if (session?.user) {
    const supabase = await createClient();
    const { data: user } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    // Use callback URL if provided, otherwise redirect based on role
    if (params.callbackUrl) {
      redirect(params.callbackUrl);
    } else if (user?.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/");
    }
  }

  const callbackUrl = params.callbackUrl || "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎨</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Art Arena
            </h1>
            <p className="text-gray-600">
              Sign in to vote on amazing AI-generated artwork
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: callbackUrl });
            }}
          >
            <button
              type="submit"
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center space-y-2">
              <p>✨ Vote on your favorite AI artworks</p>
              <p>🏆 Help crown the weekly champion</p>
              <p>🎨 Join our creative community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
