# Editorial portfolio refinement

## Objective
Make projects and demonstrated work the focus, with phone previews secondary, while preserving the established editorial identity, hero, floating navigation and animated PABLO footer signature.

## Authorization and baseline
- User explicitly authorized project-section redesign and all eleven browser annotations, plus verified portfolio entries and public GitHub organizations. This is local implementation authority, not push, PR, merge, deployment or authenticated remote-access authority.
- Public master fetched 2026-10-06: f8b06ae82e712b111265a05d7d22fbc8f368217b, unchanged.
- Starting local HEAD: 180c3ec; retain phone safe-area fix e41ae57.
- Backup: codex/backup-before-editorial-refinement. Working branch: codex/portfolio-editorial-refinement.
- Existing untracked .atl is unrelated; preserve it.
- RDD off (default), verified. No native review while off.
- TDD unspecified by project/session, ordinary functional/regression checks apply; never infer strict mode from test presence.
- Delivery: ask-on-risk. Forecast 1,530-2,540 authored additions plus deletions across roughly 14-22 files. User delegated the choice on 2026-10-06: selected feature-branch-chain for coherent integrated review. Work-unit commits accumulate locally; slice branches/PRs will only be created if later authorized. No PR creation authorized. Do not compress code/tests to meet review budgets.
- Engram mirror pending: current project is rejected as unknown/unbacked. Preserve local recovery document.

## Design direction
A curated editorial project index: prominent project names, one useful description, explicit contribution, concise verified technology, and purposeful actions. Use landscape imagery only when verified; otherwise deliberate typography, not invented app screens. Real phone demos become secondary inside cases. Keep three existing phone integrations and physical island safe area, sandbox/lifecycle/history/no-recursion protections, and accessible external fallbacks.

Capabilities become readable numbered editorial rows with concrete evidence rather than nested dashboard cards. Public organization membership becomes a restrained community index, not employer/partner logos. Footer utilities, form focus/typing feedback and portrait/marquee motion share existing typography, palette and restraint. User explicitly requests whole-button magnetic motion, not title-only motion. Move the complete button surface and label together, with bounded displacement and no movement during press/release; touch, keyboard and reduced-motion interactions remain stable. Do not move entire containing cards.

## Tasks
- [x] T1 Whole-button magnetic motion and marquee refinement. Replace title-only magnetism with bounded complete-button feedback and prove click stability including edge/long presses. Fix reproduced whole-bento-card hover transform causing lost clicks. Replace abrupt marquee hover pause with eased deceleration/resume without phase reset; animate decorative stars; reduced motion and keyboard safe. Route delegated direct: JS/CSS/tests.
- [ ] T2 Project catalog and case consistency foundation. Choose minimal build-time shared content where it materially eliminates existing index/modal/canonical duplication. Preserve indexable HTML and existing routes, redirect, SEO and security. Route delegated direct: multi-file rendering/content/tests. Split cohesive review slices after chain decision; no framework migration.
- [ ] T3 Verified project expansion. Add ThiagoIUTU, Robleis, Thiago Community bot, separate PapiGEGamer/PapiGECode lab, and KiCord client/web/bot grouping alongside portfolio and KernelOS. No public broken repo CTAs, fabricated stack/features/ownership or official-artist-site claims. Route delegated direct: catalog/cases/metadata/tests.
- [ ] T4 Project-led homepage and adapted cases. Titles, purpose and role lead; phones secondary. Update obsolete homepage-phone assertions without deleting security/lifecycle semantics. Route delegated direct: markup/layout/modal/tests.
- [ ] T5 Evidence and community index. Restyle capabilities; add the six publicly verified GitHub memberships with clear non-employment wording. Content visible before animation, no-JS, both themes and reduced motion. Route delegated direct: markup/CSS/content tests.
- [ ] T6 Portrait, form and footer finish. Exact #EEE9DF portrait stat; premium decorative portrait motion. Stationary contact controls with focus/typing feedback; preserve honest contact state. Style utility footer on home/privacy/cases and clarify measurement-preferences label without changing consent defaults. Route delegated direct: markup/CSS/JS/tests.
- [ ] T7 Integrated verification and local preview. Full commands, screenshots 320/390/768/1440 both themes, cases and modal history, keyboard/axe/no-JS/reduced motion, real-site spot check; record defects and evidence, commit completed work units under chosen strategy. Route delegated verification plus parent readback and spot check.

## Verified findings
- js/app.js bento hover tilt transforms the entire interactive card; Chromium edge press/release reproduced link movement y=684.34 to678.23 and zero clicks. CSS transform:none cannot override GSAP inline style. Existing hero magnetic effect animates inner .btn-t only; user clarified this is the undesired effect. Replace it as part of T1 rather than preserving it.
- Contact/social/card entrance translations can move interactive targets; audit and confine motion to noninteractive children/decorations.
- CSS marquee animation-play-state pause is discrete; pseudo-element stars currently static.
- Portrait statistic inherits theme color; explicit requested overlay color needed.
- Preferences is measurement consent, not visual settings: ps-measurement, default off, DNT/GPC honored, web-vitals and allowed events, no embedded-preview measurements. Explain this to user. Keep dialog and privacy controls functional.
- Incidental metrics allowlist route mismatch is outside approved visual work unless separately accepted; do not silently expand scope.

