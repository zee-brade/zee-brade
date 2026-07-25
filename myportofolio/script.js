const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const revealEls = document.querySelectorAll('.reveal');
const heatmap = document.getElementById('heatmap');

const playPauseBtn = document.getElementById('playPauseBtn');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const lyricsLine = document.getElementById('lyricsLine');
const visualizerRing = document.getElementById('visualizerRing');
const albumArt = document.getElementById('albumArt');
const activeTrackTitle = document.getElementById('activeTrackTitle');
const activeTrackArtist = document.getElementById('activeTrackArtist');
const trackList = document.getElementById('trackList');

const starCanvas = document.getElementById('starfield');
const starCtx = starCanvas.getContext('2d');

const tracks = [
{
title: 'Blue Orbit',
artist: 'ALANGKUN MIX',
bpm: 96,
duration: 48,
lyrics: [
{ time: 0, text: 'Floating through the midnight code,' },
{ time: 5, text: 'Neon lines and a quiet load.' },
{ time: 11, text: 'Every pulse is a city light,' },
{ time: 17, text: 'Every build feels sharp tonight.' },
{ time: 24, text: 'Hold the wave, keep the signal clean,' },
{ time: 31, text: 'Turn the dream into a screen.' },
{ time: 39, text: 'Orbit high, let the system glow,' },
{ time: 45, text: 'One more beat before we go.' }
]
},
{
title: 'Night Pulse',
artist: 'ALANGKUN MIX',
bpm: 108,
duration: 46,
lyrics: [
{ time: 0, text: 'City hum, electric skin,' },
{ time: 6, text: 'Front-end fire from within.' },
{ time: 12, text: 'Interfaces breathe in time,' },
{ time: 18, text: 'Every motion lands like rhyme.' },
{ time: 25, text: 'Build it bold, build it right,' },
{ time: 33, text: 'Glass and chrome in midnight light.' },
{ time: 40, text: 'When the beat comes back around,' },
{ time: 44, text: 'We stay steady, cool, and found.' }
]
},
{
title: 'Pixel Rain',
artist: 'ALANGKUN MIX',
bpm: 84,
duration: 50,
lyrics: [
{ time: 0, text: 'Tiny sparks across the pane,' },
{ time: 6, text: 'Soft design in pixel rain.' },
{ time: 13, text: 'Brush the edges, fade the noise,' },
{ time: 19, text: 'Ship the thing, enjoy the choice.' },
{ time: 27, text: 'Slowly now, then snap to bright,' },
{ time: 35, text: 'Little stars in muted night.' },
{ time: 43, text: 'Let the rhythm trim the frame,' },
{ time: 48, text: 'Same old soul, brand new flame.' }
]
}
];

let currentTrackIndex = 0;
let audioCtx;
let analyser;
let masterGain;
let audioSource = null;
let trackBufferMap = new Map();
let isPlaying = false;
let startTime = 0;
let pausedAt = 0;
let rafId = null;
let visualizerId = null;
let activeBars = [];
let lastLyricsIndex = -1;

function formatTime(seconds) {
if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
const m = Math.floor(seconds / 60);
const s = Math.floor(seconds % 60);
return "${m}:${String(s).padStart(2, '0')}";
}

function clamp(value, min, max) {
return Math.min(max, Math.max(min, value));
}

function initAudioContext() {
if (audioCtx) return;
const AC = window.AudioContext || window.webkitAudioContext;
audioCtx = new AC();
analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
masterGain = audioCtx.createGain();
masterGain.gain.value = volume.value / 100;

analyser.connect(masterGain);
masterGain.connect(audioCtx.destination);
}

