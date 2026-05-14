
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils.ts";
import { useCart } from "../../context/CartContext.tsx";
import { ParallaxLogo } from "./ParallaxLogo";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Boutique", path: "/shop" },
    { name: "Nouveautés", path: "/shop?category=Nouveautés" },
    { name: "A propos", path: "/about" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] transition-all duration-700 px-6 md:px-12 py-6 flex items-center justify-between",
          isScrolled ? "bg-editorial-bg/95 backdrop-blur-md shadow-2xl border-b border-neutral-100 !py-4" : "bg-transparent"
        )}
      >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/" className="hover:opacity-90 transition-all active:scale-95 group shrink-0">
          <ParallaxLogo size="md" />
        </Link>
  
        {/* Desktop Menu - Centered logic */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 space-x-8 lg:space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-[10px] uppercase tracking-[0.3em] font-bold transition-all relative group py-2",
                location.pathname === link.path ? "text-logo-pink" : "text-editorial-text hover:text-logo-pink"
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-1 left-0 h-[1px] bg-logo-pink transition-all duration-500",
                location.pathname === link.path ? "w-full" : "w-0 group-hover:w-full"
              )}></span>
            </Link>
          ))}
        </div>
  
        {/* Icons */}
        <div className="flex items-center space-x-2 md:space-x-6 shrink-0">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex text-editorial-text hover:text-editorial-gold transition-all p-2 hover:scale-110 active:scale-90"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
          
          <div className="flex items-center gap-4 md:gap-6">
            <Link 
              to="/admin" 
              className="hidden lg:flex bg-editorial-text text-white px-5 py-2 text-[8px] uppercase tracking-[0.3em] hover:bg-neutral-800 transition-all shadow-md active:scale-95 font-bold"
            >
              Espace Pro
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 group px-2 py-1 hover:bg-white/50 rounded-full transition-all"
            >
              <div className="relative">
                <ShoppingBag size={20} className="text-neutral-400 group-hover:text-logo-pink transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-logo-pink text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400 group-hover:text-editorial-text transition-colors">Panier</span>
            </button>
          </div>
  
          <button 
            className="md:hidden text-editorial-text p-2 active:scale-90 transition-transform"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <div className="space-y-1.5">
              <div className="w-6 h-[2px] bg-editorial-text"></div>
              <div className="w-4 h-[2px] bg-editorial-text ml-auto"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-editorial-bg z-[110] flex flex-col shadow-2xl md:hidden"
          >
            <div className="flex items-center justify-between p-8 border-b border-neutral-100">
              <div className="flex items-center">
                <ParallaxLogo size="sm" />
              </div>
              <button 
                className="p-2 text-neutral-400 hover:text-editorial-text transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "text-2xl font-serif tracking-tight transition-colors flex items-center justify-between group",
                      location.pathname === link.path ? "text-logo-pink" : "text-neutral-900"
                    )}
                  >
                    {link.name}
                    <motion.span 
                      whileHover={{ x: 5 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-logo-pink text-sm"
                    >
                      →
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="p-10 border-t border-neutral-100 bg-neutral-50">
              <Link 
                to="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full bg-editorial-text text-white text-center py-5 label-caps !text-[10px] shadow-xl hover:bg-neutral-800 transition-colors mb-6"
              >
                Espace Admin
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] label-caps text-neutral-400 font-bold">Mon Compte</p>
                  <p className="text-xs text-neutral-900">Se connecter</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-editorial-bg/98 backdrop-blur-xl z-[200] flex flex-col p-8 md:p-20"
          >
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex justify-between items-center mb-16 md:mb-24">
                <ParallaxLogo size="md" />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-4 hover:bg-neutral-100 rounded-full transition-colors group"
                >
                  <X size={32} className="text-neutral-400 group-hover:text-editorial-text transition-colors" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="flex items-center border-b-2 border-editorial-text pb-6 focus-within:border-editorial-gold transition-colors">
                  <Search size={40} className="text-editorial-text/20 mr-6" />
                  <input 
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Que recherchez-vous ?"
                    className="w-full bg-transparent text-3xl md:text-5xl font-serif italic focus:outline-none placeholder:text-neutral-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        window.location.href = `/shop?search=${searchQuery}`;
                        setIsSearchOpen(false);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-4 pt-8">
                  <p className="w-full text-[10px] label-caps text-neutral-400 mb-2">Suggestions :</p>
                  {['Robes', 'Sacs en cuir', 'Bijoux Gold', 'Nouveautés'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                        window.location.href = `/shop?search=${tag}`;
                        setIsSearchOpen(false);
                      }}
                      className="px-6 py-2 border border-neutral-100 rounded-full text-xs hover:bg-editorial-text hover:text-white transition-all hover:shadow-lg"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
}
