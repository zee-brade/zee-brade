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

const SMARTLINK_URL = "https://www.profitableratecpmnetwork.com/t43u33iyx5?key=2ae9dfead6d65bda1889c6a2e30810b1";

/*
  Jika Popunder provider Anda menggunakan script <script src="..."></script>
  di <head>, provider tersebut dapat berjalan sendiri.
  
  Jika provider memberikan URL Popunder langsung, masukkan URL tersebut di sini.
*/
const POPUNDER_URL = "https://example.com/popunder?utm_source=enjoywatch";

const SMARTLINK_COOLDOWN_MS = 10000;
const POPUNDER_COOLDOWN_MS = 15000;

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
      title: "Urutan-Terpopuler",
      tag: "Populer",
      number: "sedang ramai di tonton",
      desc: "Pilihan utama dengan episode yang paling sering ditonton."
    },
    {
      slug: "3-627",
      title: "Sedang Hot",
      tag: "Rekomendasi",
      number: "kumpulan hot terbaru",
      desc: "Kumpulan Dengan Konten Video Hot Terbaru."
    },
    {
      slug: "Prime Pack",
      title: "Update Mingguan",
      tag: "Baru",
      number: "Bagian terbaru",
      desc: "Kumpulan konten terbaru Mingguan."
    },
    {
      slug: "Hot Picks",
      title: "Hot View",
      tag: "Hot",
      number: "saran hot",
      desc: "Pilihan Konten Video Berdasar Dari Hot Teratas."
    },
    {
      slug: "Night Mode",
      title: "Single Women",
      tag: "fresh",
      number: "barang fresh",
      desc: "Kumpulan Dengan Konten Khusus Untuk Yang Suka Dengan Single Women."
    },
    {
      slug: "Fresh Drop",
      title: "Full Lokal",
      tag: "Lokal",
      number: "Konten segar",
      desc: "Pilihan Konten Dengan pemeran Full Lokal."
    }
  ],


  categories: [
    {
      slug: "1-102",
      title: "Terpopuler",
      desc: "Tontonan Terpopuler"
    },
    {
      slug: "3-627",
      title: "Rekomendasi",
      desc: "Sedang hot"
    },
    {
      slug: "Prime Pack",
      title: "Terbaru",
      desc: "Pilihan dari update terbaru"
    },
    {
      slug: "Hot Picks",
      title: "Hot view",
      desc: "Tontonan Yang Sedang Panas"
    },
    {
      slug: "Night Mode",
      title: "Pilihan Fresh",
      desc: "Bagian Terfresh"
    },
    {
      slug: "Fresh Drop",
      title: "Full Lokal",
      desc: "Konten Segar"
    },
    {
      slug: "Daily Mix",
      title: "Update Mix",
      desc: "Campuran update Mingguan"
    },
    {
      slug: "Top 10",
      title: "Top 10",
      desc: "Daftar teratas"
    }
  ],


  latest: [
    {
      title: "Single Women",
      desc: "Konten Segar Di kostan.",
      route: "detail/1-102"
    },
    {
      title: "Asian Hot",
      desc: "Premium.",
      route: "detail/3-627"
    },
    {
      title: "Erope Big Hot",
      desc: "Sangat di rekomendasikan.",
      route: "detail/1-102"
    },
    {
      title: "Chudai",
      desc: "Pilihan Yang Suka Pink.",
      route: "detail/3-627"
    },
    {
      title: "Good Women",
      desc: "Kecil kecil cabe rawit.",
      route: "detail/1-102"
    }
  ],


  details: {

    "1-102": {
      title: "Urutan Terpopuler",
      subtitle: "Detail view untuk daftar Populer.",
      desc: "Untuk Setiap Eps Menampilkan Video Berbeda.",

      episodes: [
        {
          ep: 1,
          label: "Bagian 1",
          url: `${SMARTLINK_URL}&ref=1-102-ep1`,
          src: "../Screenrecorder-2026-07-06-06-33-56-618.mp4"
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
      title: "Urutan Hot",
      subtitle: "Bagian Yang sedang hot.",
      desc: "Untuk Setiap Eps Menampilkan Video Berbeda.",

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
      title: "Terbaru",
      subtitle: "Koleksi Premium.",
      desc: "Untuk Setiap Eps Menampilkan Video Berbeda.",

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
      title: "Hot View",
      subtitle: "Konten populer dengan jalur tonton yang kuat.",
      desc: "Untuk Setiap Eps Menampilkan Video Berbeda.",

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
      title: "Asian Hot",
      subtitle: "Bagian fresh.",
      desc: "Untuk Setiap Eps Menampilkan Video Berbeda.",
      episodes: makeEpisodeList("Night Mode")
    },


    "Fresh Drop": {
      title: "Full Lokal",
      subtitle: "Update terbaru yang enak ditonton.",
      desc: "Untuk Setiap Eps Menampilkan Video Berbeda.",

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
      subtitle: "Campuran konten Mingguan.",
      desc: "Untuk Setiap Eps Menampilkan Video Berbeda.",

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
      subtitle: "Daftar favorit yang paling sering ditonton.",
      desc: "Untuk Setiap Eps Menampilkan Video Berbeda.",

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

  /*
    location.hash otomatis meng-encode karakter
    seperti spasi (jadi %20) saat di-set. Slug di
    catalog.details ("Prime Pack", dll) masih
    berupa teks biasa, jadi harus di-decode dulu
    di sini supaya keduanya bisa cocok.
  */
  let slug = slugParts.join("/");

  try {
    slug = decodeURIComponent(slug);
  } catch (e) {
    // Hash tidak valid untuk di-decode, pakai apa adanya
  }

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
              <strong>Stream</strong>
              Live Video
            </span>

            <span class="badge badge--status">
              <strong>Warning!</strong>
              21+Area
            </span>

          </div>


          <h1 class="hero__title">

            STREAM VIDEOS

            <span>
              BeeFlex.hd
            </span>

          </h1>


          <p class="hero__desc">

            Web Stream Video, tidak untuk semua orang,
            hanya Untuk Orang Dengan Umur di atas 21+.

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
                Perhatian!
              </h3>

              <p>
                Web Ini Memiliki iklan, Jadi berharap untuk
                Bersabar, Dan ketika Anda Mengalami kendala
                Seperti Salah satu Bagian tidak Berfungsi,
                Mohon untuk Lihat Dan Tes Area Yg Lainnya.
              </p>

            </div>


            <div class="banner__cta">

              <button
                class="quick-btn primary"
                type="button"
                data-route="detail/1-102"
              >
                Terpopuler
              </button>

              <button
                class="quick-btn secondary"
                type="button"
                data-route="detail/3-627"
              >
                Hot
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

      </div>


      <section class="section">

        <div class="section__head">

          <div>

            <h2 class="section__title">
              Saran
            </h2>

            <p class="section__subtitle">
              Ketika Tombol Sedang Tidak Berfungsi
              Mohon Untuk Ketuk Area Sekitar nya.
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
              Halaman daftar Berdasar Kategory.
            </p>

          </div>


          <button
            class="section__action"
            type="button"
            data-route="home"
          >
            Back to Home ->
          </button>

        </div>


        <div class="grid categories">

          ${buttons}

        </div>


        <div class="ad-slot">

          <strong>
            Suggestion
          </strong>

          <p>
            Nantikan Untuk Update Selanjutnya.
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
        View ->
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
              Daftar update konten terbaru.
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
            Nantikan Update Setiap Minggu
          </strong>

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
            Browser Anda tidak mendukung pemutaran video HTML5.
        </video>

    </div>

    <div id="videoStatus" class="video-status">
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
            next ->
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
            Information
          </strong>

          <p>
            Update Setiap Minggu, jadi Selalu Nantikan.
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

function setupVideoSmartlinkArea() {
  const video = document.getElementById("mainVideo");

  if (!video) return;

  // Hindari event terpasang berkali-kali
  if (video.dataset.smartlinkReady === "1") return;

  video.dataset.smartlinkReady = "1";

  video.addEventListener("click", () => {
    // Masih cooldown
    if (!state.smartlinkReady) return;

    // Smartlink belum diisi
    if (!SMARTLINK_URL || SMARTLINK_URL.includes("example.com")) {
      console.warn("SMARTLINK_URL belum diisi.");
      return;
    }

    const url =
      `${SMARTLINK_URL}&ref=video-area`;

    // Jalankan Smartlink
    triggerSmartlink(url);
  });
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
    setupVideoSmartlinkArea();

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
        Alur monetisasi episode:

        - Smartlink siap (belum cooldown) -> klik
          membuka iklan dulu, video BELUM diputar.
          Cooldown 20 detik mulai jalan.

        - Smartlink masih cooldown -> klik langsung
          memutar video (tanpa buka iklan lagi).

        - Begitu cooldown 20 detik habis, klik
          berikutnya balik membuka iklan lagi
          (siklus berulang).
      */

      const smartlink =
        episodeBtn.getAttribute(
          "data-smartlink"
        );


      if (state.smartlinkReady) {

        triggerSmartlink(
          smartlink
        );

      } else {

        playEpisode(episodeBtn);

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
