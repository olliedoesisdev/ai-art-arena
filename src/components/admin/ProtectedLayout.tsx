import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/utils/admin-auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const adminUser = await getAdminUser();

  // Redirect to login if not authenticated
  if (!adminUser) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminSidebar user={adminUser} />
      <main className="lg:pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
