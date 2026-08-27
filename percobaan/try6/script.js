/* ============================================================
   NUVIO.HD - SPA STREAMING
   Vanilla JavaScript ES6+
   ============================================================ */

/* ============================================================
   CONFIG
   ============================================================ */

const CONFIG = {
  smartlinkUrl: "YOUR_SMARTLINK_URL_HERE",
  adCooldown: 15000
};

/* ============================================================
   FILM DATA
   ============================================================ */

const films = [
  {
    id: 1,
    title: "Film 1",
    description: "Deskripsi film pertama...",
    thumbnail: "assets/film1.jpg",
    video: "assets/film1.mp4",
    category: "daftar",
    badges: ["HD"]
  },
  {
    id: 2,
    title: "Film 2",
    description: "Deskripsi film kedua...",
    thumbnail: "assets/film2.jpg",
    video: "assets/film2.mp4",
    category: "daftar",
    badges: ["HD", "Popular"]
  },
  {
    id: 3,
    title: "Film 3",
    description: "Deskripsi film ketiga...",
    thumbnail: "assets/film3.jpg",
    video: "assets/film3.mp4",
    category: "update",
    badges: ["New", "HD"]
  },
  {
    id: 4,
    title: "Film 4",
    description: "Deskripsi film keempat...",
    thumbnail: "assets/film4.jpg",
    video: "assets/film4.mp4",
    category: "update",
    badges: ["Updated"]
  },
  {
    id: 5,
    title: "Film 5",
    description: "Deskripsi film kelima...",
    thumbnail: "assets/film5.jpg",
    video: "assets/film5.mp4",
    category: "populer",
    badges: ["Trending", "HD"]
  },
  {
    id: 6,
    title: "Film 6",
    description: "Deskripsi film keenam...",
    thumbnail: "assets/film6.jpg",
    video: "assets/film6.mp4",
    category: "populer",
    badges: ["Popular"]
  },
  {
    id: 7,
    title: "Film 7",
    description: "Deskripsi film ketujuh...",
    thumbnail: "assets/film7.jpg",
    video: "assets/film7.mp4",
    category: "daftar",
    badges: ["HD"]
  },
  {
    id: 8,
    title: "Film 8",
    description: "Deskripsi film kedelapan...",
    thumbnail: "assets/film8.jpg",
    video: "assets/film8.mp4",
    category: "update",
    badges: ["New"]
  },
    {
    id: 9,
    title: "Film 9",
    description: "Deskripsi film kedelapan...",
    thumbnail: "assets/film8.jpg",
    video: "assets/film8.mp4",
    category: "update",
    badges: ["New"]
  }
];

/* ============================================================
   APP STATE
   ============================================================ */

const state = {
  view: "home",
  filmId: null,
  lastAdTime: 0,
  player: null,
  controlsTimer: null,
  centerTimer: null,
  toastTimer: null
};

let app;
let navItems;

/* ============================================================
   UTILITIES
   ============================================================ */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function findFilm(id) {
  return films.find((film) => film.id === Number(id)) || null;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${mm}:${ss}`
    : `${mm}:${ss}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  clearTimeout(state.toastTimer);

  toast.textContent = message;
  toast.classList.add("show");

  state.toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function placeholderImage(title) {
  const safeTitle = String(title).slice(0, 24);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="900" viewBox="0 0 800 900">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#2b19a9"/>
          <stop offset=".55" stop-color="#77008f"/>
          <stop offset="1" stop-color="#d3006e"/>
        </linearGradient>
      </defs>

      <rect width="800" height="900" fill="url(#g)"/>

      <circle
        cx="160"
        cy="170"
        r="130"
        fill="rgba(255,255,255,.12)"
      />

      <circle
        cx="620"
        cy="680"
        r="180"
        fill="rgba(255,196,92,.10)"
      />

      <text
        x="54"
        y="760"
        font-size="58"
        font-family="Arial, sans-serif"
        font-weight="700"
        fill="white"
      >
        ${safeTitle}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function imageMarkup(src, alt) {
  return `
    <img
      src="${escapeHTML(src)}"
      alt="${escapeHTML(alt)}"
      loading="lazy"
      onerror="this.onerror=null;this.src='${placeholderImage(alt)}'"
    >
  `;
}

function svgArrow() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 11h10.7l-4.85-4.85L12.27 4.7 19.57 12l-7.3 7.3-1.42-1.45L15.7 13H5v-2Z"></path>
    </svg>
  `;
}

function svgBack() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m10.2 5-1.4 1.4L13.4 11H4v2h9.4l-4.6 4.6 1.4 1.4L17.2 12 10.2 5Z"></path>
    </svg>
  `;
}

function svgPlay() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13c0 .8.9 1.3 1.6.9l10-6.5c.7-.4.7-1.4 0-1.8l-10-6.5C8.9 4.2 8 4.7 8 5.5Z"></path>
    </svg>
  `;
}

function svgPause() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z"></path>
    </svg>
  `;
}

