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

// ==========================================
// 3. KODE TABS PORTFOLIO
// ==========================================
function showTab(tabId) {
    // Sembunyikan semua tab content
    var contents = document.querySelectorAll('.tab-content');
    for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active-content');
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
document.getElementById("contact-form").addEventListener("submit", function(e){

    e.preventDefault();

    emailjs.sendForm(
        "service_pkapnbu",
        "template_sxweuvl",
        this
    ).then(function(){

        alert("✅ Pesan berhasil dikirim!");

        document.getElementById("contact-form").reset();

    }).catch(function(error){

        alert("❌ Gagal mengirim pesan.");

        console.log(error);

    });

});
