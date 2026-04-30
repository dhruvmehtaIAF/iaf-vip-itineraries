import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import VipForm from "../VipForm";
import { createVip } from "../actions";

export default async function NewVipPage() {
  if (!(await isAdmin())) redirect("/vips");

  return (
    <>
      <PageHeader
        back={{ href: "/vips", label: "All VIPs" }}
        eyebrow="New record"
        title="Add VIP"
      />
      <VipForm action={createVip} submitLabel="Create VIP" />
    </>
  );
}