function svgVolume() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Zm12.5 1.1a1 1 0 0 0-1.4 1.4 2.1 2.1 0 0 1 0 3 1 1 0 0 0 1.4 1.4 4.1 4.1 0 0 0 0-5.8Zm2.2-2.2a1 1 0 0 0-1.4 1.4 5.2 5.2 0 0 1 0 7.4 1 1 0 0 0 1.4 1.4 7.2 7.2 0 0 0 0-10.2Z"></path>
    </svg>
  `;
}

function svgMute() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Zm13.5 1.2L16.2 11.5l1.8 1.8-1.8 1.8 1.3 1.3 1.8-1.8 1.8 1.8 1.3-1.3-1.8-1.8 1.8-1.8-1.3-1.3-1.8 1.8-1.8-1.8Z"></path>
    </svg>
  `;
}

function svgFullscreen() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4a1 1 0 0 0-1 1v5h2V6h4V4H5Zm14 0h-5v2h4v4h2V5a1 1 0 0 0-1-1ZM4 14v5a1 1 0 0 0 1 1h5v-2H6v-4H4Zm14 0v4h-4v2h5a1 1 0 0 0 1-1v-5h-2Z"></path>
    </svg>
  `;
}

/* ============================================================
   SMARTLINK GLOBAL
   ============================================================ */

function canTriggerAd() {
  return Date.now() - state.lastAdTime >= CONFIG.adCooldown;
}

function triggerSmartlink() {
  if (!canTriggerAd()) {
    return false;
  }

  const url = String(CONFIG.smartlinkUrl || "").trim();

  if (!url || url === "YOUR_SMARTLINK_URL_HERE") {
    return false;
  }

  state.lastAdTime = Date.now();

  try {
    const popup = window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    if (!popup) {
      window.location.assign(url);
    }

    showToast("Smartlink dibuka. Cooldown 15 detik aktif.");

    return true;
  } catch (error) {
    console.warn(
      "Smartlink gagal dibuka:",
      error
    );

    return false;
  }
}

function handleAdInteraction() {
  triggerSmartlink();
}

/* ============================================================
   ROUTER / HISTORY API
   ============================================================ */

function parseRoute() {
  const rawHash =
    window.location.hash.replace(/^#/, "");

  if (!rawHash || rawHash === "home") {
    return {
      view: "home",
      filmId: null
    };
  }

  const [view, id] =
    rawHash.split("/");

  if (
    view === "player" &&
    id
  ) {
    return {
      view: "player",
      filmId: Number(id)
    };
  }

  if (
    ["daftar", "update", "populer"]
      .includes(view)
  ) {
    return {
      view,
      filmId: null
    };
  }

  return {
    view: "home",
    filmId: null
  };
}

function updateHistory(
  view,
  filmId = null,
  replace = false
) {
  const hash = filmId
    ? `#${view}/${filmId}`
    : `#${view}`;

  const stateObject = {
    view,
    filmId
  };

  if (replace) {
    history.replaceState(
      stateObject,
      "",
      hash
    );
  } else {
    history.pushState(
      stateObject,
      "",
      hash
    );
  }
}

function navigateTo(
  view,
  filmId = null,
  options = {}
) {
  const {
    skipAd = false,
    replace = false,
    fromPopState = false,
    scrollTop = true
  } = options;

  if (
    !skipAd &&
    !fromPopState
  ) {
    handleAdInteraction();
  }

  state.view = view;

  state.filmId =
    filmId
      ? Number(filmId)
      : null;

  if (!fromPopState) {
    updateHistory(
      view,
      filmId,
      replace
    );
  }

  renderView();

  if (scrollTop) {
    window.scrollTo({
      top: 0,
      behavior:
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth"
    });
  }
}

