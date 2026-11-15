    // ============================================================================
    // 2. PROCEDURAL WEB AUDIO API PENTATONIC HARP, WIND & SPATIAL WATERFALL ENGINE
    // ============================================================================
    class AetheriaAudioEngine {
      constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.waterfallGain = null;
        this.isMuted = false;
        this.started = false;
        this.noteTimer = 0.7;
        // Serene C-Major / A-Minor Pentatonic Harp Scale
        this.notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
        this.lastNote = 4;
      }

      init() {
        if (this.started) return;
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);

          this._startBreezeAndWaterfallBeds();
          this.started = true;
        } catch (e) {
          console.warn('Web Audio API unavailable:', e);
        }
      }

      _startBreezeAndWaterfallBeds() {
        if (!this.ctx) return;
        const len = this.ctx.sampleRate * 3;
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (last + 0.02 * white) / 1.02;
          last = data[i];
          data[i] *= 0.16;
        }

        // Gentle valley wind bed
        const windSrc = this.ctx.createBufferSource();
        windSrc.buffer = buf;
        windSrc.loop = true;
        const windFilter = this.ctx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.value = 320;
        const windGain = this.ctx.createGain();
        windGain.gain.value = 0.24;
        windSrc.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(this.masterGain);
        windSrc.start();

        // Spatial Crystal Falls rushing water bed
        const wfSrc = this.ctx.createBufferSource();
        wfSrc.buffer = buf;
        wfSrc.loop = true;
        const wfFilter = this.ctx.createBiquadFilter();
        wfFilter.type = 'bandpass';
        wfFilter.frequency.value = 600;
        wfFilter.Q.value = 0.7;
        this.waterfallGain = this.ctx.createGain();
        this.waterfallGain.gain.value = 0.02;
        wfSrc.connect(wfFilter);
        wfFilter.connect(this.waterfallGain);
        this.waterfallGain.connect(this.masterGain);
        wfSrc.start();
      }

      toggleMute() {
        if (!this.started) this.init();
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.32, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
      }

      update(dt, isChilling, distToWaterfall) {
        if (!this.started || this.isMuted || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        if (this.waterfallGain) {
          const proximity = Math.max(0, Math.min(1, 1 - (distToWaterfall - 10) / 55));
          this.waterfallGain.gain.setTargetAtTime(proximity * 0.42, this.ctx.currentTime, 0.15);
        }

        this.noteTimer -= dt;
        if (this.noteTimer <= 0) {
          this.playHarpPluck();
          this.noteTimer = isChilling ? (1.0 + Math.random() * 1.2) : (1.7 + Math.random() * 2.2);
        }
      }

      playHarpPluck(customNoteIdx = null) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        if (customNoteIdx !== null) {
          this.lastNote = customNoteIdx % this.notes.length;
        } else {
          const step = Math.floor(Math.random() * 5) - 2;
          this.lastNote = Math.max(0, Math.min(this.notes.length - 1, this.lastNote + step));
        }
        const freq = this.notes[this.lastNote];

        const osc = this.ctx.createOscillator();
        const overtone = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const overGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, now);
        overGain.gain.setValueAtTime(0.025, now);
        overGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.11, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 3.2);

        osc.connect(gain);
        overtone.connect(overGain);
        overGain.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + 3.3);
        overtone.stop(now + 1.9);
      }

      playStep(onWood = false) {
        if (!this.ctx || this.isMuted || !this.started) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = onWood ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(onWood ? 155 + Math.random() * 22 : 86 + Math.random() * 18, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.06);
        gain.gain.setValueAtTime(onWood ? 0.055 : 0.028, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
      }

      playWindWhoosh(highPitch = false) {
        if (!this.ctx || this.isMuted || !this.started) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(highPitch ? 340 : 220, now);
        osc.frequency.exponentialRampToValueAtTime(highPitch ? 760 : 510, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.38);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.stop(now + 0.42);
      }

      playChime(freqs = [523.25, 659.25, 783.99, 1046.50]) {
        if (!this.ctx || this.isMuted || !this.started) return;
        const now = this.ctx.currentTime;
        freqs.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.001, now + i * 0.07);
          gain.gain.linearRampToValueAtTime(0.095, now + i * 0.07 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.07 + 1.6);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 1.7);
        });
      }
    }

