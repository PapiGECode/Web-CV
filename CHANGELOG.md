## 2026-10-04 — Quality, contact and opt-in measurement

- Refined project-first hierarchy, responsive type and actions; fixed mobile overflow and empty notification artifact.
- Removed artificial loading delay, kept native cursor and made project cards readable without JavaScript.
- Shared themes, keyboard menu/dialog navigation, scroll lock and modal history fixes.
- Added validated Resend delivery with capability detection, explicit draft fallback, idempotency and bounded requests.
- Added opt-in, first-party event/Web Vitals logging; documented distinction from Vercel dashboard products.
- Self-hosted fonts, content-hashed/minified scripts/styles, responsive WebP and matching security/cache policies.
- Added server tests, browser interaction/viewport tests, accessibility checks and review screenshots.

## 2026-10-02 — Production overhaul

- Split the monolithic HTML into cacheable CSS, application JS and vendor bundles.
- Added Vercel build validation and Sharp-based image optimization.
- Added serverless GitHub activity proxy with caching and fallback.
- Corrected contact-form semantics and removed false “sent” confirmation.
- Added SEO metadata, JSON-LD, sitemap, robots, manifest and Open Graph image generation.
- Added accessibility fixes for keyboard navigation, focus traps and skip navigation.
- Added security headers, custom 404 page and mobile motion reductions.
- Replaced the original template README with project-specific documentation.

# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.1.0] — 2026-06-30
### Added
- **Theme-aware portrait** — separate photo for light and dark mode, cross-fading on theme switch.
- Readability scrim behind the portrait caption so the stats stay legible over any image.

### Fixed
- **Mobile layout** — removed the large empty gap in the hero, tamed oversized type, and reduced
  section padding for a compact, single-flow scroll.
- **Mobile menu** — the close (✕) control is now above the overlay and reliably dismisses the menu.
- **Desktop navigation** — links are now truly centered between the logo and actions.
- Eliminated horizontal overflow on small screens (≤ 360px).

## [2.0.0] — 2026-06-29
### Added
- **Light / Dark mode** — full design-token swap with system-preference detection, `localStorage`
  persistence, a smooth crossfade, and a sun/moon toggle in the nav.

## [1.0.0] — 2026-06-29
### Added
- **Cinematic rebuild** powered by GSAP, ScrollTrigger, SplitText, and Lenis (all vendored inline):
  - Cinematic preloader with counter, curtain wipe, and SplitText name reveal.
  - Custom magnetic cursor with contextual labels, media awareness, and touch fallback.
  - Sticky, stacked project showcase with 3D phone tilt and per-project ambient tint.
  - Scroll storytelling: hero depth, word-by-word reveals, count-up stats, mouse-reactive portrait.
  - Animated footer wordmark that spreads on scroll.
  - Easter eggs: design grid (`G`), Konami code, logo accent cycle.
- Full `prefers-reduced-motion` support and keyboard accessibility.

## [0.1.0] — 2026-06-28
### Added
- Initial **monochrome editorial** design — Swiss-inspired layout, oversized grotesque typography,
  mono slash-labels, hero, about, services, work, contact, and footer sections.