function handleBack() {
  if (window.history.length > 1) {
    history.back();
  } else {
    navigateTo(
      "home",
      null,
      {
        skipAd: true,
        replace: true
      }
    );
  }
}

function updateActiveNav() {
  navItems.forEach((item) => {
    const target =
      item.dataset.view;

    item.classList.toggle(
      "is-active",
      target === state.view
    );
  });
}

/* ============================================================
   RENDER HELPERS
   ============================================================ */

function badgeMarkup(film) {
  return (film.badges || [])
    .map((badge) => {
      const normalized =
        badge.toLowerCase();

      const className =
        normalized === "new"
          ? "badge badge-new"
          : normalized === "popular" ||
            normalized === "trending"
              ? "badge badge-hot"
              : "badge";

      return `
        <span class="${className}">
          ${escapeHTML(badge)}
        </span>
      `;
    })
    .join("");
}

function viewButton(film) {
  return `
    <button
      class="gradient-button view-button"
      type="button"
      data-action="view-film"
      data-film-id="${film.id}"
      aria-label="Tonton ${escapeHTML(film.title)}"
    >
      <span>View</span>
      ${svgArrow()}
    </button>
  `;
}

function recommendationMarkup(
  film,
  index
) {
  return `
    <article
      class="recommendation-item scroll-reveal"
      style="transition-delay:${index * 60}ms"
    >
      <div class="poster-wrap">
        ${imageMarkup(
          film.thumbnail,
          film.title
        )}
      </div>

      <div class="recommendation-content">
        <div>
          <p class="item-description">
            ${escapeHTML(
              film.description
            )}
          </p>

          <div
            class="meta-row"
            style="margin-top:10px"
          >
            ${badgeMarkup(film)}
          </div>
        </div>

        ${viewButton(film)}
      </div>
    </article>
  `;
}

function listCardMarkup(
  film,
  index
) {
  return `
    <article
      class="list-card scroll-reveal"
      style="transition-delay:${index * 55}ms"
    >
      <div class="list-thumb">
        ${imageMarkup(
          film.thumbnail,
          film.title
        )}
      </div>

      <div class="list-content">
        <div>
          <div
            class="meta-row"
            style="margin-bottom:8px"
          >
            ${badgeMarkup(film)}
          </div>

          <h2 class="list-title">
            ${escapeHTML(
              film.title
            )}
          </h2>

          <p class="list-description">
            ${escapeHTML(
              film.description
            )}
          </p>
        </div>

        ${viewButton(film)}
      </div>
    </article>
  `;
}

function otherCardMarkup(film) {
  return `
    <article class="other-card">

      <div class="other-thumb">
        ${imageMarkup(
          film.thumbnail,
          film.title
        )}
      </div>

      <div class="other-copy">

        <p>
          ${escapeHTML(
            film.description
          )}
        </p>

        ${viewButton(film)}

      </div>

    </article>
  `;
}

/* ============================================================
   HOME VIEW
   ============================================================ */

function renderHome() {
  const recommended =
    films.slice(0, 3);

  return `
    <section class="page home-page">

      <section class="hero">

        <h1 class="hero-title">
          Nuvio.HD
        </h1>

        <div class="home-top">

          <div class="quick-card">

            <div class="quick-links">

              <a
                href="#daftar"
                class="gradient-button"
                data-nav="daftar"
              >
                <span>
                  Daftar film
                </span>

                ${svgArrow()}
              </a>

              <a
                href="#update"
                class="gradient-button"
                data-nav="update"
              >
                <span>
                  Update
                </span>

                ${svgArrow()}
              </a>

              <a
                href="#populer"
                class="gradient-button"
                data-nav="populer"
              >
                <span>
                  Populer
                </span>

                ${svgArrow()}
              </a>

            </div>

          </div>

          <div class="info-card">

            <p>
              Keterangan website....<br>
              Temukan film pilihan terbaru,
              update, dan populer untuk ditonton.
            </p>

          </div>

        </div>

      </section>

      <section class="recommendation-shell">

        <h2 class="section-heading">
          Rekomendasi
        </h2>

        <div class="recommendation-list">

          ${recommended
            .map(
              (film, index) =>
                recommendationMarkup(
                  film,
                  index
                )
            )
            .join("")}

        </div>

      </section>

    </section>
  `;
}