function generateTrackBuffer(track) {
const sampleRate = audioCtx.sampleRate;
const length = Math.floor(track.duration * sampleRate);
const buffer = audioCtx.createBuffer(2, length, sampleRate);
const left = buffer.getChannelData(0);
const right = buffer.getChannelData(1);

const beatSeconds = 60 / track.bpm;
const notes = [220, 277.18, 329.63, 392, 440, 523.25, 659.25, 493.88];
const bassNotes = [55, 65.41, 73.42, 82.41];

let phaseL = 0;
let phaseR = 0;

for (let i = 0; i < length; i++) {
const t = i / sampleRate;
const beat = Math.floor(t / beatSeconds);
const sub = (t % beatSeconds) / beatSeconds;
const idx = beat % notes.length;
const bassIdx = Math.floor(beat / 2) % bassNotes.length;

const kick = Math.exp(-Math.pow((sub - 0.02) / 0.045, 2)) * 0.85;
const snare = Math.exp(-Math.pow((sub - 0.52) / 0.08, 2)) * 0.25;
const hat = Math.sin(t * 78) * 0.012 * ((beat % 2 === 0) ? 1 : 0.7);

const leadFreq = notes[idx] * (beat % 8 >= 6 ? 0.5 : 1);
const bassFreq = bassNotes[bassIdx];

phaseL += (2 * Math.PI * leadFreq) / sampleRate;
phaseR += (2 * Math.PI * (leadFreq * 1.005)) / sampleRate;

const lead = Math.sin(phaseL) * 0.18 + Math.sin(phaseL * 2.01) * 0.05;
const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.12;
const pad = Math.sin(2 * Math.PI * (leadFreq / 2) * t) * 0.05;

const pulse = Math.sin(t * 2.2) * 0.02 + Math.sin(t * 0.7) * 0.015;
const mix = (lead + bass + pad + kick + snare + hat + pulse) * 0.75;

const stereoSpread = Math.sin(t * 0.9) * 0.02;
left[i] = clamp(mix - stereoSpread, -1, 1);
right[i] = clamp(mix + stereoSpread, -1, 1);

}

return buffer;
}

function ensureBuffer(track) {
if (!trackBufferMap.has(track.title)) {
trackBufferMap.set(track.title, generateTrackBuffer(track));
}
return trackBufferMap.get(track.title);
}

function stopSource() {
if (audioSource) {
try { audioSource.stop(); } catch (e) {}
audioSource.disconnect();
audioSource = null;
}
}

function createSourceFromOffset(offsetSeconds) {
const track = tracks[currentTrackIndex];
const buffer = ensureBuffer(track);

const source = audioCtx.createBufferSource();
source.buffer = buffer;
source.connect(analyser);
source.onended = () => {
if (isPlaying) {
pausedAt = 0;
isPlaying = false;
playPauseBtn.textContent = '▶';
cancelAnimationFrame(rafId);
cancelAnimationFrame(visualizerId);
updateLyrics(0);
updateProgress(0);
}
};

const safeOffset = clamp(offsetSeconds, 0, Math.max(0, buffer.duration - 0.05));
source.start(0, safeOffset);

return source;
}

function getTrackTime() {
if (!isPlaying) return pausedAt;
return audioCtx.currentTime - startTime;
}

function updateProgress(seconds) {
const track = tracks[currentTrackIndex];
const buffer = ensureBuffer(track);
const duration = buffer.duration;
const normalized = duration > 0 ? (seconds / duration) * 1000 : 0;
progress.value = String(clamp(normalized, 0, 1000));
currentTimeEl.textContent = formatTime(seconds);
durationEl.textContent = formatTime(duration);
}

function updateLyrics(seconds) {
const track = tracks[currentTrackIndex];
let activeIndex = 0;

for (let i = 0; i < track.lyrics.length; i++) {
if (seconds >= track.lyrics[i].time) activeIndex = i;
}

if (activeIndex !== lastLyricsIndex) {
lastLyricsIndex = activeIndex;
lyricsLine.textContent = track.lyrics[activeIndex].text;
lyricsLine.animate(
[
{ transform: 'translateY(10px)', opacity: 0.2 },
{ transform: 'translateY(0)', opacity: 1 }
],
{ duration: 260, easing: 'ease-out' }
);
}
}

