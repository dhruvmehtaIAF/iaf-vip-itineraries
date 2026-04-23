import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import EventForm from "../../EventForm";
import { updateEvent } from "../../actions";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAdmin())) redirect(`/events/${id}`);

  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) notFound();

  const update = updateEvent.bind(null, id);

  return (
    <>
      <PageHeader
        back={{ href: `/events/${id}`, label: event.name }}
        eyebrow="Edit record"
        title={event.name}
      />
      <EventForm action={update} event={event} submitLabel="Save changes" />
    </>
  );
}
