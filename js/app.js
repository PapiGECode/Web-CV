
      (function () {
        "use strict";
        var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
        var FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
        var html = document.documentElement;
        
        

        var hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
        if (hasGSAP && !REDUCE) html.classList.add("fx");
        if (hasGSAP) {
          gsap.registerPlugin(ScrollTrigger);
        }

        /* ============ DYNAMIC YEARS / COUNTERS INIT ============ */
        function initDynamicCounters() {
          var currentYear = new Date().getFullYear();
          document.querySelectorAll("[data-start-year]").forEach(function (el) {
            var startYear = parseInt(el.dataset.startYear, 10) || 2015;
            var years = Math.max(1, currentYear - startYear);
            var suf = el.dataset.suffix || "";
            el.dataset.count = years;
            el.textContent = years + suf;
          });
        }
        initDynamicCounters();

        /* ============ LENIS SMOOTH SCROLL ============ */
        var lenis = null;
        if (!REDUCE && typeof Lenis !== "undefined") {
          lenis = new Lenis({
            lerp: 0.1,
            wheelMultiplier: 1,
            smoothWheel: true,
          });
          if (hasGSAP) {
            lenis.on("scroll", ScrollTrigger.update);
            gsap.ticker.add(function (t) {
              lenis.raf(t * 1000);
            });
            gsap.ticker.lagSmoothing(0);
          } else {
            function raf(t) {
              lenis.raf(t);
              requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
          }
        }
        window.goTo = function (sel) {
          if (typeof sel !== 'string' || !/^#[a-z][a-z0-9_-]*$/i.test(sel)) return;
          var el = document.getElementById(sel.slice(1));
          if (!el) return;
          if (sel === '#main') { el.focus({ preventScroll: true }); el.scrollIntoView(); return; }
          if (lenis) lenis.scrollTo(el, { offset: -96, duration: .85 });
          else el.scrollIntoView({ behavior: REDUCE ? 'instant' : 'smooth' });
        };

        // Keep the native cursor; motion is enhancement, not navigation.
        /* ============ MAGNETIC BUTTONS / LINKS ============ */
        if (FINE && !REDUCE) {
          document
            .querySelectorAll(".btn,.nav-cta,.f-submit,.nav-link,.social")
            .forEach(function (el) {
              var s =
                el.classList.contains("nav-link") ||
                el.classList.contains("social")
                  ? 0.25
                  : 0.4;
              el.addEventListener("mousemove", function (e) {
                var r = el.getBoundingClientRect();
                var dx = (e.clientX - (r.left + r.width / 2)) * s,
                  dy = (e.clientY - (r.top + r.height / 2)) * s;
                if (hasGSAP)
                  gsap.to(el, {
                    x: dx,
                    y: dy,
                    duration: 0.4,
                    ease: "power3.out",
                  });
                else
                  el.style.transform = "translate(" + dx + "px," + dy + "px)";
              });
              el.addEventListener("mouseleave", function () {
                if (hasGSAP)
                  gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1,.4)",
                  });
                else el.style.transform = "";
              });
            });
        }

        /* ============ SPOTLIGHT ============ */
        if (FINE && !REDUCE) {
          var spot = document.getElementById("spot");
          var hero = document.getElementById("hero");
          addEventListener(
            "mousemove",
            function (e) {
              spot.style.setProperty("--mx", e.clientX + "px");
              spot.style.setProperty("--my", e.clientY + "px");
            },
            { passive: true },
          );
          if (hero) {
            hero.addEventListener("mouseenter", function () {
              spot.style.opacity = "1";
            });
            hero.addEventListener("mouseleave", function () {
              spot.style.opacity = "0";
            });
          }
        }

        /* ============ NAV ============ */
        var nav = document.getElementById("nav");
        var navlinks = document.querySelectorAll(".nav-link");
        var sections = document.querySelectorAll("section[id]");
        var progress = document.getElementById("progress");
        function onScroll() {
          var y = scrollY || pageYOffset;
          nav.classList.toggle("float", y > 40);
          var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
          if (progress && hasGSAP)
            gsap.to(progress, {
              scaleX: y / max,
              duration: 0.2,
              ease: "none",
              transformOrigin: "left",
            });
          else if (progress) progress.style.width = (y / max) * 100 + "%";
          var cur = "";
          sections.forEach(function (s) {
            if (y >= s.offsetTop - 200) cur = s.id;
          });
          navlinks.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + cur);
          });
        }
        addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        if (progress && hasGSAP) gsap.set(progress, { scaleX: 0 });

        // smooth anchors (delegate)
        document
          .querySelectorAll(
            'a[href^="#"]:not([data-close]):not([data-open-case])',
          )
          .forEach(function (a) {
            if (a.getAttribute("onclick")) return;
            a.addEventListener("click", function (e) {
              e.preventDefault();
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              goTo(a.getAttribute("href"));
            });
          });

        /* Mobile navigation: trap focus and lock native scrolling as well as Lenis. */
        var burger = document.getElementById('nav-burger');
        var ov = document.getElementById('nav-overlay');
        var open = false;
        function menuItems() {
          return Array.from(document.querySelectorAll('#nav .nav-actions a, #nav .nav-actions button, #nav-overlay a'))
            .filter(function (el) { return el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden'; });
        }
        function setMenuState(nextOpen, restoreFocus) {
          open = Boolean(nextOpen);
          ov.classList.toggle('open', open);
          nav.classList.toggle('menu-open', open);
          ov.setAttribute('aria-hidden', String(!open));
          ov.inert = !open;
          burger.setAttribute('aria-expanded', String(open));
          burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
          document.documentElement.classList.toggle('menu-locked', open);
          document.getElementById('main').inert = open;
          document.querySelector('footer').inert = open;
          if (lenis) open ? lenis.stop() : lenis.start();
          if (open) ov.querySelector('a').focus({ preventScroll: true });
          else if (restoreFocus !== false) burger.focus({ preventScroll: true });
        }
        ov.inert = true;
        burger.addEventListener('click', function () { setMenuState(!open); });
        document.querySelectorAll('#nav-overlay [data-close], #nav a[href^="#"]').forEach(function(a) {
          a.addEventListener('click', function(e) {
            if (!open || e.ctrlKey || e.metaKey) return;
            e.preventDefault(); setMenuState(false, false); burger.focus({ preventScroll: true });
            goTo(a.getAttribute('href'));
          });
        });
        document.addEventListener('keydown', function(e) {
          if (!open) return;
          if (e.key === 'Escape') { e.preventDefault(); setMenuState(false); return; }
          if (e.key !== 'Tab') return;
          var items = menuItems(), i = items.indexOf(document.activeElement);
          if ((e.shiftKey && i <= 0) || (!e.shiftKey && i === items.length - 1) || i < 0) {
            e.preventDefault(); items[e.shiftKey ? items.length - 1 : 0].focus();
          }
        });
        addEventListener('resize', function() {
          if (open && matchMedia('(min-width: 881px)').matches) setMenuState(false, false);
        });

        /* ============ LOADER + HERO REVEAL ============ */
        function revealHero() {
          // The name and primary actions are visible immediately, even with no JS.
          document.querySelectorAll('#hero .anim').forEach(function(el) { el.style.opacity = '1'; });
          if (hasGSAP && !REDUCE) gsap.fromTo('.hero-kicker', { y: 8 }, { y: 0, duration: .45 });
        }

        /* ========================================================
           SECONDARY PROJECTS (Bento Box - Configurable in one place)
           ======================================================== */
        function startReveals() {

          revealHero();
          buildScroll();
        }

        var loader = document.getElementById('loader');
        if (loader) loader.remove();
        // No artificial loading counter. Layout stabilizes after the critical font or a short bound.
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(function(r) { setTimeout(r, 350); })])
          .then(function() { startReveals(); window.__portfolioReady = true; });

        /* ============ SCROLL-DRIVEN STORY ============ */
        function buildScroll() {
          if (!hasGSAP) return;
          gsap
            .matchMedia()
            .add("(prefers-reduced-motion: no-preference)", function () {
              /* hero depth on scroll */
              gsap.to(".hero-inner", {
                scrollTrigger: {
                  trigger: "#hero",
                  start: "top top",
                  end: "bottom top",
                  scrub: 0.6,
                },
                yPercent: 14,
                scale: 0.94,
                opacity: 0.35,
                filter: "blur(3px)",
                ease: "none",
                transformOrigin: "left bottom",
              });

              /* section header lines draw in */
              gsap.utils.toArray(".sec-line").forEach(function (l) {
                gsap.from(l, {
                  scaleX: 0,
                  duration: 1,
                  ease: "power3.out",
                  scrollTrigger: { trigger: l, start: "top 88%" },
                });
              });
              gsap.utils.toArray(".sec-title").forEach(function (t) {
                gsap.from(t, {
                  yPercent: 110,
                  opacity: 0,
                  duration: 0.9,
                  ease: "power3.out",
                  scrollTrigger: { trigger: t, start: "top 88%" },
                });
              });

              /* ABOUT: statement word-by-word */
              var hello = document.getElementById("about-hello");
              if (hello && typeof SplitText !== "undefined") {
                var hs = new SplitText(hello, {
                  type: "words",
                  wordsClass: "word",
                });
                gsap.from(hs.words, {
                  yPercent: 120,
                  opacity: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  stagger: 0.04,
                  scrollTrigger: { trigger: hello, start: "top 82%" },
                });
              }
              /* counters */
              gsap.utils.toArray("[data-count], [data-start-year]").forEach(function (el) {
                var currentYear = new Date().getFullYear();
                var startYear = el.dataset.startYear ? parseInt(el.dataset.startYear, 10) : null;
                var end = startYear ? Math.max(1, currentYear - startYear) : (+el.dataset.count || 0);
                var suf = el.dataset.suffix || "";
                el.dataset.count = end;
                var o = { v: 0 };
                el.textContent = "0" + suf;
                ScrollTrigger.create({
                  trigger: el,
                  start: "top 88%",
                  once: true,
                  onEnter: function () {
                    gsap.to(o, {
                      v: end,
                      duration: 1.6,
                      ease: "power2.out",
                      onUpdate: function () {
                        el.textContent = Math.round(o.v) + suf;
                      },
                    });
                  },
                  onRefresh: function (self) {
                    if (self.progress > 0 && o.v === 0) {
                      gsap.to(o, {
                        v: end,
                        duration: 1.6,
                        ease: "power2.out",
                        onUpdate: function () {
                          el.textContent = Math.round(o.v) + suf;
                        },
                      });
                    }
                  },
                });
              });
              /* Timeline progress line filling with scroll */
              var tlTrack = document.getElementById("tl-progress");
              if (tlTrack) {
                gsap.to(tlTrack, {
                  height: "100%",
                  ease: "none",
                  scrollTrigger: {
                    trigger: "#timeline",
                    start: "top 75%",
                    end: "bottom 75%",
                    scrub: 0.3,
                  },
                });
              }

              /* Timeline items illumination and entrance */
              gsap.utils.toArray(".tl-item").forEach(function (item) {
                var meta = item.querySelector(".tl-col-meta");
                var card = item.querySelector(".tl-card");
                var node = item.querySelector(".tl-node");

                var tl = gsap.timeline({
                  scrollTrigger: {
                    trigger: item,
                    start: "top 82%",
                    onEnter: function () {
                      item.classList.add("is-active");
                    },
                    onLeaveBack: function () {
                      item.classList.remove("is-active");
                    },
                  },
                });

                tl.to(item, { opacity: 1, duration: 0.1 })
                  .from(
                    node,
                    {
                      scale: 0.5,
                      opacity: 0,
                      duration: 0.5,
                      ease: "back.out(1.7)",
                    },
                    0,
                  )
                  .from(
                    meta,
                    {
                      x: -24,
                      opacity: 0,
                      duration: 0.6,
                      ease: "power3.out",
                      clearProps: "transform",
                    },
                    0.05,
                  )
                  .from(
                    card,
                    {
                      x: 24,
                      opacity: 0,
                      duration: 0.6,
                      ease: "power3.out",
                      clearProps: "transform",
                    },
                    0.1,
                  );
              });
              /* about body + certs */
              gsap.to(".about-body", {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: ".about-body", start: "top 86%" },
              });
              gsap.set(".about-body", { y: 16 });
              gsap.to(".certs .cert", {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.06,
                ease: "back.out(1.6)",
                scrollTrigger: { trigger: ".certs", start: "top 90%" },
              });
              gsap.set(".certs .cert", { y: 14 });
              /* portrait reveal */
              gsap.from("#portrait", {
                clipPath: "inset(100% 0 0 0)",
                duration: 1.1,
                ease: "power3.out",
                scrollTrigger: { trigger: "#portrait", start: "top 85%" },
              });

              /* CAPABILITIES cards */
              gsap.utils.toArray(".cap-card").forEach(function (card) {
                var tl = gsap.timeline({
                  scrollTrigger: { trigger: card, start: "top 88%" },
                });
                tl.to(card, { opacity: 1, duration: 0.1 })
                  .from(
                    card,
                    {
                      y: 28,
                      opacity: 0,
                      duration: 0.7,
                      ease: "power3.out",
                      clearProps: "transform",
                    },
                    0,
                  )
                  .from(
                    card.querySelectorAll(".cap-tag"),
                    {
                      y: 10,
                      opacity: 0,
                      duration: 0.4,
                      stagger: 0.03,
                      ease: "power2.out",
                      clearProps: "transform",
                    },
                    0.2,
                  );
              });

              /* WORK panels: phone tilt + bgmark parallax + ambient + outgoing scale */
              gsap.utils.toArray(".panel").forEach(function (panel, i) {
                var phone = panel.querySelector(".phone") || panel.querySelector(".phone-mockup"),
                  mark = panel.querySelector(".panel-bgmark");
                if (FINE) {
                  gsap.fromTo(
                    phone,
                    { y: 26 },
                    {
                      y: -26,
                      ease: "none",
                      scrollTrigger: {
                        trigger: panel,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.7,
                      },
                    },
                  );
                } else {
                  gsap.fromTo(
                    phone,
                    { rotateY: -12, rotateX: 5, y: 26 },
                    {
                      rotateY: 8,
                      rotateX: -3,
                      y: -26,
                      ease: "none",
                      scrollTrigger: {
                        trigger: panel,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 0.7,
                      },
                    },
                  );
                }
                gsap.fromTo(
                  mark,
                  { yPercent: 18 },
                  {
                    yPercent: -18,
                    ease: "none",
                    scrollTrigger: {
                      trigger: panel,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: 0.7,
                    },
                  },
                );
                // reveal contents on enter
                var info = panel.querySelector(".panel-info");
                var tl = gsap.timeline({
                  scrollTrigger: { trigger: panel, start: "top 60%" },
                });
                tl.from(
                  panel.querySelector(".ph-stage"),
                  {
                    rotationX: 16,
                    y: 80,
                    opacity: 0,
                    transformOrigin: "50% 100%",
                    duration: 1.1,
                    ease: "power3.out",
                  },
                  0,
                )
                  .from(
                    info.querySelector(".panel-num"),
                    { opacity: 0, x: -14, duration: 0.5, ease: "power2.out" },
                    0.1,
                  )
                  .from(
                    info.querySelector(".panel-title"),
                    {
                      opacity: 0,
                      yPercent: 40,
                      duration: 0.7,
                      ease: "power3.out",
                    },
                    "-=.2",
                  );
                var metrics = info.querySelectorAll(".metric-pill");
                if (metrics && metrics.length) {
                  tl.from(
                    metrics,
                    {
                      opacity: 0,
                      y: 10,
                      duration: 0.4,
                      stagger: 0.05,
                      ease: "power2.out",
                    },
                    "-=.3",
                  );
                }
                tl.from(
                    info.querySelector(".panel-desc"),
                    { opacity: 0, y: 18, duration: 0.6, ease: "power2.out" },
                    "-=.35",
                  )
                  .from(
                    info.querySelectorAll(".panel-tag"),
                    {
                      opacity: 0,
                      y: 12,
                      scale: 0.9,
                      duration: 0.4,
                      stagger: 0.05,
                      ease: "back.out(1.7)",
                    },
                    "-=.3",
                  )
                  .from(
                    info.querySelectorAll(".panel-links .btn"),
                    {
                      opacity: 0,
                      y: 12,
                      duration: 0.45,
                      stagger: 0.08,
                      ease: "power2.out",
                      clearProps: "transform",
                    },
                    "-=.2",
                  );
              });

              /* Bento projects anim — cards rendered dynamically, triggered by bento-projects-grid */
              gsap.to(".bento-card", {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: { trigger: "#bento-projects-grid", start: "top 85%" },
              });
              gsap.set(".bento-card", { y: 30 });
              gsap.to(".bento-projects-head", {
                opacity: 1,
                duration: 0.6,
                scrollTrigger: { trigger: ".bento-projects-head", start: "top 90%" },
              });

              /* CONTACT */
              var ch = document.getElementById("contact-head");
              if (ch && typeof SplitText !== "undefined") {
                var cs = new SplitText(ch, {
                  type: "words",
                  wordsClass: "word",
                });
                gsap.from(cs.words, {
                  yPercent: 115,
                  opacity: 0,
                  duration: 0.9,
                  ease: "power4.out",
                  stagger: 0.06,
                  scrollTrigger: { trigger: ch, start: "top 80%" },
                });
              }
              gsap.to(
                ".contact-sub,.socials .social,.form .f-field,.form .f-submit",
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  stagger: 0.08,
                  ease: "power3.out",
                  scrollTrigger: { trigger: "#contact", start: "top 60%" },
                },
              );
              gsap.set(
                ".contact-sub,.socials .social,.form .f-field,.form .f-submit",
                { y: 20 },
              );
              gsap.fromTo(
                ".contact-glow",
                { scale: 0.6, opacity: 0.4 },
                {
                  scale: 1,
                  opacity: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: "#contact",
                    start: "top bottom",
                    end: "center center",
                    scrub: true,
                  },
                },
              );

              /* FOOTER: name letters separate on scroll */
              var fw = document.getElementById("foot-word");
              if (fw && typeof SplitText !== "undefined") {
                var fs = new SplitText(fw, {
                  type: "chars",
                  charsClass: "fchar",
                });
                gsap.fromTo(
                  fs.chars,
                  {
                    x: function (i) {
                      return (i - (fs.chars.length - 1) / 2) * -5;
                    },
                  },
                  {
                    x: function (i) {
                      return (i - (fs.chars.length - 1) / 2) * 16;
                    },
                    ease: "none",
                    scrollTrigger: {
                      trigger: "footer",
                      start: "top bottom",
                      end: "bottom bottom",
                      scrub: 0.8,
                    },
                  },
                );
              }

              return function () {
                /* cleanup handled by matchMedia */
              };
            });

          // non-animated fallback: ensure .anim visible if no matchMedia ran
          if (REDUCE)
            document.querySelectorAll(".anim").forEach(function (e) {
              e.style.opacity = "1";
            });
          ScrollTrigger.refresh();
        }

        /* ============ ROLE CYCLER ============ */
        (function () {
          var roles = [
            "productos web con criterio",
            "herramientas para comunidades",
            "automatizaciones útiles",
            "proyectos open source",
          ];
          var i = 0,
            el = document.getElementById("hero-role");
          if (!el) return;
          setInterval(function () {
            i = (i + 1) % roles.length;
            el.style.opacity = "0";
            setTimeout(function () {
              el.textContent = roles[i];
              el.style.opacity = "1";
            }, 350);
          }, 3200);
        })();

        // Contact is independently managed in js/contact.js.

        /* ============ 3D INTERACTIONS — WORK SECTION ============ */
        if (hasGSAP && FINE && !REDUCE) {
          document.querySelectorAll(".panel-visual").forEach(function (pv) {
            var mark = pv.querySelector(".panel-bgmark");
            var devs = [];
            [[".phone", 24, 18]].forEach(function (cfg) {
              var el = pv.querySelector(cfg[0]);
              if (!el) return;
              devs.push({
                ry: gsap.quickTo(el, "rotationY", {
                  duration: 0.7,
                  ease: "power3.out",
                }),
                rx: gsap.quickTo(el, "rotationX", {
                  duration: 0.7,
                  ease: "power3.out",
                }),
                sc: gsap.quickTo(el, "scale", {
                  duration: 0.6,
                  ease: "power3.out",
                }),
                ay: cfg[1],
                ax: cfg[2],
              });
            });
            if (!devs.length) return;
            var glares = [].slice
              .call(pv.querySelectorAll(".ph-glare"))
              .map(function (g) {
                return gsap.quickTo(g, "xPercent", {
                  duration: 0.8,
                  ease: "power2.out",
                });
              });
            var mx = mark
              ? gsap.quickTo(mark, "x", { duration: 1, ease: "power3.out" })
              : null;
            var my = mark
              ? gsap.quickTo(mark, "y", { duration: 1, ease: "power3.out" })
              : null;
            pv.addEventListener("mousemove", function (e) {
              var r = pv.getBoundingClientRect();
              var nx = (e.clientX - r.left) / r.width - 0.5,
                ny = (e.clientY - r.top) / r.height - 0.5;
              devs.forEach(function (d) {
                d.ry(nx * d.ay);
                d.rx(-ny * d.ax);
                d.sc(1.03);
              });
              glares.forEach(function (g) {
                g(nx * 140);
              });
              if (mx) {
                mx(nx * -34);
                my(ny * -24);
              }
            });
            pv.addEventListener("mouseleave", function () {
              devs.forEach(function (d) {
                d.ry(0);
                d.rx(0);
                d.sc(1);
              });
              glares.forEach(function (g) {
                g(0);
              });
              if (mx) {
                mx(0);
                my(0);
              }
            });
          });
          document.querySelectorAll(".bento-card").forEach(function (card) {
            var rY = gsap.quickTo(card, "rotationY", {
              duration: 0.5,
              ease: "power2.out",
            });
            var rX = gsap.quickTo(card, "rotationX", {
              duration: 0.5,
              ease: "power2.out",
            });
            var yy = gsap.quickTo(card, "y", {
              duration: 0.5,
              ease: "power2.out",
            });
            card.addEventListener("mousemove", function (e) {
              var r = card.getBoundingClientRect();
              var nx = (e.clientX - r.left) / r.width - 0.5,
                ny = (e.clientY - r.top) / r.height - 0.5;
              card.style.setProperty("--mouse-x", (e.clientX - r.left) + "px");
              card.style.setProperty("--mouse-y", (e.clientY - r.top) + "px");
              rY(nx * 6);
              rX(-ny * 5);
              yy(-5);
            });
            card.addEventListener("mouseleave", function () {
              rY(0);
              rX(0);
              yy(0);
            });
          });
        }

        /* ============ EASTER EGGS ============ */
        // design grid -> press "g"
        var grid = document.getElementById("grid");
        (function () {
          var c = document.querySelector("#grid .g-cols");
          for (var i = 0; i < 12; i++)
            c.appendChild(document.createElement("div"));
        })();
        var egg = document.getElementById("egg"),
          eggT;
        function toast(msg) {
          egg.textContent = msg;
          egg.classList.add("show");
          clearTimeout(eggT);
          eggT = setTimeout(function () {
            egg.classList.remove("show");
          }, 2600);
        }
        addEventListener("keydown", function (e) {
          if (e.key === "g" || e.key === "G") {
            if (/input|textarea/i.test(document.activeElement.tagName)) return;
            grid.classList.toggle("on");
            toast(
              grid.classList.contains("on")
                ? "Design grid on"
                : "Design grid off",
            );
          }
        });
        // logo click -> top + accent cycle after 5 clicks
        var logo = document.getElementById("logo"),
          clicks = 0;
        var accents = ["#ece8e1", "#9db4ff", "#9fe6c0", "#ffb38a", "#e7a6ff"];
        logo.addEventListener("click", function (e) {
          e.preventDefault();
          goTo("#hero");
          clicks++;
          if (clicks >= 5) {
            var a = accents[(clicks - 5) % accents.length];
            document.documentElement.style.setProperty("--accent", a);
            if (clicks === 5) toast("Accent unlocked ✦");
          }
        });
        document.getElementById("dot").addEventListener("click", function () {
          toast("Yes, really available :)");
        });
        // konami
        var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
          pos = 0;
        addEventListener("keydown", function (e) {
          pos = e.keyCode === seq[pos] ? pos + 1 : e.keyCode === seq[0] ? 1 : 0;
          if (pos === seq.length) {
            pos = 0;
            toast("↑↑↓↓←→←→ B A — you found it ✦");
            if (hasGSAP)
              gsap.fromTo(
                ".foot-word",
                { scale: 1 },
                {
                  scale: 1.04,
                  duration: 0.3,
                  yoyo: true,
                  repeat: 3,
                  ease: "power1.inOut",
                },
              );
          }
        });

        /* ============ CASE STUDY EXPERIENCES ENGINE ============ */
        var CASE_STUDIES = {
          kicord: {
            id: "kicord",
            number: "01",
            badge: "Producto Open Source",
            title: "KiCord",
            tagline:
              "Extensión avanzada para Discord con arquitectura modular de plugins y mejoras de UX",
            statusDot: "oss",
            statusText: "Open Source · En desarrollo activo",
            heroVisual: "/assets/phone-kicord.webp",
            heroAlt: "Vista conceptual de la web de KiCord",
            tint: "rgba(150, 170, 255, 0.12)",
            meta: [
              { label: "Mi Papel", value: "Creador y Desarrollador Principal" },
              { label: "Cronología", value: "2023 — Presente" },
              {
                label: "Ecosistema",
                value: "Plugins desacoplados / Modding seguro",
              },
              { label: "Estado", value: "Open Source Activo" },
            ],
            links: [
              {
                label: "Visitar web oficial",
                url: "https://kicord.es",
                isPrimary: true,
              },
              {
                label: "Repositorio GitHub",
                url: "https://github.com/PapiGECode",
                isPrimary: false,
              },
            ],
            overview:
              "<b>KiCord</b> es una extensión avanzada y marco de extensibilidad para Discord desarrollada íntegramente en <b>TypeScript</b>. Nació de la necesidad de dotar a los usuarios y comunidades de herramientas reales de personalización, ergonomía y mejoras funcionales sin penalizar la velocidad, la estabilidad ni la seguridad del cliente oficial.",
            problem: {
              subtitle:
                "Rigidez funcional, falta de extensibilidad nativa y sobrecarga de recursos",
              description:
                "El cliente oficial de Discord no ofrece mecanismos nativos para personalizar la interfaz ni para cargar extensiones modulares. Las herramientas comunitarias tradicionales solían ser complejas, inestables o consumir demasiada memoria con cada actualización, provocando bloqueos o cierres inesperados en los clientes de los usuarios.",
            },
            solution: {
              subtitle:
                "Núcleo modular ligero, carga en caliente y tipado estricto",
              description:
                "Desarrollé KiCord implementando un núcleo ultraligero y desacoplado que gestiona el ciclo de vida completo de los plugins (inicialización, inyección controlada, desmontaje limpio y destrucción). Los usuarios pueden habilitar funciones según su flujo de trabajo sin reiniciar el cliente ni comprometer la estabilidad del sistema.",
            },
            technicalHighlights: [
              {
                tag: "Arquitectura Core",
                title: "Sistema de Plugins Desacoplados",
                text: "Cada funcionalidad vive como un plugin aislado con ciclo de vida predecible. Si un módulo experimenta una excepción, el núcleo lo intercepta y aísla sin interrumpir el funcionamiento general de Discord.",
              },
              {
                tag: "Type Safety",
                title: "Desarrollo en TypeScript Estricto",
                text: "Definición rigurosa de interfaces, contratos de eventos y tipos para interceptar el DOM y las APIs internas del cliente con total seguridad en tiempo de compilación.",
              },
              {
                tag: "PoC Avanzada",
                title: "Extensibilidad Extrema (KiCord DOOM)",
                text: "Creación del plugin KiCord-DOOM-Plugin en TypeScript, ejecutando el clásico juego dentro del entorno de Discord como prueba de concepto de la versatilidad y rendimiento de la API de plugins.",
              },
              {
                tag: "Ergonomía & UX",
                title: "Diseño & Microinteracciones",
                text: "Integración estética no intrusiva que complementa la identidad nativa de Discord, con microinteracciones fluidas, atajos de teclado y mínimo impacto en el rendimiento.",
              },
            ],
            stack: [
              {
                category: "Lenguaje & Núcleo",
                items: ["TypeScript", "JavaScript (ESNext)", "Node.js"],
              },
              {
                category: "Plataforma & APIs",
                items: [
                  "Discord Internal APIs",
                  "DOM & Event Interception",
                  "Electron Runtime",
                ],
              },
              {
                category: "Estilos & UI",
                items: ["CSS Modular", "Theming Adaptativo", "Microinteracciones"],
              },
              {
                category: "Herramientas & Despliegue",
                items: ["Git", "GitHub OSS", "Vercel", "CI/CD"],
              },
            ],
            metrics: [
              {
                val: "Open Source",
                lbl: "Código libre y transparente",
                dot: "oss",
              },
              { val: "Modular", lbl: "Arquitectura basada en plugins", dot: "" },
              {
                val: "TypeScript",
                lbl: "Tipado estricto en el 100% del core",
                dot: "",
              },
              {
                val: "Activo",
                lbl: "Mantenimiento y evolución continua",
                dot: "live",
              },
            ],
            gallery: [
              {
                type: "image",
                src: "/assets/phone-kicord.webp",
                caption: "KiCord interfaz móvil y visualización conceptual",
                label: "Mockup de Producto",
              },
              {
                type: "placeholder",
                title: "Panel de configuración y gestor de plugins",
                badge: "Galería Técnica",
                note: "Estructura preparada para capturas en alta resolución del gestor interno de plugins.",
              },
            ],
            video: {
              title: "Demostración en vídeo",
              note: "Estructura preparada para demo interactiva o walkthrough en vídeo del funcionamiento de KiCord.",
            },
            nextId: "papige",
            nextTitle: "PapiGEGamer.com",
          },
          papige: {
            id: "papige",
            number: "02",
            badge: "Plataforma Web",
            title: "PapiGEGamer.com",
            tagline:
              "Portfolio interactivo y telemetría de comunidades en tiempo real",
            statusDot: "live",
            statusText: "Activo · En Producción",
            heroVisual: "/assets/phone-papige.webp",
            heroAlt: "PapiGEGamer.com en iPhone",
            tint: "rgba(150, 255, 190, 0.1)",
            meta: [
              { label: "Mi Papel", value: "Diseño & Desarrollo Full-Stack" },
              { label: "Cronología", value: "2024 — Presente" },
              {
                label: "Enfoque",
                value: "Telemetría en tiempo real & Asistente interactivo",
              },
              { label: "Estado", value: "Activo en Producción" },
            ],
            links: [
              {
                label: "Visitar web oficial",
                url: "https://papigegamer.com",
                isPrimary: true,
              },
              {
                label: "Repositorio GitHub",
                url: "https://github.com/PapiGECode",
                isPrimary: false,
              },
            ],
            overview:
              "<b>PapiGEGamer.com</b> es una plataforma web desarrollada con <b>React y TypeScript</b> concebida como hub interactivo. Centraliza la actividad técnica de proyectos personales, métricas en vivo de servidores de Discord y repositorios de GitHub, integrando además a <b>NEXO</b>, un asistente conversacional interactivo.",
            problem: {
              subtitle:
                "Portfolios estáticos sin conexión con la actividad real",
              description:
                "La mayoría de portfolios técnicos son páginas planas que quedan desactualizadas rápidamente y no reflejan la actividad cotidiana en comunidades ni el ritmo real de commits o despliegues. Se requería una plataforma viva con telemetría en tiempo real y una experiencia interactiva guiada.",
            },
            solution: {
              subtitle:
                "Conexión reactiva a APIs externas y asistente inteligente NEXO",
              description:
                "Desarrollé una arquitectura web reactiva que consume las APIs de Discord y GitHub para mostrar estado y estadísticas en vivo. Además, implementé a NEXO, un asistente guiado que facilita a los visitantes formular preguntas sobre la trayectoria, proyectos y stack del desarrollador de forma ágil.",
            },
            technicalHighlights: [
              {
                tag: "Asistente Virtual",
                title: "Motor de NEXO",
                text: "Módulo interactivo diseñado para responder consultas frecuentes, guiar la navegación del usuario y ofrecer un recorrido interactivo por el portafolio.",
              },
              {
                tag: "Integraciones",
                title: "Telemetría de APIs (Discord & GitHub)",
                text: "Sincronización de actividad, presencia en línea, estado de servidores y conteo de repositorios mediante llamadas seguras a APIs de terceros.",
              },
              {
                tag: "Frontend",
                title: "React + TypeScript Moderno",
                text: "Componentes funcionales modulares, renderizado condicional optimizado y separación limpia de la lógica de negocio y presentación.",
              },
              {
                tag: "Infraestructura",
                title: "Despliegue Continuo en Vercel",
                text: "Integración continua vinculada al repositorio Git para despliegues instantáneos con CDN global y latencia de carga ultra-reducida.",
              },
            ],
            stack: [
              {
                category: "Frontend & UI",
                items: ["React", "TypeScript", "HTML5 Semántico", "CSS3 Moderno"],
              },
              {
                category: "APIs & Servicios",
                items: [
                  "Discord REST API",
                  "GitHub REST API",
                  "Webhooks",
                ],
              },
              {
                category: "Lógica & Estado",
                items: [
                  "Motor Asistente NEXO",
                  "Gestión de Estado React",
                  "Custom Hooks",
                ],
              },
              {
                category: "DevOps & Dominio",
                items: ["Vercel", "Git", "GitHub", "Gestión DNS"],
              },
            ],
            metrics: [
              { val: "Activo", lbl: "Servicio en línea 24/7", dot: "live" },
              {
                val: "React + TS",
                lbl: "Frontend reactivo y fuertemente tipado",
                dot: "",
              },
              {
                val: "NEXO",
                lbl: "Asistente conversacional propio",
                dot: "",
              },
              {
                val: "APIs en vivo",
                lbl: "Conexión directa con Discord y GitHub",
                dot: "",
              },
            ],
            gallery: [
              {
                type: "image",
                src: "/assets/phone-papige.webp",
                caption: "PapiGEGamer.com vista móvil y experiencia interactiva",
                label: "Mockup de Plataforma",
              },
              {
                type: "placeholder",
                title: "Capturas de la interfaz de NEXO y telemetría",
                badge: "Galería Técnica",
                note: "Estructura preparada para capturas del asistente NEXO y los paneles de telemetría.",
              },
            ],
            video: {
              title: "Demostración en vídeo",
              note: "Estructura lista para vídeo interactivo mostrando la interacción en vivo con NEXO.",
            },
            nextId: "kernelos",
            nextTitle: "KernelOS",
          },
          kernelos: {
            id: "kernelos",
            number: "03",
            badge: "Comunidad & Producto",
            title: "KernelOS",
            tagline:
              "Ecosistema de CustomOS para gaming de baja latencia y soporte masivo",
            statusDot: "live",
            statusText: "50.000+ usuarios activos · Escala masiva",
            heroVisual: "/assets/phone-kernelos.webp",
            heroAlt: "Vista de la web de KernelOS",
            tint: "rgba(255, 180, 140, 0.1)",
            meta: [
              {
                label: "Mi Papel",
                value: "Soporte Técnico, Comunidad & Producto",
              },
              { label: "Cronología", value: "2022 — Presente" },
              {
                label: "Enfoque",
                value: "Gaming de baja latencia, triaje de fallos y soporte",
              },
              { label: "Comunidad", value: "+50K activos / +1.5M históricos" },
            ],
            links: [
              {
                label: "Ver perfil en KernelOS",
                url: "https://kernelos.org/",
                isPrimary: true,
              },
              {
                label: "GitHub",
                url: "https://github.com/PapiGECode",
                isPrimary: false,
              },
            ],
            overview:
              "<b>KernelOS</b> es un ecosistema de CustomOS optimizado para gaming competitivo y ultra-baja latencia. Con más de <b>50.000 usuarios activos</b> y más de <b>1,5 millones de usuarios históricos</b>, mi labor abarca el soporte técnico avanzado, la prevención de incidencias a gran escala y la canalización de necesidades de la comunidad hacia el equipo de desarrollo de producto.",
            problem: {
              subtitle:
                "Diversidad extrema de hardware y fallos críticos en sistemas modificados",
              description:
                "La optimización agresiva del kernel y servicios de Windows provoca conflictos con configuraciones atípicas de placas base, drivers de audio USB y procesadores. Atender a decenas de miles de gamers exige identificar rápidamente patrones de error entre miles de mensajes diarios sin colapsar al equipo principal de desarrollo.",
            },
            solution: {
              subtitle:
                "Triaje estructurado, diagnóstico de latencia y retroalimentación directa",
              description:
                "Establecí protocolos de atención técnica, documentación de solución de problemas (troubleshooting) y análisis de logs/volcados de memoria. Este flujo transforma incidencias aisladas en recomendaciones técnicas y ajustes preventivos para las siguientes compilaciones de KernelOS.",
            },
            technicalHighlights: [
              {
                tag: "Soporte a Escala",
                title: "Triaje y Atención a +50.000 Miembros",
                text: "Resolución de incidencias complejas de instalación, dependencias de software y rendimiento en Discord con guías técnicas de autoayuda.",
              },
              {
                tag: "Diagnóstico",
                title: "Análisis de Latencia DPC / ISR",
                text: "Identificación y resolución de picos de micro-stuttering, problemas de interrupciones de drivers y asignación de afinidad de CPU.",
              },
              {
                tag: "Voz de Producto",
                title: "Canalización de Feedback",
                text: "Filtrado y priorización de peticiones comunitarias para la hoja de ruta de nuevas versiones del sistema operativo.",
              },
              {
                tag: "Prevención",
                title: "Seguridad y Moderación Técnica",
                text: "Supervisión de seguridad de herramientas complementarias compartidas por la comunidad para evitar malware o scripts dañinos.",
              },
            ],
            stack: [
              {
                category: "Sistemas & Kernel",
                items: [
                  "Windows Internals",
                  "Registro de Windows",
                  "Optimización de Kernel",
                  "PowerShell / Batch",
                ],
              },
              {
                category: "Diagnóstico",
                items: [
                  "LatencyMon",
                  "Visor de Eventos",
                  "MSI Utility",
                  "DPC Latency Checker",
                ],
              },
              {
                category: "Comunidad & Operaciones",
                items: [
                  "Discord a Gran Escala",
                  "KernelOS Portal",
                  "Sistemas de Tickets",
                ],
              },
              {
                category: "Metodologías",
                items: [
                  "Triaje de incidencias",
                  "Documentación técnica",
                  "Control de calidad (QA)",
                ],
              },
            ],
            metrics: [
              {
                val: "50K+",
                lbl: "Usuarios activos en la comunidad",
                dot: "live",
              },
              {
                val: "1.5M+",
                lbl: "Descargas y usuarios históricos",
                dot: "",
              },
              {
                val: "CustomOS",
                lbl: "Enfoque en latencia mínima y gaming",
                dot: "",
              },
              {
                val: "Soporte",
                lbl: "Gestión técnica, comunidad y producto",
                dot: "oss",
              },
            ],
            gallery: [
              {
                type: "image",
                src: "/assets/phone-kernelos.webp",
                caption: "KernelOS visualización conceptual y alcance",
                label: "Mockup de Comunidad",
              },
              {
                type: "placeholder",
                title: "Documentación y guías de soporte de KernelOS",
                badge: "Galería Operativa",
                note: "Estructura preparada para manuales técnicos y registros de soporte a usuarios.",
              },
            ],
            video: {
              title: "Demostración en vídeo",
              note: "Estructura lista para benchmarks y análisis de latencia comparativa de KernelOS.",
            },
            nextId: "kicord",
            nextTitle: "KiCord",
          },
        };

        var csModal = document.getElementById("case-study-modal");
        var csScroller = document.getElementById("cs-scroller");
        var csContent = document.getElementById("cs-content");
        var csTopNum = document.getElementById("cs-top-num");
        var csTopName = document.getElementById("cs-top-name");
        var csBtnBack = document.getElementById("cs-btn-back");
        var csBtnClose = document.getElementById("cs-btn-close");

        function renderCaseStudy(data) {
          var metaHtml = data.meta
            .map(function (m) {
              return (
                '<div class="cs-meta-card">' +
                '<div class="cs-meta-lbl">' +
                m.label +
                "</div>" +
                '<div class="cs-meta-val">' +
                m.value +
                "</div>" +
                "</div>"
              );
            })
            .join("");

          var linksHtml = data.links
            .map(function (l) {
              var cls = l.isPrimary ? "btn btn-solid" : "btn btn-ghost";
              return (
                '<a href="' +
                l.url +
                '" target="_blank" rel="noopener noreferrer" class="' +
                cls +
                '" data-cursor="OPEN">' +
                '<span class="btn-t">' +
                l.label +
                '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
                '<path d="M1 11L11 1M11 1H4M11 1V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
                "</svg>" +
                "</span>" +
                "</a>"
              );
            })
            .join("");

          var routeSlug = data.id === "papige" ? "papigegamer" : data.id;
          linksHtml +=
            '<a href="/projects/' +
            routeSlug +
            '" class="btn btn-ghost" data-cursor="OPEN">' +
            '<span class="btn-t">URL permanente' +
            '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
            '<path d="M1 11L11 1M11 1H4M11 1V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
            "</svg></span></a>";

          var highlightsHtml = data.technicalHighlights
            .map(function (h) {
              return (
                '<div class="cs-tech-card">' +
                '<span class="cs-tech-tag">' +
                h.tag +
                "</span>" +
                '<h4 class="cs-tech-h">' +
                h.title +
                "</h4>" +
                '<p class="cs-tech-p">' +
                h.text +
                "</p>" +
                "</div>"
              );
            })
            .join("");

          var stackHtml = data.stack
            .map(function (s) {
              var pills = s.items
                .map(function (it) {
                  return '<span class="cs-stack-pill">' + it + "</span>";
                })
                .join("");
              return (
                '<div class="cs-stack-cat">' +
                '<div class="cs-stack-cat-title">' +
                s.category +
                "</div>" +
                '<div class="cs-stack-pills">' +
                pills +
                "</div>" +
                "</div>"
              );
            })
            .join("");

          var metricsHtml = data.metrics
            .map(function (m) {
              var dotHtml = m.dot
                ? '<span class="metric-dot ' +
                  m.dot +
                  '" aria-hidden="true"></span>'
                : "";
              return (
                '<div class="cs-metric-card">' +
                '<div class="cs-metric-head">' +
                dotHtml +
                '<span class="cs-metric-val">' +
                m.val +
                "</span>" +
                "</div>" +
                '<div class="cs-metric-lbl">' +
                m.lbl +
                "</div>" +
                "</div>"
              );
            })
            .join("");

          var galleryHtml = data.gallery.filter(function(g) { return g.type === "image"; })
            .map(function (g) {
              if (g.type === "image") {
                return (
                  '<div class="cs-gallery-item">' +
                  '<div class="cs-gallery-media">' +
                  '<img src="' +
                  g.src +
                  '" alt="' +
                  (g.caption || "") +
                  '" loading="lazy" decoding="async" width="501" height="1024" draggable="false" />' +
                  "</div>" +
                  '<div class="cs-gallery-foot">' +
                  '<div class="cs-gallery-caption">' +
                  g.caption +
                  "</div>" +
                  '<div class="cs-gallery-tag">' +
                  g.label +
                  "</div>" +
                  "</div>" +
                  "</div>"
                );
              } else {
                return (
                  '<div class="cs-gallery-placeholder">' +
                  '<span class="badge">' +
                  g.badge +
                  "</span>" +
                  '<div class="title">' +
                  g.title +
                  "</div>" +
                  '<p class="desc">' +
                  g.note +
                  "</p>" +
                  "</div>"
                );
              }
            })
            .join("");

          return (
            '<div class="cs-hero">' +
            '<div class="cs-eyebrow-row">' +
            '<span class="cs-badge">' +
            data.number +
            " — " +
            data.badge +
            "</span>" +
            '<span class="cs-status-chip">' +
            '<span class="metric-dot ' +
            data.statusDot +
            '" aria-hidden="true"></span>' +
            "<span>" +
            data.statusText +
            "</span>" +
            "</span>" +
            "</div>" +
            '<h1 class="cs-title">' +
            data.title +
            "</h1>" +
            '<p class="cs-tagline">' +
            data.tagline +
            "</p>" +
            '<div class="cs-hero-actions">' +
            linksHtml +
            "</div>" +
            '<div class="cs-hero-card" style="--cs-tint: ' +
            data.tint +
            '">' +
            '<div class="cs-hero-card-glow" aria-hidden="true"></div>' +
            '<img class="cs-hero-mockup" src="' +
            data.heroVisual +
            '" alt="' +
            data.heroAlt +
            '" loading="lazy" decoding="async" width="501" height="1024" draggable="false" />' +
            "</div>" +
            "</div>" +
            '<div class="cs-sec">' +
            '<div class="cs-sec-label">Ficha Técnica</div>' +
            '<div class="cs-meta-grid">' +
            metaHtml +
            "</div>" +
            "</div>" +
            '<div class="cs-sec">' +
            '<div class="cs-sec-label">Visión General</div>' +
            '<h2 class="cs-sec-title">Descripción del Proyecto</h2>' +
            '<p class="cs-prose">' +
            data.overview +
            "</p>" +
            "</div>" +
            '<div class="cs-sec">' +
            '<div class="cs-sec-label">Reto &amp; Solución</div>' +
            '<h2 class="cs-sec-title">Problema y Enfoque Desarrollado</h2>' +
            '<div class="cs-compare-grid">' +
            '<div class="cs-compare-card problem">' +
            '<div class="cs-compare-badge">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
            "<span>El Problema</span>" +
            "</div>" +
            '<div class="cs-compare-sub">' +
            data.problem.subtitle +
            "</div>" +
            '<div class="cs-compare-desc">' +
            data.problem.description +
            "</div>" +
            "</div>" +
            '<div class="cs-compare-card solution">' +
            '<div class="cs-compare-badge">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
            "<span>Solución Desarrollada</span>" +
            "</div>" +
            '<div class="cs-compare-sub">' +
            data.solution.subtitle +
            "</div>" +
            '<div class="cs-compare-desc">' +
            data.solution.description +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            '<div class="cs-sec">' +
            '<div class="cs-sec-label">Ingeniería &amp; Core</div>' +
            '<h2 class="cs-sec-title">Arquitectura &amp; Aspectos Técnicos</h2>' +
            '<div class="cs-tech-grid">' +
            highlightsHtml +
            "</div>" +
            "</div>" +
            '<div class="cs-sec">' +
            '<div class="cs-sec-label">Tecnologías</div>' +
            '<h2 class="cs-sec-title">Stack Tecnológico</h2>' +
            '<div class="cs-stack-cat-grid">' +
            stackHtml +
            "</div>" +
            "</div>" +
            '<div class="cs-sec">' +
            '<div class="cs-sec-label">Impacto</div>' +
            '<h2 class="cs-sec-title">Métricas &amp; Datos Clave</h2>' +
            '<div class="cs-metrics-grid">' +
            metricsHtml +
            "</div>" +
            "</div>" +
            '<div class="cs-sec">' +
            '<div class="cs-sec-label">Multimedia</div>' +
            '<h2 class="cs-sec-title">Galería de Capturas &amp; Mockups</h2>' +
            '<div class="cs-gallery-grid">' +
            galleryHtml +
            "</div>" +
            "</div>" +
            '<button type="button" class="cs-next-card" data-next-case="' +
            data.nextId +
            '" data-cursor="CASE STUDY">' +
            "<div>" +
            '<div class="cs-next-sub">Siguiente caso de estudio</div>' +
            '<div class="cs-next-title">' +
            data.nextTitle +
            "</div>" +
            "</div>" +
            '<div class="cs-next-arr" aria-hidden="true">→</div>' +
            "</button>"
          );
        }

        var lastCaseStudyTrigger = null;
        function caseStudyFocusable() {
          return Array.from(csModal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
            .filter(function(el) { return el.getClientRects().length > 0; });
        }
        function setCaseBackground(locked) {
          [document.getElementById('main'), nav, ov, document.querySelector('footer')].forEach(function(el) { if(el) el.inert = locked; });
          if (!locked) ov.inert = true;
          document.documentElement.classList.toggle('modal-locked', locked);
        }
        function openCaseStudy(id, pushState) {
          var data = CASE_STUDIES[id];
          if (!csModal || !data) return;
          var alreadyOpen = csModal.classList.contains('cs-open');
          if (!alreadyOpen && !lastCaseStudyTrigger) lastCaseStudyTrigger = document.activeElement;
          csTopNum.textContent = data.number;
          csTopName.textContent = data.title;
          csContent.innerHTML = renderCaseStudy(data);
          csScroller.scrollTop = 0;
          csModal.inert = false;
          csModal.classList.add('cs-open');
          csModal.setAttribute('aria-hidden', 'false');
          setCaseBackground(true);
          if (lenis) lenis.stop();
          csBtnClose.focus({ preventScroll: true });
          if (pushState !== false) {
            history[alreadyOpen ? 'replaceState' : 'pushState']({ portfolioModal: true, caseStudy: id }, '', '#case-study-' + id);
          }
          if (hasGSAP && !REDUCE) gsap.fromTo(csContent, { opacity: .7, y: 8 }, { opacity: 1, y: 0, duration: .22 });
        }
        function closeCaseStudy(navigate) {
          if (!csModal || !csModal.classList.contains('cs-open')) return;
          if (navigate !== false && history.state && history.state.portfolioModal) {
            history.back(); return;
          }
          csModal.classList.remove('cs-open');
          csModal.setAttribute('aria-hidden', 'true');
          setCaseBackground(false);
          if (lastCaseStudyTrigger && lastCaseStudyTrigger.isConnected) lastCaseStudyTrigger.focus({ preventScroll: true });
          csModal.inert = true;
          if (lenis) lenis.start();
          if (navigate !== false) history.replaceState(null, '', location.pathname + location.search + '#work');
        }
        document.addEventListener('click', function(e) {
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          var trigger = e.target.closest('[data-open-case], [data-next-case]');
          if (!trigger) return;
          var id = trigger.dataset.openCase || trigger.dataset.nextCase;
          if (!CASE_STUDIES[id]) return;
          e.preventDefault();
          if (trigger.dataset.openCase) lastCaseStudyTrigger = trigger;
          openCaseStudy(id);
        });
        [csBtnBack, csBtnClose].forEach(function(el) { if(el) el.addEventListener('click', function() { closeCaseStudy(); }); });
        addEventListener('keydown', function(e) {
          if (!csModal || !csModal.classList.contains('cs-open')) return;
          if (e.key === 'Escape') { e.preventDefault(); closeCaseStudy(); return; }
          if (e.key !== 'Tab') return;
          var items = caseStudyFocusable(), i = items.indexOf(document.activeElement);
          if (i < 0 || (e.shiftKey && i === 0) || (!e.shiftKey && i === items.length - 1)) {
            e.preventDefault(); items[e.shiftKey ? items.length - 1 : 0].focus();
          }
        });
        function syncCaseHash() {
          var match = location.hash.match(/^#case-study-([a-z0-9_-]+)$/i);
          if (match && CASE_STUDIES[match[1]]) openCaseStudy(match[1], false);
          else closeCaseStudy(false);
        }
        addEventListener('popstate', syncCaseHash);
        syncCaseHash();

        // refresh ST after fonts load (layout shift guard)
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () {
            if (hasGSAP) ScrollTrigger.refresh();
          });
        }
      })();
    