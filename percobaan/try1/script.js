/*
  ENJOY WATCH - ZEEL.FEX
  SPA Streaming / Catalog

  MONETIZATION:
  - SMARTLINK_URL : URL Smartlink untuk tombol Lanjut / Tonton / Episode
  - POPUNDER_URL  : URL Popunder jika provider menggunakan URL trigger langsung

  VIDEO:
  - Setiap episode mempunyai property "src"
  - src harus berupa direct URL video .mp4 yang dapat diakses browser
  - Video diputar di player halaman, tidak membuka tab baru
*/

const SMARTLINK_URL = "https://ignoringexcepting.com/tirmtkpyi?key=f05059565202e05f940b6a84b893c584/smartlink?utm_source=enjoywatch";

/*
  Jika Popunder provider Anda menggunakan script <script src="..."></script>
  di <head>, provider tersebut dapat berjalan sendiri.
  
  Jika provider memberikan URL Popunder langsung, masukkan URL tersebut di sini.
*/
const POPUNDER_URL = "https://example.com/popunder?utm_source=enjoywatch";

const SMARTLINK_COOLDOWN_MS = 20000;
const POPUNDER_COOLDOWN_MS = 25000;

const app = document.getElementById("app");
const loader = document.getElementById("loader");
const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("backdrop");

const state = {
  popunderReady: true,
  smartlinkReady: true,
  firstRenderDone: false,
  currentEpisode: null
};


/* =========================================================
   CATALOG
   ========================================================= */

