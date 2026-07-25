document.addEventListener("DOMContentLoaded", () => {
    /* ====================================================
       1. ANIMASI PARTIKEL "WELCOME" (HTML5 CANVAS 3D-FEEL)
    ==================================================== */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set ukuran kanvas layar penuh
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    
    // Fungsi untuk mengekstrak bentuk kata "WELCOME" ke koordinat titik
    function initTextParticles() {
        ctx.fillStyle = 'white';
        // Atur ukuran font responsif agar pas di PC / Mobile
        let fontSize = Math.min(canvas.width / 5, 140);
        ctx.font = `900 ${fontSize}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Tulis teks di layar tersembunyi
        ctx.fillText('WELCOME', canvas.width / 2, canvas.height / 2.5);

        // Ambil data piksel dari teks yang ditulis
        const textData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Menentukan tingkat kepadatan partikel (semakin kecil step, partikel makin banyak)
        const step = Math.ceil(canvas.width / 180); 
        
        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const index = (y * canvas.width + x) * 4;
                const alpha = textData[index + 3];
                
                // Jika piksel bukan transparan, jadikan target untuk partikel
                if (alpha > 128) {
                    particles.push({
                        tx: x, ty: y, // Target koordinat 
                        x: Math.random() * canvas.width,  // Mulai dr lokasi acak
                        y: Math.random() * canvas.height, 
                        // Efek melayang random (wobble)
                        wobble: Math.random() * Math.PI * 2,
                        wobbleSpeed: Math.random() * 0.05 + 0.01
                    });
                }
            }
        }
    }

    // Fungsi Render Loop Partikel
    let particleAnimation;
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Warna Partikel Glowing Cyan-Blue
        ctx.fillStyle = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f0ff';
        
        let isSettled = true;

        particles.forEach(p => {
            // Pergerakan (easing) menuju target
            let dx = p.tx - p.x;
            let dy = p.ty - p.y;
            
            p.x += dx * 0.05; // Speed gerak (0.05)
            p.y += dy * 0.05;
            
            // Beri efek melayang saat sudah menyatu
            if(Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                p.x += Math.cos(p.wobble) * 0.5;
                p.y += Math.sin(p.wobble) * 0.5;
                p.wobble += p.wobbleSpeed;
            } else {
                isSettled = false;
            }

            // Gambar partikel
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        particleAnimation = requestAnimationFrame(animateParticles);
    }

    // Jalankan partikel
    initTextParticles();
    animateParticles();


    /* ====================================================
       2. TIMELINE TRANASISI (Papan, Loading, Lubang Hitam)
    ==================================================== */
    
    // Detik 2.0 -> Tampilkan papan judul jatuh
    setTimeout(() => {
        document.getElementById('falling-text').classList.add('drop');
    }, 2000);

    // Detik 3.0 -> Mulai loading bar
    setTimeout(() => {
        document.getElementById('loading-bar').classList.add('show');
    }, 3000);

    // Detik 5.5 -> Lubang hitam melahap layar
    setTimeout(() => {
        document.getElementById('black-hole').classList.add('expand');
    }, 5500);

    // Detik 6.5 -> Hapus Welcome Screen, tampilkan website utama
    setTimeout(() => {
        cancelAnimationFrame(particleAnimation); // Hentikan render canvas (hemat memori)
        const welcomeScreen = document.getElementById('welcome-screen');
        welcomeScreen.style.opacity = '0';
        welcomeScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.classList.remove('no-scroll'); // Buka gembok scroll
            welcomeScreen.remove(); // Hapus dari HTML
        }, 500);
    }, 6500);

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

