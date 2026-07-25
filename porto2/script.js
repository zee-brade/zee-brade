document.addEventListener("DOMContentLoaded", () => {
    let particleAnimationId;

    /* ====================================================
       1. ANIMASI PARTIKEL (DENGAN FAIL-SAFE / ANTI-CRASH)
    ==================================================== */
    const canvas = document.getElementById('particle-canvas');
    
    // Gunakan try-catch agar jika canvas error di HP/Browser tertentu, 
    // website utama tidak ikut macet dan tetap terbuka.
    try {
        if (!canvas) throw new Error("Canvas tidak ditemukan");
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Ukuran menyesuaikan layar
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        
        // GUNAKAN FONT SISTEM (sans-serif) UNTUK MENCEGAH BLOKIR KEAMANAN BROWSER HP
        let fontSize = Math.min(canvas.width / 5, 140);
        ctx.fillStyle = 'white';
        ctx.font = `900 ${fontSize}px sans-serif`; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.fillText('WELCOME', canvas.width / 2, canvas.height / 2.5);

        const textData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Optimasi tingkat kepadatan partikel untuk HP
        const step = Math.ceil(canvas.width / 150); 
        
        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const index = (y * canvas.width + x) * 4;
                if (textData[index + 3] > 128) {
                    particles.push({
                        tx: x, ty: y,
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        wobble: Math.random() * Math.PI * 2,
                        wobbleSpeed: Math.random() * 0.05 + 0.01
                    });
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00f0ff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00f0ff';
            
            particles.forEach(p => {
                let dx = p.tx - p.x;
                let dy = p.ty - p.y;
                p.x += dx * 0.05;
                p.y += dy * 0.05;
                
                if(Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                    p.x += Math.cos(p.wobble) * 0.5;
                    p.y += Math.sin(p.wobble) * 0.5;
                    p.wobble += p.wobbleSpeed;
                }
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });
            particleAnimationId = requestAnimationFrame(animateParticles);
        }
        
        if (particles.length > 0) animateParticles();

    } catch (error) {
        console.warn("Efek partikel dilewati karena limitasi keamanan browser HP.", error);
        // Script TIDAK AKAN BERHENTI di sini, melainkan lanjut ke transisi berikutnya.
    }


    /* ====================================================
       2. TIMELINE TRANSISI AMAN DARI ERROR
    ==================================================== */
    
    // Detik 1.5 -> Papan jatuh
    setTimeout(() => {
        const el = document.getElementById('falling-text');
        if(el) el.classList.add('drop');
    }, 1500);

    // Detik 2.5 -> Loading Bar
    setTimeout(() => {
        const el = document.getElementById('loading-bar');
        if(el) el.classList.add('show');
    }, 2500);

    // Detik 4.5 -> Transisi Lubang hitam
    setTimeout(() => {
        const el = document.getElementById('black-hole');
        if(el) el.classList.add('expand');
    }, 4500);

    // Detik 5.5 -> BUKA WEB UTAMA SECARA PAKSA (Fail-safe)
    setTimeout(() => {
        if (particleAnimationId) cancelAnimationFrame(particleAnimationId);
        
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.style.opacity = '0';
            setTimeout(() => {
                document.body.classList.remove('no-scroll');
                welcomeScreen.remove();
            }, 800);
        } else {
            // Berjaga-jaga jika elemen tidak ada
            document.body.classList.remove('no-scroll');
        }
    }, 5500);


    /* ====================================================
       3. NAVBAR MOBILE & SCROLL (Normal)
    ==================================================== */
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if(hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if(icon) {
                if(navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            if(navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = hamburger.querySelector('i');
                if(icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
});
