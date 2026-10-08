# Whole-site polish

## Objective and authorization
Complete an evidence-backed aesthetic and functional polish of the existing portfolio, not a redesign. User authorized local implementation on 2026-10-08. No new push, PR, merge or deployment is authorized by this request.

## Baseline and constraints
- Branch: codex/whole-site-polish, starting at6860767 from the completed local Thiago Community sketch. Preserve that unpublished artwork.
- Public master fetched before work:0fc73ff3d8b436ae55edb60c86213c6cd5e9c96c, unchanged. Prior editorial release is published; local sketch and this polish are not.
- Preserve hero, large PABLO SCHEFER, floating navigation, SCHEFER footer motion, editorial dark/light identity, current project facts, five landscape views and safe phone demonstrations. No framework/dependency changes.
- Preserve iframe security/history/lifecycle/no-recursion, reduced motion, usable no-JS content, honest contact delivery, consent default-off/DNT/GPC and no embedded metrics. Untracked .atl is unrelated and must remain untouched.
- RDD off/default confirmed. TDD unspecified by project/session: ordinary focused regression checks, no inferred strict mode. Runner: Node test plus Playwright Chromium.
- Route: delegated direct; broad audits required more than four files and implementation spans multiple nontrivial files. Single bounded writer; independent verification afterward.
- Delivery strategy: existing feature-branch-chain choice retained for eventual reviewable slices. Estimated260–430 authored lines across three coherent local work units;400 is a planning heuristic, not code compression. No PR creation now.

## Verified audit evidence
- Baseline check, server13/13, build10pages/35assets and E2E178/178 passed. Additional local route crawl at390: no broken local links/anchors, JS errors, overflow or serious/critical axe findings.
- At320 the PapiGECode artwork clips both avatar and wordmark on canonical and modal surfaces. Portfolio case title breaks inside PABLOSCHEFER instead of at a meaningful boundary; existing long-title styling loses specificity.
- The current-work collaboration action touches the preceding tag row; mobile consent checkbox flex-shrinks below its intended20px. Evidence in ignored review-reports/visual-audit-* screenshots.
- Next-project navigation loops KiCord → portfolio → KernelOS → KiCord and omits the remaining three visible projects. Showcase numbering itself is consistent.
- Frontend and server metrics allowlists omit current portfolio/ThiagoIUTU/bot/PapiGECode canonical routes: opted-in browser emits nothing; valid handler payloads receive422 while KiCord receives204.
- 404 omits existing prepaint boot and ignores selected/system light theme.
- Out of scope for these units: optional removal of no-JS-only inactive convenience controls; local custom-port origin acceptance (do not broaden production origins); third-party iframe defects; actual email delivery.

## Tasks and acceptance
- [x] P1 — Refine case typography/artwork responsiveness, collaboration-action spacing and consent checkbox sizing. Keep desktop art direction, intentional line breaks, full artwork visibility and native hit geometry. Route delegated direct; forecast80–150 lines including regression tests. Check320/390/768/1440 both themes, modal/canonical, no-JS/reduced motion and checkbox label interaction.
- [x] P2 — Derive a complete six-project next-case cycle from curated order while preserving archived Robleis canonical exit; honor the existing theme on404 with the shared prepaint boot. Route delegated direct; forecast70–120 lines. Check actual links on canonical/modal surfaces and missing-route return navigation in both themes/no-JS.
- [ ] P3 — Synchronize explicit current project metric route allowlists frontend/server and prove opt-in delivery across current canonical pages. Route delegated direct; forecast80–140 lines. Preserve rejection of unknown/private paths, payload allowlist and all consent/DNT/GPC/iframe exclusions. No new event types or user data.
- [ ] P4 — Run final integrated checks, inspect desktop/mobile before/after captures and independent verifier; preserve a working local preview. Route delegated verification plus parent readback/spot check; forecast10–20 documentation lines.

## Verification and progress
- Required per relevant unit: npm run check; npm test; npm run build; focused Playwright regressions. Final: npm run test:e2e sequentially, never overlapping suites against shared output/server.
- No install/audit repeat required unless dependency files change; no production merge in scope.
- Each implementation unit receives a conventional commit with tests/docs and a stated rollback boundary. No AI attribution.
- Memory project: pabloschefer.com continuación. New runtime instructions allow writes without session_id when no authoritative registered identity is available; never invent/register an identity. Mirror this full file at odd/whole-site-polish/tasks before source writes and after each completed unit.
- Current status: audits complete; P1–P2 complete; P3–P4 pending. This document is the current work plan; the long prior history remains in odd/tasks/editorial-portfolio-refinement.md.

### P1 — completed
- Fixed mobile PapiGECode identity clipping with a scoped stacked composition below680px; desktop remains horizontal. The portfolio domain now has a meaningful `.com` break opportunity with scoped title sizing, preserving its full accessible text.
- Added20px separation and44px minimum height to the collaboration action; its former hover translation was removed so hit geometry stays fixed. The native consent checkbox no longer flex-shrinks below20×20px.
- Observed `npm run check` pass; `npm test`13/13; `npm run build`10pages/35assets. Focused Playwright command `npx playwright test tests/whole-site-polish.spec.js tests/catalog-pages.spec.js tests/motion.spec.js tests/utility-preferences.spec.js`:56/56 pass (25.6s).
- The prior catalog test asserted exact heading markup; updated it to require identical accessible text plus the explicit domain break. No behavior coverage removed.
- Runtime proof: canonical/modal compositions and controls at320/390/768/1440 in both themes; no-JS compact cases, reduced motion, native label toggle, full-button press/release stability. Inspected canonical/mobile/desktop/preferences captures under `review-reports/polish-*`.
- Rollback boundary: title markup/rendering and targeted artwork/checkbox/action rules plus their regression assertions; no content, embed, contact-delivery or consent-policy changes.
- RDD off/default: no native review or receipt requested. Dependencies unchanged; install/audit not repeated.
- P1 work-unit commit: ab2e38d.

### P2 — completed
- Derived the six-project next-case cycle from the curated showcase order instead of stale per-project links. Canonical and modal links now name their actual destination; archived Robleis retains its explicit exit to Thiago Community.
- Compact next links use a vertical label/title composition so the full portfolio domain fits at320px. Added the shared prepaint boot script to404 without introducing another theme implementation.
- Observed `npm run check` pass; `npm test`14/14; `npm run build`10pages/35assets. Focused command `npx playwright test tests/case-navigation.spec.js tests/live-lifecycle.spec.js tests/catalog-pages.spec.js`:33/33 pass (11.4s).
- Runtime proof: real canonical/modal next-link activation across every case; all six reachable exactly once before cycling; modal iframe history/focus unchanged; saved/system light/dark404 and return-home links; no-JS return/next links. Compact next-link test first detected two-line domain wrapping, then passed after the scoped layout refinement.
- Inspected `review-reports/polish-404-*` and `review-reports/polish-next-*` screenshots in both themes.
- Rollback boundary: derived next-project helper and links, compact next-link layout,404 boot script and associated assertions. No project facts, SEO routes, iframe lifecycle, metrics or theme-storage behavior changed.
