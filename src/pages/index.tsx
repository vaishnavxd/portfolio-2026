import Head from "next/head";
import { Bebas_Neue, Inter } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import dynamic from "next/dynamic";

const GhostBackground = dynamic(() => import("../components/GhostBackground"), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
import { Menu, X, ArrowDown, CheckCircle, Smartphone, Layout, Star, Github, Instagram, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorVariant, setCursorVariant] = useState("hero");

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let cx = 0, cy = 0;
      if ('touches' in e) {
        const touch = e.touches[0];
        if (!touch) return;
        cx = touch.clientX;
        cy = touch.clientY;
      } else {
        cx = (e as MouseEvent).clientX;
        cy = (e as MouseEvent).clientY;
      }
      setMousePosition({ x: cx, y: cy });

      const element = 'touches' in e
        ? document.elementFromPoint(cx, cy)
        : e.target as Element;

      if (!element) return;
      const target = element as HTMLElement;

      const section = target.closest("section");
      const isInteractive = target.closest("a, button, [role='button']");
      const isProject = target.closest(".project-item");

      if (isProject) {
        setCursorVariant("projectHover");
      } else if (isInteractive) {
        setCursorVariant("interactive");
      } else if (section && section.id) {
        setCursorVariant(section.id);
      } else {
        setCursorVariant("default");
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchstart", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchstart", handleMove);
    };
  }, []);

  const variants = {
    default: { width: 32, height: 32, x: mousePosition.x - 16, y: mousePosition.y - 16, border: "none", borderRadius: "50%", backgroundColor: "white", mixBlendMode: "difference" as any },
    hero: { width: 80, height: 80, x: mousePosition.x - 40, y: mousePosition.y - 40, border: "none", borderRadius: "50%", backgroundColor: "white", mixBlendMode: "difference" as any },
    about: { width: 48, height: 48, x: mousePosition.x - 24, y: mousePosition.y - 24, border: "none", borderRadius: "16px", backgroundColor: "white", mixBlendMode: "difference" as any },
    work: { width: 100, height: 100, x: mousePosition.x - 50, y: mousePosition.y - 50, border: "2px solid black", borderRadius: "50%", backgroundColor: "transparent", backdropFilter: "invert(1)", mixBlendMode: "normal" as any },
    contact: { width: 120, height: 120, x: mousePosition.x - 60, y: mousePosition.y - 60, border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", mixBlendMode: "normal" as any },
    interactive: { width: 12, height: 12, x: mousePosition.x - 6, y: mousePosition.y - 6, border: "none", borderRadius: "50%", backgroundColor: "white", mixBlendMode: "difference" as any },
    projectHover: { width: 80, height: 80, x: mousePosition.x - 40, y: mousePosition.y - 40, border: "none", borderRadius: "50%", backgroundColor: "black", mixBlendMode: "normal" as any },
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `@media (pointer: fine) { * { cursor: none !important; } }` }} />
      <motion.div
        className="flex fixed top-0 left-0 rounded-full pointer-events-none z-[999999] items-center justify-center overflow-hidden"
        variants={variants}
        animate={cursorVariant}
        transition={{ type: "spring", stiffness: 1000, damping: 40, mass: 0.2 }}
      >
        <AnimatePresence>
          {cursorVariant === "projectHover" && (
            <motion.span
              key="view"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-white text-[10px] font-bold uppercase tracking-widest"
            >
              View
            </motion.span>
          )}
          {cursorVariant === "contact" && (
            <motion.span
              key="hi"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              Say Hi
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const phrases = [
    "Vaishnav  •  Frontend  Developer",
    "Building  Responsive  Web  Apps",
    "Passionate  about  UI / UX",
    "Learning  &  Creating  Daily",
    "Welcome  To  My  Portfolio"
  ];
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress counter from 0 to 100
    const duration = 2800; // time taking up to 99
    const startTime = Date.now();

    const countInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percent = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(percent);
      if (percent >= 100) clearInterval(countInterval);
    }, 16);

    // Swap texts softly
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 850);

    // Unmount delays slightly after 100 is reached
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(countInterval);
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#050014] flex flex-col items-center justify-center overflow-hidden"
      exit={{ y: "-100vh", opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center">

        {/* Subtle decorative inner ring */}
        <div className="absolute inset-0 rounded-full border border-white/[0.03] scale-[0.6] pointer-events-none" />

        {/* Outer progress circle */}
        <motion.svg
          viewBox="0 0 200 200"
          className="absolute w-full h-full -rotate-90 text-white/40 origin-center scale-[0.85]"
        >
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="534"
            animate={{ strokeDashoffset: 534 - (534 * progress) / 100 }}
            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
          />
        </motion.svg>

        {/* Rotating Circular Text SVG */}
        <motion.svg
          viewBox="0 0 200 200"
          className="absolute w-full h-full text-zinc-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, ease: "linear", repeat: Infinity }}
        >
          <defs>
            <path
              id="textCircle"
              d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
              fill="transparent"
            />
          </defs>
          <AnimatePresence mode="popLayout">
            <motion.text
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="text-[10px] md:text-[12px] uppercase font-bold tracking-[0.2em] fill-current"
            >
              <textPath href="#textCircle" startOffset="25%" textAnchor="middle">
                {phrases[index]}
              </textPath>
            </motion.text>
          </AnimatePresence>
        </motion.svg>

        {/* Central Counter */}
        <div className="text-white z-10 flex flex-col items-center justify-center mt-2">
          <div className={`${bebas.className} text-7xl md:text-9xl tracking-tighter mix-blend-difference tabular-nums w-[150px] text-center`}>
            {progress}
          </div>
          <div className="text-[9px] font-bold tracking-[0.6em] uppercase text-gray-500 mt-0 md:mt-2 -ml-2">
            Loading
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export const projectsList = [
  { name: "FlixAni", tags: "Modern Anime Streaming (Backend + Frontend)", image: "/flixani.png", link: "https://flixani.xyz" },
  { name: "Watchflix", tags: "Netflix UI Clone Streaming Site", image: "/watchflix.png", link: "https://watchflix-pink.vercel.app/" },
  { name: "Limbu", tags: "Showcase site for Limbu Soda Shop", image: "/limbu.png", link: "https://limbuwebsite.netlify.app/" },
  { name: "Sony Headphones", tags: "3D Sony Headphones Showcase Website", image: "/sonyheadphonesite.png", link: "https://sonyheadphoneshowcase.netlify.app/" }
];

const ProjectPreviewPopup = ({ activeProject }: { activeProject: typeof projectsList[0] | null }) => {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      let cx = 0, cy = 0;
      if ('touches' in e) {
        const touch = e.touches[0];
        if (!touch) return;
        cx = touch.clientX;
        cy = touch.clientY;
      } else {
        cx = (e as MouseEvent).clientX;
        cy = (e as MouseEvent).clientY;
      }
      setMousePosition({ x: cx, y: cy });
    };
    if (activeProject) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("touchmove", handleMove, { passive: true });
      window.addEventListener("touchstart", handleMove, { passive: true });
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchstart", handleMove);
    };
  }, [activeProject]);

  return (
    <AnimatePresence>
      {activeProject && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, x: mousePosition.x - 175, y: mousePosition.y - 131, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
          transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.5 }}
          className="block fixed top-0 w-[280px] md:w-[350px] aspect-[4/3] rounded-3xl overflow-hidden pointer-events-none z-[99999] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 bg-black"
        >
          <AnimatePresence mode="popLayout">
            <motion.img
              key={activeProject.name}
              initial={{ opacity: 0, filter: "blur(4px)", scale: 1.1 }}
              animate={{ opacity: 0.9, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={activeProject.image}
              alt={activeProject.name}
              className="absolute inset-0 w-full h-full object-cover object-left-top"
            />
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredProject, setHoveredProject] = useState<typeof projectsList[0] | null>(null);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: top,
        behavior: "smooth"
      });
    }
  };

  const scrollToTop = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useGSAP(() => {
    if (isLoading) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Desktop animations
      gsap.to(".hero-parallax", {
        y: 200, opacity: 0, ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
      });

      gsap.utils.toArray(".gsap-fade-up").forEach((el: any) => {
        gsap.fromTo(el, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
      });

      gsap.utils.toArray(".gsap-fade-left").forEach((el: any) => {
        gsap.fromTo(el, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
      });
    });

    mm.add("(max-width: 767px)", () => {
      // Mobile animations - subtle movements, trigger earlier
      gsap.to(".hero-parallax", {
        y: 100, opacity: 0, ease: "none",
        scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
      });

      gsap.utils.toArray(".gsap-fade-up").forEach((el: any) => {
        gsap.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });

      gsap.utils.toArray(".gsap-fade-left").forEach((el: any) => {
        gsap.fromTo(el, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    });

    return () => mm.revert();

  }, { dependencies: [isLoading] });

  return (
    <>
      <Head>
        <title>Vaishnav | Creative Developer</title>
        <meta name="description" content="Portfolio of Vaishnav" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && <CustomCursor />}
      <ProjectPreviewPopup activeProject={hoveredProject} />

      <main className={`${inter.className} min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden relative`}>

        {/* Navigation */}
        <header className={`flex w-full items-center justify-between fixed top-0 z-50 transition-all duration-500 ${isScrolled
            ? "p-4 md:px-12 bg-black/40 backdrop-blur-md border-b border-white/5"
            : "p-6 md:px-12 bg-transparent mix-blend-difference"
          }`}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={scrollToTop}
            className="text-xl font-bold tracking-tighter cursor-pointer"
          >
            Vaishnav
          </motion.div>

          <div className="flex items-center gap-6">
            <motion.nav
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:flex gap-8 text-xs uppercase tracking-[0.2em] font-medium text-gray-300"
            >
              <a href="#about" onClick={(e) => handleNavClick(e, "about")} className="hover:text-white transition-colors">About</a>
              <a href="#work" onClick={(e) => handleNavClick(e, "work")} className="hover:text-white transition-colors">Work</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, "contact")} className="hover:text-white transition-colors">Contact</a>
            </motion.nav>

            {/* Mobile Menu Toggle */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-[#050014]/95 backdrop-blur-2xl flex flex-col items-center justify-center md:hidden"
            >
              <nav className="flex flex-col gap-8 text-center">
                {['about', 'work', 'contact'].map((item, idx) => (
                  <motion.a
                    key={item}
                    href={`#${item}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (idx + 1), duration: 0.5, ease: "easeOut" }}
                    onClick={(e) => {
                      handleNavClick(e, item);
                      setIsMenuOpen(false);
                    }}
                    className={`${bebas.className} text-5xl font-bold uppercase tracking-[0.2em] text-white hover:text-purple-400 transition-colors`}
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-16 flex gap-10"
              >
                <a href="https://github.com/vaishnavxd" target="_blank" rel="noopener noreferrer"><Github size={24} className="text-gray-400 hover:text-white transition-colors" /></a>
                <a href="https://instagram.com/vaishnavxd" target="_blank" rel="noopener noreferrer"><Instagram size={24} className="text-gray-400 hover:text-white transition-colors" /></a>
                <a href="https://discord.com/channels/@me/842978764690030593" target="_blank" rel="noopener noreferrer"><MessageSquare size={24} className="text-gray-400 hover:text-white transition-colors" /></a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Hero Section */}
        <section
          id="hero"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
          className="relative flex flex-col items-center justify-center min-h-[100svh] w-full pt-20 overflow-hidden bg-black"
        >

          {/* Three.js Spirit Background */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            <GhostBackground isHovered={isHeroHovered} />
          </div>

          {/* Main Hero Container */}
          <motion.div className="hero-parallax z-10 flex flex-col items-center w-full">

            {/* Gentle Floating Wrapper */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center w-full"
            >

              {/* Cinematic Tracking Reveal Subheading */}
              <motion.h2
                initial={{ opacity: 0, letterSpacing: "1em", y: 20 }}
                animate={{ opacity: 1, letterSpacing: "0.3em", y: 0 }}
                transition={{ duration: 2, delay: 0.6, ease: "easeOut" }}
                className={`${bebas.className} text-xl md:text-3xl text-gray-300 uppercase mb-4 md:mb-6 text-center`}
                style={{ textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}
              >
                Creative Developer
              </motion.h2>

              {/* Staggered Clipped Title */}
              <motion.h1
                className={`${bebas.className} text-[6rem] md:text-[14rem] leading-[0.85] text-center tracking-tight text-white drop-shadow-2xl flex flex-col`}
              >
                <span className="overflow-hidden block py-1">
                  <motion.span
                    initial={{ y: "150%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.8, duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                    className="inline-block"
                  >
                    VAISHNAV
                  </motion.span>
                </span>
                <span className="overflow-hidden block py-1 mt-0 md:mt-2">
                  <motion.span
                    initial={{ y: "150%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.95, duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                    className="inline-block bg-gradient-to-r from-white via-purple-200 to-gray-500 bg-clip-text text-transparent pb-4"
                  >
                    DOUNDE
                  </motion.span>
                </span>
              </motion.h1>

              {/* Glassmorphic Animated Location Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.05, border: "1px solid rgba(255,255,255,0.3)" }}
                transition={{
                  opacity: { delay: 1.4, duration: 0.8 },
                  scale: { type: "spring", damping: 12, stiffness: 100, delay: 1.4 },
                  rotate: { type: "spring", damping: 10, stiffness: 100, delay: 1.4 }
                }}
                className="mt-10 md:mt-14 flex items-center justify-center gap-4 text-xs md:text-sm font-semibold tracking-[0.3em] uppercase bg-white/[0.04] backdrop-blur-xl px-6 md:px-8 py-3 md:py-4 rounded-full border border-white/5 shadow-[0_0_30px_rgba(255,255,255,0.03)] cursor-pointer"
              >
                LOCATED IN INDIA
                {/* Spinning Indian Flag Pattern Orb */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="relative w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-white/20 shadow-[0_0_15px_rgba(255,153,51,0.2)] flex-shrink-0"
                >
                  <div className="absolute top-0 w-full h-1/3 bg-[#FF9933]"></div>
                  <div className="absolute top-1/3 w-full h-1/3 bg-white flex items-center justify-center">
                    <div className="w-[4px] h-[4px] md:w-[6px] md:h-[6px] border border-[#000080] rounded-full" />
                  </div>
                  <div className="absolute bottom-0 w-full h-1/3 bg-[#138808]"></div>
                </motion.div>
              </motion.div>

            </motion.div>
          </motion.div>


        </section>

        {/* 2. About Me Section */}
        <section id="about" className="relative w-full py-16 md:py-32 px-6 md:px-12 bg-gradient-to-b from-black via-[#1a0b2e] to-[#2d1b4e] overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.h2
              className={`gsap-fade-left ${bebas.className} text-6xl lg:text-8xl mb-8 lg:mb-12 flex justify-center lg:justify-start items-center gap-4`}
            >
              ABOUT <motion.span animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="text-purple-400 inline-block">*</motion.span> ME
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
              <motion.div
                className="gsap-fade-up col-span-1 lg:col-span-1 h-[250px] lg:h-[400px] rounded-[24px] lg:rounded-[32px] overflow-hidden relative group bg-gradient-to-br from-[#1a0b2e] to-black border border-white/10 flex items-center justify-center p-4 lg:p-6 shadow-2xl"
              >
                {/* Animated glowing orbs */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -left-10 w-40 h-40 md:w-56 md:h-56 bg-purple-600/40 rounded-full blur-3xl pointer-events-none"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, -90, 0],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -right-10 w-40 h-40 md:w-56 md:h-56 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"
                />

                {/* Inner glass pane */}
                <div className="relative z-10 w-full h-full bg-white/5 backdrop-blur-xl rounded-[20px] lg:rounded-[24px] border border-white/10 flex flex-col justify-between p-6 lg:p-8 overflow-hidden">
                  {/* Subtle grid pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:15px_15px] opacity-30 pointer-events-none" />

                  <div className="flex justify-between items-start z-10">
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs text-white/70 font-bold bg-white/5 backdrop-blur-sm">
                      V
                    </div>
                    <div className="flex gap-1.5 p-2 bg-black/20 rounded-full backdrop-blur-sm border border-white/5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                  </div>

                  <div className="mt-auto z-10">
                    <h3 className={`${bebas.className} text-4xl lg:text-5xl text-white/90 tracking-wider mb-2 leading-none drop-shadow-lg`}>
                      CODE <br /> <span className="text-purple-400">AESTHETICS</span>
                    </h3>
                    <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                      Building digital realities
                    </p>
                  </div>

                  {/* Spinning decorative shapes */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -right-[20%] w-[180%] h-[180%] border-[1px] border-white/5 rounded-full border-dashed pointer-events-none"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -right-1/4 w-[120%] h-[120%] border-[2px] border-purple-500/10 rounded-full border-dotted pointer-events-none"
                  />
                </div>
              </motion.div>

              <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 lg:gap-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  <motion.div
                    className="gsap-fade-up flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] lg:rounded-[32px] p-6 lg:p-12 flex items-center shadow-2xl"
                  >
                    <p className="text-base lg:text-2xl text-gray-300 font-light leading-relaxed text-center lg:text-left w-full">
                      An enthusiastic frontend developer from India, focused on crafting clean and responsive web experiences. I blend modern design principles with modern frameworks to build accessible and user-friendly interfaces.
                    </p>
                  </motion.div>

                  <motion.div
                    className="gsap-fade-up w-full lg:w-64 bg-black/40 backdrop-blur-md border border-white/10 rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 flex flex-col items-center justify-center shadow-inner relative overflow-hidden py-8"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,0,255,0.3)_0%,transparent_70%)] pointer-events-none" />
                    <span className={`${bebas.className} text-7xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500`}>5+</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400 text-center mt-2 font-medium">Years of<br />experience</span>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {[
                    { title: "SEO", icon: <img src="/seoIcon.png" alt="SEO" className="h-16 w-auto object-contain mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" />, desc: "Optimizing sites to improve search engine rankings." },
                    { title: "UX Design", icon: <img src="/UiUx_icon.png" alt="UX Design" className="h-16 w-auto object-contain mb-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" />, desc: "Engaging layouts tailored to users and interaction." },
                    { title: "Web Dev", icon: <img src="/dev_icon.png" alt="Web Dev" className="h-16 w-auto object-contain mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]" />, desc: "Industry leading tools & frameworks used to build apps." }
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      className="gsap-fade-up flex flex-col justify-center items-center text-center lg:items-start lg:text-left min-h-[200px] bg-gradient-to-br from-purple-900/40 to-black/40 backdrop-blur-md border border-white/10 rounded-[24px] lg:rounded-[32px] p-6 lg:p-8 hover:border-purple-500/50 transition-colors cursor-default"
                    >
                      {item.icon}
                      <h3 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-3">{item.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full overflow-hidden mt-10 lg:mt-16 p-3 lg:p-4 border border-white/5 rounded-[24px] lg:rounded-full flex gap-8 items-center bg-white/5 backdrop-blur-sm relative shadow-lg">
              <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
                className="flex gap-16 min-w-[200%] opacity-50 text-xl font-bold text-gray-400 whitespace-nowrap"
              >
                {Array(4).fill(["REACT", "*", "NEXT.JS", "*", "TAILWIND", "*", "TYPESCRIPT", "*", "FRAMER MOTION", "*"]).flat().map((t, i) => (
                  <span key={i} className={t === "*" ? "text-purple-500" : ""}>{t}</span>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Selected Work Section */}
        <section id="work" className="w-full py-32 px-6 md:px-12 bg-[#e0d6ff] text-black">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`${bebas.className} text-6xl md:text-8xl mb-16 flex items-center gap-4 text-[#5e4b9e]`}
            >
              SELECTED <span className="text-black rotate-45">*</span> WORK
            </motion.h2>

            <div className="flex flex-col border-t border-black/10">
              {projectsList.map((project, i) => (
                <motion.a
                  key={i}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredProject(project)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className="project-item gsap-fade-up group relative flex flex-col md:flex-row justify-between items-start md:items-center py-10 border-b border-black/10 hover:px-8 transition-all duration-500 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none rounded-xl" />
                  <h3 className="text-3xl md:text-5xl font-medium tracking-tight relative z-10 group-hover:translate-x-4 transition-transform duration-500">{project.name}</h3>
                  <span className="text-xs font-bold uppercase tracking-[0.1em] text-gray-600 mt-4 md:mt-0 relative z-10 md:group-hover:-translate-x-4 transition-transform duration-500">{project.tags}</span>
                </motion.a>
              ))}
            </div>

            <motion.div
              className="gsap-fade-up w-full flex justify-center mt-16"
            >
              <a
                href="https://github.com/vaishnavxd"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 rounded-[40px] border border-black/20 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all duration-300"
              >
                All projects ~
              </a>
            </motion.div>

            {/* Friendly Words Section */}
            <div className="mt-32 max-w-4xl flex flex-col gap-12 relative mx-auto">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-black text-black tracking-tighter leading-none whitespace-nowrap pointer-events-none opacity-[0.03] z-0">
                KIND WORDS
              </div>

              {[
                { name: "Om", role: "Friend / Developer", text: "Vaishnav's eye for detail is unmatched. He doesn't just code; he builds experiences that actually feel alive. Always the go-to person for anything UI related!" },
                { name: "Sumeet", role: "Project Partner", text: "Working with Vaishnav is a breeze. His ability to turn complex logic into clean, simple interfaces is what makes his work stand out from the rest. 🚀" }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  className={`gsap-fade-up bg-white p-10 md:p-14 rounded-3xl shadow-2xl z-10 w-[90%] md:w-4/5 ${i % 2 === 0 ? 'self-start' : 'self-end'} transform transition hover:scale-[1.02] duration-300 relative`}
                >
                  <span className={`${bebas.className} text-8xl text-purple-200 leading-none absolute -top-2 -left-2 select-none`}>"</span>
                  <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-800 relative z-10">
                    {t.text}
                  </p>
                  <div className="mt-8 flex flex-col items-end border-t border-gray-100 pt-6">
                    <span className="font-black text-sm uppercase tracking-widest text-black">{t.name}</span>
                    <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">{t.role}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="gsap-fade-up mt-40 w-full flex justify-center pb-20"
            >
              <h2 className={`${bebas.className} text-[5rem] md:text-[12rem] leading-none tracking-tighter text-black flex items-center justify-center gap-4 md:gap-8`}>
                OVER <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-[80px] h-[30px] md:w-[150px] md:h-[60px] bg-black rounded-sm shadow-xl" /> YEARS
              </h2>
            </motion.div>
          </div>
        </section>

        {/* 4. Footer Section */}
        <section id="contact" className="relative py-32 px-6 md:px-12 bg-[#050505] min-h-[80vh] flex flex-col justify-center items-center overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

          <motion.div
            className="gsap-fade-up z-10 text-center flex flex-col items-center"
          >
            <h3 className="text-gray-400 text-lg md:text-xl font-light mb-8 uppercase tracking-[0.2em]">
              Ready to level up your project ?
            </h3>

            <a href="mailto:vaishnavdoundkar65@gmail.com" className="group relative inline-block">
              <div className="absolute inset-0 bg-white rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
              <div className={`${bebas.className} text-6xl md:text-[8rem] tracking-tight text-white border border-white/20 rounded-[32px] px-12 md:px-20 py-8 md:py-12 bg-black/50 backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-700 shadow-2xl relative z-10 overflow-hidden flex items-center justify-center`}>
                <motion.div className="gsap-fade-up text-center w-full">
                  GET IN TOUCH !!!
                </motion.div>
              </div>
            </a>
          </motion.div>

          <div className="absolute bottom-8 w-full px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500 z-10">
            <div>© 2026 Vaishnav</div>

            <div className="flex gap-4 md:gap-8 items-center">
              {[
                { name: "Github", icon: <Github size={18} />, link: "https://github.com/vaishnavxd" },
                { name: "Instagram", icon: <Instagram size={18} />, link: "https://instagram.com/vaishnavxd" },
                { name: "Discord", icon: <MessageSquare size={18} />, link: "https://discord.com/channels/@me/842978764690030593" }
              ].map((social) => (
                <motion.a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <span className="text-white/80 group-hover:text-white transition-colors">{social.icon}</span>
                  <span className="hidden md:inline text-sm font-semibold tracking-wide">{social.name}</span>
                </motion.a>
              ))}
            </div>

            <div className="text-gray-600">Site by Me</div>
          </div>
        </section>

      </main>
    </>
  );
}