function tick() {
if (!isPlaying) return;
const time = getTrackTime();
updateProgress(time);
updateLyrics(time);

const buffer = ensureBuffer(tracks[currentTrackIndex]);
if (time >= buffer.duration) {
pausedAt = 0;
isPlaying = false;
playPauseBtn.textContent = '▶';
stopSource();
cancelAnimationFrame(rafId);
cancelAnimationFrame(visualizerId);
updateProgress(buffer.duration);
updateLyrics(buffer.duration - 0.1);
return;
}

rafId = requestAnimationFrame(tick);
}

function animateVisualizer() {
if (!analyser) return;
const data = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(data);

const bars = visualizerRing.querySelectorAll('.visualizer-bar');
const count = bars.length;
for (let i = 0; i < count; i++) {
const value = data[Math.floor((i / count) * data.length)] || 0;
const height = 18 + (value / 255) * 64;
const hueShift = 200 + (i % 2) * 35;
bars[i].style.height = "${height}px";
bars[i].style.background = "linear-gradient(180deg, hsl(${hueShift} 95% 64%), hsl(${18 + (i % 8) * 2} 95% 60%))";
bars[i].style.opacity = "${0.35 + value / 450}";
}

visualizerId = requestAnimationFrame(animateVisualizer);
}

function buildVisualizerRing() {
visualizerRing.innerHTML = '';
activeBars = [];
const barCount = 64;
for (let i = 0; i < barCount; i++) {
const bar = document.createElement('span');
bar.className = 'visualizer-bar';
bar.style.transform = "rotate(${i * (360 / barCount)}deg) translateY(-18px)";
visualizerRing.appendChild(bar);
activeBars.push(bar);
}
}

function setTrack(index, autoPlay = true) {
currentTrackIndex = index;
const track = tracks[currentTrackIndex];
activeTrackTitle.textContent = track.title;
activeTrackArtist.textContent = track.artist;
lastLyricsIndex = -1;
updateLyrics(0);
updateProgress(0);

trackList.querySelectorAll('.album-chip').forEach((btn, i) => {
btn.classList.toggle('active', i === index);
});

albumArt.classList.remove('active');
void albumArt.offsetWidth;
albumArt.classList.add('active');

if (isPlaying) {
pausedAt = 0;
stopSource();
audioSource = createSourceFromOffset(0);
startTime = audioCtx.currentTime;
} else if (autoPlay) {
pausedAt = 0;
stopSource();
audioSource = createSourceFromOffset(0);
startTime = audioCtx.currentTime;
isPlaying = true;
playPauseBtn.textContent = '❚❚';
rafId = requestAnimationFrame(tick);
visualizerId = requestAnimationFrame(animateVisualizer);
}
}

function togglePlay() {
initAudioContext();

if (audioCtx.state === 'suspended') {
audioCtx.resume();
}

if (!isPlaying) {
stopSource();
audioSource = createSourceFromOffset(pausedAt);
startTime = audioCtx.currentTime - pausedAt;
isPlaying = true;
playPauseBtn.textContent = '❚❚';
rafId = requestAnimationFrame(tick);
visualizerId = requestAnimationFrame(animateVisualizer);
albumArt.classList.add('active');
return;
}

pausedAt = audioCtx.currentTime - startTime;
isPlaying = false;
playPauseBtn.textContent = '▶';
stopSource();
cancelAnimationFrame(rafId);
cancelAnimationFrame(visualizerId);
}

function seekTo(value) {
initAudioContext();
const buffer = ensureBuffer(tracks[currentTrackIndex]);
const ratio = value / 1000;
const newTime = clamp(buffer.duration * ratio, 0, buffer.duration - 0.05);
pausedAt = newTime;

updateProgress(newTime);
updateLyrics(newTime);

if (isPlaying) {
stopSource();
audioSource = createSourceFromOffset(newTime);
startTime = audioCtx.currentTime - newTime;
}
}

function setVolume(value) {
if (!masterGain) return;
masterGain.gain.value = value / 100;
}

function setupTrackButtons() {
trackList.addEventListener('click', (e) => {
const btn = e.target.closest('.album-chip');
if (!btn) return;
const index = Number(btn.dataset.track);
if (index === currentTrackIndex) {
if (!isPlaying) togglePlay();
return;
}
setTrack(index, true);
});
}

