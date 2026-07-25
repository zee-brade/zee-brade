document.body.classList.add("loading");

window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");

    // tampil minimal sekitar 1.8 detik
    setTimeout(() => {

        preloader.classList.add("fade-out");

        preloader.addEventListener("transitionend", () => {
            document.body.classList.remove("loading");
            preloader.remove();
        }, { once: true });

    }, 1800);
});
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav a, a[href^='#']");
  const tabs = document.querySelectorAll(".menu-tab");
  const menuItems = document.querySelectorAll(".menu-card");
  const revealEls = document.querySelectorAll(".reveal");

  const setHeaderState = () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeMobileNav = () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    const clickedInsideNav =
      navMenu.contains(event.target) ||
      navToggle.contains(event.target);

    if (!clickedInsideNav && navMenu.classList.contains("open")) {
      closeMobileNav();
    }
  });

  const scrollToTarget = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) return;

    const headerHeight = header.offsetHeight || 88;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  };

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    link.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToTarget(href);
      if (navMenu.classList.contains("open")) closeMobileNav();
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;

      tabs.forEach((btn) => btn.classList.remove("active"));
      tab.classList.add("active");

      menuItems.forEach((item) => {
        const itemCategory = item.dataset.category || "";
        const shouldShow = filter === "all" || itemCategory === filter;

        item.classList.toggle("hidden", !shouldShow);
      });
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealEls.forEach((el) => observer.observe(el));
});
