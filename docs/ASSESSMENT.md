# Assessment explanation

## Problem and approach

A Controller needs to know **what is open, what is material, what to do next, and why**. The dashboard reduces the close to a few consistent indicators and connects each indicator to a queue. A reconciliation drawer preserves context while exposing balances, evidence, agent rationale, and the human review workflow. Every review creates an attributable event that can be inspected and exported.

## Assumptions

- A fictional healthcare organization has two Medicaid entities (New Jersey and New York), 12 account reconciliations per month, and one USD reporting currency.
- October 2026 is an in-progress close with a November 3 source snapshot; September is a completed comparison period. These are scenario dates, not live close data.
- The Controller reviews a recommendation; an Analyst prepares the account. Final journal approval/posting and close certification happen in a separate ERP workflow.
- An illustrative $50,000 **absolute** variance threshold defines material exceptions; high risk is a separate fixture classification. Neither is a regulatory rule.
- Evidence is synthetic, aggregate financial support. No member identity, claim-level personal data, or protected health information is required.
- “Request evidence” records a terminal decision on this recommendation version. A new evidence package would generate a new version through a proposed future workflow. This demo does not notify the preparer or reopen recommendations.

## Key decisions and trade-offs

| Decision                                         | Reason                                                                               | Trade-off                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| React, strict TypeScript, Vite                   | Small, portable frontend with clear build and test commands                          | No SSR; appropriate for a private operational workspace                                    |
| Shared scope and derived metrics                 | Cards, tables, and recommendations agree under period/entity filters                 | Full fixture is loaded; a large real dataset needs server-side aggregation/pagination      |
| Integer cents and gross absolute variance        | Avoids floating-point monetary arithmetic and hiding offsetting breaks               | A real multi-currency close needs decimal-safe FX and currency-specific precision          |
| Native tables, selects, details, and dialog      | Familiar browser semantics and lower custom accessibility burden                     | Complex grids and legacy browser support would need additional work                        |
| Local state + one data hook                      | Readable solution for four views and one workflow                                    | A broader product would benefit from a query/cache layer and URL-addressable navigation    |
| In-process async service                         | Reproducible demo without credentials or backend infrastructure                      | Session-only state and simulated security; no actual network server                        |
| Deterministic agent fixtures                     | Makes explanations, evidence links, and review decisions testable                    | Does not evaluate an LLM or demonstrate inference accuracy                                 |
| Explicit decision with reason and acknowledgment | Keeps accounting judgment with a human and preserves accountability                  | More deliberate interaction than a one-click approval                                      |
| Approval means “for preparation”                 | Keeps recommendation review distinct from journal posting and account reconciliation | The demo intentionally stops before posting and final sign-off                             |
| Version checks and idempotency keys              | Demonstrates stale-write rejection and safe retries                                  | Real transactions, deduplication persistence, and concurrency controls belong on a backend |

## Implemented

- Responsive sidebar/small-screen navigation; four operational views; shared period/entity selection.
- Reconciliation progress, absolute open variance, material/high-risk counts, pending reviews, and close readiness stages.
- Queue navigation from summary cards; search/filter/sort for reconciliations; empty, loading, and recoverable error states.
- Account balance comparison and signed variance; expandable evidence with dates, source identity, control totals, and supporting observations; evidence JSON export.
- Agent review queue with rationale, provenance/version, supporting evidence references, illustrative confidence and limitations, and one illustrative unposted journal.
- Approve-for-preparation, request-evidence, and reject transitions; mandatory reason/evidence acknowledgment; disabled pending submission.
- Simulated Controller role enforcement and preparer/reviewer separation in the service; recommendation version checks; request ID idempotency; atomic in-memory decision + audit append.
- Account activity and scoped/searchable audit trail with JSON export, actor/time/reason/evidence/version/correlation fields.
- Abort and generation guards against stale read responses; older reads cannot overwrite a completed decision; StrictMode-safe data loading; a top-level rendering error boundary.
- Reusable UI components and domain selectors; Zod runtime boundary validation; no HTML injection APIs, secrets, browser persistence, or external tracking.
- Unit/service tests, UI workflow tests, structural accessibility checks, CI example, checked static build, and optional non-root Nginx container configuration.

## Proposed for production

1. **Identity and tenancy:** organization SSO via OIDC, secure HttpOnly sessions, CSRF protection where relevant, server-side role/entity authorization, independent preparer/reviewer enforcement, and a real authenticated API.
2. **Durable workflow:** transactional database, optimistic concurrency/ETags, persistent idempotency keys, immutable evidence versions/checksums, append-only audit retention, retention/access policies, and appropriate storage encryption.
3. **Source integration:** validated ERP, bank, and state extract contracts, ingestion lineage and freshness, control totals, reconciliation rules agreed with Finance, and a separate journal preparation/approval/posting lifecycle.
4. **Evidence follow-up:** assigned tasks, owner notifications, due dates, new evidence submission, versioned resubmission, and reviewer conflict handling. An evidence request here is recorded only.
5. **Agent safety and evaluation:** bounded read-only retrieval, tenant-scoped evidence, structured model output validation, prompt/source provenance, injection-resistant tool permissions, evaluation datasets, calibrated confidence, and human approval of consequential steps. Never allow a recommendation to post directly.
6. **Operations:** redacted structured telemetry, trace IDs, SLOs, audit delivery monitoring, rate limits, paging/virtualization at scale, source-freshness alerts, security review, tested backups/recovery, dependency scanning, and monitored deployment rollback.
7. **Accessibility:** assistive-technology testing with NVDA/VoiceOver, formal keyboard/reflow/contrast review across supported browsers, and user validation with Controllers. Automated checks are a subset of this work.

## Accessibility and security choices

The interface uses landmarks, heading hierarchy, labelled controls, status text alongside color, keyboard-operated tabs, visible focus, reduced-motion support, native dialog focus containment/Escape behavior, and focus restoration. Summary cards are keyboard-operable buttons. Financial values are text, and the readiness ring has an accessible text label.

The service validates snapshots and decision input. It rejects an Analyst’s mutation, rejects self-review, checks recommendation version/state, requires evidence references and acknowledgment, and deduplicates request IDs. All of this is a **simulation in browser memory**, not a real security boundary. React text escaping is retained; JSON exports avoid spreadsheet formula execution. The Nginx example describes deployment hardening but is not a compliance certification or a claim about another host’s headers.

## Approximate effort and assistance

This is an AI-assisted assessment prototype. Approximate preparation time was 35 minutes; verification results and scope are recorded in docs/VERIFICATION.md. The estimate covers implementation, styling, tests, documentation, and packaging; it is not a claim about the candidate’s unaided development time. Review the source, run it locally, and adapt the explanation to your own understanding before submission.