const catalog = {

  recommendations: [
    {
      slug: "1-102",
      title: "1-102 Collection",
      tag: "Rekomendasi",
      number: "1 sampai 102",
      desc: "Pilihan utama dengan episode yang paling sering dibuka. Cocok untuk pintasan cepat ke konten populer."
    },
    {
      slug: "3-627",
      title: "3-627 Vault",
      tag: "Trending",
      number: "3 sampai 627",
      desc: "Katalog lanjutan untuk pengguna yang suka jelajah lebih dalam. Desain tombol dibuat padat dan cepat."
    },
    {
      slug: "Prime Pack",
      title: "Prime Pack",
      tag: "Baru",
      number: "Update harian",
      desc: "Kumpulan konten terbaru dengan jalur cepat ke halaman tonton. Siap dipoles ke feed update."
    },
    {
      slug: "Hot Picks",
      title: "Hot Picks",
      tag: "Populer",
      number: "Pilihan editor",
      desc: "Kartu-kartu utama dengan aksen neon dan CTA yang menonjol. Mantap untuk homepage hero section."
    },
    {
      slug: "Night Mode",
      title: "Night Mode",
      tag: "Cinematic",
      number: "Visual gelap",
      desc: "Nuansa gelap elegan dengan border gradasi mint-cyan untuk kesan modern dan premium."
    },
    {
      slug: "Fresh Drop",
      title: "Fresh Drop",
      tag: "Terbaru",
      number: "Konten segar",
      desc: "Langsung arahkan ke daftar update terbaru, ideal untuk pengguna yang suka konten baru."
    }
  ],


  categories: [
    {
      slug: "1-102",
      title: "1-102",
      desc: "Grid episode utama"
    },
    {
      slug: "3-627",
      title: "3-627",
      desc: "Rentang katalog besar"
    },
    {
      slug: "Prime Pack",
      title: "Prime Pack",
      desc: "Paket pilihan"
    },
    {
      slug: "Hot Picks",
      title: "Hot Picks",
      desc: "Tontonan populer"
    },
    {
      slug: "Night Mode",
      title: "Night Mode",
      desc: "Tema sinematik"
    },
    {
      slug: "Fresh Drop",
      title: "Fresh Drop",
      desc: "Update terbaru"
    },
    {
      slug: "Daily Mix",
      title: "Daily Mix",
      desc: "Campuran harian"
    },
    {
      slug: "Top 10",
      title: "Top 10",
      desc: "Daftar teratas"
    }
  ],


  latest: [
    {
      title: "Episode 7 - Fresh Drop",
      desc: "Update paling baru dengan CTA Tonton -> menuju smartlink.",
      route: "detail/1-102"
    },
    {
      title: "Episode 6 - Prime Pack",
      desc: "Masuk ke detail koleksi dan pilih bagian favorit Anda.",
      route: "detail/3-627"
    },
    {
      title: "Episode 5 - Night Mode",
      desc: "Navigasi cepat ke konten dengan tampilan gelap yang tajam.",
      route: "detail/1-102"
    },
    {
      title: "Episode 4 - Hot Picks",
      desc: "Kartu update dibuat lebih ringkas dan cocok untuk mobile.",
      route: "detail/3-627"
    },
    {
      title: "Episode 3 - Daily Mix",
      desc: "Tambahkan lebih banyak item sesuai katalog Anda nanti.",
      route: "detail/1-102"
    }
  ],


  details: {

    "1-102": {
      title: "Urutan 1-102",
      subtitle: "Detail view untuk daftar episode 1 sampai 7.",
      desc: "Halaman ini menampilkan tombol episode dalam grid responsif. Tinggal ganti URL video dan Smartlink tiap episode sesuai kebutuhan katalog.",

      episodes: [
        {
          ep: 1,
          label: "Bagian 1",
          url: `${SMARTLINK_URL}&ref=1-102-ep1`,
          src: "https://zee-brade.github.io/zee-brade/percobaanzee-brade.github.io/zee-brade/percobaan/Screenrecorder-2026-07-06-06-33-56-618.mp4"
        },
        {
          ep: 2,
          label: "Bagian 2",
          url: `${SMARTLINK_URL}&ref=1-102-ep2`,
          src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep2.mp4"
        },
        {
          ep: 3,
          label: "Bagian 3",
          url: `${SMARTLINK_URL}&ref=1-102-ep3`,
          src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep3.mp4"
        },
        {
          ep: 4,
          label: "Bagian 4",
          url: `${SMARTLINK_URL}&ref=1-102-ep4`,
          src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep4.mp4"
        },
        {
          ep: 5,
          label: "Bagian 5",
          url: `${SMARTLINK_URL}&ref=1-102-ep5`,
          src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep5.mp4"
        },
        {
          ep: 6,
          label: "Bagian 6",
          url: `${SMARTLINK_URL}&ref=1-102-ep6`,
          src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep6.mp4"
        },
        {
          ep: 7,
          label: "Bagian 7",
          url: `${SMARTLINK_URL}&ref=1-102-ep7`,
          src: "https://raw.githubusercontent.com/username/repo/main/1-102-ep7.mp4"
        }
      ]
    },


    "3-627": {
      title: "Urutan 3-627",
      subtitle: "Detail view untuk range katalog yang lebih besar.",
      desc: "Gunakan halaman ini untuk menaruh daftar episode, klip, atau link tujuan lain sesuai struktur katalog Anda.",

      episodes: [
        {
          ep: 1,
          label: "Bagian 1",
          url: `${SMARTLINK_URL}&ref=3-627-ep1`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep1.mp4"
        },
        {
          ep: 2,
          label: "Bagian 2",
          url: `${SMARTLINK_URL}&ref=3-627-ep2`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep2.mp4"
        },
        {
          ep: 3,
          label: "Bagian 3",
          url: `${SMARTLINK_URL}&ref=3-627-ep3`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep3.mp4"
        },
        {
          ep: 4,
          label: "Bagian 4",
          url: `${SMARTLINK_URL}&ref=3-627-ep4`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep4.mp4"
        },
        {
          ep: 5,
          label: "Bagian 5",
          url: `${SMARTLINK_URL}&ref=3-627-ep5`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep5.mp4"
        },
        {
          ep: 6,
          label: "Bagian 6",
          url: `${SMARTLINK_URL}&ref=3-627-ep6`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep6.mp4"
        },
        {
          ep: 7,
          label: "Bagian 7",
          url: `${SMARTLINK_URL}&ref=3-627-ep7`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep7.mp4"
        }
      ]
    },


    "Prime Pack": {
      title: "Prime Pack",
      subtitle: "Koleksi kurasi dengan CTA cepat.",
      desc: "Anda bisa menjadikan halaman detail ini sebagai landing page untuk smartlink, episode, atau katalog premium.",

      episodes: [
        {
          ep: 1,
          label: "Bagian 1",
          url: `${SMARTLINK_URL}&ref=Prime-Pack-ep1`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep1.mp4"
        },
        {
          ep: 2,
          label: "Bagian 2",
          url: `${SMARTLINK_URL}&ref=Prime-Pack-ep2`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep2.mp4"
        },
        {
          ep: 3,
          label: "Bagian 3",
          url: `${SMARTLINK_URL}&ref=Prime-Pack-ep3`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep3.mp4"
        },
        {
          ep: 4,
          label: "Bagian 4",
          url: `${SMARTLINK_URL}&ref=Prime-Pack-ep4`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep4.mp4"
        },
        {
          ep: 5,
          label: "Bagian 5",
          url: `${SMARTLINK_URL}&ref=Prime-Pack-ep5`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep5.mp4"
        },
        {
          ep: 6,
          label: "Bagian 6",
          url: `${SMARTLINK_URL}&ref=Prime-Pack-ep6`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep6.mp4"
        },
        {
          ep: 7,
          label: "Bagian 7",
          url: `${SMARTLINK_URL}&ref=Prime-Pack-ep7`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep7.mp4"
        }
      ]
    },


    "Hot Picks": {
      title: "Hot Picks",
      subtitle: "Konten populer dengan jalur tonton yang kuat.",
      desc: "Semua tombol episode di sini mengarah ke Smartlink dan masing-masing memiliki video sendiri.",

      episodes: [
        {
          ep: 1,
          label: "Bagian 1",
          url: `${SMARTLINK_URL}&ref=Hot-Picks-ep1`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep1.mp4"
        },
        {
          ep: 2,
          label: "Bagian 2",
          url: `${SMARTLINK_URL}&ref=Hot-Picks-ep2`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep2.mp4"
        },
        {
          ep: 3,
          label: "Bagian 3",
          url: `${SMARTLINK_URL}&ref=Hot-Picks-ep3`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep3.mp4"
        },
        {
          ep: 4,
          label: "Bagian 4",
          url: `${SMARTLINK_URL}&ref=Hot-Picks-ep4`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep4.mp4"
        },
        {
          ep: 5,
          label: "Bagian 5",
          url: `${SMARTLINK_URL}&ref=Hot-Picks-ep5`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep5.mp4"
        },
        {
          ep: 6,
          label: "Bagian 6",
          url: `${SMARTLINK_URL}&ref=Hot-Picks-ep6`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep6.mp4"
        },
        {
          ep: 7,
          label: "Bagian 7",
          url: `${SMARTLINK_URL}&ref=Hot-Picks-ep7`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep7.mp4"
        }
      ]
    },


    "Night Mode": {
      title: "Night Mode",
      subtitle: "Sangat cocok untuk konten dengan visual gelap.",
      desc: "Layout ini memanfaatkan kartu neon dan grid adaptif untuk pengalaman mobile yang luwes.",
      episodes: makeEpisodeList("Night Mode")
    },


    "Fresh Drop": {
      title: "Fresh Drop",
      subtitle: "Update terbaru yang enak dipindai.",
      desc: "Taruh episode terbaru, trailer, atau konten baru di bawah halaman detail ini.",

      episodes: [
        {
          ep: 1,
          label: "Bagian 1",
          url: `${SMARTLINK_URL}&ref=Fresh-Drop-ep1`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep1.mp4"
        },
        {
          ep: 2,
          label: "Bagian 2",
          url: `${SMARTLINK_URL}&ref=Fresh-Drop-ep2`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep2.mp4"
        },
        {
          ep: 3,
          label: "Bagian 3",
          url: `${SMARTLINK_URL}&ref=Fresh-Drop-ep3`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep3.mp4"
        },
        {
          ep: 4,
          label: "Bagian 4",
          url: `${SMARTLINK_URL}&ref=Fresh-Drop-ep4`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep4.mp4"
        },
        {
          ep: 5,
          label: "Bagian 5",
          url: `${SMARTLINK_URL}&ref=Fresh-Drop-ep5`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep5.mp4"
        },
        {
          ep: 6,
          label: "Bagian 6",
          url: `${SMARTLINK_URL}&ref=Fresh-Drop-ep6`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep6.mp4"
        },
        {
          ep: 7,
          label: "Bagian 7",
          url: `${SMARTLINK_URL}&ref=Fresh-Drop-ep7`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep7.mp4"
        }
      ]
    },


    "Daily Mix": {
      title: "Daily Mix",
      subtitle: "Campuran konten harian.",
      desc: "Tata letak detail dibuat fleksibel supaya mudah diisi data katalog apa pun.",

      episodes: [
        {
          ep: 1,
          label: "Bagian 1",
          url: `${SMARTLINK_URL}&ref=Daily-Mix-ep1`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep1.mp4"
        },
        {
          ep: 2,
          label: "Bagian 2",
          url: `${SMARTLINK_URL}&ref=Daily-Mix-ep2`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep2.mp4"
        },
        {
          ep: 3,
          label: "Bagian 3",
          url: `${SMARTLINK_URL}&ref=Daily-Mix-ep3`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep3.mp4"
        },
        {
          ep: 4,
          label: "Bagian 4",
          url: `${SMARTLINK_URL}&ref=Daily-Mix-ep4`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep4.mp4"
        },
        {
          ep: 5,
          label: "Bagian 5",
          url: `${SMARTLINK_URL}&ref=Daily-Mix-ep5`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep5.mp4"
        },
        {
          ep: 6,
          label: "Bagian 6",
          url: `${SMARTLINK_URL}&ref=Daily-Mix-ep6`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep6.mp4"
        },
        {
          ep: 7,
          label: "Bagian 7",
          url: `${SMARTLINK_URL}&ref=Daily-Mix-ep7`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep7.mp4"
        }
      ]
    },


    "Top 10": {
      title: "Top 10",
      subtitle: "Daftar favorit yang paling sering dibuka.",
      desc: "Halaman ini bisa menjadi pintu masuk bagi tombol CTA yang paling penting.",

      episodes: [
        {
          ep: 1,
          label: "Bagian 1",
          url: `${SMARTLINK_URL}&ref=Top-10-ep1`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep1.mp4"
        },
        {
          ep: 2,
          label: "Bagian 2",
          url: `${SMARTLINK_URL}&ref=Top-10-ep2`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep2.mp4"
        },
        {
          ep: 3,
          label: "Bagian 3",
          url: `${SMARTLINK_URL}&ref=Top-10-ep3`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep3.mp4"
        },
        {
          ep: 4,
          label: "Bagian 4",
          url: `${SMARTLINK_URL}&ref=Top-10-ep4`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep4.mp4"
        },
        {
          ep: 5,
          label: "Bagian 5",
          url: `${SMARTLINK_URL}&ref=Top-10-ep5`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep5.mp4"
        },
        {
          ep: 6,
          label: "Bagian 6",
          url: `${SMARTLINK_URL}&ref=Top-10-ep6`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep6.mp4"
        },
        {
          ep: 7,
          label: "Bagian 7",
          url: `${SMARTLINK_URL}&ref=Top-10-ep7`,
          src: "https://raw.githubusercontent.com/username/repo/main/3-627-ep7.mp4"
        }
      ]
    }

  }

};


