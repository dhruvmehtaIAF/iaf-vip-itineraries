import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import UserRoleSelect from "./UserRoleSelect";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile?.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at");

  return (
    <>
      <PageHeader
        eyebrow={`${profiles?.length ?? 0} members`}
        title="Team"
        subtitle="Anyone who signs in with Google lands here as a Viewer. Promote them to Admin to give write access."
      />

      <div className="border border-neutral-200 overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p) => {
              const isSelf = p.id === session.user.id;
              return (
                <tr key={p.id} className="border-b border-neutral-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <span className="font-medium">{p.full_name ?? "—"}</span>
                    {isSelf && (
                      <span className="ml-2 text-[10px] uppercase tracking-widest text-neutral-400">
                        you
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{p.email}</td>
                  <td className="px-4 py-3">
                    <UserRoleSelect userId={p.id} role={p.role} disabled={isSelf} />
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {new Date(p.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-sm text-neutral-500 border-l-4 border-neutral-900 pl-4">
        To add a teammate: ask them to sign in once with their IAF Google account.
        They will appear here as a Viewer and you can promote them.
      </div>
    </>
  );
}
