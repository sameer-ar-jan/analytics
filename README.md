# App Analytics

A Next.js App Router application for game analytics. Next.js owns navigation,
server rendering, Google authentication, sessions, and the analytics API adapter.
The existing Cloud Run service remains the analytics data source; its database
and ingestion jobs are separate from this repository.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:3000. `/` redirects to `/dashboard`. Google sign-in is
required for every report and analytics API request. Visitors without a session
are sent to `/login`.

Copy `.env.example` to `.env.local` if local configuration does not exist. Set:

- `GOOGLE_CLIENT_ID`: the Google Web OAuth client ID.
- `ALLOWED_EMAILS`: comma-separated authorized Google account addresses.
- `SESSION_SECRET`: a random secret of at least 32 characters; generate one with
  `openssl rand -base64 48`. Use a distinct secret for each environment.
- `ANALYTICS_API_URL`: the upstream analytics service URL.
- `ANALYTICS_API_TOKEN`: optional server-to-server bearer credential.

Register `http://localhost:3000` and your deployment's HTTPS origin as authorized
JavaScript origins on the Google OAuth client. No client secret is needed for
Google Identity Services ID-token verification. All configuration stays on the
server; only the public Google client ID is passed to the login component.
`.env.local` is ignored by Git. The migration retains the existing local Google
client and authorized account list in that file.

## Routes and architecture

| URL | Report |
| --- | --- |
| `/dashboardbuilder` | Custom dashboard with draggable, resizable sample widgets |
| `/dashboard` | Individual game metrics, comparisons, and event charts |
| `/overall` | Overall metrics and monthly values |
| `/campwise` | Campaign, media, date, retention, and ROAS filters |
| `/roas2y` | Long-term ROAS |
| `/login` | Google sign-in |

`/Overall` and `/CampWise` redirect to their lowercase canonical URLs, preserving
query strings. The old Cohort implementation remains unexposed, as before.

- `app/(reports)`: authenticated Server Component pages, initial data loading,
  and report metadata. The shared layout checks the session; pages independently
  authorize before fetching data.
- `features/analytics`: interactive report components, tables, filters, and
  charts. These are Client Components rendered by native Next.js pages.
- `lib/server`: Google credential verification, signed session handling, and
  the upstream data adapter.
- `app/api/auth`: login challenge, credential verification, session, and logout.
- `app/api/analytics/[...path]`: authenticated GET adapter restricted to known
  analytics endpoint families. Upstream URLs and bearer credentials are never
  accepted from the browser.
- `app/providers.tsx`: Emotion stylesheet collection for streamed Material UI
  rendering.

There is no React Router or browser application shell. Only chart widgets skip
server rendering; tables and report structure render on the server. Excel
libraries load when a download is requested. Each report has its own route and
bundle boundary. Webpack is used for compatibility with the legacy AntV chart
library's circular imports.

Initial reports load on the server with parallel requests. Filter changes use
same-origin Next.js API routes. Client GET requests share in-flight requests and
use a bounded cache (100 entries, 60-second expiry), cleared on logout. Private
server responses use `no-store` to avoid sharing user analytics through caches.
Loading, route errors, missing pages, and initial data failures have explicit UI.

## Dashboard builder

Open **Dashboard Builder** in the report navigation or visit `/dashboardbuilder`
after signing in. `/DashboardBuilder` redirects to this authenticated route.
Use **+ Add Widget** to add charts, drag their headers to rearrange them, resize
using the corner handles, and use **Expand** or **Remove** on each widget.
The layout is saved in this browser's localStorage. Widgets currently display
sample data rather than live analytics. **Back to analytics** returns to the
game dashboard.

`@ant-design/plots` is pinned to `1.2.6`: the report popups use its G2Plot-based
DualAxes API (`geometryOptions`, paired datasets, and chart views). Version 2
uses a different chart API and requires migrating the existing charts before
upgrading. The builder uses the same version and loads its chart only in the
browser, like the report charts.

The route lives in `app/(reports)/dashboardbuilder/page.tsx`, so it inherits the
shared report layout's session check. It renders the existing client builder
without fetching unrelated campaign reports. Grid and resize styles are imported
by the builder component, and the shared `TopNav` links to the route.

## Authentication

Google ID tokens are verified using Google's public signing keys through `jose`.
The server checks signature, issuer, audience, expiry, verified email, account
allowlist, and a browser-bound login nonce. Successful login issues an eight-hour
signed HttpOnly, SameSite cookie, marked Secure in production. Raw Google
credentials are not stored in localStorage. Origin checks protect login/logout.
The allowlist is checked again when reading sessions.

Cookies are stateless: logout clears the browser session but does not centrally
revoke copies of a previously issued cookie. Rotate `SESSION_SECRET` to invalidate
all sessions. Add a session store if per-device revocation is required.

The Next.js adapter protects access through this app. Restrict the external
analytics service separately if direct access to that upstream must also be
protected; a frontend migration cannot change its deployment permissions.

## Production and validation

```sh
npm run build
npm start
npm test
npm run test:integration
npm run lint
```

The test commands use Node.js native TypeScript support (Node.js 22.18+).
Run integration tests after a production build. They start an isolated Next.js
server and a local fixture upstream, use test-only signed sessions, and verify
route redirects, authorization, credential rejection, API forwarding, upstream
failures, and server-rendered reports. They do not sign into a real Google account.

For browser navigation, refresh, export, and logout checks, set `CHROME_PATH` to a
Chrome executable when running `npm run test:integration`. Optionally set
`BROWSER_SCREENSHOT` to a PNG output path. The suite uses an isolated browser
profile and fixture API, not production analytics.

Lint currently exits successfully with warnings in preserved report code. The
legacy `set-state-in-effect` rule is reported as a warning within that feature;
new Next.js, server, and authentication code retains the standard rules.

Set the same environment variables in the deployment environment and use HTTPS.
Use a Node.js Next.js host; static export cannot run the auth/API handlers.
Stop a running production server before replacing its `.next` build, then restart
it after the new build completes. Development uses `npm run dev` with live updates.

Large legacy report/table components are preserved to avoid changing financial
calculations during the migration. Further optimization should use measured
bundle sizes and rendering profiles; table virtualization and decomposition can
be applied separately when justified by real datasets.