/* =========================================================
   AUTO EPISODE GENERATOR
   ========================================================= */

function makeEpisodeList(slug) {

  return Array.from({ length: 7 }, (_, i) => {

    const ep = i + 1;

    return {
      ep,
      label: `Bagian ${ep}`,

      url:
        `${SMARTLINK_URL}&ref=${encodeURIComponent(slug)}-ep${ep}`,

      src:
        `https://raw.githubusercontent.com/username/repo/main/${encodeURIComponent(slug)}-ep${ep}.mp4`
    };

  });

}


/* =========================================================
   ROUTER
   ========================================================= */

function getRoute() {

  const raw = location.hash.replace(/^#\/?/, "");

  if (!raw || raw === "home") {
    return {
      name: "home"
    };
  }

  const [name, ...slugParts] = raw.split("/");
  const slug = slugParts.join("/");

  if (name === "detail" && slug) {
    return {
      name: "detail",
      slug
    };
  }

  if (name === "urutan" || name === "terbaru") {
    return {
      name
    };
  }

  return {
    name: "home"
  };

}


function navigate(route) {

  location.hash = `#/${route}`;

  closeSidebar();

}


/* =========================================================
   POPUNDER
   ========================================================= */

function triggerPopunder() {

  if (!state.popunderReady) {
    return;
  }

  if (
    POPUNDER_URL &&
    !POPUNDER_URL.includes("example.com")
  ) {

    window.open(
      POPUNDER_URL,
      "_blank",
      "noopener,noreferrer"
    );

  }

  state.popunderReady = false;

  setTimeout(() => {

    state.popunderReady = true;

  }, POPUNDER_COOLDOWN_MS);

}


/* =========================================================
   SMARTLINK
   ========================================================= */

function openSmartlink(url) {

  if (!url) {
    return;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

}


function triggerSmartlink(url) {

  if (!url) {
    return false;
  }

  if (!state.smartlinkReady) {
    return false;
  }

  openSmartlink(url);

  state.smartlinkReady = false;

  setTimeout(() => {

    state.smartlinkReady = true;

  }, SMARTLINK_COOLDOWN_MS);

  return true;

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function openSidebar() {

  if (!sidebar || !backdrop) {
    return;
  }

  sidebar.classList.add("open");

  backdrop.classList.add("show");

  sidebar.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";

}


function closeSidebar() {

  if (!sidebar || !backdrop) {
    return;
  }

  sidebar.classList.remove("open");

  backdrop.classList.remove("show");

  sidebar.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

  const cards = catalog.recommendations.map((item) => `

    <article
      class="card"
      data-route="detail/${item.slug}"
    >

      <div class="card__top">

        <span class="card__tag">
          ${item.tag}
        </span>

        <span class="card__number">
          ${item.number}
        </span>

      </div>

      <h3 class="card__title">
        ${item.title}
      </h3>

      <p class="card__text">
        ${item.desc}
      </p>

      <div class="card__bottom">

        <span
          class="glow-dot"
          aria-hidden="true"
        ></span>

        <button
          class="card-btn primary"
          type="button"
          data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(item.slug)}"
        >
          Tonton ->
        </button>

      </div>

    </article>

  `).join("");


  return `

    <section
      class="view active"
      data-view="home"
    >

      <div class="hero">

        <div class="hero__main">

          <div class="hero__badge-row">

            <span class="badge">
              <strong>LIVE</strong>
              Catalog SPA
            </span>

            <span class="badge">
              <strong>Responsive</strong>
              Mobile Ready
            </span>

            <span class="badge badge--status">
              <strong>ON</strong>
              Monetization Slot
            </span>

          </div>


          <h1 class="hero__title">

            ENJOY WATCH

            <span>
              ZEEL.FEX
            </span>

          </h1>


          <p class="hero__desc">

            KETERANGAN.... Tempatkan katalog video,
            episode, atau koleksi konten dalam satu
            halaman SPA yang smooth, cepat,
            dan siap dikembangkan.

          </p>


          <div class="hero__actions">

            <button
              class="action-btn primary"
              type="button"
              data-route="urutan"
            >
              Urutan
            </button>

            <button
              class="action-btn secondary"
              type="button"
              data-route="terbaru"
            >
              Terbaru
            </button>

            <button
              class="action-btn"
              type="button"
              data-smartlink="${SMARTLINK_URL}&ref=hero-main"
            >
              Lanjut ->
            </button>

          </div>


          <div class="banner">

            <div class="banner__copy">

              <h3>
                Kontrol penuh di satu layar
              </h3>

              <p>
                Navigasi tanpa reload,
                sidebar overlay, kartu video
                interaktif, dan tombol tujuan
                yang dapat diarahkan ke smartlink.
              </p>

            </div>


            <div class="banner__cta">

              <button
                class="quick-btn primary"
                type="button"
                data-route="detail/1-102"
              >
                Urutan-1-102
              </button>

              <button
                class="quick-btn secondary"
                type="button"
                data-route="detail/3-627"
              >
                Urutan-3-627
              </button>

              <button
                class="quick-btn"
                type="button"
                data-smartlink="${SMARTLINK_URL}&ref=quick-cta"
              >
                Tonton ->
              </button>

            </div>

          </div>

        </div>


        <aside class="hero__side">

          <div class="stats">

            <div class="stat">

              <strong>
                SPA
              </strong>

              <span>
                Routing hash,
                tanpa reload halaman
              </span>

            </div>


            <div class="stat">

              <strong>
                Neon
              </strong>

              <span>
                Border mint-cyan
                dengan glow halus
              </span>

            </div>


            <div class="stat">

              <strong>
                Fast
              </strong>

              <span>
                Render ringan
                dan mudah dimodifikasi
              </span>

            </div>


            <div class="stat">

              <strong>
                Ad Ready
              </strong>

              <span>
                Slot popunder dan
                smartlink siap pakai
              </span>

            </div>

          </div>

        </aside>

      </div>


      <section class="section">

        <div class="section__head">

          <div>

            <h2 class="section__title">
              Rekomendasi
            </h2>

            <p class="section__subtitle">
              Daftar kartu video/konten
              dengan CTA cepat.
            </p>

          </div>


          <button
            class="section__action"
            type="button"
            data-route="terbaru"
          >
            Lihat semua ->
          </button>

        </div>


        <div class="grid cards">

          ${cards}

        </div>

      </section>

    </section>

  `;

}

/* =========================================================
   URUTAN
   ========================================================= */

function renderUrutan() {

  const buttons = catalog.categories.map((item) => `

    <article
      class="card"
      data-route="detail/${item.slug}"
    >

      <div class="card__top">

        <span class="card__tag">
          Urutan
        </span>

        <span class="card__number">
          ${item.title}
        </span>

      </div>


      <h3 class="card__title">
        ${item.title}
      </h3>


      <p class="card__text">
        ${item.desc}
      </p>


      <div class="card__bottom">

        <span
          class="glow-dot"
          aria-hidden="true"
        ></span>

        <button
          class="card-btn primary"
          type="button"
        >
          Lanjut ->
        </button>

      </div>

    </article>

  `).join("");


  return `

    <section
      class="view active"
      data-view="urutan"
    >

      <div class="section">

        <div class="section__head">

          <div>

            <h2 class="section__title">
              Urutan View
            </h2>

            <p class="section__subtitle">
              Halaman daftar kategori/rentang
              nomor dengan grid tombol interaktif.
            </p>

          </div>


          <button
            class="section__action"
            type="button"
            data-route="home"
          >
            Kembali Home ->
          </button>

        </div>


        <div class="grid categories">

          ${buttons}

        </div>


        <div class="ad-slot">

          <strong>
            Smartlink Placeholder
          </strong>

          <p>
            Setiap tombol bisa diarahkan
            ke Smartlink iklan atau halaman
            detail katalog sesuai strategi
            monetisasi Anda.
          </p>

        </div>

      </div>

    </section>

  `;

}

/* =========================================================
   TERBARU
   ========================================================= */

function renderTerbaru() {

  const rows = catalog.latest.map((item) => `

    <article class="update-item">

      <div class="update-item__left">

        <h3 class="update-item__title">
          ${item.title}
        </h3>

        <p class="update-item__desc">
          ${item.desc}
        </p>

        <span class="update-item__meta">
          Update terbaru •
          SPA route: ${item.route}
        </span>

      </div>


      <button
        class="action-btn primary"
        type="button"
        data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(item.title)}"
      >
        Tonton ->
      </button>

    </article>

  `).join("");


  return `

    <section
      class="view active"
      data-view="terbaru"
    >

      <div class="section">

        <div class="section__head">

          <div>

            <h2 class="section__title">
              Terbaru View
            </h2>

            <p class="section__subtitle">
              Daftar update konten terbaru
              dengan tombol Tonton ->.
            </p>

          </div>


          <button
            class="section__action"
            type="button"
            data-route="urutan"
          >
            Buka Urutan ->
          </button>

        </div>


        <div class="grid updates">

          ${rows}

        </div>


        <div class="ad-slot">

          <strong>
            Integrasi Iklan
          </strong>

          <p>
            Struktur ini cocok untuk menaruh
            native ad, Smartlink, atau tombol
            interstitial sesuai provider iklan Anda.
          </p>

        </div>

      </div>

    </section>

  `;

}

/* =========================================================
   DETAIL + VIDEO PLAYER
   ========================================================= */

function renderDetail(slug) {

  const data = catalog.details[slug] || {

    title: `Urutan ${slug}`,

    subtitle: "Detail view generik",

    desc:
      "Gunakan template ini untuk membuat halaman episode dengan rute yang berbeda.",

    episodes:
      makeEpisodeList(slug)

  };


  const episodes = data.episodes.map((ep) => `

    <button
      class="episode-btn primary"
      type="button"
      data-smartlink="${ep.url}"
      data-src="${ep.src || ""}"
      data-episode="${ep.ep}"
    >

      <strong>
        EP ${ep.ep}
      </strong>

      <span>
        ${ep.label}
      </span>

    </button>

  `).join("");


  return `

    <section
      class="view active"
      data-view="detail"
    >

      <div class="detail-box">


        <div class="detail-head">

          <div class="badge-row">

            <span class="badge">
              <strong>
                Detail
              </strong>
              View
            </span>

            <span class="badge">
              <strong>
                ${slug}
              </strong>
            </span>

          </div>


          <h2>
            ${data.title}
          </h2>


          <p>
            ${data.subtitle}
          </p>


          <p>
            ${data.desc}
          </p>

        </div>


        <!-- =================================================
             VIDEO PLAYER
             ================================================= -->

        <div class="video-player">

          <div class="video-player__shell">

            <video
              id="mainVideo"
              class="main-video"
              controls
              playsinline
              preload="metadata"
            >

              Browser Anda tidak mendukung
              pemutaran video HTML5.

            </video>

          </div>


          <div
            id="videoStatus"
            class="video-status"
          >
            Pilih episode untuk mulai menonton.
          </div>

        </div>


        <!-- =================================================
             EPISODE LIST
             ================================================= -->

        <div class="episode-grid">

          ${episodes}

        </div>


        <div class="detail-actions">

          <button
            class="action-btn primary"
            type="button"
            data-smartlink="${SMARTLINK_URL}&ref=${encodeURIComponent(slug)}-main"
          >
            Lanjut ->
          </button>


          <button
            class="action-btn secondary"
            type="button"
            data-route="terbaru"
          >
            Terbaru
          </button>


          <button
            class="action-btn"
            type="button"
            data-route="home"
          >
            Home
          </button>

        </div>


        <div class="ad-slot">

          <strong>
            Slot Episode
          </strong>

          <p>
            Setiap tombol episode mempunyai
            Smartlink dan URL video sendiri.
          </p>

        </div>


      </div>

    </section>

  `;

}

/* =========================================================
   VIDEO PLAYER CONTROL
   ========================================================= */

function playEpisode(button) {

  const video = document.getElementById("mainVideo");
  const status = document.getElementById("videoStatus");

  if (!video) {
    return;
  }

  const videoSrc =
    button.getAttribute("data-src");

  const episodeNumber =
    button.getAttribute("data-episode");


  if (!videoSrc) {

    if (status) {

      status.textContent =
        `Video EP ${episodeNumber} belum dipasang.`;

    }

    return;

  }


  /*
    Hentikan video sebelumnya
  */

  video.pause();


  /*
    Ganti source
  */

  video.src = videoSrc;


  /*
    Simpan episode aktif
  */

  state.currentEpisode =
    episodeNumber;


  /*
    Tandai tombol aktif
  */

  document.querySelectorAll(".episode-btn").forEach((btn) => {
  btn.classList.remove("active");
});

button.classList.add("active");


  /*
    Update status
  */

  if (status) {

    status.textContent =
      `Memuat EP ${episodeNumber}...`;

  }


  /*
    Reload video
  */

  video.load();


  /*
    Coba autoplay setelah
    user melakukan klik episode.
    
    Karena pemicunya adalah user gesture,
    browser biasanya mengizinkan playback.
  */

  const playPromise =
    video.play();


  if (playPromise !== undefined) {

    playPromise

      .then(() => {

        if (status) {

          status.textContent =
            `Sedang memutar EP ${episodeNumber}`;

        }

      })

      .catch(() => {

        if (status) {

          status.textContent =
            `EP ${episodeNumber} siap diputar. Tekan tombol Play.`;

        }

      });

  }

}

/* =========================================================
   VIDEO ERROR / LOADED
   ========================================================= */

function setupVideoEvents() {

  const video =
    document.getElementById("mainVideo");

  const status =
    document.getElementById("videoStatus");


  if (!video) {
    return;
  }


  video.addEventListener(
    "loadedmetadata",
    () => {

      if (
        state.currentEpisode &&
        status
      ) {

        status.textContent =
          `EP ${state.currentEpisode} siap ditonton.`;

      }

    }
  );


  video.addEventListener(
    "error",
    () => {

      if (status) {

        status.textContent =
          "Video gagal dimuat. Periksa URL video dan pastikan file dapat diakses publik.";

      }

    }
  );


  video.addEventListener(
    "playing",
    () => {

      if (
        state.currentEpisode &&
        status
      ) {

        status.textContent =
          `Sedang memutar EP ${state.currentEpisode}`;

      }

    }
  );

}

/* =========================================================
   RENDER
   ========================================================= */

function render() {

  const route =
    getRoute();

  let html = "";


  if (route.name === "urutan") {

    html =
      renderUrutan();

  }

  else if (route.name === "terbaru") {

    html =
      renderTerbaru();

  }

  else if (route.name === "detail") {

    html =
      renderDetail(route.slug);

  }

  else {

    html =
      renderHome();

  }


  /*
    Render SPA
  */

  app.innerHTML =
    html;


  /*
    Reset episode aktif
    ketika pindah halaman
  */

  state.currentEpisode = null;


  /*
    Sinkronisasi navigation
  */

  syncActiveNav(route);


  /*
    Setup event video jika
    halaman detail
  */

  if (route.name === "detail") {

    setupVideoEvents();

  }


  /*
    Scroll ke atas
  */

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  /*
    Hilangkan loader
  */

  if (!state.firstRenderDone) {

    state.firstRenderDone = true;

    setTimeout(() => {

      if (loader) {

        loader.classList.add("hide");

      }

    }, 850);

  }

}

/* =========================================================
   ACTIVE NAV
   ========================================================= */

function syncActiveNav(route) {

  const links =
    document.querySelectorAll("[data-route]");


  links.forEach((el) => {

    const target =
      el.getAttribute("data-route");


    const isActive =

      (
        route.name === "home" &&
        target === "home"
      )

      ||

      (
        route.name === "urutan" &&
        target === "urutan"
      )

      ||

      (
        route.name === "terbaru" &&
        target === "terbaru"
      )

      ||

      (
        route.name === "detail" &&
        target === `detail/${route.slug}`
      );


    el.classList.toggle(
      "active",
      Boolean(isActive)
    );

  });

}

/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

document.addEventListener(
  "click",
  (event) => {

    const routeEl =
      event.target.closest("[data-route]");

    const smartlinkEl =
      event.target.closest("[data-smartlink]");

    const episodeBtn =
      event.target.closest(".episode-btn");

    const openSidebarBtn =
      event.target.closest("[data-toggle-sidebar]");

    const closeSidebarBtn =
      event.target.closest("[data-close-sidebar]");

  /* =====================================================
       OPEN SIDEBAR
       ===================================================== */

    if (openSidebarBtn) {

      event.preventDefault();

      openSidebar();

      return;

    }


    /* =====================================================
       CLOSE SIDEBAR
       ===================================================== */

    if (closeSidebarBtn) {

      event.preventDefault();

      closeSidebar();

      return;

    }


    /* =====================================================
       POPUNDER
       ===================================================== */

    if (
      routeEl ||
      smartlinkEl ||
      episodeBtn
    ) {

      triggerPopunder();

    }


    /* =====================================================
       EPISODE
       ===================================================== */

    if (episodeBtn) {

      event.preventDefault();


      /*
        1. Ganti video di player
      */

      playEpisode(episodeBtn);


      /*
        2. Smartlink tetap bekerja
        
        Jika Smartlink siap:
        buka Smartlink dan mulai
        cooldown 20 detik.
        
        Jika Smartlink sedang cooldown:
        video tetap berjalan.
      */

      const smartlink =
        episodeBtn.getAttribute(
          "data-smartlink"
        );


      if (state.smartlinkReady) {

        triggerSmartlink(
          smartlink
        );

      }


      return;

    }


    /* =====================================================
       SMARTLINK NORMAL
       
       Berlaku untuk:
       - Lanjut
       - Tonton
       - CTA
       - tombol Smartlink lainnya
       ===================================================== */

    if (smartlinkEl) {

      event.preventDefault();


      if (state.smartlinkReady) {

        triggerSmartlink(
          smartlinkEl.getAttribute(
            "data-smartlink"
          )
        );

      }


      return;

    }


    /* =====================================================
       ROUTING SPA
       ===================================================== */

    if (routeEl) {

      event.preventDefault();


      navigate(
        routeEl.getAttribute(
          "data-route"
        )
      );


      return;

    }

  }
);


/* =========================================================
   HASH ROUTER
   ========================================================= */

window.addEventListener(
  "hashchange",
  render
);


/* =========================================================
   INITIAL LOAD
   ========================================================= */

window.addEventListener(
  "DOMContentLoaded",
  render
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
  "resize",
  () => {

    if (
      window.innerWidth > 768
    ) {

      closeSidebar();

    }

  }
);


/* =========================================================
   ESCAPE SIDEBAR
   ========================================================= */

window.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Escape"
    ) {

      closeSidebar();

    }

  }
);
