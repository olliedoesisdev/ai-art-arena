import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Header() {
  const session = await auth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            🎨 AI Art Arena
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Contest
            </Link>
            <Link
              href="/archive"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Archive
            </Link>

            {/* Auth Section */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
              {session?.user ? (
                <>
                  <div className="flex items-center gap-3">
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                      />
                    )}
                    <div className="hidden md:block">
                      <div className="text-sm font-medium text-gray-900">
                        {session.user.name}
                      </div>
                      {session.user.role === "admin" && (
                        <div className="text-xs text-blue-600 font-semibold">
                          Admin
                        </div>
                      )}
                    </div>
                  </div>

                  {session.user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}

                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/signin"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
