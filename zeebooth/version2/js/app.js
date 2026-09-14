(() => {
  const page = document.body?.dataset.page;
  const navMap = {
    home: document.querySelector('[data-nav="home"]'),
    photos: document.querySelector('[data-nav="photos"]'),
    history: document.querySelector('[data-nav="history"]')
  };

  if (navMap[page]) navMap[page].classList.add("active");

  window.Zeebooth = window.Zeebooth || {};

  window.Zeebooth.uid = (prefix = "z") =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  window.Zeebooth.formatDate = (iso) =>
    new Intl.DateTimeFormat(undefined, {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }).format(new Date(iso));

  window.Zeebooth.playTone = (frequency = 880, duration = 0.09, type = "sine", gainValue = 0.045) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  window.Zeebooth.beep = (n) => {
    const tones = {3: 620, 2: 720, 1: 840, 0: 1080};
    window.Zeebooth.playTone(tones[n] || 760, 0.1, "square", 0.035);
  };

  window.Zeebooth.shutterSound = () => {
    window.Zeebooth.playTone(1450, 0.055, "triangle", 0.05);
    setTimeout(() => window.Zeebooth.playTone(760, 0.075, "triangle", 0.035), 40);
  };
})();
