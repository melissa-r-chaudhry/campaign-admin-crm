import postgres from "postgres";

let _sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (!_sql) {
    const url = process.env.CAMPAIGN_DB_URL;
    if (!url) throw new Error("CAMPAIGN_DB_URL is not set");
    _sql = postgres(url, { prepare: false, max: 5 });
  }
  return _sql;
}

export interface ContactRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  precinct: string | null;
  tags: string[] | null;
  source: string | null;
  contact_scope: string;
  needs_review: boolean;
  created_at: string;
}

export interface DonorRow {
  id: number;
  amount: string;
  date: string;
  platform: string | null;
  cycle: string | null;
  status: string;
  recurring: boolean;
  employer: string | null;
  occupation: string | null;
}

export interface VolunteerRow {
  id: number;
  role: string | null;
  status: string;
  points: number;
  rank: string;
  lane: string | null;
  streak: number;
  joined_at: string;
}

export interface InteractionRow {
  id: number;
  channel: string;
  direction: string;
  subject: string | null;
  notes: string | null;
  occurred_at: string;
}

export async function listContacts(opts: {
  limit: number;
  offset: number;
  search: string;
}) {
  const sql = getSql();
  const term = `%${opts.search.toLowerCase()}%`;
  if (opts.search) {
    return sql<ContactRow[]>`
      SELECT id, first_name, last_name, email, phone, city, state, precinct,
             tags, source, contact_scope, needs_review, created_at
      FROM contacts
      WHERE lower(first_name) LIKE ${term}
         OR lower(last_name) LIKE ${term}
         OR lower(coalesce(email,'')) LIKE ${term}
      ORDER BY last_name, first_name
      LIMIT ${opts.limit} OFFSET ${opts.offset}
    `;
  }
  return sql<ContactRow[]>`
    SELECT id, first_name, last_name, email, phone, city, state, precinct,
           tags, source, contact_scope, needs_review, created_at
    FROM contacts
    ORDER BY last_name, first_name
    LIMIT ${opts.limit} OFFSET ${opts.offset}
  `;
}

export async function countContacts(search: string) {
  const sql = getSql();
  const term = `%${search.toLowerCase()}%`;
  if (search) {
    const rows = await sql<[{ count: string }]>`
      SELECT count(*)::text FROM contacts
      WHERE lower(first_name) LIKE ${term}
         OR lower(last_name) LIKE ${term}
         OR lower(coalesce(email,'')) LIKE ${term}
    `;
    return Number(rows[0].count);
  }
  const rows = await sql<[{ count: string }]>`SELECT count(*)::text FROM contacts`;
  return Number(rows[0].count);
}

export async function getContact(id: number) {
  const sql = getSql();
  const rows = await sql<ContactRow[]>`
    SELECT * FROM contacts WHERE id = ${id}
  `;
  return rows[0] ?? null;
}

export async function getContactDonors(contactId: number) {
  const sql = getSql();
  return sql<DonorRow[]>`
    SELECT id, amount, date, platform, cycle, status, recurring, employer, occupation
    FROM donors WHERE contact_id = ${contactId} ORDER BY date DESC
  `;
}

export async function getContactVolunteer(contactId: number) {
  const sql = getSql();
  const rows = await sql<VolunteerRow[]>`
    SELECT id, role, status, points, rank, lane, streak, joined_at
    FROM volunteers WHERE contact_id = ${contactId}
  `;
  return rows[0] ?? null;
}

export async function getContactInteractions(contactId: number) {
  const sql = getSql();
  return sql<InteractionRow[]>`
    SELECT id, channel, direction, subject, notes, occurred_at
    FROM interactions WHERE contact_id = ${contactId} ORDER BY occurred_at DESC
  `;
}

export async function getContactEmailSub(contactId: number) {
  const sql = getSql();
  const rows = await sql<[{ id: number; status: string; subscribed_at: string }]>`
    SELECT id, status, subscribed_at FROM email_subscribers WHERE contact_id = ${contactId}
  `;
  return rows[0] ?? null;
}
