
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
        var motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

        /* One continuous timeline: ease speed, never restart the marquee phase. */
        var marquee = document.querySelector('.marquee');
        if (marquee && hasGSAP && typeof Element.prototype.animate === 'function') {
          var track = marquee.querySelector('.marquee-track');
          var travel = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
            { duration: 38000, iterations: Infinity });
          var speed = { value: 0 }, visible = false, hovering = false, focused = false;
          var animations = [];
          function rate() { animations.forEach(function (animation) { animation.playbackRate = speed.value; }); }
          function updateMarquee() {
            gsap.killTweensOf(speed);
            animations = marquee.getAnimations({ subtree: true });
            if (!visible || document.hidden || motionPreference.matches) {
              speed.value = 0; rate();
              animations.forEach(function (animation) { animation.pause(); });
              return;
            }
            rate();
            animations.forEach(function (animation) { animation.play(); });
            gsap.to(speed, {
              value: hovering || focused ? 0 : 1, duration: .8, ease: 'power2.out', onUpdate: rate,
              onComplete: function () { if (speed.value === 0) animations.forEach(function (animation) { animation.pause(); }); },
            });
          }
          travel.pause();
          if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
              visible = entries[0].isIntersecting; updateMarquee();
            }).observe(marquee);
          } else { visible = true; updateMarquee(); }
          marquee.addEventListener('pointerenter', function (e) { hovering = e.pointerType === 'mouse'; updateMarquee(); });
          marquee.addEventListener('pointerleave', function () { hovering = false; updateMarquee(); });
          marquee.addEventListener('focusin', function () { focused = true; updateMarquee(); });
          marquee.addEventListener('focusout', function (e) { focused = marquee.contains(e.relatedTarget); updateMarquee(); });
          motionPreference.addEventListener('change', updateMarquee);
          document.addEventListener('visibilitychange', updateMarquee);
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
        var sections = Array.from(document.querySelectorAll('section[id]')).filter(function (section) {
          return Array.from(navlinks).some(function (link) { return link.hash === '#' + section.id; });
        });
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
            var active = l.getAttribute('href') === '#' + cur;
            l.classList.toggle('active', active);
            if (active) l.setAttribute('aria-current', 'location');
            else l.removeAttribute('aria-current');
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
              if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              if (open && a.closest('#nav')) return; // The menu handler closes before scrolling.
              e.preventDefault();
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
              /* Evidence remains opaque, even with restored scroll, reduced motion or failed JS. */
              gsap.utils.toArray('.cap-card').forEach(function (card) {
                gsap.fromTo(card.querySelectorAll('.cap-num,.cap-desc'), { y: 16 }, {
                  y: 0, opacity: 1, duration: .55, ease: 'power3.out',
                  clearProps: 'opacity,transform',
                  scrollTrigger: { trigger: card, start: 'top 90%', once: true },
                });
              });

              /* Project controls stay in place; only decorative/non-interactive content moves. */
              gsap.utils.toArray(".panel").forEach(function (panel) {
                var mark = panel.querySelector(".panel-bgmark");
                if (mark) {
                  gsap.fromTo(mark, { yPercent: 18 }, {
                    yPercent: -18, ease: "none",
                    scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: .7 },
                  });
                }
                // Do not animate the phone stage, title links, metrics or action hit areas.
                // The old long opacity sequence delayed readable copy and targeted removed mockups.
                var copy = panel.querySelectorAll(".panel-num,.panel-desc,.panel-tags");
                gsap.fromTo(copy, { y: 10 }, {
                  y: 0, duration: .55, stagger: .04, ease: "power3.out", clearProps: "transform",
                  scrollTrigger: { trigger: panel, start: "top 85%", once: true },
                });
              });

              /* Bento projects anim — cards rendered dynamically, triggered by bento-projects-grid */
              gsap.to(".bento-card", {
                opacity: 1,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: { trigger: "#bento-projects-grid", start: "top 85%" },
              });
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
                ".contact-sub",
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
                ".contact-sub",
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
            card.addEventListener("mousemove", function (e) {
              var r = card.getBoundingClientRect();
              if (motionPreference.matches) return;
              card.style.setProperty("--mouse-x", (e.clientX - r.left) + "px");
              card.style.setProperty("--mouse-y", (e.clientY - r.top) + "px");
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
        var CASE_STUDIES = {};
        document.querySelectorAll('template[data-project-case]').forEach(function (template) {
          CASE_STUDIES[template.dataset.projectCase] = { title: template.dataset.title, number: template.dataset.number, template: template };
        });

        var csModal = document.getElementById("case-study-modal");
        var csScroller = document.getElementById("cs-scroller");
        var csContent = document.getElementById("cs-content");
        var csTopNum = document.getElementById("cs-top-num");
        var csTopName = document.getElementById("cs-top-name");
        var csBtnBack = document.getElementById("cs-btn-back");
        var csBtnClose = document.getElementById("cs-btn-close");

        var lastCaseStudyTrigger = null;
        var caseReturnKey = null, caseReturnUrl = null;
        function caseStudyFocusable() {
          return Array.from(csModal.querySelectorAll('a[href], button:not([disabled]), summary, iframe[title], [tabindex]:not([tabindex="-1"])'))
            .filter(function(el) {
              var closedDetails = el.closest('details:not([open])');
              return (!closedDetails || closedDetails.querySelector('summary') === el)
                && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
            });
        }
        function setCaseBackground(locked) {
          [document.getElementById('main'), nav, ov, document.querySelector('footer')].forEach(function(el) { if(el) el.inert = locked; });
          if (!locked) ov.inert = true;
          document.documentElement.classList.toggle('modal-locked', locked);
          document.dispatchEvent(new Event('project-phone:visibility'));
        }
        function openCaseStudy(id, pushState) {
          var data = CASE_STUDIES[id];
          if (!csModal || !data) return;
          var alreadyOpen = csModal.classList.contains('cs-open');
          if (!alreadyOpen && pushState !== false) {
            caseReturnKey = window.navigation && window.navigation.currentEntry ? window.navigation.currentEntry.key : null;
            caseReturnUrl = location.pathname + location.search + location.hash;
          }
          if (!alreadyOpen && !lastCaseStudyTrigger) lastCaseStudyTrigger = document.activeElement;
          csTopNum.textContent = data.number;
          csTopName.textContent = data.title;
          if (window.ProjectPhones) window.ProjectPhones.destroy(csContent);
          if (window.ButtonMotion) window.ButtonMotion.destroy(csContent);
          csContent.replaceChildren(data.template.content.cloneNode(true));
          csScroller.scrollTop = 0;
          csModal.inert = false;
          csModal.classList.add('cs-open');
          csModal.setAttribute('aria-hidden', 'false');
          if (window.ProjectPhones) window.ProjectPhones.mount(csContent);
          if (window.ButtonMotion) window.ButtonMotion.mount(csContent);
          setCaseBackground(true);
          if (lenis) lenis.stop();
          csBtnClose.focus({ preventScroll: true });
          if (pushState !== false) {
            history[alreadyOpen ? 'replaceState' : 'pushState']({ portfolioModal: true, caseStudy: id }, '', '#case-study-' + id);
          }
          if (hasGSAP && !REDUCE) gsap.fromTo(csContent, { opacity: .7 }, { opacity: 1, duration: .22 });
        }
        function closeCaseStudy(navigate) {
          if (!csModal || !csModal.classList.contains('cs-open')) return;
          if (navigate !== false && history.state && history.state.portfolioModal) {
            if (window.ProjectPhones) window.ProjectPhones.destroy(csContent);
            // Navigate to the saved parent entry, not a child iframe history step.
            // Older browsers close safely in place rather than leaving the portfolio.
            var settleClose = function () {
              closeCaseStudy(false);
              history.replaceState(null, '', caseReturnUrl || location.pathname + location.search + '#work');
            };
            if (caseReturnKey && window.navigation && typeof window.navigation.traverseTo === 'function') {
              try {
                window.navigation.traverseTo(caseReturnKey).finished.catch(settleClose);
              } catch (_) { settleClose(); }
            } else { settleClose(); }
            return;
          }
          if (window.ProjectPhones) window.ProjectPhones.destroy(csContent);
          if (window.ButtonMotion) window.ButtonMotion.destroy(csContent);
          csModal.classList.remove('cs-open');
          csModal.setAttribute('aria-hidden', 'true');
          setCaseBackground(false);
          // Restore after native fragment traversal has completed its own focus reset.
          requestAnimationFrame(function () {
            if (!csModal.classList.contains('cs-open') && lastCaseStudyTrigger && lastCaseStudyTrigger.isConnected) {
              lastCaseStudyTrigger.focus({ preventScroll: true });
            }
          });
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
