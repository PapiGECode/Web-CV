# Wider homepage project previews

## Objective and authorization
Make the five real homepage website previews modestly wider horizontally, preserving the current editorial identity. Local implementation only; no push, pull request, merge, deployment, or production email changes.

## Evidence and approach
- Starting branch: `codex/contact-delivery-activation`; baseline commit: `ced30566e7b046bf1d40b56f2f818aa6a2ca2d56`.
- No `origin` remote is configured. Anonymous fetch of the explicitly named public repository succeeded; `FETCH_HEAD` is `0fc73ff3d8b436ae55edb60c86213c6cd5e9c96c`. No reset, merge, or remote configuration change.
- At 1440px all five previews are 558.17–558.19px wide and 413.45–413.47px high; text columns are 507.42–507.44px. The bot artwork has the same geometry.
- Scope the wider grid only to live website entries: desktop text/preview ratio 1:1.3 (previously 1:1.1), gap from 6vw to 4vw, capped at 4rem. Preview aspect ratio 1.5 preserves approximately the same height while widening the display. Target around 619px at 1440px, approximately 11% wider.
- Visual verification found the portfolio domain wrapping inside `.com` after narrowing the text column. Reuse the existing meaningful domain break in the homepage heading without changing font size or content; verify both segments fit.
- Preserve the single-column layout at 900px and below, the bot artwork, the 1100px iframe viewport, controllers, security policy, contact behavior, and all project content.

## Workflow and constraints
- Route: delegated direct. Coordinated renderer/CSS/regression changes require one bounded writer.
- TDD: unspecified; use ordinary functional regression checks, not an invented strict mode.
- RDD: confirmed off, decided by default. No native review.
- Forecast: fewer than 200 authored changed lines in one coherent behavior/test/doc work unit. Future delivery strategy remains `feature-branch-chain`; no PR is authorized.
- Engram mirror: pending. No registered runtime session identity is available; memory writes and session registration are prohibited. This local document is authoritative.
- Leave user-owned `.atl/` untouched. No dependency changes.

## Tasks
- [x] W1 — Implement the scoped wider live-preview layout and geometry regression. Acceptance: all five previews visibly widen on desktop, retain alternating order, readable text and rounded corners; bot and mobile layout remain unchanged.
- [x] W2 — Verify the complete preview flow and record final evidence. Acceptance: checks, server tests, build, focused landscape/responsive tests, full E2E pass; inspect 320/390/768/1440 in both themes, measure all five widths, and leave the local preview ready.

## Verification evidence
- Baseline `npm run build`: passed, source validation passed, 10 pages and 35 versioned assets.
- Final `npm run check`: passed.
- Final `npm test`: 17/17 passed, no skipped tests; provider calls are simulated, no real emails.
- Final `npm run build`: passed, 10 pages and 35 versioned assets.
- `npx playwright test tests/landscape.spec.js tests/landscape-lifecycle.spec.js tests/browser.spec.js tests/compact.spec.js`: 34/34 passed in 38.0s after the title correction. The initial implementation also passed 34/34 before visual inspection identified the awkward title break.
- One sequential final `npm run test:e2e`: 213/213 passed in 2.1m, zero failures/skips. This covers accessibility, both themes, no-JS, reduced motion, frame scaling/lifecycle/history, isolation and recursion/metrics safeguards.
- New geometry regression checks 320/390/768/899/900/901/1024/1440 in both themes, all five live entries, readable text width, meaningful domain segments, alternation, preserved bot dimensions, rounding and no page overflow.
- No dependency changes; reinstall and dependency audit were not rerun for this local CSS/renderer change. No production verification or publication was performed.
- RDD remains off/default. Parent structural readback, `npm run check`, and `git diff --check` passed. Native risk assessment could not classify the pre-existing untracked `.atl/` inventory; the independent verification below supplies the fallback, not a native review receipt.

## Visual and runtime evidence
The user flow is homepage project entry -> lazy-mounted real site -> correctly scaled larger landscape region -> unchanged external fallback and case navigation. No API or provider behavior was changed.

| Live preview | Previous width at 1440px | Final width at 1440px |
| --- | ---: | ---: |
| KiCord | 558.1875px | 618.5781px |
| PabloSchefer.com | 558.1719px | 618.5625px |
| KernelOS | 558.1875px | 618.5781px |
| ThiagoIUTU | 558.1719px | 618.5625px |
| PapiGEGamer | 558.1719px | 618.5625px |

All five displays are 10.82% wider. Their height is now 412.375px (previously approximately 413.46px), while text remains 475.83px wide. Bot dimensions remain 558.19 x 413.47px. At 320/390/768 the existing single-column preview geometry is unchanged. Actual iframe bounds match their containers within 0.01px at 1440. No horizontal overflow was measured at the four target widths in either theme.

- Local preview: `http://localhost:3104/#work`, started by `node scripts/serve.mjs` (exec session 12034); left running.
- Geometry and live heading observations: `review-reports/wider-previews-geometry.json`.
- Baseline capture: `review-reports/wider-previews-before-1440-dark.png` is mislabeled: it shows the light theme and an empty iframe. Do not use it as a visual dark before/after comparison; the baseline width measurements and regression tests establish the enlargement.
- Forty real-site captures: `review-reports/wider-previews-{kicord,portfolio,kernelos,thiagoiutu,papigegamer-web}-{320,390,768,1440}-{dark,light}.png`. Portfolio captures were refreshed after the domain-break correction; desktop external captures were refreshed after their own entrance animations settled.
- Visual readback covered 320/390/768/1440, light/dark, all five desktop project compositions and the corrected title. The external pages rendered actual content; automated fixtures remain clearly separated in `review-reports/landscape-*`.
- Chromium desktop emulation only; not a physical-device/Safari/Firefox or third-party-site availability guarantee. External content remains controlled by its owners.

## Delivery
- W1/W2 behavior, tests and documentation committed as `9293976d68e7804782cd58ea9a9dba172772ec3e` (`feat(projects): widen desktop website previews`). All functional verification above was run on these source bytes before commit; this closure entry changes documentation only.
- Authored implementation slice: 152 changed lines (145 additions, 7 deletions), before this small closure entry; below the 400-line delivery heuristic.
- Future feature-branch-chain slice: this widening unit is separate from prior contact activation and whole-site polish. No remote mutation is included.
- Engram mirror is still pending because there is no registered runtime identity; no memory writes were attempted.

## Independent closure
- A fresh verifier passed `tests/landscape.spec.js` plus `tests/landscape-lifecycle.spec.js`: 17/17 in29.1s, with `git diff --check ced3056..HEAD` clean. Inspected real desktop/mobile screenshots, both-theme geometry,900/901px boundary,1024px, all five frames, text containment, rounding and alternating order; no change-caused defects found.
- Parent inspected the final PapiGECode desktop screenshot and the scoped CSS/renderer changes. The final full213/213 E2E result remains writer evidence; the independent verifier did not repeat the full suite or inspect production.
- Local implementation complete. Review at `http://localhost:3104/#work`; no publication, production email change, or pending-artwork release occurred. Existing `.atl/` is untouched. Recovery remains local while runtime memory registration is unavailable.

## Rollback
Revert only the new live-layout class, its scoped desktop CSS, the homepage domain-break/shared title formatter, corresponding geometry regression, and this task document. Existing contact activation, whole-site polish, artwork, iframe lifecycle and production settings are outside this rollback boundary.