function setupNav() {
navToggle.addEventListener('click', () => {
const open = siteNav.classList.toggle('open');
navToggle.setAttribute('aria-expanded', String(open));
});

navLinks.forEach(link => {
link.addEventListener('click', (e) => {
const href = link.getAttribute('href');
if (!href || !href.startsWith('#')) return;
e.preventDefault();
const target = document.querySelector(href);
if (!target) return;

  siteNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  const offset = document.querySelector('.site-header')?.offsetHeight || 0;
  const y = target.getBoundingClientRect().top + window.scrollY - offset - 10;
  window.scrollTo({ top: y, behavior: 'smooth' });
});

});
}

function setupReveal() {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.classList.add('show');
observer.unobserve(entry.target);
}
});
}, {
threshold: 0.18,
rootMargin: '0px 0px -80px 0px'
});

revealEls.forEach(el => observer.observe(el));
}

function setupHeatmap() {
const months = 12;
const rows = 7;
const total = months * rows * 4;

for (let i = 0; i < total; i++) {
const cell = document.createElement('span');
cell.className = 'day-box';
const seed = (Math.sin(i * 12.9898) * 43758.5453) % 1;
const level = Math.floor(Math.abs(seed) * 5);
const palette = ['#1b2230', '#12331f', '#175932', '#1f8f4a', '#3ed06f'];
cell.style.background = palette[level];
cell.title = "${level} contributions";
heatmap.appendChild(cell);
}
}

function setupStarfield() {
const stars = [];
const count = 180;

function resize() {
const dpr = window.devicePixelRatio || 1;
const { width, height } = starCanvas.getBoundingClientRect();
starCanvas.width = width * dpr;
starCanvas.height = height * dpr;
starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initStars() {
const { width, height } = starCanvas.getBoundingClientRect();
stars.length = 0;
for (let i = 0; i < count; i++) {
stars.push({
x: Math.random() * width,
y: Math.random() * height,
r: Math.random() * 1.6 + 0.2,
vx: (Math.random() - 0.5) * 0.22,
vy: (Math.random() - 0.5) * 0.18,
tw: Math.random() * Math.PI * 2
});
}
}

function draw() {
const { width, height } = starCanvas.getBoundingClientRect();
starCtx.clearRect(0, 0, width, height);
starCtx.fillStyle = 'rgba(255,255,255,0.95)';

for (const s of stars) {
  s.x += s.vx;
  s.y += s.vy;
  s.tw += 0.02;

  if (s.x < -10) s.x = width + 10;
  if (s.x > width + 10) s.x = -10;
  if (s.y < -10) s.y = height + 10;
  if (s.y > height + 10) s.y = -10;

  const alpha = 0.25 + (Math.sin(s.tw) + 1) * 0.25;
  starCtx.globalAlpha = alpha;
  starCtx.beginPath();
  starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
  starCtx.fill();
}

starCtx.globalAlpha = 1;
requestAnimationFrame(draw);

}

resize();
initStars();
draw();
window.addEventListener('resize', () => {
resize();
initStars();
});
}

function setupProgressEvents() {
playPauseBtn.addEventListener('click', togglePlay);
progress.addEventListener('input', (e) => seekTo(Number(e.target.value)));
volume.addEventListener('input', (e) => setVolume(Number(e.target.value)));
}

function setupVisibilityPause() {
document.addEventListener('visibilitychange', () => {
if (document.hidden && isPlaying) {
togglePlay();
}
});
}

function init() {
setupNav();
setupReveal();
setupHeatmap();
setupStarfield();
setupTrackButtons();
setupProgressEvents();
setupVisibilityPause();
buildVisualizerRing();
setTrack(0, false);
durationEl.textContent = formatTime(tracks[0].duration);
currentTimeEl.textContent = '0:00';
setVolume(Number(volume.value));

const firstTrack = tracks[0];
activeTrackTitle.textContent = firstTrack.title;
activeTrackArtist.textContent = firstTrack.artist;
lyricsLine.textContent = firstTrack.lyrics[0].text;
updateLyrics(0);
updateProgress(0);
}

init();
