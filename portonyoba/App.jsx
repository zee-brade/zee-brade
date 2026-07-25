import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Github, Linkedin, Instagram, Mail, ChevronRight, 
  Download, Send, Code2, Terminal, MonitorSmartphone, 
  Server, Database, Layout, Sparkles, MessageCircle
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

// ==========================================
// 1. NAVBAR COMPONENT
// ==========================================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0a0a0a]/70 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        <a href="#" className="text-xl font-bold tracking-wider text-white">
          PORTOFOLIO<span className="text-teal-400">.</span>
        </a>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
          <a href="#home" className="hover:text-teal-400 transition">Home</a>
          <a href="#about" className="hover:text-teal-400 transition">About</a>
          <a href="#project" className="hover:text-teal-400 transition">Project</a>
          <a href="#contact" className="hover:text-teal-400 transition">Contact</a>
        </div>
      </div>
    </nav>
  );
};

// ==========================================
// 2. HERO SECTION
// ==========================================
const Hero = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative px-6 md:px-12">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Bagian Kiri */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="flex flex-col items-start gap-6"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
            </span>
            <span className="text-xs font-medium text-gray-300">Tersedia untuk proyek baru</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold leading-tight">
            Hi, I'm <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
              Alex Frontend
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-md leading-relaxed">
            Seorang Frontend Developer yang bersemangat menciptakan pengalaman web modern yang interaktif, responsif, dan estetis dengan teknologi terkini.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-4">
            <button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-medium transition flex items-center gap-2 shadow-lg shadow-teal-500/25">
              Explore Projects <ChevronRight size={18} />
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl font-medium transition flex items-center gap-2 backdrop-blur-md">
              <Download size={18} /> Download CV
            </button>
          </motion.div>
        </motion.div>

        {/* Bagian Kanan (Glass Profile Card) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center md:justify-end relative"
        >
          {/* Efek Floating Menggunakan Framer Motion */}
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-72 flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-[40px]"></div>
            
            <div className="relative w-32 h-32 rounded-full border-2 border-white/20 p-1 mb-2">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover rounded-full" />
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">Alex Doe</h3>
              <p className="text-sm text-teal-400 font-medium">Frontend Developer</p>
            </div>
            
            <div className="flex gap-3 w-full">
              <button className="flex-1 bg-white/10 hover:bg-white/20 transition rounded-lg py-2 text-sm font-medium border border-white/5">
                Contact Me
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 3. ABOUT ME SECTION
// ==========================================
const About = () => {
  return (
    <section id="about" className="py-24 px-6 md:px-12 relative">
      <div className="container mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}
          className="flex flex-col gap-6"
        >
          <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold">
            Tentang <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Saya</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 leading-relaxed text-lg">
            Saya mengkhususkan diri dalam merancang dan membangun antarmuka digital yang tidak hanya terlihat indah, tetapi juga berfungsi dengan lancar. Fokus saya adalah pada arsitektur web modern, performa tinggi, dan pengalaman pengguna yang intuitif.
          </motion.p>
          
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6 mt-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h4 className="text-4xl font-bold text-teal-400 mb-2">20+</h4>
              <p className="text-sm text-gray-400 font-medium">Project Finished</p>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h4 className="text-4xl font-bold text-blue-400 mb-2">3+</h4>
              <p className="text-sm text-gray-400 font-medium">Years Experience</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} 
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative perspective-1000 flex justify-center"
        >
          {/* Floating 3D-like ID Card */}
          <motion.div 
             animate={{ rotateY: [-5, 5, -5], rotateX: [5, -5, 5] }}
             transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
             className="w-full max-w-sm bg-gradient-to-br from-white/10 to-white/0 border border-white/20 backdrop-blur-xl rounded-3xl p-1 shadow-2xl"
          >
            <div className="bg-[#0a0a0a]/80 rounded-[22px] p-6 flex flex-col gap-6 h-full relative overflow-hidden">
              <Sparkles className="absolute top-4 right-4 text-teal-500/30 w-24 h-24" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop" alt="Code" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Developer ID</h4>
                  <p className="text-xs text-gray-400">Verified Professional</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-sm">Role</span>
                  <span className="font-medium">Frontend Engineer</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 text-sm">Location</span>
                  <span className="font-medium">Jakarta, ID</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className="text-teal-400 font-medium">Available</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ==========================================
// 4. TOOLS & TECHNOLOGIES
// ==========================================
const Tools = () => {
  const tools = [
    { name: 'React', icon: <Code2 /> },
    { name: 'Next.js', icon: <Server /> },
    { name: 'Tailwind CSS', icon: <Layout /> },
    { name: 'JavaScript', icon: <Terminal /> },
    { name: 'TypeScript', icon: <Terminal /> },
    { name: 'Figma', icon: <MonitorSmartphone /> },
    { name: 'Firebase', icon: <Database /> },
    { name: 'Git', icon: <Github /> },
  ];

  return (
    <section className="py-16 px-6 md:px-12 relative">
      <div className="container mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Tools & <span className="text-teal-400">Technologies</span></h2>
          <p className="text-gray-400">Teknologi yang saya gunakan untuk membangun ekosistem digital</p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {tools.map((tool, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/30 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="text-gray-400 group-hover:text-teal-400 transition-colors">
                {tool.icon}
              </div>
              <span className="font-medium text-sm text-gray-300 group-hover:text-white transition-colors">{tool.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. PROJECT SECTION
// ==========================================
const Projects = () => {
  const projects = [
    {
      title: "Fintech Dashboard",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      tags: ["React", "Tailwind", "Recharts"]
    },
    {
      title: "E-Commerce SPA",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      tags: ["Next.js", "Framer Motion", "Stripe"]
    },
    {
      title: "Task Management App",
      img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop",
      tags: ["React", "Firebase", "Zustand"]
    }
  ];

  return (
    <section id="project" className="py-24 px-6 md:px-12 relative">
      <div className="container mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Projects</span>
          </h2>
          <p className="text-gray-400 max-w-lg">Beberapa proyek terpilih yang menunjukkan keahlian saya dalam memecahkan masalah melalui kode.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: idx * 0.2 }}
              className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-teal-500/50 transition-all duration-300"
            >
              <div className="overflow-hidden h-56">
                <img 
                  src={project.img} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{project.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-medium bg-white/5 border border-white/10 text-gray-300 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 6. CONTACT SECTION
// ==========================================
const Contact = () => {
  return (
    <section id="contact" className="py-24 px-6 md:px-12 relative">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Connect</span>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-stretch">
          {/* Kiri: Chat UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <MessageCircle className="text-teal-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Chat with Me</h4>
                  <p className="text-xs text-teal-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span> Online Now
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm w-[85%] text-sm text-gray-200">
                  Hi! Saya tertarik dengan portfolio Anda. Apakah Anda menerima project freelance?
                </div>
                <div className="bg-teal-500/20 border border-teal-500/30 p-4 rounded-2xl rounded-tr-sm w-[85%] ml-auto text-sm text-gray-100">
                  Halo! Ya, saya sedang menerima proyek baru. Mari kita diskusikan detailnya! 👋
                </div>
              </div>
            </div>

            <button className="w-full py-4 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition">
              <Mail className="w-5 h-5" /> Login with Google to Chat
            </button>
          </motion.div>

          {/* Kanan: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold mb-6">Kirim Pesan</h3>
            <form className="flex flex-col gap-5">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Message</label>
                <textarea 
                  rows="4" 
                  placeholder="Halo, saya ingin membahas tentang..." 
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-colors resize-none"
                ></textarea>
              </div>
              <button type="button" className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white py-4 rounded-xl font-medium transition flex justify-center items-center gap-2 mt-2">
                Send Message <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 7. FOOTER SECTION
// ==========================================
const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md py-8">
      <div className="container mx-auto px-6 flex flex-col items-center gap-4">
        <h2 className="text-xl font-bold tracking-widest">
          PORTOFOLIO<span className="text-teal-400">.</span>
        </h2>
        <div className="flex gap-6 text-gray-400">
          <a href="#" className="hover:text-teal-400 transition"><Github size={20} /></a>
          <a href="#" className="hover:text-teal-400 transition"><Linkedin size={20} /></a>
          <a href="#" className="hover:text-teal-400 transition"><Insta
