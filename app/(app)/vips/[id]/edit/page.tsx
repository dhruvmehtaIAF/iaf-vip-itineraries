import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import VipForm from "../../VipForm";
import { updateVip } from "../../actions";

export default async function EditVipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/vips/${id}`);

  const supabase = await createClient();
  const [{ data: vip }, { data: hosts }] = await Promise.all([
    supabase.from("vips").select("*").eq("id", id).single(),
    supabase.from("profiles").select("id, full_name, email").order("full_name", { nullsFirst: false }),
  ]);

  if (!vip) notFound();

  const update = updateVip.bind(null, id);

  return (
    <>
      <PageHeader
        back={{ href: `/vips/${id}`, label: vip.full_name }}
        eyebrow="Edit record"
        title={vip.full_name}
      />
      <VipForm action={update} vip={vip} hosts={hosts ?? []} submitLabel="Save changes" />
    </>
  );
}
