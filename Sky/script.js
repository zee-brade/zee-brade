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
// --- KODE BARU UNTUK SPLASH SCREEN ---
// Menunggu halaman dimuat sepenuhnya
window.addEventListener("load", function() {
    // Memberikan jeda waktu (contoh: 2500 milidetik = 2,5 detik)
    setTimeout(function() {
        // Menambahkan class 'hidden' untuk menghilangkan splash screen dengan animasi transisi
        document.getElementById("splash-screen").classList.add("hidden");
    }, 2500); 
});

