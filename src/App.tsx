
import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar.tsx";
import Footer from "./components/layout/Footer.tsx";
import Hero from "./components/home/Hero.tsx";
import ProductGrid from "./components/shop/ProductGrid.tsx";
import AdminLogin from "./components/admin/AdminLogin.tsx";
import Dashboard from "./components/admin/Dashboard.tsx";
import ProductDetails from "./components/shop/ProductDetails.tsx";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";
import { MessageCircle, Star, Quote, ShoppingBag } from "lucide-react";
import { CartProvider, useCart } from "./context/CartContext.tsx";
import { CartDrawer } from "./components/shop/CartDrawer.tsx";
import { ParallaxLogo } from "./components/layout/ParallaxLogo";
import ShopPage from "./pages/ShopPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";

function Home() {
  const { scrollYProgress } = useScroll();
  const { setIsCartOpen } = useCart();
  
  // High-performance smooth scroll values
  const springConfig = { stiffness: 60, damping: 25, mass: 0.5 };
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  
  const smoothY1 = useSpring(y1, springConfig);
  const smoothY2 = useSpring(y2, springConfig);
  const smoothY3 = useSpring(y3, springConfig);

  // Background floating text parallax
  const textX = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const smoothTextX = useSpring(textX, springConfig);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-editorial-bg relative overflow-hidden"
    >
      {/* Immersive Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <motion.div 
            style={{ y: smoothY1 }}
            className="absolute top-1/4 -left-20 w-200 h-200 bg-editorial-rose rounded-full opacity-[0.07] blur-[150px]"
          />
        <motion.div 
          style={{ y: smoothY2 }}
          className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-editorial-beige rounded-full opacity-[0.08] blur-[120px]"
        />
        <motion.div 
          style={{ y: smoothY3 }}
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-editorial-gold rounded-full opacity-[0.05] blur-[100px]"
        />
        
        {/* Atmospheric background */}
      </div>

      <div className="relative z-10 font-sans">
        <Hero />
        
        {/* Featured Section - Meilleurs Ventes */}
        <section className="bg-white/40 backdrop-blur-md py-24 md:py-40 relative z-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-10 border-b border-neutral-100 pb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-px bg-editorial-gold opacity-50"></div>
                  <span className="label-caps text-editorial-gold tracking-[0.5em] text-[9px]!">Excellence</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif tracking-tight">Meilleures Ventes</h2>
              </motion.div>
              <button 
                onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })} 
                className="label-caps bg-editorial-text text-white px-10 py-5 text-[10px] hover:bg-neutral-800 transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                Voir tout le catalogue
              </button>
            </div>
            <ProductGrid sort="views" limit={4} hideFilters={true} />
          </div>
        </section>
        
        {/* Categories Preview */}
        <section className="py-24 md:py-40 max-w-7xl mx-auto relative z-20 bg-transparent">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-20 md:mb-32 relative px-6 md:px-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-px bg-editorial-gold opacity-50"></div>
              <span className="label-caps text-editorial-gold tracking-[0.6em] text-[11px]!">Découverte</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-serif mt-2 tracking-tighter">Nos Univers</h2>
          </motion.div>
          
          <CategoryGrid />
        </section>

        {/* Boutique Complète */}
        <div id="shop" className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-48 scroll-mt-24 relative z-20 overflow-visible">
          {/* Subtle Side Parallax Element */}
          <motion.div 
            style={{ y: useSpring(useTransform(scrollYProgress, [0, 1], [300, -300]), springConfig) }}
            className="absolute -right-20 top-1/4 w-60 h-60 border border-editorial-gold/5 rounded-full hidden xl:block"
          />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-10 border-b border-neutral-100 pb-16">
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-px bg-editorial-gold opacity-50"></div>
                  <span className="label-caps text-editorial-gold tracking-[0.5em] text-[9px]!">Premium Catalog</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-serif">Toute la Boutique</h2>
             </div>
          </div>
          <ProductGrid />
        </div>

        {/* Reviews Section with Advanced Parallax Decor */}
        <section className="py-24 md:py-48 bg-editorial-text text-white relative overflow-hidden z-20">
          {/* Parallax Background Quote */}
          <motion.div 
            style={{ 
              y: useSpring(useTransform(scrollYProgress, [0.6, 1], [150, -150]), springConfig),
              rotate: -5
            }}
            className="absolute top-0 right-10 text-[10rem] md:text-[20rem] font-serif text-white/[0.02] pointer-events-none select-none italic"
          >
            &ldquo;
          </motion.div>
          
          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="text-center mb-16 md:mb-32">
               <Quote className="mx-auto text-editorial-gold/40 mb-6 md:mb-8 w-12 md:w-20" strokeWidth={1} />
               <h2 className="text-4xl md:text-6xl font-serif italic mb-4">L'expérience Rouky</h2>
               <p className="label-caps tracking-[0.5em] text-editorial-gold/60 !text-[8px] md:!text-xs">Témoignages</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 xl:gap-20">
              <ReviewCard name="Sira K." text="La qualité des robes est exceptionnelle. J'ai reçu ma commande en 24h via WhatsApp." />
              <ReviewCard name="Awa T." text="Rouky Shop est ma boutique préférée. Les bijoux ne ternissent pas, un vrai luxe accessible." />
              <ReviewCard name="Kadi D." text="Service client impeccable. Très réactif et les produits sont identiques aux photos." />
            </div>
          </div>
        </section>

        {/* WhatsApp Banner - Enhanced */}
        <section className="py-20 md:py-40 px-6 md:px-12">
          <div className="max-w-7xl mx-auto bg-neutral-50 editorial-border p-8 md:p-24 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-16 shadow-2xl">
            <div className="relative z-10 text-center lg:text-left flex-1">
              <span className="label-caps text-editorial-gold mb-4 block tracking-[0.4em]">Personal Shopping</span>
              <h2 className="text-5xl md:text-7xl font-serif text-editorial-text mb-8 leading-[1.1]">Besoin d'un <br className="hidden md:block" /> conseil expert ?</h2>
              <p className="text-neutral-500 mb-12 max-w-xl text-lg font-light leading-relaxed italic">
                Nos conseillères sont à votre écoute pour vous guider dans vos choix, 
                vérifier la disponibilité des tailles et organiser votre livraison express.
              </p>
              <a 
                href="https://wa.me/22393932382" 
                target="_blank" 
                className="inline-flex items-center space-x-6 bg-editorial-text text-white px-12 py-6 text-xs font-bold uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-2xl group"
              >
                <MessageCircle size={24} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                <span>Nous contacter sur WhatsApp</span>
              </a>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative z-10 w-full lg:w-[450px] aspect-[4/3] bg-white editorial-border shadow-2xl overflow-hidden group"
            >
               <img 
                 src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800" 
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90"
                 alt="Contact Support"
               />
               <div className="absolute inset-0 bg-editorial-gold/10 mix-blend-overlay"></div>
            </motion.div>
            
            {/* Background Texture */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-editorial-gold/5 rounded-full blur-[80px]"></div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}

function CategoryCard({ title, img, delay = 0 }: { title: string; img: string; delay?: number }) {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });
  
  // Inner image parallax
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const smoothY = useSpring(y, { stiffness: 40, damping: 20 });

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-[700px] overflow-hidden cursor-pointer editorial-border bg-white shadow-xl"
    >
      {/* Inner Image with Parallax */}
      <motion.div style={{ y: smoothY, height: "130%", top: "-15%" }} className="absolute inset-x-0">
        <img 
          src={img} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
          alt={title} 
        />
      </motion.div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-editorial-text/20 group-hover:bg-editorial-text/40 transition-all duration-700"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-editorial-text/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-12 text-center">
        <h3 className="text-5xl font-serif mb-8 tracking-wide transform group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl">{title}</h3>
        <div className="w-16 h-[1px] bg-white mb-8 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
        <button className="label-caps tracking-[0.4em] !text-[9px] border-b border-white pb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-700 hover:text-editorial-gold hover:border-editorial-gold">
          Explorer la Gamme
        </button>
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
    </motion.div>
  );
}

