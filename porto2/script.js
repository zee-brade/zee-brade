(() => {
  const state = {
    heroMouseX: 0,
    heroMouseY: 0,
    starfield: null,
    viz: null,
    audioCtx: null,
    analyser: null,
    sourceNode: null,
    frequencyData: null,
    currentTrack: 0,
    isReady: false,
    songs: [],
    starPoints: [],
    heatActive: false,
    planeRaf: 0
  };

  const projects = [
    {
      index: "01",
      title: "CutYO",
      subtitle: "Background Remover",
      description: "A fast, crisp background removal experience built around a clean workflow and punchy visual feedback.",
      accent: ["#f97316", "#38bdf8"],
      tags: ["AI", "Canvas", "UX"],
      glow: "rgba(249, 115, 22, 0.18)"
    },
    {
      index: "02",
      title: "KomiYO",
      subtitle: "Manga Reader",
      description: "A smooth manga reading app with polished navigation, focus-first layouts, and mobile-friendly motion.",
      accent: ["#38bdf8", "#a78bfa"],
      tags: ["Reader", "Responsive", "Motion"],
      glow: "rgba(56, 189, 248, 0.18)"
    },
    {
      index: "03",
      title: "Roastgram",
      subtitle: "Instagram Profile Roaster",
      description: "An entertaining profile commentary engine with playful copy, animated results, and dramatic reveal states.",
      accent: ["#fb7185", "#f97316"],
      tags: ["Fun", "Social", "API"],
      glow: "rgba(251, 113, 133, 0.18)"
    },
    {
      index: "04",
      title: "Roastblox",
      subtitle: "Roblox Avatar Roaster",
      description: "A quirky avatar analyzer that blends bold UI, witty output, and a confident product presentation.",
      accent: ["#38bdf8", "#22c55e"],
      tags: ["Games", "Avatar", "Frontend"],
      glow: "rgba(34, 197, 94, 0.16)"
    },
    {
      index: "05",
      title: "PixUP",
      subtitle: "AI Image Enhancer",
      description: "Image uplift tooling with a modern canvas preview, transform controls, and premium-feeling results.",
      accent: ["#f97316", "#facc15"],
      tags: ["Enhance", "Canvas", "AI"],
      glow: "rgba(250, 204, 21, 0.16)"
    },
    {
      index: "06",
      title: "Cinefy",
      subtitle: "Movie & TV Show App",
      description: "A cinematic browsing experience with dynamic cards, glowing metadata, and a binge-friendly structure.",
      accent: ["#60a5fa", "#22c55e"],
      tags: ["Movies", "Search", "UI"],
      glow: "rgba(96, 165, 250, 0.18)"
    },
    {
      index: "07",
      title: "Impostorgram",
      subtitle: "Identity Game",
      description: "A playful social-style experiment with suspense, reveal moments, and a deceptively simple surface.",
      accent: ["#a78bfa", "#38bdf8"],
      tags: ["Game", "Social", "Experiment"],
      glow: "rgba(167, 139, 250, 0.18)"
    },
    {
      index: "08",
      title: "Alang AEP",
      subtitle: "Creative Engine",
      description: "A polished internal playground for visual ideas, reusable motion, and experimental interface pieces.",
      accent: ["#f97316", "#38bdf8"],
      tags: ["System", "Toolkit", "Design"],
      glow: "rgba(56, 189, 248, 0.14)"
    }
  ];

  const tech = [
    ["React", "Interface building and state flow", "#38bdf8"],
    ["Next.js", "App structure and routing", "#a78bfa"],
    ["TypeScript", "Safer logic and clearer contracts", "#60a5fa"],
    ["Tailwind", "Rapid design systems", "#f97316"],
    ["Node.js", "Backend and tooling", "#22c55e"],
    ["Python", "Automation and problem solving", "#facc15"],
    ["PHP", "Legacy and web integration", "#fb7185"],
    ["Kotlin", "Android-centric workflows", "#8b5cf6"],
    ["Git", "Version control and collaboration", "#38bdf8"]
  ];

  const timeline = [
    {
      title: "STUDENT (2020 - 2024)",
      subtitle: "Politeknik Caltex Riau",
      text: "Built a foundation in engineering discipline, problem solving, and product thinking while learning how to ship with consistency."
    },
    {
      title: "CONTENT CREATOR & FREELANCE VIDEO EDITOR (2020 - 2024)",
      subtitle: "Independent Creative Work",
      text: "Developed a strong eye for pacing, story, and visual rhythm, which now feeds directly into interface motion and presentation."
    },
    {
      title: "FRONT END DEVELOPER (Present)",
      subtitle: "Assist.id",
      text: "Focused on building sharp, reliable frontend experiences with scalable UI logic, clean structure, and attention to detail."
    }
  ];

  const songSpecs = [
    {
      title: "Judul Lagu 1",
    artist: "Nama Artis 1",
    url: "Simpan Rasa_Tmate.cc_1785055539.mp3",     // Path file MP3 lu
    cover: "IMG_20260726_155903.jpg"
      ]
    },
    {
      title: "Paper Skies",
      artist: "ALANGKUN SESSION",
      duration: 34,
      bpm: 104,
      root: 196,
      phase: 0.6,
      accent: ["#f97316", "#facc15"],
      art: ["#111827", "#7c2d12", "#f97316"],
      sequence: [1, 1.33, 1.5, 1.33, 1, 0.88, 1, 1.5],
      lyrics: [
        { time: 0, text: "Fold the doubt and let it catch the wind." },
        { time: 5, text: "A paper plane can still outrun a heavy sky." },
        { time: 10, text: "Soft edges, sharp direction, zero hesitation." },
        { time: 15, text: "The path is drawn by motion, not by fear." },
        { time: 20, text: "A little lift, a little drift, then forward." },
        { time: 26, text: "Up through the haze and into the clean line." }
      ]
    },
    {
      title: "Chrome Heart",
      artist: "ALANGKUN SESSION",
      duration: 34,
      bpm: 108,
      root: 247,
      phase: 1.1,
      accent: ["#22c55e", "#38bdf8"],
      art: ["#0f172a", "#14532d", "#22c55e"],
      sequence: [1, 1.2, 1.5, 1.8, 1.5, 1.2, 1, 0.9],
      lyrics: [
        { time: 0, text: "A chrome reflection, clean and low-key bright." },
        { time: 4, text: "The bassline marches like a polished engine." },
        { time: 9, text: "Focus on the frame, polish on the edges." },
        { time: 14, text: "Nothing wasted, nothing loose, all signal." },
        { time: 20, text: "When the beat bends, the whole room leans with it." },
        { time: 26, text: "Sharp lines, soft glow, perfect in motion." }
      ]
    },
    {
      title: "Afterglow",
      artist: "ALANGKUN SESSION",
      duration: 34,
      bpm: 88,
      root: 262,
      phase: 1.7,
      accent: ["#a78bfa", "#38bdf8"],
      art: ["#111827", "#312e81", "#a78bfa"],
      sequence: [1, 1.25, 1.33, 1.5, 1.33, 1.25, 1, 0.75],
      lyrics: [
        { time: 0, text: "The afterglow hangs around the last good idea." },
        { time: 5, text: "A quiet shimmer across the glass and steel." },
        { time: 10, text: "Every line lands like it knew the answer already." },
        { time: 16, text: "Slow burn, clean arc, and a gentle return." },
        { time: 22, text: "The night stays warm where the motion touched it." },
        { time: 28, text: "Fade out soft, but leave the spark behind." }
      ]
    },
    {
      title: "Signal Bloom",
      artist: "ALANGKUN SESSION",
      duration: 34,
      bpm: 96,
      root: 233,
      phase: 2.3,
      accent: ["#f97316", "#38bdf8"],
      art: ["#0b1220", "#1d4ed8", "#38bdf8"],
      sequence: [1, 1.18, 1.42, 1.68, 1.42, 1.18, 1, 0.84],
      lyrics: [
        { time: 0, text: "A signal blooms in the center of the noise." },
        { time: 5, text: "Tiny sparks gather, then choose a direction." },
        { time: 11, text: "One clean pulse and the whole thing opens." },
        { time: 17, text: "Brightness without clutter, motion without stress." },
        { time: 23, text: "All the scattered pieces come back into shape." },
        { time: 29, text: "And the bloom stays, even after the beat." }
      ]
    }
  ];

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const intro = document.getElementById("intro");
    document.body.classList.add("loading");

    renderProjects();
    renderTech();
    renderTimeline();
    renderHeatmap();
    setupSmoothScroll();
    setupRevealObserver();
    setupHeroParallax();
    setupJourneyPlane();
    setupFooterGlow();
    setupMusic();
    setupStarfield();

    setTimeout(() => {
      intro.classList.add("is-hidden");
      document.body.classList.remove("loading");
      document.body.classList.add("intro-finished");
      document.querySelector(".hero")?.classList.add("hero-ready");
    }, 1800);

    setTimeout(() => {
      intro.style.display = "none";
    }, 3100);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeXml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("\"", "&quot;")
      .replaceAll("'", "&apos;");
  }

  function createPreviewSvg(title, a, b) {
    const safe = escapeXml(title);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${a}" />
            <stop offset="100%" stop-color="${b}" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="45%" r="58%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </radialGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>
        <rect width="960" height="600" rx="44" fill="url(#bg)"/>
        <circle cx="200" cy="128" r="82" fill="#fff" fill-opacity="0.18" filter="url(#blur)"/>
        <circle cx="770" cy="130" r="120" fill="#fff" fill-opacity="0.14" filter="url(#blur)"/>
        <path d="M0 462 C 170 370, 320 520, 480 430 S 810 350, 960 410 L 960 600 L 0 600 Z" fill="#0b1020" fill-opacity="0.32"/>
        <path d="M0 390 C 180 300, 330 474, 480 390 S 810 280, 960 350" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="12" stroke-linecap="round"/>
        <path d="M 130 408 C 250 270, 390 500, 510 360 S 760 270, 840 372" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="8" stroke-linecap="round"/>
        <rect x="64" y="68" width="832" height="464" rx="34" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>
        <rect x="96" y="102" width="300" height="84" rx="22" fill="#ffffff" fill-opacity="0.14"/>
        <rect x="96" y="204" width="220" height="14" rx="7" fill="#ffffff" fill-opacity="0.22"/>
        <rect x="96" y="232" width="286" height="14" rx="7" fill="#ffffff" fill-opacity="0.18"/>
        <rect x="96" y="260" width="250" height="14" rx="7" fill="#ffffff" fill-opacity="0.18"/>
        <circle cx="736" cy="276" r="124" fill="url(#glow)"/>
        <text x="96" y="154" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" letter-spacing="-1.4">${safe}</text>
        <text x="96" y="314" fill="#fff" fill-opacity="0.78" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="4">INTERACTIVE UI STUDY</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function createAlbumArt(title, a, b) {
    const safe = escapeXml(title);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${a}"/>
            <stop offset="100%" stop-color="${b}"/>
          </linearGradient>
          <radialGradient id="r" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="420" height="420" rx="36" fill="url(#g)"/>
        <circle cx="132" cy="104" r="88" fill="#fff" fill-opacity="0.18"/>
        <circle cx="288" cy="308" r="122" fill="#0b1020" fill-opacity="0.2"/>
        <circle cx="215" cy="176" r="164" fill="url(#r)"/>
        <path d="M52 286 C 112 216, 182 340, 242 260 S 360 190, 378 292" fill="none" stroke="#fff" stroke-opacity="0.28" stroke-width="10" stroke-linecap="round"/>
        <text x="36" y="374" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="900" letter-spacing="-1">${safe}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"], [data-scroll]').forEach((el) => {
      el.addEventListener("click", (event) => {
        const targetSelector = el.getAttribute("href") || el.getAttribute("data-scroll");
        if (!targetSelector || !targetSelector.startsWith("#")) return;
        const target = document.querySelector(targetSelector);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupRevealObserver() {
    const revealItems = document.querySelectorAll(".reveal");
    const heroItems = document.querySelectorAll(".hero-reveal");
    const musicSection = document.getElementById("music");
    const heatmap = document.getElementById("heatmap");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    }, { threshold: 0.14 });

    revealItems.forEach((item) => observer.observe(item));
    document.querySelectorAll(".project-card, .tech-card, .timeline-card, .contact-card, .album-card").forEach((item) => observer.observe(item));

    heroItems.forEach((item, index) => {
      item.style.transitionDelay = `${index * 120}ms`;
    });

    if (musicSection && heatmap) {
      const musicObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heatmap.classList.add("is-active");
            state.heatActive = true;
          }
        });
      }, { threshold: 0.35 });
      musicObserver.observe(musicSection);
    }
  }

  function setupHeroParallax() {
    const hero = document.querySelector(".hero");
    const visual = document.querySelector(".hero-visual");
    if (!hero || !visual) return;

    hero.addEventListener("pointermove", (event) => {
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      state.heroMouseX = x;
      state.heroMouseY = y;
      document.documentElement.style.setProperty("--hero-mx", (x * 24).toFixed(2) + "px");
      document.documentElement.style.setProperty("--hero-my", (y * 20).toFixed(2) + "px");
    });

    hero.addEventListener("pointerleave", () => {
      document.documentElement.style.setProperty("--hero-mx", "0px");
      document.documentElement.style.setProperty("--hero-my", "0px");
    });

    const onScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      document.documentElement.style.setProperty("--scroll-y", `${scrollY}px`);

      const layers = visual.querySelectorAll(".hero-layer");
      layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth || "0.1");
        const translateY = scrollY * depth * -0.16;
        layer.style.transform = `translate3d(calc(var(--hero-mx) + 0px), calc(var(--hero-my) + ${translateY}px), 0)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function renderProjects() {
    const grid = document.getElementById("projectsGrid");
    if (!grid) return;

    grid.innerHTML = projects.map((project) => {
      const preview = createPreviewSvg(project.title, project.accent[0], project.accent[1]);
      return `
        <article class="project-card reveal">
          <div class="project-meta">
            <span class="project-index">${project.index}</span>
            <span class="project-chip">${project.subtitle}</span>
          </div>
          <img class="project-preview" src="${preview}" alt="${project.title} preview">
          <h4>${project.title}</h4>
          <p>${project.description}</p>
          <div class="badge-row">
            ${project.tags.map((tag) => `<span class="badge">${tag}</span>`).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  function renderTech() {
    const grid = document.getElementById("techGrid");
    if (!grid) return;

    grid.innerHTML = tech.map((item, index) => `
      <article class="tech-card reveal" data-accent="${item[2]}">
        <div class="tech-index">${String(index + 1).padStart(2, "0")}</div>
        <h4>${item[0]}</h4>
        <p>${item[1]}</p>
      </article>
    `).join("");

    grid.querySelectorAll(".tech-card").forEach((card) => {
      const accent = card.dataset.accent || "#38bdf8";
      card.style.setProperty("--accent-glow", `${accent}26`);

      const reset = () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      };

      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * 14;
        const ry = (px - 0.5) * 16;
        card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      });

      card.addEventListener("pointerleave", reset);
    });
  }

  function renderTimeline() {
    const container = document.getElementById("timelineCards");
    if (!container) return;

    container.innerHTML = timeline.map((item, index) => {
      const tilt = (Math.random() * 4.6 - 2.3).toFixed(2);
      return `
        <article class="timeline-card reveal" style="--tilt:${tilt}deg">
          <div class="timeline-thumb"></div>
          <span class="date">${String(index + 1).padStart(2, "0")}</span>
          <h4>${item.title}</h4>
          <p><strong>${item.subtitle}</strong></p>
          <p>${item.text}</p>
        </article>
      `;
    }).join("");
  }

  function renderHeatmap() {
    const heatmap = document.getElementById("heatmap");
    if (!heatmap) return;

    const cells = [];
    for (let week = 0; week < 52; week++) {
      for (let day = 0; day < 7; day++) {
        const value = Math.floor((Math.sin(week * 0.7 + day * 1.1) + 1) * 2);
        const level = clamp(value + (Math.random() > 0.75 ? 1 : 0), 0, 4);
        cells.push(`<div class="heat-cell level-${level}" style="--delay:${week * 7 + day}"></div>`);
      }
    }
    heatmap.innerHTML = cells.join("");
  }

  function setupJourneyPlane() {
    const section = document.getElementById("journey");
    const path = document.getElementById("journeyPath");
    const plane = document.getElementById("paperPlane");
    if (!section || !path || !plane) return;

    let pathLength = 0;
    const measure = () => {
      pathLength = path.getTotalLength();
    };

    const update = () => {
      const rect = section.getBoundingClientRect();
      const viewHeight = window.innerHeight || document.documentElement.clientHeight;
      const progress = clamp((viewHeight * 0.72 - rect.top) / (rect.height + viewHeight * 0.4), 0, 1);
      const point = path.getPointAtLength(pathLength * progress);
      const nextPoint = path.getPointAtLength(Math.min(pathLength, pathLength * progress + 1));
      const box = path.getBoundingClientRect();
      const x = point.x / 1300 * box.width + box.left - section.getBoundingClientRect().left - 18;
      const y = point.y / 320 * box.height + box.top - section.getBoundingClientRect().top - 22;
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180 / Math.PI;

      document.documentElement.style.setProperty("--plane-x", `${x}px`);
      document.documentElement.style.setProperty("--plane-y", `${y}px`);
      document.documentElement.style.setProperty("--plane-r", `${angle}deg`);
    };

    measure();
    update();

    let scheduled = false;
    const rafUpdate = () => {
      scheduled = false;
      update();
    };

    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(rafUpdate);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      update();
    });

    state.planeRaf = requestAnimationFrame(function loop() {
      update();
      state.planeRaf = requestAnimationFrame(loop);
    });
  }

  function setupFooterGlow() {
    const done = document.querySelector(".done-headline");
    if (!done) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          done.style.animationPlayState = "running";
        }
      });
    }, { threshold: 0.4 });
    observer.observe(done);
  }

  function setupMusic() {
    const audio = document.getElementById("audioElement");
    const orbit = document.getElementById("albumOrbit");
    const title = document.getElementById("trackTitle");
    const artist = document.getElementById("trackArtist");
    const lyricLine = document.getElementById("lyricLine");
    const playPause = document.getElementById("playPauseBtn");
    const progress = document.getElementById("progressBar");
    const volume = document.getElementById("volumeBar");
    const vizCanvas = document.getElementById("vizCanvas");

    if (!audio || !orbit || !title || !artist || !lyricLine || !playPause || !progress || !volume || !vizCanvas) return;

    state.songs = songSpecs.map((song) => {
      const url = createWavUrl(song);
      return {
        ...song,
        url,
        artUrl: createAlbumArt(song.title, song.art[0], song.art[1])
      };
    });

    orbit.innerHTML = state.songs.map((song, index) => {
      const angle = (index / state.songs.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 220;
      const tx = Math.cos(angle) * radius;
      const ty = Math.sin(angle) * radius * 0.72;
      return `
        <button class="album-card ${index === 0 ? "active" : ""}" data-index="${index}" style="--tx:${tx}px;--ty:${ty}px;--rot:${(angle * 8).toFixed(2)}deg">
          <img class="album-art" src="${song.artUrl}" alt="${song.title}">
          <strong>${song.title}</strong>
          <span>${song.artist}</span>
        </button>
      `;
    }).join("");

    const cards = Array.from(orbit.querySelectorAll(".album-card"));

    const selectTrack = (index, shouldPlay = false) => {
      state.currentTrack = index;
      const song = state.songs[index];
      title.textContent = song.title;
      artist.textContent = song.artist;
      audio.src = song.url;
      audio.currentTime = 0;
      progress.value = 0;
      setLyric(song, 0, lyricLine);
      cards.forEach((card, cardIndex) => {
        card.classList.toggle("active", cardIndex === index);
        card.classList.toggle("dimmed", cardIndex !== index);
      });
      if (shouldPlay) {
        audio.play().catch(() => {});
        playPause.textContent = "PAUSE";
      } else {
        playPause.textContent = "PLAY";
      }
    };

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const index = Number(card.dataset.index || 0);
        selectTrack(index, true);
      });
    });

    progress.addEventListener("input", () => {
      if (!audio.duration) return;
      audio.currentTime = (Number(progress.value) / 100) * audio.duration;
    });

    volume.addEventListener("input", () => {
      audio.volume = Number(volume.value) / 100;
    });

    playPause.addEventListener("click", async () => {
      if (!audio.src) {
        selectTrack(0, true);
      }

      try {
        await ensureAudioGraph(audio);
      } catch (_) {
      }

      if (audio.paused) {
        audio.play().catch(() => {});
        playPause.textContent = "PAUSE";
      } else {
        audio.pause();
        playPause.textContent = "PLAY";
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      progress.value = 0;
    });

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) {
        progress.value = String((audio.currentTime / audio.duration) * 100);
      }
      setLyric(state.songs[state.currentTrack], audio.currentTime, lyricLine);
    });

    audio.addEventListener("play", () => {
      playPause.textContent = "PAUSE";
    });

    audio.addEventListener("pause", () => {
      playPause.textContent = "PLAY";
    });

    audio.addEventListener("ended", () => {
      const next = (state.currentTrack + 1) % state.songs.length;
      selectTrack(next, true);
    });

    audio.volume = Number(volume.value) / 100;

    selectTrack(0, false);

    state.viz = setupVisualizer(vizCanvas, audio);
    requestAnimationFrame(drawVisualizer);
  }

  async function ensureAudioGraph(audio) {
    if (!state.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      state.audioCtx = new AudioContextClass();
      state.analyser = state.audioCtx.createAnalyser();
      state.analyser.fftSize = 256;
      state.frequencyData = new Uint8Array(state.analyser.frequencyBinCount);
      if (!state.sourceNode) {
        state.sourceNode = state.audioCtx.createMediaElementSource(audio);
        state.sourceNode.connect(state.analyser);
        state.analyser.connect(state.audioCtx.destination);
      }
    }
    if (state.audioCtx.state === "suspended") {
      await state.audioCtx.resume();
    }
  }

  function setLyric(song, time, output) {
    if (!song || !output) return;
    let line = song.lyrics[0].text;
    for (const lyric of song.lyrics) {
      if (time >= lyric.time) {
        line = lyric.text;
      }
    }
    if (output.textContent !== line) {
      output.classList.add("pop");
      window.setTimeout(() => {
        output.textContent = line;
        output.classList.remove("pop");
      }, 120);
    }
  }

  function setupVisualizer(canvas, audio) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const resize = () => {
      const ratio = Math.max(1, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    return { canvas, ctx, resize, audio };
  }

  function drawVisualizer() {
    if (!state.viz) return;
    const { ctx, canvas, audio } = state.viz;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const baseRadius = Math.min(w, h) * 0.18;

    const song = state.songs[state.currentTrack];
    const spectrum = state.analyser && state.frequencyData ? state.frequencyData : null;
    let totalBars = 64;
    let bars = new Array(totalBars).fill(0);

    if (spectrum && state.analyser) {
      state.analyser.getByteFrequencyData(spectrum);
      totalBars = Math.min(64, spectrum.length);
      bars = Array.from({ length: totalBars }, (_, i) => spectrum[i]);
    } else {
      const t = performance.now() * 0.001;
      bars = Array.from({ length: totalBars }, (_, i) => (Math.sin(t * 2 + i * 0.24) + 1) * 92);
    }

    ctx.save();
    ctx.translate(cx, cy);

    const rotation = audio && !audio.paused ? audio.currentTime * 0.9 : performance.now() * 0.00025;
    ctx.rotate(rotation);

    for (let i = 0; i < totalBars; i++) {
      const value = bars[i] || 0;
      const angle = (i / totalBars) * Math.PI * 2;
      const inner = baseRadius + 18;
      const outer = inner + 16 + value * 0.42;

      const x1 = Math.cos(angle) * inner;
      const y1 = Math.sin(angle) * inner;
      const x2 = Math.cos(angle) * outer;
      const y2 = Math.sin(angle) * outer;

      const alpha = 0.35 + (value / 255) * 0.65;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    const pulse = audio && !audio.paused ? 1 + Math.sin(audio.currentTime * 8) * 0.06 : 1 + Math.sin(performance.now() * 0.004) * 0.03;
    const currentGlow = song ? song.accent[0] : "#38bdf8";

    ctx.rotate(-rotation * 0.8);
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 1.08 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();

    ctx.strokeStyle = currentGlow;
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 1.2 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.restore();

    requestAnimationFrame(drawVisualizer);
  }

  function setupStarfield() {
    const canvas = document.getElementById("starfieldCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = [];
    const starCount = 180;

    const resize = () => {
      const ratio = Math.max(1, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: 0.6 + Math.random() * 1.8,
          speed: 0.08 + Math.random() * 0.42,
          twinkle: Math.random() * Math.PI * 2,
          drift: (Math.random() - 0.5) * 0.12
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const t = performance.now() * 0.001;

      for (const star of stars) {
        star.x += star.speed * 0.22;
        star.y += star.drift;

        if (star.x > w + 12) star.x = -12;
        if (star.y > h + 12) star.y = -12;
        if (star.y < -12) star.y = h + 12;

        const twinkle = 0.52 + Math.sin(t * 3 + star.twinkle) * 0.48;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.28 + twinkle * 0.58})`;
        ctx.fill();
      }

      requestAnimationFrame(render);
    };

    render();
  }

  function createWavUrl(spec) {
    const sampleRate = 44100;
    const duration = spec.duration;
    const samples = Math.floor(sampleRate * duration);
    const channels = 2;
    const bytesPerSample = 2;
    const blockAlign = channels * bytesPerSample;
    const buffer = new ArrayBuffer(44 + samples * blockAlign);
    const view = new DataView(buffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    const clampSample = (value) => Math.max(-1, Math.min(1, value));

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples * blockAlign, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(36, "data");
    view.setUint32(40, samples * blockAlign, true);

    let offset = 44;

    const step = 60 / spec.bpm / 2;
    const beat = 60 / spec.bpm;
    const bassFreq = spec.root / 2;
    const melodyBase = spec.root;
    const scale = spec.sequence;
    const noise = (n) => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const stepIndex = Math.floor(t / step);
      const beatIndex = Math.floor(t / beat);
      const localStep = (t % step) / step;
      const localBeat = (t % beat) / beat;

      const env = localStep < 0.14
        ? localStep / 0.14
        : localStep > 0.74
          ? Math.max(0, (1 - localStep) / 0.26)
          : 1;

      const n = scale[stepIndex % scale.length];
      const freq = melodyBase * n;
      const melody = Math.sin(2 * Math.PI * freq * t) * 0.14 * env;
      const overtone = Math.sin(2 * Math.PI * freq * 2 * t + 0.3) * 0.05 * env;
      const pad = Math.sin(2 * Math.PI * (melodyBase * 0.5) * t + Math.sin(t * 0.12 + spec.phase)) * 0.06;
      const bass = Math.sin(2 * Math.PI * bassFreq * t) * (0.16 + (beatIndex % 4 === 3 ? 0.06 : 0));
      const kick = localBeat < 0.05 ? (1 - localBeat / 0.05) * 0.54 : 0;
      const hatPhase = (t % (beat / 2)) / (beat / 2);
      const hat = hatPhase > 0.78 ? (1 - hatPhase) * 0.16 * (noise(stepIndex) - 0.5) : 0;
      const sweep = Math.sin(2 * Math.PI * 0.08 * t + spec.phase) * 0.05;

      const left = clampSample((melody + overtone + pad + bass + kick + hat + sweep) * 0.8);
      const right = clampSample((melody * 0.97 + overtone * 1.04 + pad * 1.03 + bass * 0.96 + kick + hat * 0.82 - sweep * 0.5) * 0.8);

      view.setInt16(offset, left < 0 ? left * 0x8000 : left * 0x7fff, true);
      view.setInt16(offset + 2, right < 0 ? right * 0x8000 : right * 0x7fff, true);
      offset += 4;
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    return URL.createObjectURL(blob);
  }
})();
