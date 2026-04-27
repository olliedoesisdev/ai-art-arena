import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  // Fetch user role from database to ensure we have the latest role
  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (user?.role !== "admin") {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">🔧 Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {session.user.email}
              </span>
              <Link
                href="/"
                className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
              >
                Back to Site
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-3">
            <nav className="bg-white rounded-lg shadow p-4 space-y-2">
              <Link
                href="/admin"
                className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors font-medium"
              >
                📊 Overview
              </Link>
              <Link
                href="/admin/contests"
                className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                🎨 Contests
              </Link>
              <Link
                href="/admin/artworks"
                className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                🖼️ Artworks
              </Link>
              <Link
                href="/admin/analytics"
                className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                📈 Analytics
              </Link>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <p className="text-xs text-gray-500 px-4 mb-2">Quick Actions</p>
                <Link
                  href="/admin/contests/new"
                  className="block px-4 py-2 text-sm rounded hover:bg-blue-50 text-blue-600 transition-colors"
                >
                  ➕ New Contest
                </Link>
                <Link
                  href="/admin/artworks/upload"
                  className="block px-4 py-2 text-sm rounded hover:bg-green-50 text-green-600 transition-colors"
                >
                  🖼️ Upload Artworks
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