function ReviewCard({ name, text }: { name: string; text: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 backdrop-blur-sm p-16 border border-white/10 hover:border-editorial-gold/30 transition-all duration-700 relative group"
    >
      <div className="flex text-editorial-gold mb-10 gap-2">
        {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" className="opacity-0 group-hover:opacity-100 transition-all" style={{ transitionDelay: `${i * 100}ms` }} />)}
        {[...Array(5)].map((_, i) => <Star key={i} size={16} className="absolute opacity-40 group-hover:opacity-0 transition-opacity" style={{ left: `${i * 24 + 64}px` }} />)}
      </div>
      <p className="text-white italic tracking-wide mb-12 leading-[1.8] text-xl font-light">"{text}"</p>
      <div className="flex items-center gap-6">
        <div className="w-12 h-[1px] bg-editorial-gold"></div>
        <p className="label-caps !text-[10px] text-editorial-gold tracking-[0.4em]">{name}</p>
      </div>
      {/* Decorative Quote Mark */}
      <div className="absolute top-10 right-12 text-7xl text-white/5 font-serif select-none italic pointer-events-none group-hover:text-editorial-gold transition-colors duration-700">"</div>
    </motion.div>
  );
}
function AdminPage() {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem("admin_token");
    return saved && saved !== "undefined" && saved !== "null" ? saved : "";
  });

  const handleLogin = (newToken: string) => {
    if (!newToken || newToken === "undefined" || newToken === "null") {
      return;
    }
    setToken(newToken);
    localStorage.setItem("admin_token", newToken);
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("admin_token");
  };

  return (
    <AnimatePresence mode="wait">
      {token ? (
        <Dashboard key="dashboard" token={token} onLogout={handleLogout} />
      ) : (
        <AdminLogin key="login" onLogin={handleLogin} />
      )}
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    // Track visitor on mount
    fetch("/api/track-visitor", { method: "POST" });
  }, []);

  return (
    <Router>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="relative">
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <CartDrawer />}
      {!isAdminRoute && <CartFAB />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function CartFAB() {
  const { totalItems, setIsCartOpen } = useCart();
  if (totalItems === 0) return null;
  
  return (
    <motion.button 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsCartOpen(true)}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-editorial-text text-white rounded-full flex items-center justify-center shadow-2xl group border border-white/10"
    >
      <ShoppingBag size={24} className="group-hover:text-editorial-gold transition-colors" />
      <span className="absolute -top-1 -right-1 bg-editorial-gold text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-editorial-bg">
        {totalItems}
      </span>
    </motion.button>
  );
}

function CategoryGrid() {
  const [assets, setAssets] = useState<{ key: string; url: string }[]>([]);
  
  useEffect(() => {
    fetch("/api/site-assets")
      .then(res => res.json())
      .then((data) => setAssets(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const getImg = (key: string, fallback: string) => assets.find((a) => a.key === key)?.url || fallback;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 px-6 md:px-0">
      <CategoryCard title="Vêtements" img={getImg('cat_vetements', "https://images.unsplash.com/photo-1539109132314-3477524c754a?q=80&w=800")} delay={0} />
      <CategoryCard title="Accessoires" img={getImg('cat_sacs', "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800")} delay={0.2} />
      <CategoryCard title="Chaussures" img={getImg('cat_chaussures', "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800")} delay={0.4} />
    </div>
  );
}

export default App;

// Remove unused or duplicate ArrowRight imports
