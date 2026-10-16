# Campaign Admin CRM

A small internal admin tool for a political campaign: a searchable contact
list and per-contact profile pulling together donation history, volunteer
status, and interaction log — all from one shared campaign database, for a
team that didn't have (and didn't need) a dedicated CRM product.

Built as a route group inside a larger Next.js application, deployed
alongside it.

## What's here

- **`/admin/login`** — a single-password gate behind an httpOnly session
  cookie (8h). Deliberately minimal: this is a single-operator internal
  tool, not a multi-user system, so a shared password behind a server-set
  cookie is the right amount of complexity, not a corner cut. (If this were
  ever opened to more than one person, the natural next step is per-user
  credentials — noted here rather than silently implied as "already
  secure enough for that.")
- **`/admin/contacts`** — paginated, searchable (name/email) contact list.
- **`/admin/contacts/[id]`** — full profile: contact info, donation
  history, volunteer status/rank, and interaction log, pulled from four
  related tables with one query each rather than one large join, since
  each section renders and fails independently.
- **`lib/campaign-db.ts`** — the data layer. Every query is parameterized
  (tagged-template SQL via the `postgres` package — no string
  concatenation, no injection surface), and reads from a single shared
  `contacts`/`donors`/`volunteers`/`interactions`/`email_subscribers`
  schema rather than each admin page rolling its own query shape.

## Why this exists

The underlying database already held everything a campaign needs to look
someone up — but only through direct SQL access, Airtable views, or other
single-purpose tools built for specific automated workflows. This gives a
non-technical team member one place to actually look up a real person and
see their whole relationship to the campaign at a glance, without needing
database access or a separate paid CRM subscription.

No real data ships with this repo — it's the application code only,
connecting to `CAMPAIGN_DB_URL` and gated by `ADMIN_PASSWORD`, both read
from environment variables.
