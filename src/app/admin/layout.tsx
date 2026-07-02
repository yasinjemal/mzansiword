import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminPhone } from "@/lib/admin";

// Admins are phone-allowlisted via ADMIN_PHONES; everyone else sees a 404
// (no hint that the route exists).
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminPhone();
  if (!admin) notFound();

  return (
    <div className="flex flex-col gap-4 pb-10">
      <nav className="flex gap-3 border-b border-zinc-200 pb-2 text-sm font-medium dark:border-zinc-700">
        <Link href="/admin/prizes" className="underline">
          Prizes
        </Link>
        <Link href="/admin/flagged" className="underline">
          Flagged
        </Link>
        <Link href="/admin/draws" className="underline">
          Draws
        </Link>
      </nav>
      {children}
    </div>
  );
}
