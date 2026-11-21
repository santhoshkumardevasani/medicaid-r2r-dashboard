# Aster · Medicaid Close

A React + TypeScript assessment application for a healthcare Controller overseeing Medicaid Record-to-Report. All organizations, people, amounts, references, and source extracts in the application are synthetic.

The implemented journey is **close overview → reconciliation → source evidence → agent recommendation → human decision → audit trail**.

## Run locally

Use Node.js **22.12 or later** (Node 24 is recommended and was used for verification) and npm. No environment variables, API keys, database, account, or backend setup is needed.

```bash
# Unzip the submission and enter the application folder.
cd medicaid-close
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

```bash
npm test                 # Vitest + React Testing Library + structural axe checks
npm run test:coverage    # Text report and coverage/index.html
npm run typecheck       # Strict TypeScript, including tests
npm run build           # Checked, optimized static production build in dist/
npm run preview         # Inspect the production build locally
```

The complete source, pinned lockfile, setup instructions, assessment explanation, CI workflow, and optional container configuration are included. Start with [docs/ASSESSMENT.md](docs/ASSESSMENT.md) for assumptions, decisions, trade-offs, implemented/proposed boundaries, and time spent. See [docs/VERIFICATION.md](docs/VERIFICATION.md) for verification results and limits.

## Five-minute walkthrough

1. **Close overview:** October 2026, all entities shows 7/12 reconciliations complete (58%), $547,500 gross absolute open variance, 3 material exceptions, and 3 pending agent reviews. Click a summary card to open its matching work queue.
2. **Find the issue:** open _Capitation receivables_. Its GL is $22,876,000 and source register is $23,124,000, giving a signed GL − source variance of **−$248,000**.
3. **Inspect evidence:** expand the source extract. It includes control totals, source identity, extract timestamp, remittance reference, earned period, receipt date, and unposted amount. Download the synthetic evidence as JSON if useful.
4. **Review the proposal:** open the _Agent recommendation_ tab. Read the rationale, illustrative confidence, limitations, proposed next step, and unposted illustrative journal. Choose an action, write a reason (12–1,000 characters), and acknowledge evidence review. The default choice requests more evidence.
5. **Record and trace:** approve for preparation, request evidence, or reject. The recommendation status and queue counts update. The account remains open. The Activity tab and Audit trail retain actor, reason, evidence IDs, reviewed version, and request ID. Audit JSON export respects entity, period, and search selection.
6. **Explore alternate states:** select New Jersey or New York; select September for a completed comparison period. Use _Demo controls_ to switch to a read-only Analyst or simulate a service failure. Retry recovers and retains the last successful snapshot.

**Session behavior:** refresh the browser to reset all decisions. The in-memory demo is isolated per tab; it is not shared or durable. The dashboard’s refresh button rereads the mock service without resetting it. Historical source snapshot dates remain explicit; new review events use the current time in America/New_York.

## Project structure

```text
src/
  App.tsx                         Application shell, shared scope, navigation
  components/
    Overview.tsx                  Summary cards, readiness, priorities, agent cards
    Reconciliations.tsx           Search, filters, variance sorting, account table
    ReconciliationDetail.tsx      Evidence and account activity
    RecommendationReview.tsx      Rationale, proposed entry, human decision form
    AgentQueue.tsx                Pending and reviewed recommendation queues
    AuditTrail.tsx                Searchable, scoped history and JSON export
    ui.tsx                        Dialog, badges, empty/error/loading states
  domain/
    types.ts                      Zod runtime schemas and inferred TypeScript types
    fixtures.ts                   Deterministic, synthetic source data
    selectors.ts                  Scope, variance, materiality, formatting
  hooks/useDashboard.ts           Read cancellation and stale-response protection
  services/
    mockApi.ts                    Async service with validation and review controls
    download.ts                   JSON exports and object-URL cleanup
  test/setup.ts                   Test environment and jsdom dialog shim
```

## Deploy

`npm run build` produces a static application; serve `dist/` on an HTTPS host. There are no external fonts, analytics, real model calls, or third-party API requests. The private hosted demo uses the same source and synthetic browser-local service.

Optional Docker deployment:

```bash
docker build -t aster-medicaid-close .
docker run --rm -p 8080:8080 aster-medicaid-close
```

Open `http://localhost:8080`. The included Nginx example supplies CSP and other response headers, long-lived caching for hashed assets, and a non-root runtime. It was provided as a deployment example and was not container-tested in this environment. Terminate TLS at the ingress; set HSTS there only after HTTPS is correctly configured. Pin container image digests and CI action commit SHAs before a controlled production deployment.

The CSP permits inline **styles** for the CSS-based progress indicators. Scripts remain self-origin only. The development server uses its own development policy. The sample Nginx headers apply only when using that configuration; verify headers on any other hosting platform.

## Important scope boundaries

- Review actions are mock workflow transitions. No ERP posting, close sign-off, email, task delivery to an owner, or bank/state integration occurs.
- The simulated role is intentionally switchable. Client code is not an authorization boundary. Move review controls into an authenticated backend before using real data.
- Confidence values are fixture metadata, uncalibrated and unsuitable for automatic accounting decisions.
- The audit history is append-only through the mock service API; it is not tamper-resistant or durable in a browser.
- Evidence is an aggregate fixture, not transaction/member data. No PHI is included or required.

## Documentation references

Implementation references: [React hooks](https://react.dev/reference/react), [Vite setup](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [Testing Library semantic queries](https://testing-library.com/docs/queries/about/), and [native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog). These explain the chosen tools; this sample makes no compliance certification claim.
