
      (function () {
        "use strict";
        var REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
        var FINE = matchMedia("(hover:hover) and (pointer:fine)").matches;
        var html = document.documentElement;
        if (FINE) html.classList.add("fine");
        if (!REDUCE) html.classList.add("fx");

        var hasGSAP = typeof gsap !== "undefined";
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
          var el = document.querySelector(sel);
          if (!el) return;
          if (lenis) lenis.scrollTo(el, { offset: -10, duration: 1.2 });
          else el.scrollIntoView({ behavior: REDUCE ? "auto" : "smooth" });
        };

        /* ============ CURSOR (Premium custom, works everywhere) ============ */
        var bindCursor = function () {};
        if (FINE) {
          var cd = document.getElementById("cur-dot"),
            cr = document.getElementById("cur-ring"),
            cl = document.getElementById("cur-label");
          var cx = innerWidth / 2,
            cy = innerHeight / 2,
            rx = cx,
            ry = cy;
          var curVisible = false;

          document.addEventListener("mouseleave", function () {
            curVisible = false;
            if (cd) cd.style.opacity = "0";
            if (cr) cr.style.opacity = "0";
            if (cl) cl.style.opacity = "0";
          });

          document.addEventListener("mouseenter", function () {
            curVisible = true;
            if (cd) cd.style.opacity = "1";
            if (cr) cr.style.opacity = "1";
          });

          addEventListener(
            "mousemove",
            function (e) {
              cx = e.clientX;
              cy = e.clientY;
              if (!curVisible) {
                curVisible = true;
                if (cd) cd.style.opacity = "1";
                if (cr) cr.style.opacity = "1";
              }
              if (cd) {
                cd.style.transform =
                  "translate3d(" + cx + "px," + cy + "px,0) translate(-50%,-50%)";
              }
              if (cl) {
                cl.style.transform =
                  "translate3d(" + cx + "px," + cy + "px,0) translate(16px,16px)";
              }
            },
            { passive: true },
          );

          (function ringLoop() {
            rx += (cx - rx) * 0.18;
            ry += (cy - ry) * 0.18;
            if (cr) {
              cr.style.transform =
                "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
            }
            requestAnimationFrame(ringLoop);
          })();

          /* Global event delegation: works on ALL sections, existing, new, and dynamically created */
          var activeHoverEl = null;
          var cursorSelector =
            "a, button, [role='button'], .btn, .btn-case, .nav-cta, .nav-theme, .social, .metric-pill, .panel-visual, .cap-card, .cs-close-btn, .cs-back-btn, .cs-btn, .cs-next-card, [data-cursor], .cap-evidence-link";

          document.addEventListener("mouseover", function (e) {
            var target = e.target.closest(cursorSelector);
            if (target) {
              activeHoverEl = target;
              var isMedia =
                target.classList.contains("panel-visual") ||
                target.classList.contains("proj-visual");
              html.classList.add(isMedia ? "cur-media" : "cur-hot");
              var lbl = target.getAttribute("data-cursor");
              if (lbl && cl) {
                cl.textContent = lbl;
                cl.style.opacity = "1";
              }
            }
          });

          document.addEventListener("mouseout", function (e) {
            if (
              activeHoverEl &&
              (!e.relatedTarget || !activeHoverEl.contains(e.relatedTarget))
            ) {
              html.classList.remove("cur-hot", "cur-media");
              if (cl) cl.style.opacity = "0";
              activeHoverEl = null;
            }
          });

          bindCursor = function () {};
        }

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
        if (!REDUCE) {
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
          var max = document.documentElement.scrollHeight - innerHeight;
          if (hasGSAP)
            gsap.to(progress, {
              scaleX: y / max,
              duration: 0.2,
              ease: "none",
              transformOrigin: "left",
            });
          else progress.style.width = (y / max) * 100 + "%";
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
              goTo(a.getAttribute("href"));
            });
          });

        /* mobile menu */
        var burger = document.getElementById("nav-burger"),
          ov = document.getElementById("nav-overlay"),
          open = false,
          menuReturnFocus = null;

        function menuFocusable() {
          return Array.from(
            ov.querySelectorAll(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter(function (el) {
            return el.offsetParent !== null;
          });
        }

        function setBurger() {
          var lines = burger.querySelectorAll("span");
          if (open) {
            lines[0].style.transform = "rotate(45deg) translate(4px,5px)";
            lines[1].style.opacity = "0";
            lines[2].style.transform = "rotate(-45deg) translate(4px,-5px)";
          } else {
            lines.forEach(function (x) {
              x.style.transform = "";
              x.style.opacity = "";
            });
          }
        }

        function setMenuState(nextOpen, restoreFocus) {
          open = Boolean(nextOpen);
          ov.classList.toggle("open", open);
          nav.classList.toggle("menu-open", open);
          ov.setAttribute("aria-hidden", open ? "false" : "true");
          burger.setAttribute("aria-expanded", open ? "true" : "false");
          burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
          setBurger();

          var mainEl = document.getElementById("main");
          var footerEl = document.querySelector("footer");
          [mainEl, footerEl].forEach(function (el) {
            if (!el) return;
            if (open) el.setAttribute("inert", "");
            else el.removeAttribute("inert");
          });

          if (lenis) open ? lenis.stop() : lenis.start();

          if (open) {
            menuReturnFocus = document.activeElement;
            requestAnimationFrame(function () {
              var items = menuFocusable();
              if (items[0]) items[0].focus();
            });
          } else if (restoreFocus !== false) {
            var target =
              menuReturnFocus && typeof menuReturnFocus.focus === "function"
                ? menuReturnFocus
                : burger;
            requestAnimationFrame(function () {
              target.focus();
            });
          }
        }

        burger.addEventListener("click", function () {
          setMenuState(!open);
        });

        ov.querySelectorAll("[data-close]").forEach(function (a) {
          a.addEventListener("click", function (e) {
            e.preventDefault();
            var href = a.getAttribute("href");
            setMenuState(false, false);
            burger.focus();
            goTo(href);
          });
        });

        document.addEventListener("keydown", function (e) {
          if (!open) return;
          if (e.key === "Escape") {
            e.preventDefault();
            setMenuState(false);
            return;
          }
          if (e.key !== "Tab") return;
          var items = menuFocusable();
          if (!items.length) {
            e.preventDefault();
            burger.focus();
            return;
          }
          var first = items[0],
            last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        });

        /* ============ THEME TOGGLE ============ */
        (function () {
          var tt = document.getElementById("theme-toggle");
          if (!tt) return;
          function sync() {
            var light = html.classList.contains("light");
            tt.setAttribute("aria-pressed", light);
            tt.setAttribute(
              "aria-label",
              light ? "Cambiar a modo oscuro" : "Cambiar a modo claro",
            );
            var fav = document.getElementById("favicon");
            if (fav) {
              fav.href = light ? "assets/favicon-light-32.png" : "assets/favicon-dark-32.png";
            }
          }
          sync();
          tt.addEventListener("click", function () {
            html.classList.add("theming");
            var light = html.classList.toggle("light");
            try {
              localStorage.setItem("ps-theme", light ? "light" : "dark");
            } catch (e) {}
            sync();
            setTimeout(function () {
              html.classList.remove("theming");
            }, 560);
          });
        })();

        /* ============ LOADER + HERO REVEAL ============ */
        function revealHero() {
          if (!hasGSAP) {
            document.querySelectorAll(".anim").forEach(function (e) {
              e.style.opacity = "1";
            });
            return;
          }
          var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          // SplitText name reveal
          if (typeof SplitText !== "undefined") {
            var sp = new SplitText(".hero-line > span", {
              type: "chars",
              charsClass: "char",
            });
            gsap.set(sp.chars, {
              yPercent: 120,
              opacity: 0,
              filter: "blur(12px)",
            });
            tl.to(
              sp.chars,
              {
                yPercent: 0,
                opacity: 1,
                filter: "blur(0px)",
                duration: 1,
                stagger: 0.035,
              },
              0,
            );
          } else {
            tl.from(
              ".hero-line > span",
              { yPercent: 120, opacity: 0, duration: 1, stagger: 0.1 },
              0,
            );
          }
          tl.to(".hero-sub", { opacity: 1, y: 0, duration: 0.8 }, 0.5)
            .to(".hero-actions", { opacity: 1, y: 0, duration: 0.8 }, 0.65)
            .to(
              ".hero-top .mono,.hero-eyebrow",
              { opacity: 1, y: 0, duration: 0.7, stagger: 0.05 },
              0.4,
            );
          gsap.set(".hero-sub,.hero-actions", { y: 18 });
          gsap.set(".hero-top .mono,.hero-eyebrow", { y: -8 });
        }

        /* ========================================================
           SECONDARY PROJECTS (Bento Box - Configurable in one place)
           ======================================================== */
        window.SECONDARY_PROJECTS = [
          {
            id: "kicord-doom-plugin",
            index: "04",
            name: "KiCord-DOOM-Plugin",
            badgeType: "Plugin Open Source",
            status: { label: "Activo", type: "active" },
            colSpan: 2,
            category: "plugin",
            description:
              "Adaptación y plugin funcional en TypeScript que lleva el clásico DOOM al entorno de KiCord, demostrando la extensibilidad modular de su motor de plugins y una integración de bajo nivel en el cliente.",
            language: { name: "TypeScript", color: "#3178c6" },
            technologies: [
              "TypeScript",
              "DOOM Wasm",
              "Discord Client",
              "Plugin Architecture",
            ],
            githubUrl: "https://github.com/PapiGECode/KiCord-DOOM-Plugin",
            webUrl: null,
            stars: 1,
            updatedAt: "Ago 2026",
          },
          {
            id: "duolingo-streak-keeper",
            index: "05",
            name: "duolingo-streak-keeper",
            badgeType: "Automatización",
            status: { label: "Mantenido", type: "maintained" },
            colSpan: 1,
            category: "automation",
            description:
              "Script de automatización en TypeScript para la monitorización e interacción periódica programada, resolviendo la retención de rachas de forma desatendida y fiable.",
            language: { name: "TypeScript", color: "#3178c6" },
            technologies: [
              "TypeScript",
              "Node.js",
              "Cron Tasks",
              "API Client",
            ],
            githubUrl: "https://github.com/PapiGECode/duolingo-streak-keeper",
            webUrl: null,
            stars: 1,
            updatedAt: "Sep 2026",
          },
          {
            id: "fnlb-comunidades",
            index: "06",
            name: "FNLB & Comunidades Tech",
            badgeType: "Gestión & Operaciones",
            status: { label: "Activo", type: "active" },
            colSpan: 1,
            category: "community",
            description:
              "Moderación y colaboración de producto en FNLB, junto a participación activa y soporte técnico en comunidades de Nate Gentile, Edgar Pons y ThiagoIUTU a gran escala.",
            language: { name: "Community Ops", color: "#10b981" },
            technologies: [
              "Moderación",
              "Gestión de Producto",
              "Discord Ops",
              "Resolución Técnica",
            ],
            githubUrl: "https://github.com/PapiGECode",
            webUrl: null,
            stars: null,
            updatedAt: "Actualidad",
          },
          {
            id: "thiagoiutu-portfolio",
            index: "07",
            name: "thiagoiutu-portfolio",
            badgeType: "Colaboración Web",
            status: { label: "Completado", type: "completed" },
            colSpan: 1,
            category: "web",
            description:
              "Colaboración técnica y desarrollo frontend para el portfolio del creador ThiagoIUTU, enfocado en rendimiento web, maquetación responsive limpia y arquitectura visual atractiva.",
            language: { name: "HTML / JS", color: "#e34c26" },
            technologies: [
              "HTML5",
              "CSS Grid",
              "JavaScript",
              "Responsive UI",
            ],
            githubUrl: "https://github.com/PapiGECode/thiagoiutu-portfolio",
            webUrl: null,
            stars: 1,
            updatedAt: "Sep 2026",
          },
          {
            id: "github-achievements-lab",
            index: "08",
            name: "github-achievements-lab",
            badgeType: "Research & CI/CD",
            status: { label: "Laboratorio", type: "lab" },
            colSpan: 1,
            category: "lab",
            description:
              "Entorno de pruebas y laboratorio técnico para validar flujos colaborativos en GitHub: pull requests, resolución de issues, trazabilidad técnica y automatizaciones CI/CD.",
            language: { name: "Git / CI", color: "#8957e5" },
            technologies: [
              "Git Workflows",
              "CI/CD",
              "PRs & Issues",
              "Code Review",
            ],
            githubUrl: "https://github.com/PapiGECode/github-achievements-lab",
            webUrl: null,
            stars: 0,
            updatedAt: "Sep 2026",
          },
          {
            id: "project-vi-technical-archive",
            index: "09",
            name: "project-vi-technical-archive",
            badgeType: "Investigación C++",
            status: { label: "Archivo", type: "archive" },
            colSpan: 2,
            category: "systems",
            description:
              "Archivo y análisis técnico en C++ estructurado para la exploración de pipelines, ingeniería de sistemas y compilación orientada a rendimiento en arquitecturas de software complejas.",
            language: { name: "C++", color: "#f34b7d" },
            technologies: [
              "C++",
              "Sistemas",
              "Low-level Analysis",
              "Engine Tech",
            ],
            githubUrl:
              "https://github.com/PapiGECode/project-vi-technical-archive",
            webUrl: "https://www.rockstargames.com/VI",
            stars: 1,
            updatedAt: "Ago 2026",
          },
          {
            id: "github-ecosystem",
            index: "+",
            name: "Ecosistema GitHub",
            badgeType: "Código Abierto",
            status: { label: "Público", type: "active" },
            colSpan: 1,
            category: "hub",
            description:
              "Explora el perfil completo de GitHub con todos los repositorios públicos, forks, contribuciones y actividad técnica de código abierto continua.",
            language: { name: "GitHub Hub", color: "#38bdf8" },
            technologies: [
              "Open Source",
              "Git",
              "Commits",
              "Developer Program",
            ],
            githubUrl: "https://github.com/PapiGECode?tab=repositories",
            webUrl: null,
            stars: "9 repos",
            updatedAt: "Continuo",
          },
        ];

        function renderSecondaryProjects() {
          var container = document.getElementById("bento-projects-grid");
          if (
            !container ||
            !window.SECONDARY_PROJECTS ||
            !window.SECONDARY_PROJECTS.length
          )
            return;

          var categoryIcons = {
            plugin:
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4m-2-2v4m10-2h.01m-3-1h.01"></path></svg>',
            automation:
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
            community:
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            web:
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
            lab:
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path></svg>',
            systems:
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>',
            hub:
              '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
          };

          var githubIconSvg =
            '<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>';
          var externalLinkSvg =
            '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
          var starIconSvg =
            '<svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z"></path></svg>';

          var cardsHtml = window.SECONDARY_PROJECTS.map(function (item) {
            var colClass = item.colSpan === 2 ? "bento-col-2" : "bento-col-1";
            var icon = categoryIcons[item.category] || categoryIcons.plugin;
            var statusClass =
              "status-" +
              (item.status && item.status.type ? item.status.type : "active");
            var statusLabel =
              item.status && item.status.label ? item.status.label : "Activo";

            var tagsHtml = (item.technologies || [])
              .map(function (t) {
                return '<span class="bento-tag">' + t + "</span>";
              })
              .join("");

            var starsHtml = "";
            if (item.stars !== null && item.stars !== undefined) {
              starsHtml =
                '<div class="bento-stars" title="Stars en GitHub" aria-label="' +
                item.stars +
                '">' +
                starIconSvg +
                "<span>" +
                item.stars +
                "</span>" +
                "</div>";
            }

            var webBtnHtml = "";
            if (item.webUrl) {
              webBtnHtml =
                '<a href="' +
                item.webUrl +
                '" target="_blank" rel="noopener" class="bento-btn-link secondary" aria-label="Visitar web oficial de ' +
                item.name +
                '" data-cursor="VISIT">' +
                externalLinkSvg +
                "<span>Web</span>" +
                "</a>";
            }

            var ghBtnHtml = "";
            if (item.githubUrl) {
              var ghText = item.category === "hub" ? "Explorar" : "Código";
              ghBtnHtml =
                '<a href="' +
                item.githubUrl +
                '" target="_blank" rel="noopener" class="bento-btn-link" aria-label="Ver ' +
                item.name +
                ' en GitHub" data-cursor="GITHUB">' +
                githubIconSvg +
                "<span>" +
                ghText +
                "</span>" +
                "</a>";
            }

            return (
              '<article class="bento-card ' +
              colClass +
              '" data-cursor="PROJECT">' +
              '<div class="bento-border-glow" aria-hidden="true"></div>' +
              '<div class="bento-card-inner">' +
              '<div class="bento-top">' +
              '<div class="bento-meta-left">' +
              '<span class="bento-num">' +
              item.index +
              "</span>" +
              '<span class="bento-type-badge">' +
              item.badgeType +
              "</span>" +
              "</div>" +
              '<div class="bento-status-badge ' +
              statusClass +
              '">' +
              '<span class="bento-status-dot" aria-hidden="true"></span>' +
              "<span>" +
              statusLabel +
              "</span>" +
              "</div>" +
              "</div>" +
              '<div class="bento-heading-row">' +
              '<div class="bento-icon-box" aria-hidden="true">' +
              icon +
              "</div>" +
              '<div class="bento-title-group">' +
              '<h4 class="bento-card-title">' +
              item.name +
              "</h4>" +
              '<span class="bento-updated">Actualizado: ' +
              item.updatedAt +
              "</span>" +
              "</div>" +
              "</div>" +
              '<p class="bento-desc">' +
              item.description +
              "</p>" +
              '<div class="bento-footer">' +
              '<div class="bento-specs-row">' +
              '<div class="bento-lang">' +
              '<span class="bento-lang-dot" style="background-color: ' +
              item.language.color +
              ';" aria-hidden="true"></span>' +
              "<span>" +
              item.language.name +
              "</span>" +
              "</div>" +
              starsHtml +
              "</div>" +
              '<div class="bento-tags">' +
              tagsHtml +
              "</div>" +
              '<div class="bento-actions">' +
              webBtnHtml +
              ghBtnHtml +
              "</div>" +
              "</div>" +
              "</div>" +
              "</article>"
            );
          }).join("");

          container.innerHTML = cardsHtml;

          // Wire mouse tracking on newly rendered cards
          container.querySelectorAll(".bento-card").forEach(function (card) {
            card.addEventListener("mousemove", function (e) {
              var r = card.getBoundingClientRect();
              card.style.setProperty("--mouse-x", e.clientX - r.left + "px");
              card.style.setProperty("--mouse-y", e.clientY - r.top + "px");
            });
          });
        }

        function startReveals() {
          renderSecondaryProjects();
          revealHero();
          buildScroll();
        }

        var loader = document.getElementById("loader");
        function killLoader(instant) {
          if (loader.dataset.done) return;
          loader.dataset.done = "1";
          if (!hasGSAP || instant) {
            loader.style.display = "none";
            startReveals();
            return;
          }
          gsap
            .timeline({
              onComplete: function () {
                loader.style.display = "none";
              },
            })
            .to(
              "#loader .l-mark,#loader .l-bar,#loader .l-num,#loader .l-skip",
              {
                opacity: 0,
                y: -10,
                duration: 0.4,
                ease: "power2.in",
                stagger: 0.03,
              },
            )
            .to(
              loader,
              {
                yPercent: -100,
                duration: 0.9,
                ease: "power4.inOut",
                onStart: startReveals,
              },
              "-=.05",
            );
        }

        if (REDUCE || !hasGSAP) {
          killLoader(true);
        } else {
          gsap.set("#loader .l-inner", { y: 0 });
          var lt = gsap.timeline();
          lt.fromTo(
            "#loader .l-mark",
            { opacity: 0, y: 14, filter: "blur(8px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.7,
              ease: "power3.out",
            },
          ).to(
            "#loader .l-glow",
            { opacity: 1, duration: 1.2, ease: "power2.out" },
            "-=.3",
          );
          var prog = { v: 0 };
          lt.to(
            prog,
            {
              v: 100,
              duration: 1.5,
              ease: "power1.inOut",
              onUpdate: function () {
                var n = Math.round(prog.v);
                document.querySelector("#loader .l-num").textContent = String(
                  n,
                ).padStart(3, "0");
                document.querySelector("#loader .l-bar i").style.width =
                  n + "%";
              },
            },
            "-=.9",
          );
          lt.add(function () {
            killLoader(false);
          });
          loader.addEventListener("click", function () {
            lt.kill();
            killLoader(false);
          });
        }

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

        /* ============ CONTACT FORM ============ */
        var contactForm = document.getElementById("contact-form");
        if (contactForm) {
          contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            if (!this.checkValidity()) {
              this.reportValidity();
              return;
            }

            var btn = this.querySelector(".f-submit");
            var label = btn.querySelector(".fs-t");
            var status = document.getElementById("form-ok");
            var originalLabel = label.innerHTML;
            var payload = {
              name: document.getElementById("name").value.trim(),
              email: document.getElementById("email").value.trim(),
              message: document.getElementById("message").value.trim(),
              website: document.getElementById("website")
                ? document.getElementById("website").value.trim()
                : "",
            };

            btn.disabled = true;
            btn.style.opacity = ".65";
            label.textContent = "Preparando…";
            if (status) {
              status.classList.remove("show");
              status.removeAttribute("data-error");
            }

            try {
              var res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              var data = await res.json().catch(function () {
                return {};
              });
              if (!res.ok || !data.ok) {
                throw new Error(data.error || "No se pudo preparar el mensaje.");
              }

              if (status) {
                var title = status.querySelector(".ok-t");
                var sub = status.querySelector(".ok-s");
                if (data.mode === "sent") {
                  if (title) title.textContent = "Mensaje enviado ✦";
                  if (sub) sub.textContent = "Gracias. Te responderé cuando pueda.";
                  contactForm.reset();
                } else {
                  if (title) title.textContent = "Mensaje preparado ✦";
                  if (sub)
                    sub.textContent =
                      "Revisa y envía el borrador desde tu aplicación de correo.";
                }
                status.classList.add("show");
              }

              if (data.mailto) {
                window.location.href = data.mailto;
              }
            } catch (err) {
              if (status) {
                var titleErr = status.querySelector(".ok-t");
                var subErr = status.querySelector(".ok-s");
                if (titleErr) titleErr.textContent = "No se pudo preparar";
                if (subErr)
                  subErr.textContent =
                    "Puedes escribirme directamente a pablopme50@gmail.com.";
                status.setAttribute("data-error", "true");
                status.classList.add("show");
              }
              console.error("Contact form:", err);
            } finally {
              btn.disabled = false;
              btn.style.opacity = "";
              label.innerHTML = originalLabel;
            }
          });
        }

        var SHOTS = {
          careergpt: [
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973143/1_rw2yje.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973144/3_legmnj.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973143/2_dallfn.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973143/6_gyvp6d.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973143/4_oxq7vl.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973146/9_xs1icw.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973143/5_xksmwm.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973146/9_xs1icw.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1782973147/10_ebvyma.png",
          ],
          simul: [
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1783853542/chrome_ZM1e5oNyMR_czlrgt.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1783853541/chrome_AwHGP1909S_gjefco.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1783853541/chrome_j32CX6cZca_kououo.png",
          ],
          f1vision: [
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1785107389/f1_vision_wmMGzfeXkz_vb599s.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1785107389/f1_vision_cHAJMejlkO_bvyvtx.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1785107388/f1_vision_aLX2csGVee_lnyhyg.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1785107388/f1_vision_MlM7ESAeEL_lcyl6a.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1785107388/f1_vision_Jh4OB93a9G_s1zz2t.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1785107388/f1_vision_iSo93niUZj_ae5pam.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1785107388/f1_vision_vVwb4jiAJi_tix9lx.png",
            "https://res.cloudinary.com/dfd2kp7s5/image/upload/v1785107388/f1_vision_veFebSDnfZ_w6baib.png",
          ],
        };
        document.querySelectorAll(".phone[data-shots]").forEach(function (ph) {
          var key = ph.getAttribute("data-shots");
          var urls = (SHOTS[key] || []).filter(function (u) {
            return u && typeof u === "string" && u.indexOf("PASTE") === -1;
          });
          var screen = ph.querySelector(".ph-screen");
          var dotsWrap = document.querySelector(
            '.ph-dots[data-dots="' + key + '"]',
          );
          if (!urls.length) {
            screen.classList.add("ph-empty");
            if (dotsWrap) dotsWrap.style.display = "none";
            return;
          }
          var idx = 0,
            hover = false,
            imgs = [],
            dots = [];
          urls.forEach(function (u, i) {
            var img = document.createElement("img");
            img.src = u;
            img.alt = "";
            img.loading = i ? "lazy" : "eager";
            img.decoding = "async";
            img.draggable = false;
            img.className = "ph-shot" + (i ? "" : " on");
            screen.appendChild(img);
            imgs.push(img);
            if (dotsWrap) {
              var d = document.createElement("button");
              d.type = "button";
              d.className = "pdot" + (i ? "" : " on");
              d.setAttribute(
                "aria-label",
                "Screenshot " + (i + 1) + " of " + urls.length,
              );
              d.addEventListener("click", function () {
                show(i);
              });
              dotsWrap.appendChild(d);
              dots.push(d);
            }
          });
          function show(n) {
            if (n === idx && imgs[idx].classList.contains("on")) return;
            imgs[idx].classList.remove("on");
            if (dots[idx]) dots[idx].classList.remove("on");
            idx = (n + imgs.length) % imgs.length;
            var im = imgs[idx];
            im.classList.remove("on");
            void im.offsetWidth;
            im.classList.add("on");
            if (dots[idx]) dots[idx].classList.add("on");
          }
          if (!REDUCE)
            setInterval(function () {
              if (!hover) show(idx + 1);
            }, 3000);
          var hoverEl = ph.closest(".panel-visual") || ph;
          hoverEl.addEventListener("mouseenter", function () {
            hover = true;
            screen.classList.add("paused");
          });
          hoverEl.addEventListener("mouseleave", function () {
            hover = false;
            screen.classList.remove("paused");
          });
        });

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
            heroVisual: "assets/phone-kicord.webp",
            heroAlt: "KiCord en iPhone",
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
                src: "assets/phone-kicord.webp",
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
            heroVisual: "assets/phone-papige.webp",
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
                src: "assets/phone-papige.webp",
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
            heroVisual: "assets/phone-kernelos.webp",
            heroAlt: "KernelOS en iPhone",
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
                src: "assets/phone-kernelos.webp",
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
                '" target="_blank" rel="noopener" class="' +
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

          var galleryHtml = data.gallery
            .map(function (g) {
              if (g.type === "image") {
                return (
                  '<div class="cs-gallery-item">' +
                  '<div class="cs-gallery-media">' +
                  '<img src="' +
                  g.src +
                  '" alt="' +
                  (g.caption || "") +
                  '" draggable="false" />' +
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
            '" draggable="false" />' +
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
            '<div class="cs-sec">' +
            '<div class="cs-sec-label">Demostración</div>' +
            '<h2 class="cs-sec-title">Vídeo &amp; Demo Interactiva</h2>' +
            '<div class="cs-video-box">' +
            '<div class="icon" aria-hidden="true">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
            "</div>" +
            '<div class="title">' +
            data.video.title +
            "</div>" +
            '<div class="desc">' +
            data.video.note +
            "</div>" +
            "</div>" +
            "</div>" +
            '<div class="cs-next-card" data-next-case="' +
            data.nextId +
            '" data-cursor="CASE STUDY">' +
            "<div>" +
            '<div class="cs-next-sub">Siguiente caso de estudio</div>' +
            '<div class="cs-next-title">' +
            data.nextTitle +
            "</div>" +
            "</div>" +
            '<div class="cs-next-arr" aria-hidden="true">→</div>' +
            "</div>"
          );
        }

        var lastCaseStudyTrigger = null;

        function caseStudyFocusable() {
          if (!csModal) return [];
          return Array.from(
            csModal.querySelectorAll(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter(function (el) {
            return el.offsetParent !== null;
          });
        }

        function openCaseStudy(id, pushState) {
          if (!csModal) return;
          var data = CASE_STUDIES[id];
          if (!data) return;

          csTopNum.textContent = data.number;
          csTopName.textContent = data.title;
          csContent.innerHTML = renderCaseStudy(data);
          csScroller.scrollTop = 0;

          csModal.classList.add("cs-open");
          csModal.setAttribute("aria-hidden", "false");
          document.body.style.overflow = "hidden";

          if (lenis) lenis.stop();
          requestAnimationFrame(function () {
            if (csBtnClose) csBtnClose.focus();
          });

          if (pushState !== false) {
            try {
              history.pushState({ caseStudy: id }, "", "#case-study-" + id);
            } catch (e) {}
          }

          if (typeof bindCursor === "function") {
            bindCursor(csContent);
          }

          if (hasGSAP && !REDUCE) {
            gsap.fromTo(
              csContent,
              { opacity: 0, y: 22 },
              { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
            );
          }
        }

        function closeCaseStudy(popState) {
          if (!csModal || !csModal.classList.contains("cs-open")) return;
          csModal.classList.remove("cs-open");
          csModal.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";

          if (lenis) lenis.start();
          if (
            lastCaseStudyTrigger &&
            document.contains(lastCaseStudyTrigger) &&
            typeof lastCaseStudyTrigger.focus === "function"
          ) {
            requestAnimationFrame(function () {
              lastCaseStudyTrigger.focus();
            });
          }

          if (popState !== false && location.hash.indexOf("#case-study") === 0) {
            try {
              history.pushState(null, "", location.pathname + location.search);
            } catch (e) {}
          }
        }

        document.addEventListener("click", function (e) {
          var openTrigger = e.target.closest("[data-open-case]");
          if (openTrigger) {
            e.preventDefault();
            lastCaseStudyTrigger = openTrigger;
            var id = openTrigger.getAttribute("data-open-case");
            openCaseStudy(id);
            return;
          }
          var nextTrigger = e.target.closest("[data-next-case]");
          if (nextTrigger) {
            e.preventDefault();
            var nextId = nextTrigger.getAttribute("data-next-case");
            openCaseStudy(nextId);
            return;
          }
        });

        if (csBtnBack) {
          csBtnBack.addEventListener("click", function () {
            closeCaseStudy();
          });
        }
        if (csBtnClose) {
          csBtnClose.addEventListener("click", function () {
            closeCaseStudy();
          });
        }

        addEventListener("keydown", function (e) {
          if (!csModal || !csModal.classList.contains("cs-open")) return;
          if (e.key === "Escape") {
            e.preventDefault();
            closeCaseStudy();
            return;
          }
          if (e.key !== "Tab") return;
          var items = caseStudyFocusable();
          if (!items.length) return;
          var first = items[0],
            last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        });

        window.addEventListener("popstate", function () {
          var match = location.hash.match(/^#case-study-([a-z0-9_-]+)/i);
          if (match && CASE_STUDIES[match[1]]) {
            openCaseStudy(match[1], false);
          } else if (csModal && csModal.classList.contains("cs-open")) {
            closeCaseStudy(false);
          }
        });

        // Check hash on initial load
        (function checkInitialHash() {
          var match = location.hash.match(/^#case-study-([a-z0-9_-]+)/i);
          if (match && CASE_STUDIES[match[1]]) {
            setTimeout(function () {
              openCaseStudy(match[1], false);
            }, 500);
          }
        })();

        /* ========================================================
           NOW STATUS PANEL (Configurable in one single place)
           ======================================================== */
        window.NOW_CONFIG = {
          project: {
            title: "KiCord & PapiGEGamer",
            url: "https://kicord.es",
            linkText: "Explorar KiCord",
            desc: "Iterando arquitectura modular en TypeScript, sistema de plugins dinámicos y telemetría reactiva en tiempo real.",
          },
          status: {
            text: "Disponible para colaborar",
            updated: "Actividad sincronizada automáticamente",
          },
          github: {
            username: "PapiGECode",
            fetchLive: true,
            fallback: {
              repo: "PapiGECode/Web-CV",
              msg: "feat: visual premium timeline & live status integration",
              time: "Reciente",
            },
          },
          focusTags: [
            "TypeScript",
            "React / Next.js",
            "Kernel & Sistemas",
            "Open Source",
          ],
        };

        function initNowPanel() {
          var cfg = window.NOW_CONFIG;
          if (!cfg) return;

          // Render static config immediately
          var pTitle = document.getElementById("now-project-title");
          var pDesc = document.getElementById("now-project-desc");
          var pLink = document.getElementById("now-project-link");
          var sText = document.getElementById("now-status-text");
          var uText = document.getElementById("now-updated-text");
          var tagsContainer = document.getElementById("now-focus-tags");

          if (pTitle && cfg.project) pTitle.textContent = cfg.project.title;
          if (pDesc && cfg.project) pDesc.textContent = cfg.project.desc;
          if (pLink && cfg.project) {
            pLink.href = cfg.project.url;
            var linkSpan = pLink.querySelector("span");
            if (linkSpan) linkSpan.textContent = cfg.project.linkText;
          }
          if (sText && cfg.status) sText.textContent = cfg.status.text;
          if (uText && cfg.status) uText.textContent = cfg.status.updated;

          if (tagsContainer && cfg.focusTags && cfg.focusTags.length) {
            tagsContainer.innerHTML = cfg.focusTags
              .map(function (t) {
                return '<span class="now-tag">' + t + "</span>";
              })
              .join("");
          }

          // Render GitHub fallback initially
          var ghRepo = document.getElementById("now-github-repo");
          var ghTime = document.getElementById("now-github-time");
          var ghMsg = document.getElementById("now-github-msg");
          var ghLink = document.getElementById("now-github-link");

          if (ghRepo && cfg.github && cfg.github.fallback)
            ghRepo.textContent = cfg.github.fallback.repo;
          if (ghTime && cfg.github && cfg.github.fallback)
            ghTime.textContent = cfg.github.fallback.time;
          if (ghMsg && cfg.github && cfg.github.fallback)
            ghMsg.textContent = cfg.github.fallback.msg;

          // Live GitHub activity through a cached same-origin endpoint.
          if (cfg.github && cfg.github.fetchLive && cfg.github.username) {
            var endpoint =
              "/api/github-activity?username=" +
              encodeURIComponent(cfg.github.username);

            fetch(endpoint, { cache: "no-store" })
              .then(function (res) {
                if (!res.ok) throw new Error("GitHub activity status " + res.status);
                return res.json();
              })
              .then(function (data) {
                if (!data || !data.ok) return;
                if (ghRepo && data.repo) ghRepo.textContent = data.repo;
                if (ghTime && data.time) ghTime.textContent = data.time;
                if (ghMsg && data.message) ghMsg.textContent = data.message;
                if (ghLink && data.url) {
                  ghLink.href = data.url;
                  var ghSpan = ghLink.querySelector("span");
                  if (ghSpan) ghSpan.textContent = data.url.replace(/^https?:\/\//, "");
                }
              })
              .catch(function (err) {
                console.info("GitHub activity fallback:", err.message);
              });
          }
        }
        initNowPanel();

        // refresh ST after fonts load (layout shift guard)
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () {
            if (hasGSAP) ScrollTrigger.refresh();
          });
        }
      })();
    