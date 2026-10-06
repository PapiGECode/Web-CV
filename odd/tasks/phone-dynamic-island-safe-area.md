# Phone dynamic-island safe area

## Objective
Keep real website headers clear of the original iPhone dynamic island without removing or replacing the bezel.

## Problem and scope
The iframe begins at the full display top, behind the island. Reserve a proportional, empty safe area and fit the real website below it. Preserve the original bezel, 390/430 CSS-pixel web viewports, external sandbox/CSP, lazy loading, reload, modal teardown, BFCache/history, no recursion, and metrics suppression. Do not modify remote websites, add fake browser/status controls, redesign the portfolio, push, create a PR, merge, or deploy.

## Authorization and baseline
- User authorized this local visual correction.
- Anonymous pull of PapiGECode/Web-CV master completed; baseline f8b06ae82e712b111265a05d7d22fbc8f368217b.
- Feature branch: codex/phone-dynamic-island-safe-area.
- Existing untracked .atl/ is unrelated and must be preserved.
- RDD: off, default, confirmed with gentle-ai review mode status.
- Delivery strategy: ask-on-risk; forecast 100–180 authored changed lines, one work unit. No remote delivery authorized.
- TDD mode: unspecified in repository/session; do not claim strict TDD enabled. Run ordinary functional/regression checks, optionally demonstrate regression RED before source correction. Runner: node --test and Playwright via package scripts.
- Engram mirror pending: detected project is rejected as unknown/unbacked; local progress remains authoritative until sync can succeed.

## Tasks
- [ ] T1 — Implement proportional phone safe viewport and verify it. Route: delegated direct (three non-trivial source files plus regression tests/docs; mandatory writer/preparation triggers). Preserve island and original asset, remove redundant portfolio-only header offset, update legitimate edge geometry expectations, add responsive regression coverage. Commit source/tests/docs as one conventional work unit after checks.

## Acceptance and checks
- Headers start below island, with small visual clearance; original bezel unchanged and island visible.
- Real page fills remaining display width/height; no artificial status/navigation content.
- 320/390/768/1440 widths, both themes; all three homepage phones, modal, canonical page, mounted resize, top header interactions.
- Existing lifecycle, sandbox, history, recursion, analytics and accessibility coverage remains intact.
- npm ci; npm audit --audit-level=high; npm run check; npm test; npm run build; npm run test:e2e.
- Focused: npx playwright test tests/live-websites.spec.js tests/live-lifecycle.spec.js tests/phones.spec.js.
- Screenshots inspected and real external website rendering checked separately from mocked tests; report external limitations honestly.
- Parent structural readback and spot check; independent verifier if native risk assessment is high or unavailable.

## Progress and evidence
- Exploration complete: iframe top=0 and full-display fit cause overlap. Original 1470x3000 asset island ends near y=216; screen top near y=48. About 7% display safe inset places header near y=250.
- Implemented `.pf-viewport` below a proportional 7% empty dark matte; iframe sizing and ResizeObserver use that viewport. Original bezel asset, URLs, sandbox, CSP and lifecycle logic remain unchanged. Embedded portfolio cards retain normal flow; removed its obsolete navigation-only offset.
- Added safe-area geometry regression across 320/390/768/1440 in dark/light, canonical top-navigation pointer checks for all three phones, mounted resize/context retention, and modal safe geometry. Existing lifecycle/accessibility checks retained. README explains the safe viewport.
- Regression RED observed against original source: 320px dark safe geometry returned false. The first launch found missing Chromium v1243; installed matching Playwright Chromium publicly. An initial new fixture response omitted UTF-8 charset; corrected its response header, not assertions.
- Runtime: Node v24.19.0. `npm ci` passed (17 packages); `npm audit --audit-level=high` passed (0 vulnerabilities). npm reported unapproved install-script warnings for agent-browser/esbuild, but both ran successfully without changing approval settings.
- `npm run check`: passed. `npm test`: 12/12 passed. `npm run build`: passed (6 pages, 19 versioned assets); final build rerun after whitespace normalization also passed.
- `npx playwright test tests/live-websites.spec.js tests/live-lifecycle.spec.js tests/phones.spec.js`: 32/32 passed (26.0s). `npm run test:e2e`: 70/70 passed (47.9s). `git diff --check`: passed.
- Local preview on port 3101 verified with agent-browser: meaningful page content, expected navigation/actions and no reported page errors. Real unmocked KiCord, portfolio and KernelOS rendered at 390 and 1440; titles/body checked, no captured page errors. Evidence: ignored `review-reports/real-sites-report.json` and `review-reports/real-{kicord,portfolio,kernelos}-{390,1440}.png`. Inspected KiCord 390, portfolio 390 and KernelOS 1440 screenshots: island preserved, headers clearly below, remaining display filled.
- No commit or remote operation performed. T1 remains unchecked pending parent structural/independent verification, spot check and work-unit commit. Engram mirror remains pending as previously documented.

## Rollback
Revert safe-area CSS, viewport renderer/fit changes and matching tests/docs as one unit. No external state changes.
