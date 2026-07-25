(() => {
  const body = document.body;
  const introOverlay = document.getElementById('introOverlay');
  const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
  const sceneSections = [
    'hero', 'about', 'projects', 'toolkit', 'journey', 'github', 'music', 'footer'
  ].map(id => document.getElementById(id)).filter(Boolean);

  const hero = document.getElementById('hero');
  const parallaxWord = document.querySelector('[data-parallax-word]');
  const paperPlane = document.getElementById('paperPlane');
  const heatmapGrid = document.getElementById('heatmapGrid');
  const albumOrbit = document.getElementById('albumOrbit');
  const trackName = document.getElementById('trackName');
  const playBtn = document.getElementById('playBtn');
  const progressBar = document.getElementById('progressBar');
  const currentTimeEl = document.getElementById('currentTime');
  const trackDurationEl = document.getElementById('trackDuration');
  const lyricsWrap = document.getElementById('lyrics');
  const starfieldCanvas = document.getElementById('starfieldCanvas');
  const visualizerCanvas = document.getElementById('visualizerCanvas');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const formatTime = seconds => {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  // INTRO CURTAIN
  window.addEventListener('load', () => {
    const delay = prefersReducedMotion ? 250 : 1800;
    setTimeout(() => {
      introOverlay.classList.add('is-hidden');
      setTimeout(() => {
        introOverlay.remove();
      }, 1300);
    }, delay);
  });

  // REVEAL ON SCROLL
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        const idx = revealTargets.indexOf(entry.target);
        if (idx >= 0) entry.target.style.setProperty('--delay', `${Math.min(idx * 85, 420)}ms`);

        if (entry.target.closest('#github')) {
          animateHeatmap();
        }
        if (entry.target.closest('#music')) {
          layoutAlbums();
        }
        if (entry.target.closest('#journey')) {
          updatePlane();
        }
      }
    });
  }, { threshold: 0.18 });

  revealTargets.forEach(el => observer.observe(el));

  // SECTION SCENE TRACKING
  const sceneObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) {
      body.dataset.scene = visible.target.id;
      if (visible.target.id === 'music') {
        layoutAlbums();
      }
      if (visible.target.id === 'journey') {
        updatePlane();
      }
      if (visible.target.id === 'github') {
        animateHeatmap();
      }
    }
  }, { threshold: [0.2, 0.35, 0.55, 0.7] });

  sceneSections.forEach(sec => sceneObserver.observe(sec));

  // PARALLAX
  const parallax = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0
  };

  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) - 0.5;
    const ny = (e.clientY / window.innerHeight) - 0.5;
    parallax.tx = nx;
    parallax.ty = ny;
  });

  window.addEventListener('scroll', () => {
    updatePlane();
    updateSectionWord();
    updateSceneFromScroll();
  }, { passive: true });

  function updateSceneFromScroll() {
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const center = window.innerHeight * 0.35;
    const inHero = rect.top <= center && rect.bottom >= center;
    if (inHero) body.dataset.scene = 'hero';
  }

  function animateParallax() {
    parallax.x = lerp(parallax.x, parallax.tx, 0.08);
    parallax.y = lerp(parallax.y, parallax.ty, 0.08);

    const px = parallax.x * 22;
    const py = parallax.y * 18;
    document.documentElement.style.setProperty('--hero-parallax-x', `${px}px`);
    document.documentElement.style.setProperty('--hero-parallax-y', `${py}px`);

    const layers = document.querySelectorAll('.mountain, .forest-stripes, .hero-glow');
    layers.forEach((layer, i) => {
      const depth = (i + 1) * 0.65;
      layer.style.transform = `translate3d(${px * depth}px, ${py * depth}px, 0)`;
    });

    if (parallaxWord) {
      const amount = window.scrollY * 0.16;
      parallaxWord.style.transform = `translateX(-50%) translate3d(0, ${amount * -0.22}px, 0)`;
    }

    requestAnimationFrame(animateParallax);
  }
  requestAnimationFrame(animateParallax);

  function updateSectionWord() {
    if (!parallaxWord) return;
    const about = document.getElementById('about');
    const rect = about.getBoundingClientRect();
    const progress = clamp(1 - (rect.top + rect.height * 0.25) / (window.innerHeight + rect.height), 0, 1);
    parallaxWord.style.opacity = String(0.08 + progress * 0.12);
  }

  // HEATMAP
  const heatCells = [];
  function buildHeatmap() {
    if (!heatmapGrid) return;
    heatmapGrid.innerHTML = '';
    const total = 16 * 7;
    for (let i = 0; i < total; i++) {
      const cell = document.createElement('div');
      cell.className = 'heat-cell';
      cell.style.transitionDelay = `${i * 12}ms`;
      heatmapGrid.appendChild(cell);
      heatCells.push(cell);
    }
  }

  let heatmapAnimated = false;
  function animateHeatmap() {
    if (heatmapAnimated || !heatCells.length) return;
    heatmapAnimated = true;
    heatCells.forEach((cell, i) => {
      setTimeout(() => cell.classList.add('active'), i * 18);
    });
  }

  buildHeatmap();

  // PAPER PLANE PATH
  function updatePlane() {
    if (!paperPlane) return;
    const section = document.getElementById('journey');
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const sectionHeight = rect.height;
    const scrollCenter = window.scrollY + window.innerHeight * 0.45;

    const t = clamp((scrollCenter - sectionTop) / sectionHeight, 0, 1);
    const trackWidth = Math.min(window.innerWidth * 0.34, 320);
    const x = 18 + Math.sin(t * Math.PI * 2) * 22 + t * trackWidth;
    const y = t * Math.max(sectionHeight - 120, 500);
    const angle = 18 + Math.cos(t * Math.PI * 2) * 12;

    paperPlane.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
  }

  // ALBUM ORBIT
  const albums = Array.from(document.querySelectorAll('.album-card'));
  const albumData = [
    { title: 'Neon Drift', hue: 28 },
    { title: 'Orbit Glow', hue: 195 },
    { title: 'Midnight Pulse', hue: 340 },
    { title: 'Aurora Loop', hue: 150 },
    { title: 'Static Bloom', hue: 256 },
    { title: 'Starlane', hue: 42 },
    { title: 'Wave Runner', hue: 188 },
    { title: 'Cosmic Tape', hue: 310 }
  ];

  let selectedAlbum = 0;

  function layoutAlbums() {
    if (!albumOrbit || !albums.length) return;

    const radiusX = Math.min(albumOrbit.clientWidth * 0.36, 260);
    const radiusY = Math.min(albumOrbit.clientHeight * 0.16, 88);
    const centerX = albumOrbit.clientWidth / 2;
    const centerY = albumOrbit.clientHeight / 2 + 34;
    const spread = Math.PI * 1.38;
    const start = -Math.PI * 0.92;

    albums.forEach((card, i) => {
      const active = i === selectedAlbum;
      const n = albums.length;
      const step = n > 1 ? i / (n - 1) : 0;
      const angle = start + spread * step;
      const x = active ? centerX : centerX + Math.cos(angle) * radiusX;
      const y = active ? centerY - 40 : centerY + Math.sin(angle) * radiusY;
      const rot = active ? 0 : clamp(Math.cos(angle) * 16, -16, 16);
      const scale = active ? 1.55 : 0.92 + Math.sin(step * Math.PI) * 0.08;
      const blur = active ? 0 : 2.4;
      const opacity = active ? 1 : 0.74;

      card.style.zIndex = active ? 5 : String(1 + i);
      card.style.opacity = opacity;
      card.style.filter = `blur(${blur}px) saturate(${active ? 1.15 : 0.7})`;
      card.style.transform = `translate(-50%, -50%) translate3d(${x - centerX}px, ${y - centerY}px, 0) rotate(${rot}deg) scale(${scale})`;
    });
  }

  function selectAlbum(index) {
    selectedAlbum = index;
    const selected = albums[index];
    if (!selected) return;

    albums.forEach((card, i) => card.classList.toggle('is-selected', i === index));
    const title = selected.dataset.title || albumData[index]?.title || `Track ${index + 1}`;
    trackName.textContent = title;
    audioEngine.setTrack(index);
    layoutAlbums();
  }

  albums.forEach((card, index) => {
    card.addEventListener('click', () => selectAlbum(index));
  });

  window.addEventListener('resize', () => {
    layoutAlbums();
    resizeCanvas(starfieldCanvas, starfieldState);
    resizeCanvas(visualizerCanvas, visualizerState);
    updatePlane();
  });

  // AUDIO ENGINE
  const DURATION = 63;
  const lyrics = [
    { t: 0, text: 'Take off through the static night.' },
    { t: 11, text: 'Let the neon carry the frame.' },
    { t: 24, text: 'Orbit slow, then bloom in light.' },
    { t: 37, text: 'Every pulse remembers your name.' },
    { t: 49, text: 'The sky turns soft electric blue.' },
    { t: 57, text: 'One more loop and back to you.' }
  ];

  const trackDur = DURATION;
  trackDurationEl.textContent = formatTime(trackDur);

  const audioEngine = (() => {
    let ctx = null;
    let analyser = null;
    let master = null;
    let compressor = null;
    let lfo = null;
    let lfoGain = null;
    let padOscs = [];
    let bassOsc = null;
    let beatInterval = null;
    let melodyInterval = null;
    let harmonyInterval = null;
    let started = false;
    let playing = false;
    let pausedAt = 0;
    let startAt = 0;
    let currentTrack = 0;

    const trackPalettes = [
      { name: 'Neon Drift', root: 110, chord: [110, 138.59, 164.81], filter: 740 },
      { name: 'Orbit Glow', root: 123.47, chord: [123.47, 155.56, 185], filter: 820 },
      { name: 'Midnight Pulse', root: 98, chord: [98, 123.47, 146.83], filter: 680 },
      { name: 'Aurora Loop', root: 130.81, chord: [130.81, 164.81, 196], filter: 900 },
      { name: 'Static Bloom', root: 92.5, chord: [92.5, 116.54, 146.83], filter: 700 },
      { name: 'Starlane', root: 146.83, chord: [146.83, 174.61, 220], filter: 980 },
      { name: 'Wave Runner', root: 87.31, chord: [87.31, 110, 130.81], filter: 760 },
      { name: 'Cosmic Tape', root: 103.83, chord: [103.83, 130.81, 155.56], filter: 840 }
    ];

    function makeNoiseBuffer(ctx) {
      const len = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      return buffer;
    }

    function init() {
      if (started) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.88;

      compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 20;
      compressor.ratio.value = 9;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.18;

      master = ctx.createGain();
      master.gain.value = 0.0;

      master.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(ctx.destination);

      lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = 22;
      lfo.connect(lfoGain);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = trackPalettes[0].filter;
      filter.Q.value = 0.8;

      lfoGain.connect(filter.frequency);
      filter.connect(master);

      padOscs = trackPalettes[0].chord.map((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = index === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = index * 4 - 4;
        const g = ctx.createGain();
        g.gain.value = index === 0 ? 0.16 : 0.08;
        osc.connect(g);
        g.connect(filter);
        osc.start();
        return { osc, g };
      });

      bassOsc = ctx.createOscillator();
      bassOsc.type = 'sine';
      bassOsc.frequency.value = trackPalettes[0].root / 2;
      const bassGain = ctx.createGain();
      bassGain.gain.value = 0.16;
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.value = 220;
      bassOsc.connect(bassGain);
      bassGain.connect(bassFilter);
      bassFilter.connect(master);
      bassOsc.start();

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = makeNoiseBuffer(ctx);
      noiseSource.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1400;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.02;
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noiseSource.start();

      lfo.start();
      started = true;
    }

    function pulseBeat() {
      if (!ctx || !playing) return;
      const now = ctx.currentTime;
      const kick = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kick.type = 'sine';
      kick.frequency.setValueAtTime(150, now);
      kick.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      kickGain.gain.setValueAtTime(0.22, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      kick.connect(kickGain);
      kickGain.connect(master);
      kick.start(now);
      kick.stop(now + 0.16);
    }

    function updateHarmony(index = currentTrack) {
      if (!ctx || !padOscs.length) return;
      const palette = trackPalettes[index];
      const now = ctx.currentTime;

      padOscs.forEach((voice, i) => {
        const target = palette.chord[i];
        voice.osc.frequency.cancelScheduledValues(now);
        voice.osc.frequency.setTargetAtTime(target, now, 0.12 + i * 0.03);
        voice.g.gain.cancelScheduledValues(now);
        voice.g.gain.setTargetAtTime(i === 0 ? 0.17 : 0.08, now, 0.14);
      });
      bassOsc.frequency.setTargetAtTime(palette.root / 2, now, 0.14);
      master.gain.setTargetAtTime(0.72, now, 0.15);

      if (ctx) {
        const filterNode = compressor ? compressor : null;
        if (filterNode) {
          // no-op; kept for structure clarity
        }
      }
    }

    function scheduleMoodChanges() {
      clearInterval(harmonyInterval);
      clearInterval(beatInterval);
      clearInterval(melodyInterval);

      beatInterval = setInterval(() => {
        pulseBeat();
      }, 500);

      harmonyInterval = setInterval(() => {
        if (!playing) return;
        const palette = trackPalettes[currentTrack];
        const drift = 0.98 + Math.random() * 0.04;
        padOscs.forEach((voice, i) => {
          const detune = (i - 1) * 6 + (Math.random() - 0.5) * 4;
          voice.osc.detune.setTargetAtTime(detune, ctx.currentTime, 0.1);
          voice.g.gain.setTargetAtTime(i === 0 ? 0.17 : 0.09, ctx.currentTime, 0.1);
        });
        bassOsc.frequency.setTargetAtTime((palette.root / 2) * drift, ctx.currentTime, 0.12);
      }, 2200);

      const leadSequence = [0, 2, 4, 7, 9, 7, 4, 2];
      let step = 0;
      melodyInterval = setInterval(() => {
        if (!playing || !ctx) return;
        const palette = trackPalettes[currentTrack];
        const note = leadSequence[step % leadSequence.length];
        const lead = ctx.createOscillator();
        const leadGain = ctx.createGain();
        const leadFilter = ctx.createBiquadFilter();
        lead.type = 'triangle';
        lead.frequency.value = palette.root * Math.pow(2, note / 12);
        leadFilter.type = 'bandpass';
        leadFilter.frequency.value = 1200 + note * 70;
        leadFilter.Q.value = 5;

        const now = ctx.currentTime;
        leadGain.gain.setValueAtTime(0.0001, now);
        leadGain.gain.exponentialRampToValueAtTime(0.09, now + 0.05);
        leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

        lead.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(master);
        lead.start(now);
        lead.stop(now + 0.5);

        step++;
      }, 625);
    }

    function start() {
      init();
      if (!ctx) return;
      ctx.resume();
      if (!started) return;
      playing = true;
      startAt = ctx.currentTime - pausedAt;
      master.gain.setTargetAtTime(0.72, ctx.currentTime, 0.15);
      scheduleMoodChanges();
      updateHarmony(currentTrack);
    }

    function pause() {
      if (!ctx) return;
      playing = false;
      pausedAt = getTime();
      master.gain.setTargetAtTime(0.0, ctx.currentTime, 0.08);
      clearInterval(beatInterval);
      clearInterval(melodyInterval);
      clearInterval(harmonyInterval);
    }

    function toggle() {
      if (!started || !playing) {
        start();
        return true;
      }
      pause();
      return false;
    }

    function setTrack(index) {
      currentTrack = index % trackPalettes.length;
      if (trackName) trackName.textContent = trackPalettes[currentTrack].name;
      updateHarmony(currentTrack);
    }

    function getTime() {
      if (!ctx) return pausedAt;
      return playing ? (ctx.currentTime - startAt) : pausedAt;
    }

    function getAnalyser() {
      return analyser;
    }

    function isPlaying() {
      return playing;
    }

    return {
      start,
      pause,
      toggle,
      setTrack,
      getTime,
      getAnalyser,
      isPlaying
    };
  })();

  // MUSIC UI
  let activeLyricIndex = 0;

  function updateLyrics(time) {
    const idx = lyrics
      .map((line, i) => ({ i, t: line.t }))
      .reverse()
      .find(item => time >= item.t)?.i ?? 0;

    if (idx !== activeLyricIndex) {
      activeLyricIndex = idx;
      Array.from(lyricsWrap.children).forEach((node, i) => {
        node.classList.toggle('is-active', i === idx);
      });
    }
  }

  function updateMusicUI() {
    const time = audioEngine.getTime();
    const pct = clamp((time % DURATION) / DURATION, 0, 1);
    progressBar.style.width = `${pct * 100}%`;
    currentTimeEl.textContent = formatTime(time % DURATION);
    updateLyrics(time % DURATION);

    if (playBtn) {
      playBtn.textContent = audioEngine.isPlaying() ? 'PAUSE' : 'PLAY';
    }

    requestAnimationFrame(updateMusicUI);
  }

  playBtn?.addEventListener('click', async () => {
    const playing = audioEngine.toggle();
    playBtn.textContent = playing ? 'PAUSE' : 'PLAY';
    if (playing) {
      await maybeStartVisualizer();
    }
  });

  albums.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      selectAlbum(idx);
      trackName.textContent = albumData[idx]?.title || btn.dataset.title || 'Track';
      if (!audioEngine.isPlaying()) {
        audioEngine.start();
        playBtn.textContent = 'PAUSE';
        maybeStartVisualizer();
      }
    });
  });

  // STARFIELD CANVAS
  const starfieldState = {
    ctx: null,
    w: 0,
    h: 0,
    stars: [],
    ready: false
  };

  function resizeCanvas(canvas, state) {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    state.w = canvas.width;
    state.h = canvas.height;
    state.ctx = canvas.getContext('2d');
    state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.w = rect.width;
    state.h = rect.height;
    state.dpr = dpr;
  }

  function buildStars() {
    const count =
