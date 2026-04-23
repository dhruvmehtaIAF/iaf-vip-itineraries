import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavLink from "@/components/NavLink";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "viewer";
  const name = profile?.full_name ?? user.email ?? "User";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo-horizontal.png"
              alt="India Art Fair"
              width={140}
              height={20}
              className="h-5 w-auto"
              priority
            />
            <span className="text-[11px] tracking-[0.2em] text-neutral-500 uppercase hidden sm:inline">
              VIP Itineraries
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/vips">VIPs</NavLink>
            <NavLink href="/events">Events</NavLink>
            {role === "admin" && <NavLink href="/admin/users">Team</NavLink>}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right leading-tight hidden sm:block">
              <div className="text-sm font-medium">{name}</div>
              <div className="text-[11px] uppercase tracking-widest text-neutral-500">
                {role}
              </div>
            </div>
            <form action="/auth/sign-out" method="post">
              <button
                type="submit"
                className="text-sm text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-900 px-3 py-1.5 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
        India Art Fair — Internal tool
      </footer>
    </div>
  );
}
