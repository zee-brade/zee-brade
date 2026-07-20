// ==========================================
// 1. KODE SPLASH SCREEN (ANTI STUCK)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // Splash screen akan otomatis ditarik ke atas setelah 2.5 detik
    setTimeout(function() {
        var splash = document.getElementById("splash-screen");
        if (splash) {
            splash.classList.add("hidden");
        }
    }, 2500); 
});

// ==========================================
// 2. KODE ANIMASI SCROLL REVEAL
// ==========================================
function revealOnScroll() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100;
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}
// Jalankan saat di-scroll
window.addEventListener("scroll", revealOnScroll);
// Jalankan sekali saat web pertama dibuka
revealOnScroll();

// Fungsi untuk mengganti Tab pada bagian Portfolio
function showTab(tabName) {
    // Sembunyikan semua tab konten
    let contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove("active-content");
    }

    // Hapus class 'active' dari semua tombol
    let buttons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    // Tampilkan tab yang dipilih
    document.getElementById(tabName).classList.add("active-content");
    
    // Tambahkan class 'active' pada tombol yang diklik
    event.currentTarget.classList.add("active");
}

    // Hapus warna 'active' dari semua tombol
    var buttons = document.querySelectorAll('.tab-btn');
    for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove('active');
    }

    // Munculkan tab yang dipilih
    var selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active-content');
    }

    // Kasih warna 'active' ke tombol yang lagi diklik
    if (typeof event !== 'undefined' && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}
