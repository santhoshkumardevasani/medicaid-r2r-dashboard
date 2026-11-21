# Medicaid R2R Dashboard

A responsive React + TypeScript dashboard for a Controller overseeing a synthetic Medicaid Record-to-Report close. Organizations, people, account balances, evidence, and agent recommendations are fictional.

The workflow is **close overview → reconciliations → evidence → agent review → human decision → audit trail**.

## Run locally

Use Node.js **22.12 or later** and npm. No environment variables, API keys, database, account, or backend setup are needed.

```bash
cd medicaid-close
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

```bash
npm test                # Vitest, React Testing Library, and accessibility checks
npm run test:coverage   # Coverage report
npm run typecheck       # TypeScript project check
npm run build           # Checked production build in dist/
npm run preview         # Serve the production build locally
```

The project includes a lockfile, CI workflow, Docker/Nginx example, and additional documentation. See [docs/ASSESSMENT.md](docs/ASSESSMENT.md) for assumptions and production boundaries, and [docs/VERIFICATION.md](docs/VERIFICATION.md) for verification notes.

## Five-minute walkthrough

1. **Review the close:** October 2026, all entities show 7/12 reconciliations complete (58%), $547,500 gross absolute open variance, 3 material exceptions, and 3 pending agent reviews. Select a metric to open its related work queue.
2. **Find an exception:** open _Reconciliations_ and select _Capitation receivables_. Its GL is $22,876,000 and source register is $23,124,000, giving a signed GL − source variance of **−$248,000**.
3. **Inspect evidence:** expand the source extract. It includes control totals, source identity, extract timestamp, remittance reference, earned period, receipt date, and unposted amount. Download the synthetic evidence as JSON if useful.
4. **Review the proposal:** open the _Agent recommendation_ tab. Read the rationale, illustrative confidence, limitations, proposed next step, and unposted illustrative journal. Choose an action, write a reason (12–1,000 characters), and acknowledge evidence review. The default choice requests more evidence.
5. **Record and trace:** approve for preparation, request evidence, or reject. Approval moves the reconciliation from _Needs review_ to _In progress_; rejection marks it _Rejected_; an evidence request leaves the reconciliation status unchanged. No journal is posted. The Activity tab and Audit trail retain actor, reason, evidence IDs, reviewed version, and request ID.
6. **Explore alternate states:** select New Jersey or New York; select September for a completed comparison period. Open the profile control to switch to a read-only Analyst or simulate a service failure. Retry retains the last successful snapshot.

**Session behavior:** refresh the browser to reset all decisions. The in-memory demo is isolated per tab; it is not shared or durable. The dashboard refresh button rereads the mock service without resetting it. Historical source snapshot dates are fixed; new review events use the current time in America/New_York.

## Project structure

```text
src/
  App.tsx                         Application state and workspace composition
  main.tsx                        React entry point
  styles.css                      Responsive application styles
  App.test.tsx                    Application workflows
  App.accessibility.test.tsx      Structural accessibility checks
  components/
    NavigationPanel.tsx           Primary workspace navigation
    Workspace*.tsx                Toolbar, page content, navigation, and overlays
    DashboardPages.tsx            Routes the four workspace views
    Overview*.tsx                 Overview summary
    ReadinessPanel.tsx            Close readiness stages
    FocusPanel.tsx                 High-risk and missing-data actions
    ExceptionsPanel.tsx            Open reconciliation summary
    AgentRecommendations.tsx       Recommendation cards on the overview
    AgentQueue.tsx                 Pending and reviewed recommendations
    Reconciliations.tsx            Searchable, filterable account table
    Reconciliation*.tsx            Detail header, evidence, activity, and table
    Recommendation*.tsx            Rationale and decision workflow
    Decision*.tsx                  Review choices and submission form
    Audit*.tsx                     Scoped audit list and event details
    DemoDialogs.tsx                Demo controls and guide dialogs
    Modal.tsx, ui.tsx              Shared modal and UI primitives
  domain/
    types.ts                       Zod schemas and inferred types
    fixtures.ts, fixture*.ts, *Rows.ts  Synthetic close, evidence, and recommendation data
    selectors.ts                   Scope, metrics, variance, and formatting
  hooks/
    useDashboard.ts                Loading, retry, and stale-read handling
  services/
    mockApi.ts                     In-memory decision service
    decisionSchema.ts              Decision request validation
    createId.ts                    Browser-compatible unique IDs
    download.ts                    JSON export helper
  test/
    setup.ts                       Vitest and jsdom setup
    components/                    Component and workflow tests
index.html                         HTML entry point
vite.config.ts                     Vite and Vitest configuration
docs/                              Assessment and verification notes
```

## Deploy

`npm run build` produces a static application; serve `dist/` on an HTTPS host. The application uses no external fonts, analytics, real model calls, or third-party API requests.

Optional Docker deployment:

```bash
docker build -t medicaid-r2r-dashboard .
docker run --rm -p 8080:8080 aster-medicaid-close
```

Open `http://localhost:8080`. The included Nginx example supplies CSP and other response headers, long-lived caching for hashed assets, and a non-root runtime. It was provided as a deployment example and was not container-tested in this environment. Terminate TLS at the ingress; set HSTS there only after HTTPS is correctly configured. Pin container image digests and CI action commit SHAs before a controlled production deployment.

The CSP permits inline **styles** for the CSS-based progress indicators. Scripts remain self-origin only. The development server uses its own development policy. The sample Nginx headers apply only when using that configuration; verify headers on any other hosting platform.

## Important scope boundaries

- Review actions are mock workflow transitions. Approval moves an eligible reconciliation to _In progress_; rejection marks it _Rejected_; neither posts a journal or signs off the close. Evidence requests do not change the reconciliation status. No email, task delivery, or bank/state integration occurs.
- The simulated role is intentionally switchable. Client code is not an authorization boundary. Move review controls into an authenticated backend before using real data.
- Confidence values are fixture metadata, uncalibrated and unsuitable for automatic accounting decisions.
- The audit history is append-only through the mock service API; it is not tamper-resistant or durable in a browser.
- Evidence is an aggregate fixture, not transaction/member data. No PHI is included or required.

## Documentation references

Implementation references: [React hooks](https://react.dev/reference/react), [Vite setup](https://vite.dev/guide/), [Vitest](https://vitest.dev/guide/), [Testing Library semantic queries](https://testing-library.com/docs/queries/about/), and [native dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog). These explain the chosen tools; this sample makes no compliance certification claim.