## Content evidence (public, unauthenticated, 2026-10-06)
- https://thiagoiutu.com/ live; user identifies contribution as their project. Safe description: a website for ThiagoIUTU's archive, present and community. Supplied https://github.com/PapiGECode/thiago-web-definitiva returns public404; no verified stack.
- https://github.com/PapiGECode/robleis-universe returns public404. User identifies Robleis web project. No verified public domain, stack, launch or official status. Use conservative user-supported description, not false public source links.
- https://github.com/PapiGECode/thiago-community-bot returns public404. User identifies community bot. No verified features or stack.
- https://papigegamer.com/ is a separate PapiGECode software/experiments lab; public HTML uses Next.js chunks. Vercel dashboard provided by user is not deployment evidence. Its cross-project canonical inconsistency is not permission to change that remote project. Preserve legacy /projects/papigegamer redirect; if a new canonical case is needed use distinct slug such as /projects/papigegamer-web.
- https://www.kicord.es/es live. Client closed source per explicit user instruction; client/web/bot contributions user-confirmed without exclusive-author claim. Public help still claims open source but linked repositories return404. Do not copy that conflict. Public web uses Next.js; client/bot stack not verified.
- https://kernelos.org/ existing contribution stays support/community, not ISO authorship.
- https://api.github.com/users/PapiGECode/orgs publicly confirms EpicGames, Design-and-Code, Thread-Development, See-Bot, Open-Hub-Community, K1R4L-BS. Label public GitHub communities/membership, not employment, partners or sponsorship.
- User authorizes relevant logo search within Downloads. Inspect candidate images before using; do not infer logo identity from filename alone or expose unrelated downloads. Local bundled existing assets take priority where appropriate.

## Acceptance and checks
- Hero composition, large PABLO SCHEFER, floating navigation, font system and animated PABLO footer preserved.
- All requested annotations accounted for. Original phone safe area retained wherever phones remain.
- No false content/metrics, no secret access, no default-on analytics, no contact backend changes or false sent success.
- npm ci; npm audit --audit-level=high; npm run check; npm test; npm run build; npm run test:e2e.
- Focused lost-click regression including long pointerdown at edges, reduced motion, marquee smooth pause/resume, typing/reset, exact overlay color, keyboard focus.
- Responsive 320/390/768/1440, dark/light, no overflow, readable capabilities without JS, accessible navigation/modal traps/return focus, unchanged phone sandbox/no recursion/lifecycle.
- Preserve equivalent tests when intentional layout changes invalidate old selectors/counts.
- Real browser screenshots inspected; mocked external tests reported separately from real public-site checks.

## Progress / next step
T1 implemented and self-verified; T2–T7 remain. Feature-branch-chain selected under explicit user delegation; local commit only, no remote delivery. Unknown/publicly inaccessible project details remain conservative unless the user provides evidence or authorizes scoped authenticated inspection.

### T1 evidence and review slice
- Complete `.btn`/`.f-submit` surfaces and labels move together, bounded to 5px horizontally and 3px vertically with a transform-corrected baseline. Native press kills the tween without resetting position; release/cancel resets only after native activation has completed. No pointer capture or synthetic click. Keyboard, touch and live reduced-motion changes remain stable.
- Bento cards no longer tilt, translate on hover or translate on entrance; decorative mouse glow remains. Removed bento-link hover translation. Contact fields/socials/submit and capability links no longer inherit entrance translations; modal entrance uses opacity only.
- Marquee retains one WAAPI timeline with eased velocity, synchronized decorative star rotation and no hover phase reset. Animations pause offscreen/hidden, at rest and with live reduced motion. No new tab stop on the aria-hidden decoration.
- `npm run check`: passed; `npm test`: 12/12; `npm run build`: passed (6 pages/19 versioned assets). `npx playwright test tests/motion.spec.js tests/polish.spec.js tests/ui-refinement.spec.js`: 17/17 passed (15.3s, final normalized source), covering full-surface/title movement, long edge presses, drag nonactivation, keyboard/touch/reduced motion, bento edge click, marquee easing/phase/stars/offscreen and existing layout.
- Initial new drag-and-reentry assertion encountered native link drag cancellation, which legitimately ends the frozen press. Regression now separately checks an actual stationary long edge press and a real drag produces no synthetic click; no production drag suppression was added.
- Agent-browser inspected local preview on port3101: meaningful hero/navigation/controls, no reported page errors. Screenshot inspected at `review-reports/editorial-t1.png` (ignored). Full suite and integrated visual review remain T7/parent verification, not claimed complete.
- Rollback: revert this motion work unit across js/app.js, css/styles.css, tests/motion.spec.js and adjusted tests/polish.spec.js. No content, backend or deployment changes. Engram mirror still pending; RDD off/unmanaged.

- T1 work-unit commit: `fd8f9fee718acc47efd008d997e1bbb0ddb5f315` (273 additions + 56 deletions = 329 authored lines, including initial feature document). Parent independent readback/spot check and T7 remain pending.

### T2–T4 implementation slices
- T1 parent verification: independent verifier 17/17; parent `npm run check` passed. Native assessment unavailable (untracked inventory); RDD remains off and independent fallback completed.
- Plan: migrate existing cases into a shared build-time catalog one at a time; remove the obsolete runtime renderer after migration; add new verified entries in small content slices; replace the homepage gallery with an editorial index and port phone test contexts. Keep runnable states and tests in every slice. No remote PRs.
- T2a: KiCord canonical page and inert modal now share escaped build-time catalog content and preserved page shell. Runtime fallback remains only for unmigrated cases. Checks: check/build passed, node13/13, focused fact consistency + KiCord canonical/pointer/history3/3. Rollback this catalog integration as one unit.
- T2b: migrated portfolio page/modal to the same catalog. T2a commit34ad7c9 (329 lines). Checks check/build passed, node13/13, portfolio canonical/pointer/history and cross-view facts3/3. Existing redirect preserved.
