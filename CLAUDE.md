# Claude Code

This project uses the Payload CMS skill at `.claude/skills/payload/`.
Start with `.claude/skills/payload/SKILL.md` for a quick reference, then see `.claude/skills/payload/reference/` for detailed docs.

---

## Project: IAG Local ERP — Financial Tracking App

**Stack:** Next.js 16 (App Router, Turbopack) · Payload CMS 3.84 · PostgreSQL (Neon in production) · Tailwind CSS v3 · Vercel Blob (media storage)

### Route group layout

```
src/app/
├── (frontend)/        # Public + protected Next.js routes
│   ├── layout.tsx     # Root HTML shell + Tailwind globals.css
│   ├── page.tsx       # Redirects → /dashboard
│   ├── login/         # Client login form → POST /api/users/login
│   └── dashboard/
│       ├── layout.tsx # Server auth guard: payload.auth({ headers }) → redirect /login
│       └── page.tsx   # Stats cards (Net/VAT/Gross) + transaction table
└── (payload)/         # Payload admin — do not touch
    ├── admin/[[...segments]]/
    └── api/[...slug]/
```

`(frontend)` and `(payload)` are parallel siblings — route groups emit no URL segment so there is no collision.

### Collections & Globals

| Slug | Type | Notes |
|---|---|---|
| `users` | Collection | Payload auth |
| `media` | Collection | Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set |
| `income-categories` | Collection | Name only |
| `expense-categories` | Collection | Name only |
| `incomes` | Collection | `beforeValidate` hook: VAT calc server-side |
| `expenses` | Collection | `beforeValidate` hook: VAT calc server-side |
| `settings` | Global | `defaultVatRate` (%) |

### VAT calculation rule (server-side, read-only for users)

```
vatAmount  = netAmount × (vatRate / 100)    ← rounded to 2dp
totalGross = netAmount + vatAmount
```

Hook location: `src/collections/Incomes.ts` and `src/collections/Expenses.ts` → `hooks.beforeValidate`.
If `vatRate` is absent, the hook fetches `settings.defaultVatRate` from the global before calculating.
`vatAmount` and `totalGross` are `admin.readOnly: true`.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `PAYLOAD_SECRET` | Yes | Set |
| `DATABASE_URL` | Dev fallback | Local postgres |
| `NEON_DATABASE_URI` | Production | Takes priority over `DATABASE_URL` |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob; plugin disabled if absent |

### After connecting the database

Run `npm run payload generate:types` to regenerate `src/payload-types.ts`.
The manual stubs added during build will be replaced with full generated types.

### Key helpers

- `src/lib/payload.ts` — `getPayloadInstance()` singleton wrapper around `getPayload({ config })`
- Auth in Server Components: `payload.auth({ headers: await headers() })`
- Logout: form `action="/api/users/logout" method="POST"`
