/*
  Enjoy Watch | ZEEL.FEX
  - SMARTLINK SLOT: tombol Lanjut / Tonton / EP
  - POPUNDER SLOT: aktif sekali pada interaksi pertama pengguna
  - VIDEO SLOT: player detail yang bisa berubah per episode
*/

const SMARTLINK_URL = "https://example.com/smartlink?utm_source=enjoywatch";
const POPUNDER_URL = "https://example.com/popunder?utm_source=enjoywatch";
const SMARTLINK_COOLDOWN_MS = 20000;
const STORAGE_KEY = "smartlinkCooldownUntil";

const app = document.getElementById("app");
const loader = document.getElementById("loader");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("backdrop");

const state = {
  popunderTriggered: false,
  firstRenderDone: false,
  cooldownUntil: Number(localStorage.getItem(STORAGE_KEY) || 0),
  cooldownTimer: null,
  overlay: null,
  detailsCache: new Map(),
};

const catalog = {
  recommendations: [
    {
      slug: "1-102",
      title: "1-102 Collection",
      tag: "Rekomendasi",
      number: "1 sampai 102",
      desc: "Pilihan utama dengan episode yang paling sering dibuka. Cocok untuk pintasan cepat ke konten populer.",
    },
    {
      slug: "3-627",
      title: "3-627 Vault",
      tag: "Trending",
      number: "3 sampai 627",
      desc: "Katalog lanjutan untuk pengguna yang suka jelajah lebih dalam. Desain tombol dibuat padat dan cepat.",
    },
    {
      slug: "Prime Pack",
      title: "Prime Pack",
      tag: "Baru",
      number: "Update harian",
      desc: "Kumpulan konten terbaru dengan jalur cepat ke halaman tonton. Siap dipoles ke feed update.",
    },
    {
      slug: "Hot Picks",
      title: "Hot Picks",
      tag: "Populer",
      number: "Pilihan editor",
      desc: "Kartu-kartu utama dengan aksen neon dan CTA yang menonjol. Mantap untuk homepage hero section.",
    },
    {
      slug: "Night Mode",
      title: "Night Mode",
      tag: "Cinematic",
      number: "Visual gelap",
      desc: "Nuansa gelap elegan dengan border gradasi mint-cyan untuk kesan modern dan premium.",
    },
    {
      slug: "Fresh Drop",
      title: "Fresh Drop",
      tag: "Terbaru",
      number: "Konten segar",
      desc: "Langsung arahkan ke daftar update terbaru, ideal untuk pengguna yang suka konten baru.",
    },
  ],
  categories: [
    { slug: "1-102", title: "1-102", desc: "Grid episode utama" },
    { slug: "3-627", title: "3-627", desc: "Rentang katalog besar" },
    { slug: "Prime Pack", title: "Prime Pack", desc: "Paket pilihan" },
    { slug: "Hot Picks", title: "Hot Picks", desc: "Tontonan populer" },
    { slug: "Night Mode", title: "Night Mode", desc: "Tema sinematik" },
    { slug: "Fresh Drop", title: "Fresh Drop", desc: "Update terbaru" },
    { slug: "Daily Mix", title: "Daily Mix", desc: "Campuran harian" },
    { slug: "Top 10", title: "Top 10", desc: "Daftar teratas" },
  ],
  latest: [
    {
      title: "Episode 7 - Fresh Drop",
      desc: "Update paling baru dengan CTA Tonton -> menuju smartlink.",
      route: "detail/1-102",
    },
    {
      title: "Episode 6 - Prime Pack",
      desc: "Masuk ke detail koleksi dan pilih bagian favorit Anda.",
      route: "detail/3-627",
    },
    {
      title: "Episode 5 - Night Mode",
      desc: "Navigasi cepat ke konten dengan tampilan gelap yang tajam.",
      route: "detail/1-102",
    },
    {
      title: "Episode 4 - Hot Picks",
      desc: "Kartu update dibuat lebih ringkas dan cocok untuk mobile.",
      route: "detail/3-627",
    },
    {
      title: "Episode 3 - Daily Mix",
      desc: "Tambahkan lebih banyak item sesuai katalog Anda nanti.",
      route: "detail/1-102",
    },
  ],
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildEpisodeList(slug) {
  const folder = slugify(slug);
  return Array.from({ length: 7 }, (_, index) => {
    const ep = index + 1;
    return {
      ep,
      label: `Bagian ${ep}`,
      video: `videos/${folder}/ep${ep}.mp4`,
      smartlink: `${SMARTLINK_URL}&ref=${encodeURIComponent(slug)}-ep${ep}`,
    };
  });
}

function getDetailData(slug) {
  if (state.detailsCache.has(slug)) {
    return state.detailsCache.get(slug);
  }

  const data = {
    title: `Urutan ${slug}`,
    subtitle: "Detail view untuk daftar episode 1 sampai 7.",
    desc: "Halaman ini menampilkan video player di atas daftar episode. Setiap episode punya video berbeda, dan tombol episode juga bisa menjadi slot smartlink.",
    episodes: buildEpisodeList(slug),
    poster: `assets/poster.jpg`,
  };

  if (slug === "3-627") {
    data.title = "Urutan 3-627";
    data.subtitle = "Detail view untuk range katalog yang lebih besar.";
    data.desc = "Gunakan halaman ini untuk menaruh daftar episode, klip, atau link tujuan lain sesuai struktur katalog Anda.";
  } else if (slug === "Prime Pack") {
    data.title = "Prime Pack";
    data.subtitle = "Koleksi kurasi dengan CTA cepat.";
    data.desc = "Anda bisa menjadikan halaman detail ini sebagai landing page untuk smartlink, episode, atau katalog premium.";
  } else if (slug === "Hot Picks") {
    data.title = "Hot Picks";
    data.subtitle = "Konten populer dengan jalur tonton yang kuat.";
    data.desc = "Semua tombol episode di sini mengarah ke placeholder smartlink agar mudah diganti nanti.";
  } else if (slug === "Night Mode") {
    data.title = "Night Mode";
    data.subtitle = "Sangat cocok untuk konten dengan visual gelap.";
    data.desc = "Layout ini memanfaatkan kartu neon dan grid adaptif untuk pengalaman mobile yang luwes.";
  } else if (slug === "Fresh Drop") {
    data.title = "Fresh Drop";
    data.subtitle = "Update terbaru yang enak dipindai.";
    data.desc = "Taruh episode terbaru, trailer, atau konten baru di bawah halaman detail ini.";
  } else if (slug === "Daily Mix") {
    data.title = "Daily Mix";
    data.subtitle = "Campuran konten harian.";
    data.desc = "Tata letak detail dibuat fleksibel supaya mudah diisi data katalog apa pun.";
  } else if (slug === "Top 10") {
    data.title = "Top 10";
    data.subtitle = "Daftar favorit yang paling sering dibuka.";
    data.desc = "Halaman ini bisa menjadi pintu masuk bagi tombol CTA yang paling penting.";
  }

  state.detailsCache.set(slug, data);
  return data;
}

function getRoute() {
  const raw = location.hash.replace(/^#\/?/, "");
  if (!raw || raw === "home") return { name: "home" };
  const [name, slug] = raw.split("/");
  if (name === "detail" && slug) return { name: "detail", slug: decodeURIComponent(slug) };
  if (name === "urutan" || name === "terbaru") return { name };
  return { name: "home" };
}

function navigate(route) {
  location.hash = `#/${route}`;
  closeSidebar();
}

function triggerPopunderOnce() {
  // POPUNDER SLOT: aktif sekali saat interaksi pertama pengguna
  if (state.popunderTriggered) return;
  state.popunderTriggered = true;

  if (!POPUNDER_URL || POPUNDER_URL.includes("example.com")) return;

  const popup = window.open(POPUNDER_URL, "_blank", "noopener,noreferrer");
  if (popup) {
    try {
      popup.blur();
      window.focus();
    } catch (_) {
      // noop
    }
  }
}

function openSidebar() {
  sidebar.classList.add("open");
  backdrop.classList.add("show");
  sidebar.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar.classList.remove("open");
  backdrop.classList.remove("show");
  sidebar.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function isCooldownActive() {
  return Date.now() < state.cooldownUntil;
}

function getRemainingSeconds() {
  return Math.max(0, Math.ceil((state.cooldownUntil - Date.now()) / 1000));
}

function setCooldownUntil(ts) {
  state.cooldownUntil = ts;
  localStorage.setItem(STORAGE_KEY, String(ts));
}

function ensureOverlay() {
  if (!state.overlay) {
    state.overlay = document.createElement("div");
    state.overlay.className = "smartlink-overlay";
    state.overlay.innerHTML = `
      <strong>Smartlink sedang jeda</strong>
      <p>Aktif kembali dalam <span class="count" id="smartlink-count">20</span> detik.</p>
    `;
    document.body.appendChild(state.overlay);
  }

  state.overlay.classList.add("show");
  const count = state.overlay.querySelector("#smartlink-count");
  if (count) count.textContent = String(getRemainingSeconds());
}

function hideOverlay() {
  if (!state.overlay) return;
  state.overlay.classList.remove("show");
}

function updateSmartlinkStates() {
  const locked = isCooldownActive();
  document.querySelectorAll("[data-smartlink]").forEach((el) => {
    const hasVideo = el.hasAttribute("data-video");
    const onlySmartlink = !hasVideo;

    if (onlySmartlink) {
      el.classList.toggle("is-locked", locked);
      if (el instanceof HTMLButtonElement) {
        el.disabled = locked;
      } else {
        if (locked) {
          el.setAttribute("aria-disabled", "true");
          el.setAttribute("tabindex", "-1");
        } else {
          el.removeAttribute("aria-disabled");
          el.removeAttribute("tabindex");
        }
      }
    } else {
      el.classList.toggle("is-locked", locked);
    }
  });
}

function startCooldown() {
  setCooldownUntil(Date.now() + SMARTLINK_COOLDOWN_MS);
  updateSmartlinkStates();
  ensureOverlay();

  if (state.cooldownTimer) clearInterval(state.cooldownTimer);

  state.cooldownTimer = setInterval(() => {
    if (!isCooldownActive()) {
      clearInterval(state.cooldownTimer);
      state.cooldownTimer = null;
      hideOverlay();
      updateSmartlinkStates();
      return;
    }
    ensureOverlay();
  }, 1000);
}

function openSmartlink(url) {
  if (!url || isCooldownActive()) return;

  startCooldown();

  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    location.href = url;
  }
}

function syncActiveNav(route) {
  document.querySelectorAll("[data-route]").forEach((el) => {
    const target = el.getAttribute("data-route");
    const isActive =
      (route.name === "home" && target === "home") ||
      (route.name === "urutan" && target === "urutan") ||
      (route.name === "terbaru" && target === "terbaru") ||
      (route.name === "detail" && target === `detail/${route.slug}`);

    el.classList.toggle("active", Boolean(isActive));
  });
}

function renderHome() {
  const cards = catalog.recommendations.map((item) => `
    <article class="card" data-route="detail/${item.slug}">
      <div class="card__top">
        <span class="card__tag">${item.tag}</span>
        <span class="card__number">${item.number}</span>
      </div>
      <h3 class="card__title">${item.title}</h3>
      <p class="card__text">${item.desc}</p>
      <div class="card__bottom">
        <span class="glow-dot" aria-hidden="true"></span>
        <!-- SMARTLINK SLOT -->
        <button class="card-btn primary smartlink-slot" type="button" data-slot="smartlink" data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(item.slug)}">Tonton -></button>
      </div>
    </article>
  `).join("");

  return `
    <section class="view active" data-view="home">
      <div class="hero">
        <div class="hero__main">
          <div class="hero__badge-row">
            <span class="badge"><strong>LIVE</strong> Catalog SPA</span>
            <span class="badge"><strong>Responsive</strong> Mobile Ready</span>
            <span class="badge badge--status"><strong>ON</strong> Monetization Slot</span>
            <span class="badge"><strong>SMARTLINK</strong> SLOT</span>
          </div>

          <h1 class="hero__title">
            ENJOY WATCH
            <span>ZEEL.FEX</span>
          </h1>

          <p class="hero__desc">
            KETERANGAN.... Tempatkan katalog video, episode, atau koleksi konten dalam satu halaman SPA yang smooth, cepat, dan siap dikembangkan.
          </p>

          <div class="hero__actions">
            <button class="action-btn primary" type="button" data-route="urutan">Urutan</button>
            <button class="action-btn secondary" type="button" data-route="terbaru">Terbaru</button>
            <!-- SMARTLINK SLOT -->
            <button class="action-btn smartlink-slot" type="button" data-slot="smartlink" data-smartlink="${SMARTLINK_URL}&ref=hero-main">Lanjut -></button>
          </div>

          <div class="banner">
            <div class="banner__copy">
              <h3>Kontrol penuh di satu layar</h3>
              <p>
                Navigasi tanpa reload, sidebar overlay, kartu video interaktif, dan tombol tujuan yang dapat diarahkan ke smartlink.
              </p>
            </div>

            <div class="banner__cta">
              <button class="quick-btn primary" type="button" data-route="detail/1-102">Urutan-1-102</button>
              <button class="quick-btn secondary" type="button" data-route="detail/3-627">Urutan-3-627</button>
              <!-- SMARTLINK SLOT -->
              <button class="quick-btn smartlink-slot" type="button" data-slot="smartlink" data-smartlink="${SMARTLINK_URL}&ref=quick-cta">Tonton -></button>
            </div>
          </div>
        </div>

        <aside class="hero__side">
          <div class="stats">
            <div class="stat">
              <strong>SPA</strong>
              <span>Routing hash, tanpa reload halaman</span>
            </div>
            <div class="stat">
              <strong>Neon</strong>
              <span>Border mint-cyan dengan glow halus</span>
            </div>
            <div class="stat">
              <strong>Popunder</strong>
              <span>Aktif sekali pada klik pertama</span>
              <small>POPUNDER SLOT</small>
            </div>
            <div class="stat">
              <strong>Ad Ready</strong>
              <span>Smartlink aktif di tombol aksi</span>
              <small>SMARTLINK SLOT</small>
            </div>
          </div>
        </aside>
      </div>

      <section class="section">
        <div class="section__head">
          <div>
            <h2 class="section__title">Rekomendasi</h2>
            <p class="section__subtitle">Daftar kartu video/konten dengan CTA cepat.</p>
          </div>
          <button class="section__action" type="button" data-route="terbaru">Lihat semua -></button>
        </div>

        <div class="grid cards">
          ${cards}
        </div>
      </section>
    </section>
  `;
}

function renderUrutan() {
  const buttons = catalog.categories.map((item) => `
    <article class="card" data-route="detail/${item.slug}">
      <div class="card__top">
        <span class="card__tag">Urutan</span>
        <span class="card__number">${item.title}</span>
      </div>
      <h3 class="card__title">${item.title}</h3>
      <p class="card__text">${item.desc}</p>
      <div class="card__bottom">
        <span class="glow-dot" aria-hidden="true"></span>
        <!-- SMARTLINK SLOT -->
        <button class="card-btn primary smartlink-slot" type="button" data-slot="smartlink" data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(item.slug)}-lanjut">Lanjut -></button>
      </div>
    </article>
  `).join("");

  return `
    <section class="view active" data-view="urutan">
      <div class="section">
        <div class="section__head">
          <div>
            <h2 class="section__title">Urutan View</h2>
            <p class="section__subtitle">Halaman daftar kategori/rentang nomor dengan grid tombol interaktif.</p>
          </div>
          <button class="section__action" type="button" data-route="home">Kembali Home -></button>
        </div>

        <div class="grid categories">
          ${buttons}
        </div>
      </div>
    </section>
  `;
}

function renderTerbaru() {
  const rows = catalog.latest.map((item) => `
    <article class="update-item">
      <div class="update-item__left">
        <h3 class="update-item__title">${item.title}</h3>
        <p class="update-item__desc">${item.desc}</p>
        <span class="update-item__meta">Update terbaru • SPA route: ${item.route}</span>
      </div>
      <!-- SMARTLINK SLOT -->
      <button class="action-btn primary smartlink-slot" type="button" data-slot="smartlink" data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(item.title)}">Tonton -></button>
    </article>
  `).join("");

  return `
    <section class="view active" data-view="terbaru">
      <div class="section">
        <div class="section__head">
          <div>
            <h2 class="section__title">Terbaru View</h2>
            <p class="section__subtitle">Daftar update konten terbaru dengan tombol Tonton ->.</p>
          </div>
          <button class="section__action" type="button" data-route="urutan">Buka Urutan -></button>
        </div>

        <div class="grid updates">
          ${rows}
        </div>
      </div>
    </section>
  `;
}

function renderDetail(slug) {
  const data = getDetailData(slug);
  const episodes = data.episodes.map((ep) => `
    <!-- SMARTLINK SLOT + VIDEO SLOT -->
    <button
      class="episode-btn primary smartlink-slot"
      type="button"
      data-slot="smartlink-video"
      data-video="${ep.video}"
      data-smartlink="${ep.smartlink}"
    >
      <strong>EP ${ep.ep}</strong>
      <span>${ep.label}</span>
      <span class="episode-chip">VIDEO + SMARTLINK</span>
    </button>
  `).join("");

  const poster = data.poster || "assets/poster.jpg";

  return `
    <section class="view active" data-view="detail">
      <div class="detail-box">
        <div class="detail-head">
          <div class="detail-head__chips">
            <span class="badge"><strong>Detail</strong> View</span>
            <span class="badge"><strong>${slug}</strong></span>
            <span class="slot-badge video-slot__marker"><strong>VIDEO</strong></span>
            <span class="slot-badge smartlink-slot"><strong>SMARTLINK</strong></span>
          </div>
          <h2>${data.title}</h2>
          <p>${data.subtitle}</p>
          <p>${data.desc}</p>
        </div>

        <!-- VIDEO SLOT -->
        <div class="video-player">
          <div class="video-player__shell">
            <div class="video-player__header">
              <div class="video-slot__label">
                <span class="slot-badge video-slot__marker"><strong>VIDEO</strong> SLOT</span>
              </div>
              <p>Klik episode untuk mengganti video tanpa reload.</p>
            </div>

            <video
              id="mainVideo"
              class="video-player__element"
              controls
              playsinline
              preload="metadata"
              poster="${poster}"
            >
              <source src="${data.episodes[0].video}" type="video/mp4" />
              Browser kamu tidak mendukung video player.
            </video>
          </div>
        </div>

        <div class="episode-grid">
          ${episodes}
        </div>

        <div class="detail-actions">
          <!-- SMARTLINK SLOT -->
          <button class="action-btn primary smartlink-slot" type="button" data-slot="smartlink" data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(slug)}-main">Lanjut -></button>
          <button class="action-btn secondary" type="button" data-route="terbaru">Terbaru</button>
          <button class="action-btn" type="button" data-route="home">Home</button>
        </div>
      </div>
    </section>
  `;
}

function render() {
  const route = getRoute();
  let html = "";

  if (route.name === "urutan") {
    html = renderUrutan();
  } else if (route.name === "terbaru") {
    html = renderTerbaru();
  } else if (route.name === "detail") {
    html = renderDetail(route.slug);
  } else {
    html = renderHome();
  }

  app.innerHTML = html;
  syncActiveNav(route);
  updateSmartlinkStates();
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (!state.firstRenderDone) {
    state.firstRenderDone = true;
    setTimeout(() => loader.classList.add("hide"), 850);
  }
}

function updateVideoSource(videoUrl) {
  if (!videoUrl) return false;

  const video = document.getElementById("mainV
