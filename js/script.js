/* АРОМАТИКА — интерактивность
   - раскрытие цвета напитка и смена гаммы фона и логотипа
   - переворот интерактивной карточки «Не просто кофе»
   - мобильное меню, плавная навигация, появление блоков, демо-уведомления */
(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.remove("no-js");

  const THEMES = ["neutral", "velvet", "blush", "sage"];
  const LOGO_BY_THEME = {
    neutral: "base",
    velvet: "velvet",
    blush: "blush",
    sage: "sage"
  };
  const NAMES = {
    neutral: "исходная нейтральная гамма",
    velvet: "VELVET — ванильный раф",
    blush: "BLUSH — малиновый раф",
    sage: "SAGE — фисташковый латте"
  };

  const drinkButtons = Array.from(document.querySelectorAll("[data-drink]"));
  const logoImages = Array.from(document.querySelectorAll(".logo-stack__img[data-logo]"));
  const themeStatus = document.getElementById("theme-status");
  const toast = document.getElementById("toast");

  let currentTheme = "neutral";
  let toastTimer = null;

  /* --- Смена цветового состояния ---------------------------------------- */
  function setTheme(nextTheme) {
    if (!THEMES.includes(nextTheme)) return;

    // Повторный клик по активному напитку возвращает нейтральное состояние
    if (nextTheme === currentTheme) nextTheme = "neutral";
    currentTheme = nextTheme;

    root.setAttribute("data-theme", currentTheme);

    logoImages.forEach(function (img) {
      const isActive = img.getAttribute("data-logo") === LOGO_BY_THEME[currentTheme];
      img.classList.toggle("is-active", isActive);
    });

    drinkButtons.forEach(function (button) {
      const isActive = button.getAttribute("data-drink") === currentTheme;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (themeStatus) {
      themeStatus.textContent = currentTheme === "neutral"
        ? "Восстановлена исходная нейтральная гамма. Все напитки монохромны."
        : "Выбран напиток " + NAMES[currentTheme] + ". Цвет раскрыт, фон сайта изменил гамму.";
    }
  }

  drinkButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setTheme(button.getAttribute("data-drink"));
    });
  });

  /* --- Интерактивная карточка «Не просто кофе» --------------------------- */
  const flipCard = document.querySelector(".flip-card");
  const flipStatus = document.getElementById("flip-status");

  const FLIP_FRONT_LABEL =
    "Не просто кофе. Маленькое впечатление. Нажмите, чтобы перевернуть карточку и узнать о кофейне";
  const FLIP_BACK_LABEL =
    "АРОМАТИКА — место для тех, кто любит открывать новое и замечать красоту в деталях. " +
    "Мы создаём авторские напитки, в которых встречаются вкус, аромат и цвет. " +
    "У каждого своя история, которую интереснее всего узнать с первым глотком. " +
    "Нажмите, чтобы вернуться к лицевой стороне";

  if (flipCard) {
    flipCard.addEventListener("click", function () {
      const isFlipped = flipCard.getAttribute("aria-pressed") !== "true";

      flipCard.classList.toggle("is-flipped", isFlipped);
      flipCard.setAttribute("aria-pressed", String(isFlipped));
      flipCard.setAttribute("aria-label", isFlipped ? FLIP_BACK_LABEL : FLIP_FRONT_LABEL);

      if (flipStatus) {
        flipStatus.textContent = isFlipped
          ? "Карточка перевёрнута: открыта цветная фотография и текст о кофейне."
          : "Карточка возвращена к лицевой стороне.";
      }
    });
  }

  /* --- Демо-уведомления -------------------------------------------------- */
  function showToast(message) {
    if (!toast || !message) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3800);
  }

  document.querySelectorAll("[data-demo]").forEach(function (element) {
    element.addEventListener("click", function (event) {
      event.preventDefault();
      showToast(element.getAttribute("data-demo"));
    });
  });

  /* --- Мобильное меню ---------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("primary-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));

  function closeMenu() {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("nav-open");
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      nav.classList.toggle("is-open", willOpen);
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Закрыть меню" : "Открыть меню");
      document.body.classList.toggle("nav-open", willOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!header) return;
      if (!header.contains(event.target) && nav.classList.contains("is-open")) closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* --- Состояние шапки при прокрутке и активный пункт меню --------------- */
  const sections = ["home", "drinks", "about", "contacts"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  let scrollQueued = false;

  function updateOnScroll() {
    const scrollY = window.pageYOffset || window.scrollY || 0;

    if (header) header.classList.toggle("is-scrolled", scrollY > 24);

    const marker = scrollY + window.innerHeight * 0.35;
    let activeId = "home";
    sections.forEach(function (section) {
      if (section.offsetTop <= marker) activeId = section.id;
    });

    navLinks.forEach(function (link) {
      const isCurrent = link.getAttribute("data-nav") === activeId;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    scrollQueued = false;
  }

  window.addEventListener("scroll", function () {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(updateOnScroll);
    }
  }, { passive: true });

  updateOnScroll();

  /* --- Появление блоков при прокрутке ------------------------------------ */
  const revealItems = Array.from(document.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    revealItems.forEach(function (item) { observer.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* --- Год в футере ------------------------------------------------------ */
  document.querySelectorAll("[data-year]").forEach(function (element) {
    element.textContent = String(new Date().getFullYear());
  });
})();
