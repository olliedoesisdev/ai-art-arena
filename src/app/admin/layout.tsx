// Admin layout - renders without protection
// Individual pages handle their own auth

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}