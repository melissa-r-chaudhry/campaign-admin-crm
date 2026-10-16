import Link from "next/link";
import { listContacts, countContacts } from "@/lib/campaign-db";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export const dynamic = "force-dynamic";

function displayName(c: { first_name: string; last_name: string; email: string | null }) {
  const full = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (c.email) return c.email;
  return "No name";
}

export default async function AdminContactsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const search = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? "1"));
  const limit = 50;
  const offset = (page - 1) * limit;

  const [contacts, total] = await Promise.all([
    listContacts({ limit, offset, search }),
    countContacts(search),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-dvh bg-[var(--paper-50)]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-[1.75rem] font-medium text-[var(--ink-900)]">
              Contacts
            </h1>
            <p className="text-[0.875rem] text-[var(--ink-500)] mt-0.5">
              {total.toLocaleString()} total
            </p>
          </div>
          <form action="/admin/contacts" className="flex gap-2">
            <input
              name="q"
              defaultValue={search}
              placeholder="Search name or email…"
              className="bg-white border border-[var(--paper-300)] rounded-md px-3 py-2 text-[0.875rem] text-[var(--ink-900)] placeholder:text-[var(--ink-300)] outline-none focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent w-64"
            />
            <button
              type="submit"
              className="bg-[var(--clay-600)] text-[var(--paper-50)] text-[0.875rem] font-medium rounded-md px-4 py-2 hover:bg-[var(--clay-500)] transition-colors"
            >
              Search
            </button>
            {search && (
              <Link
                href="/admin/contacts"
                className="text-[0.875rem] text-[var(--ink-500)] px-4 py-2 hover:text-[var(--ink-900)] transition-colors"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[var(--paper-200)] overflow-hidden">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-[var(--paper-200)] bg-[var(--paper-100)]">
                <th className="text-left px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--ink-500)] w-52">Name</th>
                <th className="text-left px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--ink-500)]">Email</th>
                <th className="text-left px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--ink-500)] w-36">Location</th>
                <th className="text-left px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--ink-500)] w-32">Source</th>
                <th className="text-left px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--ink-500)]">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--paper-100)]">
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--ink-400)]">
                    No contacts found.
                  </td>
                </tr>
              )}
              {contacts.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-[var(--clay-50)] transition-colors group"
                >
                  <td className="p-0 w-52">
                    <Link
                      href={`/admin/contacts/${c.id}`}
                      className="flex items-center gap-1 px-4 py-3 font-medium text-[var(--clay-700)] hover:text-[var(--clay-500)] transition-colors h-full w-full"
                    >
                      {displayName(c)}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={`/admin/contacts/${c.id}`} className="block px-4 py-3 text-[var(--ink-600)] h-full w-full">
                      {c.email ?? "—"}
                    </Link>
                  </td>
                  <td className="p-0 w-36">
                    <Link href={`/admin/contacts/${c.id}`} className="block px-4 py-3 text-[var(--ink-600)] h-full w-full">
                      {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                    </Link>
                  </td>
                  <td className="p-0 w-32">
                    <Link href={`/admin/contacts/${c.id}`} className="block px-4 py-3 text-[var(--ink-500)] h-full w-full">
                      {c.source ?? "—"}
                    </Link>
                  </td>
                  <td className="p-0">
                    <Link href={`/admin/contacts/${c.id}`} className="block px-4 py-3 h-full w-full">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags ?? []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block bg-[var(--paper-100)] text-[var(--ink-600)] text-[0.6875rem] font-medium px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-[0.875rem] text-[var(--ink-500)]">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/contacts?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                  className="text-[0.875rem] px-3 py-1.5 rounded border border-[var(--paper-300)] text-[var(--ink-700)] hover:bg-[var(--paper-100)] transition-colors"
                >
                  ← Prev
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/contacts?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                  className="text-[0.875rem] px-3 py-1.5 rounded border border-[var(--paper-300)] text-[var(--ink-700)] hover:bg-[var(--paper-100)] transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
