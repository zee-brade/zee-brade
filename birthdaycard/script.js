const candleBtn = document.getElementById('candleBtn');
const flame = document.getElementById('flame');
const finalScreen = document.getElementById('finalScreen');
const instructionText = document.getElementById('instructionText');

let holdTimer;

// Fungsi pas lilin diteken lama (Hold)
function startHold() {
    holdTimer = setTimeout(() => {
        flame.style.opacity = '0'; // Api padam, amannn bukan berak!
        instructionText.innerText = "Wishes sent! ✨";
        
        setTimeout(() => {
            finalScreen.classList.add('active');
            createBalloons();
        }, 1000);
    }, 1500); // 1.5 detik jeda hold
}

function cancelHold() {
    clearTimeout(holdTimer);
}

// Event Listener buat PC (Mouse)
candleBtn.addEventListener('mousedown', startHold);
candleBtn.addEventListener('mouseup', cancelHold);
candleBtn.addEventListener('mouseleave', cancelHold);

// Event Listener buat HP (Touch) - Penting nih biar mulus di HP lu
candleBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startHold();
});
candleBtn.addEventListener('touchend', cancelHold);

// Fungsi Bikin Balon Terbang Acak
function createBalloons() {
    const colors = ['#ff5964', '#35a7ff', '#386fa4', '#f1e8b8', '#f94144', '#f9c74f', '#90be6d'];
    for (let i = 0; i < 30; i++) {
        const balloon = document.createElement('div');
        balloon.classList.add('balloon');
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = Math.random() * 100 + 'vw';
        balloon.style.animationDelay = Math.random() * 3 + 's';
        balloon.style.animationDuration = (Math.random() * 3 + 4) + 's';
        finalScreen.appendChild(balloon);
    }
}
