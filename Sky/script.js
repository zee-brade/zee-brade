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
