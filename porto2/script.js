// --- LOGIKA WELCOME SCREEN ANIMATION ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Kunci scroll saat animasi welcome muncul
    document.body.classList.add('no-scroll');

    // 2. Beri jeda 3.5 detik sebelum layar welcome menghilang (fade out)
    setTimeout(() => {
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.visibility = 'hidden';
            
            // 3. Hapus layar welcome dari DOM setelah transisi opacity selesai (0.8s) & buka kunci scroll
            setTimeout(() => {
                document.body.classList.remove('no-scroll');
                welcomeScreen.remove();
            }, 800);
        }
    }, 3500); // 3500ms = 3.5 detik
});

// Toggle Hamburger Menu for Mobile / Tablet
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Ganti icon hamburger ke silang (X)
    const icon = hamburger.querySelector('i');
    if(navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Smooth Scrolling untuk Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        // Tutup menu mobile jika link diklik
        if(navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        }

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // -70 untuk jarak sticky navbar
                behavior: 'smooth'
            });
        }
    });
});

