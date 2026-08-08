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

        <butt
