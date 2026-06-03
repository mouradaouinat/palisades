# Vercel Deployment

This app keeps local development simple with `storage/`, but production on Vercel needs durable services.

## Required Services

Create this from the Vercel project dashboard:

1. Blob store for bank statement files.

Create this from the Supabase dashboard:

1. Supabase project for application metadata.

## Required Supabase Table

Run this in the Supabase SQL editor:

```sql
create table if not exists public.applications (
  id text primary key,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  source text not null,
  applicant jsonb not null,
  form jsonb not null,
  files jsonb not null
);

alter table public.applications enable row level security;
```

The API uses the Supabase service role key from server-side Vercel environment variables, so no browser-facing RLS policy is needed for this table.

## Required Environment Variables

Set these in Vercel project settings:

```bash
BLOB_READ_WRITE_TOKEN=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
PALISADES_SUPABASE_SERVICE_ROLE_KEY=...
BACKOFFICE_PASSWORD=...
BACKOFFICE_AUTH_SECRET=...
```

Optional:

```bash
SUPABASE_APPLICATIONS_TABLE=applications
```

Do not prefix the service role key with `VITE_`; it must stay server-only.

The publishable key is safe to expose, but it is not enough for the protected application API because this app stores DOB, SSN, and bank statement metadata. The server API needs `SUPABASE_SERVICE_ROLE_KEY` so it can write and read the `applications` table without exposing that access to the browser.

## Runtime Behavior

- If `BLOB_READ_WRITE_TOKEN` exists, the browser uploads statements directly to Vercel Blob through `/api/blob-upload`.
- If `VITE_SUPABASE_URL` or `SUPABASE_URL` exists, and `SUPABASE_SERVICE_ROLE_KEY` exists, application records are stored in Supabase.
- If either is missing on Vercel, the API returns a clear configuration error instead of silently writing to temporary storage.
- Local development still uses `storage/applications.json` and `storage/uploads`.

## Backoffice

The backoffice remains at `/backoffice`. It uses a signed HttpOnly cookie after login and reads records/files through protected API endpoints.
