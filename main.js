(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Preloader: só uma vez por sessão, nunca bloqueia
  --------------------------------------------------------- */
  const preloader = document.querySelector(".preloader");
  if (preloader) {
    const seen = sessionStorage.getItem("aussie-intro-seen");
    if (seen || prefersReducedMotion) {
      preloader.remove();
    } else {
      sessionStorage.setItem("aussie-intro-seen", "1");
      const hide = () => preloader.classList.add("is-hidden");
      window.setTimeout(hide, 1100);
      preloader.addEventListener("transitionend", () => preloader.remove(), { once: true });
      // não bloquear se o usuário interagir antes
      preloader.addEventListener("click", hide);
    }
  }

  /* ---------------------------------------------------------
     Hero: 3 cenas (Learn / Grow / Belong), autoplay 7s
  --------------------------------------------------------- */
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const scenes = [
      {
        eyebrow: "Aussie Education • Learn",
        title: 'O futuro começa <em>na infância.</em>',
        lead: "Uma educação bilíngue que une excelência acadêmica, acolhimento e experiências significativas para que cada criança aprenda, cresça e pertença.",
        eyebrowEn: "Aussie Education • Learn",
        titleEn: 'The future begins <em>in childhood.</em>',
        leadEn: "A bilingual education that combines academic excellence, warmth, and meaningful experiences, so every child can learn, grow, and belong.",
      },
      {
        eyebrow: "Aussie Education • Grow",
        title: "Educação bilíngue para uma infância <em>extraordinária.</em>",
        lead: "Currículo australiano, imersão genuína em inglês e desenvolvimento integral para que cada criança cresça no seu próprio ritmo.",
        eyebrowEn: "Aussie Education • Grow",
        titleEn: "Bilingual education for an <em>extraordinary childhood.</em>",
        leadEn: "Australian curriculum, genuine English immersion, and whole-child development, so every child grows at their own pace.",
      },
      {
        eyebrow: "Aussie Education • Belong",
        title: "Aprender. Crescer. <em>Pertencer.</em>",
        lead: "Uma comunidade acolhedora onde cada criança se sente vista, segura e parte de algo maior, dentro e fora da sala de aula.",
        eyebrowEn: "Aussie Education • Belong",
        titleEn: "Learn. Grow. <em>Belong.</em>",
        leadEn: "A welcoming community where every child feels seen, safe, and part of something bigger, inside and outside the classroom.",
      },
    ];
    const titleEl = hero.querySelector("[data-hero-title]");
    const leadEl = hero.querySelector("[data-hero-lead]");
    const eyebrowEl = hero.querySelector("[data-hero-eyebrow]");
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const photos = Array.from(hero.querySelectorAll("[data-hero-photo]"));
    const doodles = Array.from(hero.querySelectorAll("[data-scene-doodle]"));
    const progressFill = hero.querySelector("[data-hero-progress]");
    const pauseBtn = hero.querySelector("[data-hero-pause]");
    const iconPause = pauseBtn?.querySelector("[data-icon-pause]");
    const iconPlay = pauseBtn?.querySelector("[data-icon-play]");
    const INTERVAL = 7000;
    let current = 0;
    let timer = null;
    let playing = !prefersReducedMotion;

    const isEn = () => document.documentElement.lang === "en";
    const applyScene = (index) => {
      current = index;
      hero.classList.add("is-switching");
      window.setTimeout(() => {
        const s = scenes[index];
        if (titleEl) titleEl.innerHTML = isEn() ? s.titleEn : s.title;
        if (leadEl) leadEl.textContent = isEn() ? s.leadEn : s.lead;
        if (eyebrowEl) eyebrowEl.textContent = isEn() ? s.eyebrowEn : s.eyebrow;
        hero.classList.remove("is-switching");
      }, prefersReducedMotion ? 0 : 260);

      photos.forEach((p) => p.classList.toggle("is-active", Number(p.dataset.scene) === index));
      doodles.forEach((d) => d.classList.toggle("is-active", Number(d.dataset.sceneDoodle) === index));
      dots.forEach((d) => d.setAttribute("aria-current", String(Number(d.dataset.heroDot) === index)));
    };

    const restartProgress = () => {
      if (!progressFill) return;
      progressFill.classList.remove("is-animating");
      // eslint-disable-next-line no-unused-expressions
      progressFill.offsetWidth; // force reflow to restart CSS transition
      if (playing) progressFill.classList.add("is-animating");
    };

    const goTo = (index, restart = true) => {
      applyScene((index + scenes.length) % scenes.length);
      restartProgress();
      if (restart) resetTimer();
    };

    function resetTimer() {
      if (timer) window.clearInterval(timer);
      if (!playing) return;
      timer = window.setInterval(() => goTo(current + 1, false), INTERVAL);
    }

    hero.querySelectorAll("[data-hero-prev]").forEach((b) => b.addEventListener("click", () => goTo(current - 1)));
    hero.querySelectorAll("[data-hero-next]").forEach((b) => b.addEventListener("click", () => goTo(current + 1)));
    dots.forEach((d) => d.addEventListener("click", () => goTo(Number(d.dataset.heroDot))));
    pauseBtn?.addEventListener("click", () => {
      playing = !playing;
      pauseBtn.setAttribute("aria-pressed", String(!playing));
      iconPause?.toggleAttribute("hidden", !playing);
      iconPlay?.toggleAttribute("hidden", playing);
      if (playing) { restartProgress(); resetTimer(); }
      else { if (timer) window.clearInterval(timer); progressFill?.classList.remove("is-animating"); }
    });

    applyScene(0);
    if (playing) { restartProgress(); resetTimer(); }

    window.__aussieRerenderHero = () => {
      if (titleEl) titleEl.innerHTML = isEn() ? scenes[current].titleEn : scenes[current].title;
      if (leadEl) leadEl.textContent = isEn() ? scenes[current].leadEn : scenes[current].lead;
      if (eyebrowEl) eyebrowEl.textContent = isEn() ? scenes[current].eyebrowEn : scenes[current].eyebrow;
    };
  }

  /* ---------------------------------------------------------
     Header: compacta após primeiro scroll
  --------------------------------------------------------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-compact", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------
     Menu mobile
  --------------------------------------------------------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuClose = document.querySelector(".mobile-menu__close");
  const openMenu = () => {
    mobileMenu?.classList.add("is-open");
    menuToggle?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    mobileMenu?.querySelector("a")?.focus();
  };
  const closeMenu = () => {
    mobileMenu?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    menuToggle?.focus();
  };
  menuToggle?.addEventListener("click", openMenu);
  menuClose?.addEventListener("click", closeMenu);
  mobileMenu?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  mobileMenu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal], [data-reveal-group]");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------------------------------------------------------
     Rota SVG: desenha ao entrar na viewport
  --------------------------------------------------------- */
  document.querySelectorAll(".route-svg").forEach((svg) => {
    if (prefersReducedMotion) { svg.classList.add("is-drawn"); return; }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-drawn");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(svg);
  });

  /* ---------------------------------------------------------
     Segmentos: trilho com contador "X de 4"
  --------------------------------------------------------- */
  const segTrack = document.querySelector(".segments-track");
  const segCounter = document.querySelector("[data-seg-counter]");
  const segFill = document.querySelector(".segments-progress__fill");
  if (segTrack) {
    const cards = Array.from(segTrack.querySelectorAll(".segment-card"));
    const updateActive = () => {
      let closest = 0;
      let minDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - segTrack.scrollLeft);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      cards.forEach((c, i) => c.classList.toggle("is-active", i === closest));
      if (segCounter) segCounter.textContent = document.documentElement.lang === "en" ? `${closest + 1} of ${cards.length}` : `${closest + 1} de ${cards.length}`;
      if (segFill) segFill.style.width = `${((closest + 1) / cards.length) * 100}%`;
    };
    let ticking = false;
    segTrack.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { updateActive(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    updateActive();

    document.querySelectorAll("[data-seg-prev]").forEach((btn) =>
      btn.addEventListener("click", () => segTrack.scrollBy({ left: -360, behavior: "smooth" }))
    );
    document.querySelectorAll("[data-seg-next]").forEach((btn) =>
      btn.addEventListener("click", () => segTrack.scrollBy({ left: 360, behavior: "smooth" }))
    );
  }

  /* ---------------------------------------------------------
     Proposta pedagógica: mantém só um item aberto por vez (desktop)
  --------------------------------------------------------- */
  const proposalItems = document.querySelectorAll(".proposal-item");
  proposalItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        proposalItems.forEach((other) => { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---------------------------------------------------------
     Galeria: filtros + lightbox
  --------------------------------------------------------- */
  const galleryFilters = document.querySelectorAll("[data-gallery-filter]");
  const galleryItems = document.querySelectorAll("[data-gallery-item]");
  galleryFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      galleryFilters.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      const filter = btn.dataset.galleryFilter;
      galleryItems.forEach((item) => {
        const match = filter === "all" || item.dataset.category === filter;
        item.style.display = match ? "" : "none";
      });
    });
  });

  const lightbox = document.querySelector(".lightbox");
  const lightboxCaption = lightbox?.querySelector(".lightbox__caption");
  const lightboxImage = lightbox?.querySelector(".lightbox__image");
  let lastFocused = null;
  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      lastFocused = item;
      const captionText = item.dataset.caption || "";
      const captionShown = document.documentElement.lang === "en" && window.__aussieI18nDict && window.__aussieI18nDict[captionText] ? window.__aussieI18nDict[captionText] : captionText;
      if (lightboxCaption) lightboxCaption.textContent = captionShown;
      if (lightboxImage) {
        const src = item.querySelector("img")?.getAttribute("src") || "";
        lightboxImage.src = src;
        lightboxImage.alt = captionShown;
      }
      lightbox?.classList.add("is-open");
      lightbox?.querySelector(".lightbox__close")?.focus();
    });
  });
  lightbox?.querySelector(".lightbox__close")?.addEventListener("click", () => {
    lightbox.classList.remove("is-open");
    lastFocused?.focus();
  });
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) { lightbox.classList.remove("is-open"); lastFocused?.focus(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox?.classList.contains("is-open")) {
      lightbox.classList.remove("is-open");
      lastFocused?.focus();
    }
  });

  /* ---------------------------------------------------------
     Conteúdos: filtro por categoria + busca
  --------------------------------------------------------- */
  const contentFilters = document.querySelectorAll("[data-content-filter]");
  const contentItems = document.querySelectorAll("[data-content-item]");
  const contentSearch = document.querySelector("[data-content-search]");
  const contentEmpty = document.querySelector("[data-content-empty]");
  if (contentItems.length) {
    let activeCategory = "all";
    const applyFilters = () => {
      const query = (contentSearch?.value || "").trim().toLowerCase();
      let visibleCount = 0;
      contentItems.forEach((item) => {
        const matchesCategory = activeCategory === "all" || item.dataset.category === activeCategory;
        const matchesQuery = !query || item.dataset.title.toLowerCase().includes(query);
        const visible = matchesCategory && matchesQuery;
        item.style.display = visible ? "" : "none";
        if (visible) visibleCount++;
      });
      if (contentEmpty) contentEmpty.hidden = visibleCount !== 0;
    };
    contentFilters.forEach((btn) => {
      btn.addEventListener("click", () => {
        contentFilters.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        activeCategory = btn.dataset.contentFilter;
        applyFilters();
      });
    });
    contentSearch?.addEventListener("input", applyFilters);
  }

  /* ---------------------------------------------------------
     WhatsApp FAB: anima só na primeira aparição
  --------------------------------------------------------- */
  const fab = document.querySelector(".whatsapp-fab");
  if (fab && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fab.classList.add("fab-enter");
          io.disconnect();
        }
      });
    }, { threshold: 0.9 });
    io.observe(fab);
  }

  /* ---------------------------------------------------------
     Cookie banner (LGPD)
  --------------------------------------------------------- */
  const cookieBanner = document.querySelector(".cookie-banner");
  if (cookieBanner) {
    const consent = localStorage.getItem("aussie-cookie-consent");
    if (!consent) {
      window.setTimeout(() => cookieBanner.classList.add("is-visible"), 900);
    }
    cookieBanner.querySelectorAll("[data-cookie-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem("aussie-cookie-consent", btn.dataset.cookieChoice);
        cookieBanner.classList.remove("is-visible");
      });
    });
  }

  /* ---------------------------------------------------------
     Formulário de visita: validação e estados
  --------------------------------------------------------- */
  const visitForm = document.querySelector("[data-visit-form]");
  if (visitForm) {
    const fields = Array.from(visitForm.querySelectorAll("[data-field]"));

    const validateField = (fieldEl) => {
      const input = fieldEl.querySelector("input, select, textarea");
      if (!input) return true;
      let valid = input.checkValidity();
      fieldEl.classList.toggle("has-error", !valid);
      fieldEl.classList.toggle("is-valid", valid && input.value.trim() !== "");
      return valid;
    };

    fields.forEach((fieldEl) => {
      const input = fieldEl.querySelector("input, select, textarea");
      input?.addEventListener("blur", () => validateField(fieldEl));
      input?.addEventListener("input", () => {
        if (fieldEl.classList.contains("has-error")) validateField(fieldEl);
      });
    });

    const WHATSAPP_NUMBER = "556139720719";

    const buildWhatsAppMessage = () => {
      const lines = [];
      Array.from(visitForm.querySelectorAll(".field")).forEach((fieldEl) => {
        const input = fieldEl.querySelector("input, select, textarea");
        if (!input || !input.value.trim()) return;
        const label = fieldEl.querySelector("label")?.textContent.replace(/\*/g, "").trim();
        let value = input.value.trim();
        if (input.tagName === "SELECT") {
          value = input.options[input.selectedIndex]?.textContent.trim() || value;
        }
        if (label) lines.push(`${label}: ${value}`);
      });
      return lines.join("\n");
    };

    visitForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let allValid = true;
      fields.forEach((fieldEl) => { if (!validateField(fieldEl)) allValid = false; });

      // honeypot antispam
      const honeypot = visitForm.querySelector('input[name="empresa_site"], input[name="c-empresa"]');
      if (honeypot && honeypot.value !== "") return;

      if (!allValid) {
        fields.find((f) => f.classList.contains("has-error"))?.querySelector("input, select, textarea")?.focus();
        return;
      }

      const submitBtn = visitForm.querySelector('button[type="submit"]');
      const originalText = submitBtn?.textContent;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = document.documentElement.lang === "en" ? "Sending..." : "Enviando..."; }

      window.setTimeout(() => {
        const message = buildWhatsAppMessage();
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank", "noopener");

        visitForm.hidden = true;
        const success = document.querySelector("[data-form-success]");
        if (success) {
          success.hidden = false;
          success.setAttribute("tabindex", "-1");
          success.focus();
          const plane = success.querySelector(".success-plane");
          if (plane && !prefersReducedMotion) plane.classList.add("fly");
        }
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
      }, 500);
    });
  }

  /* ---------------------------------------------------------
     Parallax leve no hero (desativado com reduced motion)
  --------------------------------------------------------- */
  if (!prefersReducedMotion && window.innerWidth > 860) {
    const heroMedia = document.querySelector(".hero__media");
    const heroBlob1 = document.querySelector(".hero__blob--1");
    if (heroMedia) {
      window.addEventListener("scroll", () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroMedia.style.transform = `translateY(${y * 0.06}px)`;
          if (heroBlob1) heroBlob1.style.transform = `translateY(${y * 0.1}px)`;
        }
      }, { passive: true });
    }
  }

  /* ---------------------------------------------------------
     Ano dinâmico no rodapé
  --------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