/* ============================================================
   LIST VIEWS
   ============================================================ */

function categoryTitle(category) {
  if (category === "daftar") {
    return "Daftar Film";
  }

  if (category === "update") {
    return "Update";
  }

  return "Populer";
}

function renderFilmList(category) {
  const filtered =
    films.filter(
      (film) =>
        film.category ===
        category
    );

  const title =
    categoryTitle(category);

  return `
    <section class="page">

      <div class="page-topbar">

        <button
          type="button"
          class="gradient-button back-button"
          data-action="back"
          aria-label="Kembali"
        >
          ${svgBack()}

          <span>
            Back
          </span>
        </button>

        <h1 class="page-title">
          ${escapeHTML(title)}
        </h1>

      </div>

      <div class="film-grid">

        ${
          filtered.length
            ? filtered
                .map(
                  (film, index) =>
                    listCardMarkup(
                      film,
                      index
                    )
                )
                .join("")
            : `
              <div class="empty-state">
                <p>
                  Belum ada film
                  pada kategori ini.
                </p>
              </div>
            `
        }

      </div>

    </section>
  `;
}

/* ============================================================
   PLAYER VIEW
   ============================================================ */

function renderPlayer(filmId) {
  const film =
    findFilm(filmId);

  if (!film) {
    return renderFilmList(
      "daftar"
    );
  }

  const others =
    films
      .filter(
        (item) =>
          item.id !== film.id
      )
      .slice(0, 3);

  return `
    <section class="page player-page">

      <div class="page-topbar">

        <button
          type="button"
          class="gradient-button back-button"
          data-action="back"
          aria-label="Kembali"
        >
          ${svgBack()}

          <span>
            Back
          </span>
        </button>

        <h1 class="page-title">
          Video Player
        </h1>

      </div>

      <section class="player-card">

        <div
          class="player-shell"
          id="playerShell"
          tabindex="0"
          aria-label="Video player ${escapeHTML(
            film.title
          )}"
        >

          <video
            id="video"
            class="video"
            playsinline
            preload="metadata"
          >

            <source
              id="videoSource"
              src="${escapeHTML(
                film.video
              )}"
              type="video/mp4"
            >

            Browser Anda tidak
            mendukung video HTML5.

          </video>

          <div
            class="player-placeholder"
            id="playerPlaceholder"
          >

            <button
              class="play-big"
              id="playBig"
              type="button"
              aria-label="Putar ${escapeHTML(
                film.title
              )}"
            >
              ${svgPlay()}
            </button>

          </div>

          <div class="player-top-label">
            ${escapeHTML(
              film.title
            )}
          </div>

          <button
            class="center-pause"
            id="centerPause"
            type="button"
            aria-label="Pause video"
          >
            ${svgPause()}
          </button>

          <div
            class="player-controls"
            id="playerControls"
          >

            <div
              class="progress-track"
              id="progressTrack"
              role="slider"
              aria-label="Progress video"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="0"
              tabindex="0"
            >

              <div
                class="progress-fill"
                id="progressFill"
              ></div>

            </div>

            <div class="controls-row">

              <button
                class="control-btn"
                id="playPause"
                type="button"
                aria-label="Putar video"
              >
                ${svgPlay()}
              </button>

              <div class="volume-wrap">

                <button
                  class="control-btn"
                  id="muteButton"
                  type="button"
                  aria-label="Mute"
                >
                  ${svgVolume()}
                </button>

                <input
                  class="volume-slider"
                  id="volumeSlider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value="1"
                  aria-label="Volume"
                >

              </div>

              <span
                class="time-label"
                id="timeLabel"
              >
                00:00 / 00:00
              </span>

              <button
                class="control-btn"
                id="fullscreenButton"
                type="button"
                aria-label="Fullscreen"
              >
                ${svgFullscreen()}
              </button>

            </div>

          </div>

        </div>

        <div class="player-description">

          <span class="eyebrow">
            ${escapeHTML(
              film.title
            )}
          </span>

          <p>
            ${escapeHTML(
              film.description
            )}
          </p>

        </div>

      </section>

      <section class="other-section">

        <h2 class="section-heading">
          Lainnya..
        </h2>

        <div class="other-grid">

          ${others
            .map(
              otherCardMarkup
            )
            .join("")}

        </div>

      </section>

    </section>
  `;
}

