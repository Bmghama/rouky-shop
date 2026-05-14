
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  const containerRef = useRef(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Configurable spring for "viscous" luxury motion
  const springConfig = { stiffness: 45, damping: 25, mass: 0.8 };

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotateValue = useTransform(scrollYProgress, [0, 1], [3, -5]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  const smoothY1 = useSpring(y1, springConfig);
  const smoothY2 = useSpring(y2, springConfig);
  const smoothY3 = useSpring(y3, springConfig);
  const smoothRotate = useSpring(rotateValue, springConfig);
  const smoothScale = useSpring(scale, springConfig);

  const welcomeMessages = [
    "Mode femme élégante, chic et premium",
    "Découvrez des pièces tendances pour sublimer votre style",
    "Achetez directement par WhatsApp en toute simplicité",
    "Nouvelle collection, nouveaux looks, nouvelle élégance"
  ];

  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800");
  const [heroLabel, setHeroLabel] = useState("Favori de la saison");
  const [heroTitle, setHeroTitle] = useState("Pure Élégance");
  const [heroSubtitle, setHeroSubtitle] = useState("Look de soirée");

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch("/api/site-assets");
        const assets = await res.json();
        const mainHero = assets.find((a: any) => a.key === 'hero_main');
        if (mainHero) {
          setHeroImage(mainHero.url);
          if (mainHero.content) {
            try {
              const data = JSON.parse(mainHero.content);
              if (data.label) setHeroLabel(data.label);
              if (data.title) setHeroTitle(data.title);
              if (data.subtitle) setHeroSubtitle(data.subtitle);
            } catch {
              setHeroLabel(mainHero.content);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      }
    };
    fetchAssets();

    const timer = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % welcomeMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-screen lg:h-screen overflow-hidden flex items-start md:items-center justify-center bg-editorial-bg pt-32 md:pt-48 pb-20 md:pb-0">
      {/* Dynamic Background Patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#C5A267 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      
      {/* Background Orbs with Multi-Speed Parallax */}
      <motion.div 
        style={{ y: smoothY3 }}
        className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-logo-pink rounded-full opacity-20 blur-[120px]"
      />
      <motion.div 
        style={{ y: smoothY2 }}
        className="absolute bottom-[-150px] right-[-150px] w-[600px] h-[600px] bg-editorial-beige rounded-full opacity-30 blur-[120px]"
      />

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center lg:items-stretch gap-12 lg:gap-24 py-12 md:py-20">
        <motion.div 
          style={{ opacity }}
          className="w-full lg:w-3/5 flex flex-col justify-center space-y-10 md:space-y-16"
        >
          <div className="space-y-8 md:space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="flex items-center space-x-4 md:space-x-6"
            >
              <div className="w-8 md:w-12 h-[1px] bg-logo-pink"></div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-logo-pink font-extrabold">
                Nouvelle Saison 2026
              </p>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-8xl font-serif leading-[1.1] text-editorial-text tracking-tight max-w-2xl"
            >
              L'Élégance <br />
              <span className="italic font-light bg-clip-text text-transparent bg-gradient-to-r from-editorial-text to-editorial-gold">Redéfinie.</span>
            </motion.h2>

            <div className="h-auto min-h-[3rem] flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessageIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="text-lg md:text-2xl font-light text-neutral-500 leading-relaxed max-w-xl italic font-serif"
                >
                  {welcomeMessages[currentMessageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-8 pt-4"
          >
            <Link to="/shop" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group relative bg-editorial-text text-white px-10 md:px-14 py-5 md:py-6 text-[10px] uppercase tracking-[0.3em] overflow-hidden transition-all shadow-xl hover:shadow-2xl">
                <span className="relative z-10 transition-colors duration-500 group-hover:text-white">Découvrir la Collection</span>
                <motion.div 
                  className="absolute inset-0 bg-logo-pink transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                />
              </button>
            </Link>
            <a href="https://wa.me/22393932382" target="_blank" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto group border border-editorial-text/20 hover:border-editorial-text px-10 md:px-14 py-5 md:py-6 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-editorial-text hover:text-white transition-all duration-500">
                <span className="w-2.5 h-2.5 bg-[#25D366] rounded-full animate-pulse shadow-[0_0_10px_#25D366]"></span> 
                <span>WhatsApp Shop</span>
              </button>
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="pt-12 md:pt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 opacity-80"
          >
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-serif">1.5k</p>
              <p className="text-[8px] uppercase tracking-[0.3em] opacity-40 font-bold">Clientes</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-serif">24h</p>
              <p className="text-[8px] uppercase tracking-[0.3em] opacity-40 font-bold">Livraison</p>
            </div>
            <div className="space-y-1 hidden md:block">
              <p className="text-3xl md:text-4xl font-serif">A+</p>
              <p className="text-[8px] uppercase tracking-[0.3em] opacity-40 font-bold">Qualité</p>
            </div>
            <div className="space-y-1 hidden md:block">
               <p className="text-3xl md:text-4xl font-serif">223</p>
               <p className="text-[8px] uppercase tracking-[0.3em] opacity-40 font-bold">Mali</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Visual Content (Right Side) - Multi-Layered Parallax */}
        <div className="w-full lg:w-2/5 relative flex items-center justify-center py-20">
          {/* Back Layer Shape */}
          <motion.div 
            style={{ y: smoothY1, rotate: -8 }}
            className="absolute w-[400px] h-[550px] border border-editorial-gold/20 rounded-t-full hidden lg:block"
          ></motion.div>
          
          {/* Middle Layer Shape */}
          <motion.div 
            style={{ y: smoothY3, rotate: -2 }}
            className="absolute w-[380px] h-[520px] bg-editorial-rose/30 rounded-t-full shadow-inner opacity-40"
          ></motion.div>
          
          {/* Front Image Card */}
          <motion.div 
            style={{ y: smoothY2, rotate: smoothRotate, scale: smoothScale }}
            className="relative w-full max-w-[360px] aspect-[3/4] bg-white editorial-border shadow-[0_50px_100px_-20px_rgba(30,30,30,0.3)] overflow-hidden group flex flex-col"
          >
            <div className="flex-1 bg-neutral-100 flex items-center justify-center overflow-hidden relative">
              <div className="absolute top-6 right-6 bg-editorial-gold text-white px-4 py-2 text-[9px] label-caps shadow-2xl z-20">{heroLabel}</div>
              <img 
                src={heroImage} 
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                alt="Featured Product"
              />
              {/* Floating label inside image */}
              <div className="absolute bottom-6 left-6 text-white z-10 transition-transform duration-700 group-hover:-translate-y-2">
                <p className="label-caps !text-[8px] opacity-70 mb-1">{heroSubtitle}</p>
                <h4 className="text-2xl font-serif italic">{heroTitle}</h4>
              </div>
            </div>
          </motion.div>

          {/* Floating Sticker - Extra Layer */}
          <motion.div 
             style={{ y: useTransform(scrollYProgress, [0, 1], [0, -350]) }}
             animate={{ rotate: [-2, 2, -2] }}
             transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
             className="absolute -bottom-10 -right-4 w-56 h-32 bg-editorial-text text-white p-7 flex flex-col justify-between shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] pointer-events-none z-30"
          >
            <p className="text-[9px] uppercase tracking-[0.4em] text-editorial-gold">Exclusive</p>
            <p className="text-sm font-light italic leading-snug">Nouvel arrivage disponible cette semaine</p>
          </motion.div>
        </div>
      </div>

      {/* Floating Mouse-interactive element (decorative) */}
      <div className="absolute top-1/2 left-20 hidden 2xl:block opacity-20 group-hover:opacity-40 transition-opacity">
         <div className="w-12 h-12 border-2 border-editorial-gold rounded-full animate-ping"></div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 opacity-40"
      >
        <span className="text-[9px] uppercase tracking-[0.5em] font-bold">Explorer</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-neutral-400 to-transparent"></div>
      </motion.div>
    </section>
  );
}
