import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getContact,
  getContactDonors,
  getContactVolunteer,
  getContactInteractions,
  getContactEmailSub,
} from "@/lib/campaign-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin-session")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contactId = Number(id);
  if (!Number.isFinite(contactId) || contactId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const contact = await getContact(contactId);
  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [donors, volunteer, interactions, emailSub] = await Promise.all([
    getContactDonors(contactId),
    getContactVolunteer(contactId),
    getContactInteractions(contactId),
    getContactEmailSub(contactId),
  ]);

  return NextResponse.json({ contact, donors, volunteer, interactions, emailSub });
}