/* ============================================================
   MAIN RENDER
   ============================================================ */

function renderView() {
  updateActiveNav();

  if (
    state.view === "home"
  ) {
    app.innerHTML =
      renderHome();

  } else if (
    state.view === "daftar"
  ) {
    app.innerHTML =
      renderFilmList(
        "daftar"
      );

  } else if (
    state.view === "update"
  ) {
    app.innerHTML =
      renderFilmList(
        "update"
      );

  } else if (
    state.view === "populer"
  ) {
    app.innerHTML =
      renderFilmList(
        "populer"
      );

  } else if (
    state.view === "player"
  ) {
    app.innerHTML =
      renderPlayer(
        state.filmId
      );

  } else {
    state.view =
      "home";

    state.filmId =
      null;

    app.innerHTML =
      renderHome();
  }

  window.requestAnimationFrame(
    () => {
      setupCurrentView();
      setupScrollReveal();
    }
  );
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */

function setupScrollReveal() {
  const elements =
    document.querySelectorAll(
      ".scroll-reveal"
    );

  if (!elements.length) {
    return;
  }

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    elements.forEach(
      (element) => {
        element.classList.add(
          "is-visible"
        );
      }
    );

    return;
  }

  const observer =
    new IntersectionObserver(
      (
        entries,
        observerRef
      ) => {

        entries.forEach(
          (entry) => {

            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              "is-visible"
            );

            observerRef.unobserve(
              entry.target
            );

          }
        );

      },
      {
        threshold: 0.08
      }
    );

  elements.forEach(
    (element) =>
      observer.observe(
        element
      )
  );
}

/* ============================================================
   EVENT DELEGATION
   ============================================================ */

function setupCurrentView() {
  setupPlayerIfPresent();

  app.querySelectorAll(
    "[data-nav]"
  ).forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          const view =
            link.dataset.nav;

          if (!view) {
            return;
          }

          navigateTo(
            view
          );

        }
      );

    }
  );

  app.querySelectorAll(
    '[data-action="back"]'
  ).forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          handleAdInteraction();
          handleBack();

        }
      );

    }
  );

  app.querySelectorAll(
    '[data-action="view-film"]'
  ).forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const filmId =
            Number(
              button.dataset
                .filmId
            );

          if (
            !findFilm(
              filmId
            )
          ) {
            return;
          }

          navigateTo(
            "player",
            filmId
          );

        }
      );

    }
  );
}

/* ============================================================
   PLAYER SETUP
   ============================================================ */

