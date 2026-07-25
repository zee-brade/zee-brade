window.addEventListener("load",()=>{

const screen=document.getElementById("welcome-screen");

const h1=document.querySelector(".welcome-content h1");

const p=document.querySelector(".welcome-content p");

gsap.timeline()

.to(h1,{
opacity:1,
y:0,
scale:1,
duration:1,
ease:"power3.out"
})

.to(p,{
opacity:1,
y:0,
duration:.8
},"-=.5")

.to(".welcome-content",{

scale:.8,

opacity:0,

duration:.8,

delay:1

})

.to(screen,{

opacity:0,

duration:.8,

onComplete(){

screen.remove();

}

});

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

