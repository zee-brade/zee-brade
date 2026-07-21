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

        Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Message Sent Successfully",
    showConfirmButton: false,
    timer: 2500
});

        document.getElementById("contact-form").reset();

    }).catch(function(error){

        Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Pesan gagal dikirim.",
    confirmButtonColor: "#ff3b3b"
});

        console.log(error);

    });

});
const b1=document.querySelector(".blur-1");
const b2=document.querySelector(".blur-2");
const b3=document.querySelector(".blur-3");

document.addEventListener("mousemove",(e)=>{

const x=e.clientX/window.innerWidth;
const y=e.clientY/window.innerHeight;

b1.style.transform=`translate(${x*40}px,${y*30}px)`;
b2.style.transform=`translate(${-x*60}px,${-y*40}px)`;
b3.style.transform=`translate(${x*30}px,${-y*35}px)`;

});

document.addEventListener("touchmove",(e)=>{

const t=e.touches[0];

const x=t.clientX/window.innerWidth;
const y=t.clientY/window.innerHeight;

b1.style.transform=`translate(${x*40}px,${y*30}px)`;
b2.style.transform=`translate(${-x*60}px,${-y*40}px)`;
b3.style.transform=`translate(${x*30}px,${-y*35}px)`;

});
