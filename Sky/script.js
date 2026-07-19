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
// --- KODE SPLASH SCREEN ---
window.addEventListener("load", function() {
    // Memberikan waktu 3,5 detik agar semua animasi ikon dan teks selesai
    setTimeout(function() {
        // Layar akan ditarik ke atas berkat transform: translateY(-100%) di CSS
        document.getElementById("splash-screen").classList.add("hidden");
    }, 3500); 
});


// --- KODE UNTUK ANIMASI SCROLL REVEAL ---
function revealOnScroll() {
    // Mencari semua elemen yang punya class 'reveal'
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        // Mendapatkan ukuran layar dan posisi elemen
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100; // Jarak sebelum elemen muncul (dalam pixel)

        // Jika elemen sudah masuk ke area layar, tambahkan class 'active'
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

// Menjalankan fungsi setiap kali layar di-scroll
window.addEventListener("scroll", revealOnScroll);

// Menjalankan sekali saat halaman pertama dibuka (untuk elemen di bagian atas)
revealOnScroll();

    /* Tambahkan ini untuk Contact di mobile */
    .contact-container {
        flex-direction: column;
        gap: 30px;
    }
    
    .info-card:hover {
        transform: none; /* Matikan efek geser di mobile agar tidak aneh */
    }
}