function setupPlayerIfPresent() {
  const video =
    document.getElementById(
      "video"
    );

  const playerShell =
    document.getElementById(
      "playerShell"
    );

  if (
    !video ||
    !playerShell
  ) {
    state.player =
      null;

    return;
  }

  const player = {
    video,
    shell: playerShell,
    placeholder:
      document.getElementById(
        "playerPlaceholder"
      ),
    playBig:
      document.getElementById(
        "playBig"
      ),
    playPause:
      document.getElementById(
        "playPause"
      ),
    centerPause:
      document.getElementById(
        "centerPause"
      ),
    muteButton:
      document.getElementById(
        "muteButton"
      ),
    volumeSlider:
      document.getElementById(
        "volumeSlider"
      ),
    fullscreenButton:
      document.getElementById(
        "fullscreenButton"
      ),
    progressTrack:
      document.getElementById(
        "progressTrack"
      ),
    progressFill:
      document.getElementById(
        "progressFill"
      ),
    timeLabel:
      document.getElementById(
        "timeLabel"
      )
  };

  state.player =
    player;

  video.volume =
    1;

  /* Play dari tombol besar */
  player.playBig.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      handleAdInteraction();
      toggleVideoPlayback();

    }
  );

  /* Play / pause custom */
  player.playPause.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      handleAdInteraction();
      toggleVideoPlayback();

    }
  );

  /* Pause dari tombol tengah */
  player.centerPause.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      handleAdInteraction();
      toggleVideoPlayback();

    }
  );

  /* Klik langsung pada video */
  video.addEventListener(
    "click",
    () => {

      handleAdInteraction();
      revealPlayerControls();

      toggleVideoPlayback();

    }
  );

  /* Mute */
  player.muteButton.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      handleAdInteraction();

      video.muted =
        !video.muted;

      updateMuteIcon();

    }
  );

  /* Volume */
  player.volumeSlider.addEventListener(
    "input",
    () => {

      video.volume =
        Number(
          player.volumeSlider.value
        );

      if (
        video.volume > 0
      ) {
        video.muted =
          false;
      }

      updateMuteIcon();

    }
  );

  /* Fullscreen */
  player.fullscreenButton.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      handleAdInteraction();
      toggleFullscreen();

    }
  );

  /* Progress click */
  player.progressTrack.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      handleAdInteraction();
      seekVideo(
        event.clientX
      );

    }
  );

  /* Keyboard progress */
  player.progressTrack.addEventListener(
    "keydown",
    (event) => {

      if (
        !Number.isFinite(
          video.duration
        )
      ) {
        return;
      }

      let target =
        video.currentTime;

      if (
        event.key ===
        "ArrowRight"
      ) {

        target +=
          5;

      } else if (
        event.key ===
        "ArrowLeft"
      ) {

        target -=
          5;

      } else {

        return;

      }

      event.preventDefault();

      handleAdInteraction();

      video.currentTime =
        Math.max(
          0,
          Math.min(
            video.duration,
            target
          )
        );

      updatePlayerTime();

    }
  );

  /* Keyboard player */
  playerShell.addEventListener(
    "keydown",
    (event) => {

      if (
        event.target ===
          player.volumeSlider ||
        event.target ===
          player.progressTrack
      ) {
        return;
      }

      if (
        event.code ===
        "Space"
      ) {

        event.preventDefault();

        handleAdInteraction();
        toggleVideoPlayback();

      }

      if (
        event.key.toLowerCase() ===
        "m"
      ) {

        event.preventDefault();

        handleAdInteraction();

        video.muted =
          !video.muted;

        updateMuteIcon();

      }

      if (
        event.key.toLowerCase() ===
        "f"
      ) {

        event.preventDefault();

        handleAdInteraction();
        toggleFullscreen();

      }

    }
  );

  /* Hover / touch controls */
  playerShell.addEventListener(
    "mousemove",
    revealPlayerControls
  );

  playerShell.addEventListener(
    "touchstart",
    revealPlayerControls,
    {
      passive: true
    }
  );

  /* Video events */
  video.addEventListener(
    "loadedmetadata",
    updatePlayerTime
  );

  video.addEventListener(
    "timeupdate",
    updatePlayerTime
  );

  video.addEventListener(
    "play",
    () => {

      player.placeholder.classList.add(
        "is-hidden"
      );

      updatePlayPauseIcon();

      revealPlayerControls();

    }
  );

  video.addEventListener(
    "playing",
    () => {

      player.placeholder.classList.add(
        "is-hidden"
      );

      updatePlayPauseIcon();

    }
  );

  video.addEventListener(
    "pause",
    () => {

      player.placeholder.classList.remove(
        "is-hidden"
      );

      updatePlayPauseIcon();

      player.shell.classList.add(
        "controls-visible"
      );

      player.centerPause.classList.remove(
        "show"
      );

    }
  );

  video.addEventListener(
    "ended",
    () => {

      player.placeholder.classList.remove(
        "is-hidden"
      );

      updatePlayPauseIcon();

      player.shell.classList.add(
        "controls-visible"
      );

    }
  );

  video.addEventListener(
    "error",
    () => {

      player.placeholder.classList.remove(
        "is-hidden"
      );

      showToast(
        "Video tidak dapat dimuat. Periksa URL video."
      );

    }
  );

  updatePlayPauseIcon();
  updateMuteIcon();
  updatePlayerTime();
}

function revealPlayerControls() {
  const player =
    state.player;

  if (!player) {
    return;
  }

  player.shell.classList.add(
    "controls-visible"
  );

  clearTimeout(
    state.controlsTimer
  );

  state.controlsTimer =
    window.setTimeout(
      () => {

        if (
          !player.video.paused
        ) {

          player.shell.classList.remove(
            "controls-visible"
          );

        }

      },
      2800
    );
}

function toggleVideoPlayback() {
  const player =
    state.player;

  if (!player) {
    return;
  }

  if (
    player.video.paused
  ) {

    const promise =
      player.video.play();

    if (
      promise &&
      typeof promise.catch ===
        "function"
    ) {

      promise.catch(
        () => {

          showToast(
            "Video belum dapat diputar. Periksa file videonya."
          );

        }
      );

    }

  } else {

    player.video.pause();

  }
}

