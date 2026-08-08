/* 
  Ganti placeholder di bawah dengan URL monetisasi asli Anda.
  - SMARTLINK_URL: tautan tujuan tombol "Lanjut" / "Tonton"
  - POPUNDER_URL : tautan popunder / ad network Anda
*/
const SMARTLINK_URL = "https://example.com/smartlink?utm_source=enjoywatch";
const POPUNDER_URL = "https://example.com/popunder?utm_source=enjoywatch";

const app = document.getElementById("app");
const loader = document.getElementById("loader");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("backdrop");

const state = {
  popunderReady: true, // Untuk jeda 25 detik popunder
  smartlinkReady: true, // Untuk jeda 20 detik smartlink
  firstRenderDone: false,
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
  details: {
    "1-102": {
      title: "Urutan 1-102",
      subtitle: "Detail view untuk daftar episode 1 sampai 7.",
      desc: "Halaman ini menampilkan tombol episode dalam grid responsif. Tinggal ganti URL tujuan tiap episode sesuai kebutuhan katalog Anda.",
      episodes: [
        { ep: 1, label: "Bagian 1", url: `${SMARTLINK_URL}&ref=1-102-ep1`, src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep1.mp4" },
        { ep: 2, label: "Bagian 2", url: `${SMARTLINK_URL}&ref=1-102-ep2`, src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep2.mp4" },
        { ep: 3, label: "Bagian 3", url: `${SMARTLINK_URL}&ref=1-102-ep3`, src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep3.mp4" },
        { ep: 4, label: "Bagian 4", url: `${SMARTLINK_URL}&ref=1-102-ep4`, src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep4.mp4" },
        { ep: 5, label: "Bagian 5", url: `${SMARTLINK_URL}&ref=1-102-ep5`, src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep5.mp4" },
        { ep: 6, label: "Bagian 6", url: `${SMARTLINK_URL}&ref=1-102-ep6`, src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep6.mp4" },
        { ep: 7, label: "Bagian 7", url: `${SMARTLINK_URL}&ref=1-102-ep7`, src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep7.mp4" },
      ],
    },
    "3-627": {
      title: "Urutan 3-627",
      subtitle: "Detail view untuk range katalog yang lebih besar.",
      desc: "Gunakan halaman ini untuk menaruh daftar episode, klip, atau link tujuan lain sesuai struktur katalog Anda.",
      episodes: [
        { ep: 1, label: "Bagian 1", url: `${SMARTLINK_URL}&ref=3-627-ep1`, src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep1.mp4" },
        { ep: 2, label: "Bagian 2", url: `${SMARTLINK_URL}&ref=3-627-ep2`, src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep2.mp4" },
        { ep: 3, label: "Bagian 3", url: `${SMARTLINK_URL}&ref=3-627-ep3`, src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep3.mp4" },
        { ep: 4, label: "Bagian 4", url: `${SMARTLINK_URL}&ref=3-627-ep4`, src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep4.mp4" },
        { ep: 5, label: "Bagian 5", url: `${SMARTLINK_URL}&ref=3-627-ep5`, src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep5.mp4" },
        { ep: 6, label: "Bagian 6", url: `${SMARTLINK_URL}&ref=3-627-ep6`, src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep6.mp4" },
        { ep: 7, label: "Bagian 7", url: `${SMARTLINK_URL}&ref=3-627-ep7`, src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep7.mp4" },
      ],
    },
    "Prime Pack": {
      title: "Prime Pack",
      subtitle: "Koleksi kurasi dengan CTA cepat.",
      desc: "Anda bisa menjadikan halaman detail ini sebagai landing page untuk smartlink, episode, atau katalog premium.",
      episodes: makeEpisodeList("Prime Pack"),
    },
    "Hot Picks": {
      title: "Hot Picks",
      subtitle: "Konten populer dengan jalur tonton yang kuat.",
      desc: "Semua tombol episode di sini mengarah ke placeholder smartlink agar mudah diganti nanti.",
      episodes: makeEpisodeList("Hot Picks"),
    },
    "Night Mode": {
      title: "Night Mode",
      subtitle: "Sangat cocok untuk konten dengan visual gelap.",
      desc: "Layout ini memanfaatkan kartu neon dan grid adaptif untuk pengalaman mobile yang luwes.",
      episodes: makeEpisodeList("Night Mode"),
    },
    "Fresh Drop": {
      title: "Fresh Drop",
      subtitle: "Update terbaru yang enak dipindai.",
      desc: "Taruh episode terbaru, trailer, atau konten baru di bawah halaman detail ini.",
      episodes: makeEpisodeList("Fresh Drop"),
    },
    "Daily Mix": {
      title: "Daily Mix",
      subtitle: "Campuran konten harian.",
      desc: "Tata letak detail dibuat fleksibel supaya mudah diisi data katalog apa pun.",
      episodes: makeEpisodeList("Daily Mix"),
    },
    "Top 10": {
      title: "Top 10",
      subtitle: "Daftar favorit yang paling sering dibuka.",
      desc: "Halaman ini bisa menjadi pintu masuk bagi tombol CTA yang paling penting.",
      episodes: makeEpisodeList("Top 10"),
    },
  }
};

function makeEpisodeList(slug) {
  return Array.from({ length: 7 }, (_, i) => {
    const ep = i + 1;
    return {
      ep,
      label: `Bagian ${ep}`,
      url: `${SMARTLINK_URL}&ref=${encodeURIComponent(slug)}-ep${ep}`,
      src: `https://raw.githubusercontent.com/username/repo/main/${slug}-ep${ep}.mp4` // Link video GitHub kamu
    };
  });
}

function getRoute() {
  const raw = location.hash.replace(/^#\/?/, "");
  if (!raw || raw === "home") return { name: "home" };
  const [name, slug] = raw.split("/");
  if (name === "detail" && slug) return { name: "detail", slug };
  if (name === "urutan" || name === "terbaru") return { name };
  return { name: "home" };
}

function navigate(route) {
  location.hash = `#/${route}`;
  closeSidebar();
}

function triggerPopunder() {
  // Jika jeda 25 detik belum selesai, hentikan fungsi
  if (!state.popunderReady) return;

  // Eksekusi popunder
  // Catatan: "noopener,noreferrer" dipertahankan demi keamanan (URL iklan
  // pihak ketiga tidak bisa mengontrol tab ini lewat window.opener). Efek
  // sampingnya, window.open() akan mengembalikan null di banyak browser
  // modern, jadi trik blur()/focus() untuk "menyembunyikan" tab baru di
  // belakang tidak bisa diandalkan lagi -- kalau efek itu wajib ada, flag
  // noopener/noreferrer perlu dilepas dengan risiko keamanan di atas.
  if (POPUNDER_URL && !POPUNDER_URL.includes("example.com")) {
    window.open(POPUNDER_URL, "_blank", "noopener,noreferrer");
  }

  // Iklan aktif, mulai jeda 25 detik
  state.popunderReady = false;
  setTimeout(() => {
    state.popunderReady = true; // Setelah 25 detik, iklan siap lagi
  }, 25000);
}

function openSmartlink(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
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
        <button class="card-btn primary" type="button" data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(item.slug)}">Tonton -></button>
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
            <button class="action-btn" type="button" data-smartlink="${SMARTLINK_URL}&ref=hero-main">Lanjut -></button>
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
              <button class="quick-btn" type="button" data-smartlink="${SMARTLINK_URL}&ref=quick-cta">Tonton -></button>
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
              <strong>Fast</strong>
              <span>Render ringan dan mudah dimodifikasi</span>
            </div>
            <div class="stat">
              <strong>Ad Ready</strong>
              <span>Slot popunder dan smartlink siap pakai</span>
            </div>
          </div>

          <div class="ad-slot">
            <strong>Slot Monetisasi</strong>
            <p>Pasang script ad network Anda di sini, atau gunakan area CTA untuk smartlink agar lebih natural.</p>
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
        <button class="card-btn primary" type="button">Lanjut -></button>
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

        <div class="ad-slot">
          <strong>Smartlink Placeholder</strong>
          <p>Setiap tombol bisa diarahkan ke smartlink iklan atau halaman detail katalog sesuai strategi monetisasi Anda.</p>
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
      <button class="action-btn primary" type="button" data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(item.title)}">Tonton -></button>
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

        <div class="ad-slot">
          <strong>Integrasi Iklan</strong>
          <p>Struktur ini cocok untuk menaruh native ad, smartlink, atau tombol interstitial sesuai provider iklan Anda.</p>
        </div>
      </div>
    </section>
  `;
}

function renderDetail(slug) {
  const data = catalog.details[slug] || {
    title: `Urutan ${slug}`,
    subtitle: "Detail view generik",
    desc: "Gunakan template ini untuk membuat halaman episode dengan rute yang berbeda.",
    episodes: makeEpisodeList(slug),
  };

  const episodes = data.episodes.map((ep) => `
    <button class="episode-btn primary" type="button" data-smartlink="${ep.url}" data-src="${ep.src}">
      <strong>EP ${ep.ep}</strong>
      <span>${ep.label}</span>
    </button>
  `).join("");

  return `
    <section class="view active" data-view="detail">
      <div class="detail-box">
        <div class="detail-head">
          <div class="badge-row">
            <span class="badge"><strong>Detail</strong> View</span>
            <span class="badge"><strong>${slug}</strong></span>
          </div>
          <h2>${data.title}</h2>
          <p>${data.subtitle}</p>
          <p>${data.desc}</p>
        </div>

        <div class="episode-grid">
          ${episodes}
        </div>

        <div class="detail-actions">
          <button class="action-btn primary" type="button" data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(slug)}-main">Lanjut -></button>
          <button class="action-btn secondary" type="button" data-route="terbaru">Terbaru</button>
          <button class="action-btn" type="button" data-route="home">Home</button>
        </div>

        <div class="ad-slot">
          <strong>Slot Episode</strong>
          <p>Setiap tombol episode bisa diarahkan ke link tujuan berbeda. Tinggal update URL di array data JavaScript.</p>
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

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (!state.firstRenderDone) {
    state.firstRenderDone = true;
    setTimeout(() => loader.classList.add("hide"), 850);
  }
}

function syncActiveNav(route) {
  const links = document.querySelectorAll("[data-route]");
  links.forEach((el) => {
    const target = el.getAttribute("data-route");
    const isActive =
      (route.name === "home" && target === "home") ||
      (route.name === "urutan" && target === "urutan") ||
      (route.name === "terbaru" && target === "terbaru") ||
      (route.name === "detail" && target === `detail/${route.slug}`);
    el.classList.toggle("active", Boolean(isActive));
  });
}

document.addEventListener("click", (event) => {
  const routeEl = event.target.closest("[data-route]");
  const smartlinkEl = event.target.closest("[data-smartlink]");
  const episodeBtn = event.target.closest(".episode-btn"); // Deteksi khusus tombol episode
  const openSidebarBtn = event.target.closest("[data-toggle-sidebar]");
  const closeSidebarBtn = event.target.closest("[data-close-sidebar]");

  if (openSidebarBtn) {
    openSidebar();
    return;
  }

  if (closeSidebarBtn) {
    closeSidebar();
    return;
  }

  // Setiap kali ada klik pada area konten/tombol, cek dan panggil popunder (Popunder akan mengecek sendiri apakah jeda 25 detik sudah selesai)
  if (routeEl || smartlinkEl || episodeBtn) {
    triggerPopunder();
  }

  // --- LOGIKA SMARTLINK & EPISODE ---
  // Siklusnya: klik pertama -> smartlink siap -> buka iklan, mulai jeda 20 detik.
  // Klik berikutnya SELAGI jeda -> iklan dilewati, langsung 
