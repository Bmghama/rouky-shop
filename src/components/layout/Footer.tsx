
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MessageCircle, Truck, Instagram, Facebook, Music } from "lucide-react";
import { ParallaxLogo } from "./ParallaxLogo";
import { useCart } from "../../context/CartContext";

export default function Footer() {
  const { setIsCartOpen } = useCart();

  return (
    <footer className="bg-white border-t border-neutral-100 pt-20 pb-12 px-6 md:px-12 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <div className="flex items-center">
              <ParallaxLogo size="lg" />
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs italic font-serif">
              "L'élégance est la seule beauté qui ne se fane jamais." 
              Découvrez une mode pensée pour sublimer chaque instant.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="label-caps text-editorial-text !text-[11px] font-black tracking-[0.2em] flex items-center gap-2">
              <span className="w-4 h-[1px] bg-editorial-gold"></span>
              Navigation
            </h4>
            <ul className="space-y-3 text-[12px] font-bold uppercase tracking-wider text-neutral-400">
              <li><Link to="/" className="hover:text-editorial-gold transition-colors">Accueil</Link></li>
              <li><Link to="/shop" className="hover:text-editorial-gold transition-colors">Boutique</Link></li>
              <li><button onClick={() => setIsCartOpen(true)} className="hover:text-editorial-gold transition-colors text-left uppercase">Mon Panier</button></li>
              <li><Link to="/admin" className="hover:text-editorial-gold transition-colors">Espace Pro</Link></li>
            </ul>
          </div>

          {/* Contact & Delivery */}
          <div className="space-y-6">
            <h4 className="label-caps text-editorial-text !text-[11px] font-black tracking-[0.2em] flex items-center gap-2">
              <span className="w-4 h-[1px] bg-editorial-gold"></span>
              Contact & Services
            </h4>
            <div className="space-y-4">
              <a href="https://wa.me/22393932382" target="_blank" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-green-50 text-[#25D366] flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all">
                  <MessageCircle size={16} />
                </div>
                <span className="text-sm font-mono tracking-tight text-neutral-600">+223 93 93 23 82</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-50 text-editorial-gold flex items-center justify-center">
                  <Truck size={16} />
                </div>
                <div>
                  <p className="text-[9px] label-caps text-neutral-400 leading-none mb-1">Livraison Express</p>
                  <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-tighter">Mali · Sénégal · Côte d’Ivoire</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="label-caps text-editorial-text !text-[11px] font-black tracking-[0.2em] flex items-center gap-2">
              <span className="w-4 h-[1px] bg-editorial-gold"></span>
              Réseaux Sociaux
            </h4>
            <div className="flex gap-6">
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-[#E1306C] hover:text-white transition-all duration-500 shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                <img src="/instagram.png" alt="Instagram" className="w-6 h-6 object-contain" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-[#1877F2] hover:text-white transition-all duration-500 shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                <img src="/facebook.png" alt="Facebook" className="w-6 h-6 object-contain" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white transition-all duration-500 shadow-sm hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                <img src="/tiktok.png" alt="TikTok" className="w-6 h-6 object-contain" />
              </a>
            </div>
            <p className="text-[9px] label-caps text-neutral-400 italic tracking-[0.1em]">Retrouvez-nous prochainement sur vos réseaux favoris</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] label-caps tracking-[0.2em] text-neutral-400 font-bold order-2 md:order-1">
            © 2026 Rouky Shop Premium. Tous droits réservés.
          </p>
          <div className="hidden md:flex items-center gap-8 text-[9px] label-caps text-neutral-300 font-bold tracking-[0.3em] order-1 md:order-2">
            <span className="hover:text-editorial-gold transition-colors cursor-pointer">CGV</span>
            <span className="hover:text-editorial-gold transition-colors cursor-pointer">Confidentialité</span>
            <span className="hover:text-editorial-gold transition-colors cursor-pointer">Mentions Légales</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
