# Verification and effort

Verified on November 20, 2026 using Node 24.22.3 and npm 11.19.1.

| Check                      | Result                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Lockfile installation      | `npm ci` succeeded through the environment installer after dependency updates                                                      |
| Strict TypeScript          | Passed, including test files                                                                                                       |
| Automated tests            | **30 passed** across five files                                                                                                    |
| Coverage                   | 80.04% statements; 77.47% branches; 75.44% functions; 81.25% lines in the configured coverage scope                                |
| Optimized production build | Passed with Vite 7.3.8; approximately 105 KB JavaScript + 9 KB CSS gzip                                                            |
| Dependency audit           | `npm audit --json`: **0 known vulnerabilities** in the delivered lockfile at verification time                                     |
| Structural accessibility   | axe-core checks passed on the overview and recommendation dialog in jsdom; contrast rule excluded because jsdom has no real layout |
| Browser review             | Desktop overview, evidence drill-down, proposal approval, unchanged account state, and audit references inspected in Chromium      |
| Responsive review          | Compact header, two-column summary cards, and hidden-sidebar layout visually inspected at browser 200% zoom                        |

## Meaningful scenarios covered

- Metrics, materiality, signed variance, gross absolute variance, empty selection, period/entity scoping, and valid synthetic fixtures.
- Controller-only review, preparer/reviewer separation, required reason and evidence acknowledgment, optimistic version rejection, idempotent retry, request-ID misuse, concurrent decisions, unknown IDs, failure recovery, request abort, and state isolation.
- Summary-to-work-queue navigation, period/entity changes, evidence inspection, required review controls, saved decision and audit evidence, Analyst read-only behavior, service retry retaining data, empty search recovery, and keyboard-operated detail tabs.
- Scoped/search-filtered audit JSON export and a slow read not overwriting a completed mutation snapshot.

## Verification limits

- Automated accessibility checks are structural checks, not a WCAG certification. Contrast colors were strengthened and visually inspected; screen-reader acceptance, a formal contrast audit, browser matrix, and physical mobile testing remain production work.
- CI configuration is included but has not run on a remote CI provider. The Docker/Nginx example was not built or exercised here. Its headers are not a claim about another hosting environment.
- The native dialog's browser focus containment and Escape handling depend on current browser support. jsdom tests use a method shim; it does not emulate a full browser focus trap.
- Source control, API authorization, durable audit, encryption, identity integration, real agent quality, and ERP posting need a backend implementation and independent review before real use.
- Build output includes harmless Rollup comments warnings from the patched Zod dependency; they do not prevent the checked build.
- Coverage scope is configured in `vite.config.ts`; deterministic fixture generation is excluded. Coverage is not a claim of complete UI or integration coverage.

## Approximate time spent

Approximately **35 minutes of AI-assisted preparation**, including implementation, styling, automated tests, browser review, documentation, dependency updates, and packaging. This describes the assisted prototype creation, not the candidate's unaided effort. Record your own actual review/adaptation time and disclose assistance according to the assessment's rules.
