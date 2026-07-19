/* =========================================
   1. Splash Screen Logic
   ========================================= */
window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    
    // Tunggu 2 detik agar animasi splash terlihat, lalu hilangkan
    setTimeout(() => {
        splash.classList.add('hidden');
    }, 2000); 
});

/* =========================================
   2. Scroll Reveal Logic (Intersection Observer)
   ========================================= */
// Ini jauh lebih efisien daripada menggunakan scroll event listener biasa
const observerOptions = {
    threshold: 0.1 // Animasi muncul saat 10% elemen terlihat di layar
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

// Daftarkan semua elemen dengan class .reveal untuk diamati
document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

/* =========================================
   3. Tab Switching Logic
   ========================================= */
function showTab(tabId) {
    // 1. Sembunyikan semua konten tab
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active-content');
    });

    // 2. Hapus class 'active' dari semua tombol
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Tampilkan konten yang dipilih
    document.getElementById(tabId).classList.add('active-content');

    // 4. Tambahkan class 'active' ke tombol yang diklik
    // Mencari tombol yang memiliki onclick sesuai tabId
    event.currentTarget.classList.add('active');
}
