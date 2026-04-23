import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import VipForm from "../VipForm";
import { createVip } from "../actions";

export default async function NewVipPage() {
  if (!(await isAdmin())) redirect("/vips");

  const supabase = await createClient();
  const { data: hosts } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name", { nullsFirst: false });

  return (
    <>
      <PageHeader
        back={{ href: "/vips", label: "All VIPs" }}
        eyebrow="New record"
        title="Add VIP"
      />
      <VipForm action={createVip} hosts={hosts ?? []} submitLabel="Create VIP" />
    </>
  );
}
