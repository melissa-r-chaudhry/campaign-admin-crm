import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getContact,
  getContactDonors,
  getContactVolunteer,
  getContactInteractions,
  getContactEmailSub,
} from "@/lib/campaign-db";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: "neutral" | "positive" | "warning" }) {
  const cls = {
    neutral: "bg-[var(--paper-100)] text-[var(--ink-600)]",
    positive: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
  }[variant];
  return (
    <span className={`inline-block text-[0.6875rem] font-medium px-1.5 py-0.5 rounded ${cls}`}>
      {children}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-[var(--paper-200)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--paper-100)] bg-[var(--paper-50)]">
        <h2 className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--ink-500)]">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-[0.6875rem] uppercase tracking-wider text-[var(--ink-400)] font-medium">{label}</dt>
      <dd className="mt-0.5 text-[0.875rem] text-[var(--ink-800)]">{value ?? "—"}</dd>
    </div>
  );
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const contactId = Number(id);
  if (!Number.isFinite(contactId) || contactId <= 0) notFound();

  const contact = await getContact(contactId);
  if (!contact) notFound();

  const [donors, volunteer, interactions, emailSub] = await Promise.all([
    getContactDonors(contactId),
    getContactVolunteer(contactId),
    getContactInteractions(contactId),
    getContactEmailSub(contactId),
  ]);

  const totalDonated = donors.reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="min-h-dvh bg-[var(--paper-50)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back + header */}
        <div className="mb-6">
          <Link
            href="/admin/contacts"
            className="text-[0.8125rem] text-[var(--ink-500)] hover:text-[var(--ink-800)] transition-colors"
          >
            ← All contacts
          </Link>
          <div className="mt-3 flex items-start gap-3">
            <div>
              <h1 className="font-serif text-[2rem] font-medium text-[var(--ink-900)]">
                {contact.first_name} {contact.last_name}
              </h1>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {contact.needs_review && <Badge variant="warning">Needs review</Badge>}
                {volunteer && <Badge variant="positive">Volunteer · {volunteer.rank}</Badge>}
                {donors.length > 0 && <Badge variant="positive">Donor · ${totalDonated.toFixed(2)}</Badge>}
                {emailSub && <Badge>{emailSub.status === "active" ? "Email subscriber" : `Email: ${emailSub.status}`}</Badge>}
                {(contact.tags ?? []).map((t) => <Badge key={t}>{t}</Badge>)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Contact info */}
          <Section title="Contact info">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Email" value={contact.email} />
              <Field label="Phone" value={contact.phone} />
              <Field label="Source" value={contact.source} />
              <Field label="Scope" value={contact.contact_scope} />
              <Field label="Precinct" value={contact.precinct} />
              <Field label="Voter ID" value={(contact as any).voter_id} />
              <Field
                label="Address"
                value={[contact.address, contact.city, contact.state, contact.zip]
                  .filter(Boolean).join(", ")}
              />
              <Field
                label="Added"
                value={new Date(contact.created_at).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              />
            </dl>
          </Section>

          {/* Volunteer */}
          {volunteer && (
            <Section title="Volunteer">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Status" value={volunteer.status} />
                <Field label="Lane" value={volunteer.lane} />
                <Field label="Points" value={String(volunteer.points)} />
                <Field label="Streak" value={`${volunteer.streak} days`} />
                <Field label="Rank" value={volunteer.rank} />
                <Field label="Role" value={volunteer.role} />
                <Field
                  label="Joined"
                  value={new Date(volunteer.joined_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                />
              </dl>
            </Section>
          )}

          {/* Donations */}
          {donors.length > 0 && (
            <Section title={`Donations (${donors.length} · $${totalDonated.toFixed(2)} total)`}>
              <table className="w-full text-[0.875rem]">
                <thead>
                  <tr className="border-b border-[var(--paper-100)]">
                    <th className="text-left pb-2 text-[0.6875rem] uppercase tracking-wider text-[var(--ink-400)] font-medium">Date</th>
                    <th className="text-left pb-2 text-[0.6875rem] uppercase tracking-wider text-[var(--ink-400)] font-medium">Amount</th>
                    <th className="text-left pb-2 text-[0.6875rem] uppercase tracking-wider text-[var(--ink-400)] font-medium">Platform</th>
                    <th className="text-left pb-2 text-[0.6875rem] uppercase tracking-wider text-[var(--ink-400)] font-medium">Cycle</th>
                    <th className="text-left pb-2 text-[0.6875rem] uppercase tracking-wider text-[var(--ink-400)] font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--paper-50)]">
                  {donors.map((d) => (
                    <tr key={d.id}>
                      <td className="py-2 text-[var(--ink-600)]">
                        {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-2 font-medium text-[var(--ink-900)]">
                        ${Number(d.amount).toFixed(2)}
                        {d.recurring && <span className="ml-1 text-[0.6875rem] text-[var(--ink-400)]">recurring</span>}
                      </td>
                      <td className="py-2 text-[var(--ink-600)]">{d.platform ?? "—"}</td>
                      <td className="py-2 text-[var(--ink-600)]">{d.cycle ?? "—"}</td>
                      <td className="py-2 text-[var(--ink-500)]">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Interactions */}
          <Section title={`Interactions (${interactions.length})`}>
            {interactions.length === 0 ? (
              <p className="text-[0.875rem] text-[var(--ink-400)]">No interactions logged yet.</p>
            ) : (
              <div className="space-y-3">
                {interactions.map((i) => (
                  <div key={i.id} className="flex gap-3 text-[0.875rem]">
                    <div className="shrink-0 mt-0.5">
                      <span className="inline-block bg-[var(--paper-100)] text-[var(--ink-600)] text-[0.6875rem] font-medium px-1.5 py-0.5 rounded">
                        {i.channel}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--ink-400)] text-[0.75rem]">
                          {new Date(i.occurred_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                        <span className="text-[var(--ink-300)] text-[0.75rem]">{i.direction}</span>
                      </div>
                      {i.subject && (
                        <p className="text-[var(--ink-700)] font-medium mt-0.5">{i.subject}</p>
                      )}
                      {i.notes && (
                        <p className="text-[var(--ink-500)] mt-0.5">{i.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