function updatePlayPauseIcon() {
  const player =
    state.player;

  if (!player) {
    return;
  }

  player.playPause.innerHTML =
    player.video.paused
      ? svgPlay()
      : svgPause();

  player.playPause.setAttribute(
    "aria-label",
    player.video.paused
      ? "Putar video"
      : "Pause video"
  );

  if (
    player.video.paused
  ) {

    player.centerPause.classList.remove(
      "show"
    );

  }
}

function updateMuteIcon() {
  const player =
    state.player;

  if (!player) {
    return;
  }

  const muted =
    player.video.muted ||
    player.video.volume === 0;

  player.muteButton.innerHTML =
    muted
      ? svgMute()
      : svgVolume();

  player.muteButton.setAttribute(
    "aria-label",
    muted
      ? "Aktifkan suara"
      : "Mute"
  );
}

function updatePlayerTime() {
  const player =
    state.player;

  if (!player) {
    return;
  }

  const duration =
    Number.isFinite(
      player.video.duration
    )
      ? player.video.duration
      : 0;

  const current =
    Number.isFinite(
      player.video.currentTime
    )
      ? player.video.currentTime
      : 0;

  const percent =
    duration > 0
      ? (
          current /
          duration
        ) * 100
      : 0;

  player.progressFill.style.width =
    `${percent}%`;

  player.progressTrack.setAttribute(
    "aria-valuenow",
    String(
      Math.round(percent)
    )
  );

  player.timeLabel.textContent =
    `${formatTime(current)} / ${formatTime(duration)}`;
}

function seekVideo(clientX) {
  const player =
    state.player;

  if (
    !player ||
    !Number.isFinite(
      player.video.duration
    )
  ) {
    return;
  }

  const rect =
    player.progressTrack.getBoundingClientRect();

  if (
    rect.width <= 0
  ) {
    return;
  }

  const ratio =
    Math.max(
      0,
      Math.min(
        1,
        (
          clientX -
          rect.left
        ) /
        rect.width
      )
    );

  player.video.currentTime =
    ratio *
    player.video.duration;

  updatePlayerTime();
}

async function toggleFullscreen() {
  const player =
    state.player;

  if (!player) {
    return;
  }

  try {

    if (
      !document.fullscreenElement
    ) {

      if (
        player.shell.requestFullscreen
      ) {

        await player.shell.requestFullscreen();

      } else if (
        player.video.webkitEnterFullscreen
      ) {

        player.video.webkitEnterFullscreen();

      } else {

        showToast(
          "Fullscreen tidak didukung browser ini."
        );

      }

    } else {

      await document.exitFullscreen();

    }

  } catch (error) {

    console.warn(
      "Fullscreen gagal:",
      error
    );

  }
}

/* ============================================================
   NAV EVENT
   ============================================================ */

function setupGlobalNavigation() {
  navItems =
    document.querySelectorAll(
      ".nav-item"
    );

  navItems.forEach(
    (item) => {

      item.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          const view =
            item.dataset.view;

          if (!view) {
            return;
          }

          navigateTo(
            view
          );

        }
      );

    }
  );
}

/* ============================================================
   INIT APP
   ============================================================ */

function initApp() {
  app =
    document.getElementById(
      "app"
    );

  if (!app) {
    return;
  }

  setupGlobalNavigation();

  const route =
    parseRoute();

  state.view =
    route.view;

  state.filmId =
    route.filmId;

  updateHistory(
    state.view,
    state.filmId,
    true
  );

  renderView();

  window.addEventListener(
    "popstate",
    () => {

      const routeState =
        parseRoute();

      state.view =
        routeState.view;

      state.filmId =
        routeState.filmId;

      renderView();

      window.scrollTo({
        top: 0,
        behavior:
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches
            ? "auto"
            : "smooth"
      });

    }
  );

  window.addEventListener(
    "hashchange",
    () => {

      const routeState =
        parseRoute();

      if (
        routeState.view ===
          state.view &&
        routeState.filmId ===
          state.filmId
      ) {
        return;
      }

      state.view =
        routeState.view;

      state.filmId =
        routeState.filmId;

      renderView();

    }
  );
}

document.addEventListener(
  "DOMContentLoaded",
  initApp
);
