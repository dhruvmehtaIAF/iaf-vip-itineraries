import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import EventForm from "../EventForm";
import { createEvent } from "../actions";

export default async function NewEventPage() {
  if (!(await isAdmin())) redirect("/events");
  return (
    <>
      <PageHeader
        back={{ href: "/events", label: "All events" }}
        eyebrow="New record"
        title="Add Event"
      />
      <EventForm action={createEvent} submitLabel="Create event" />
    </>
  );
}
