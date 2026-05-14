
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Globe, Award, Sparkles } from "lucide-react";

export default function AboutPage() {
  const [visionImage, setVisionImage] = useState("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200");
  
  useEffect(() => {
    fetch("/api/site-assets")
      .then(res => res.json())
      .then(assets => {
        const vision = assets.find((a: any) => a.key === 'about_vision');
        if (vision) setVisionImage(vision.url);
      });
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const slowY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white min-h-screen pt-40 pb-32 font-sans"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        
        {/* Elegant Header */}
        <div className="max-w-3xl mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-8 h-[1px] bg-editorial-gold"></div>
            <span className="label-caps text-editorial-gold !text-[10px] tracking-[0.4em] font-black">Maison Rouky Shop</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-8xl font-serif italic leading-[0.9] mb-12"
          >
            L'excellence du <br />
            <span className="text-neutral-300">Style Malien.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-500 font-light leading-relaxed max-w-xl"
          >
            Depuis sa création, Rouky Shop s'impose comme une signature de raffinement. 
            Notre mission est de sublimer chaque femme à travers des pièces qui allient 
            tradition et modernité.
          </motion.p>
        </div>

        {/* Structured Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-40 items-center">
          <div className="md:col-span-7 aspect-[4/5] overflow-hidden bg-neutral-50 editorial-border">
            <motion.img 
              style={{ y: slowY }}
              src={visionImage} 
              className="w-full h-full object-cover scale-110"
              alt="Vision"
            />
          </div>
          <div className="md:col-span-5 space-y-12 pl-0 md:pl-10">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif italic">Une Vision Claire</h2>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Nous sélectionnons nos tissus et nos créations avec une exigence absolue. 
                Chaque détail compte, de la première esquisse à la livraison finale 
                chez nos clientes à Bamako, Dakar ou Abidjan.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-editorial-gold">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="font-serif text-lg italic mb-1">Qualité Supérieure</h4>
                  <p className="text-xs text-neutral-400">Des standards de luxe pour chaque collection.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="shrink-0 w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center text-editorial-gold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-serif text-lg italic mb-1">Style Exclusif</h4>
                  <p className="text-xs text-neutral-400">Des modèles pensés pour vous rendre unique.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values - Clean Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-100 border border-neutral-100 mb-40">
          <ValueBlock 
            icon={<Heart size={24} />} 
            title="Dévouement" 
            text="Nous sommes à l'écoute de chaque cliente pour une expérience sur mesure." 
          />
          <ValueBlock 
            icon={<ShieldCheck size={24} />} 
            title="Intégrité" 
            text="La transparence sur la qualité et la provenance de nos produits." 
          />
          <ValueBlock 
            icon={<Globe size={24} />} 
            title="Ambition" 
            text="Faire rayonner la mode premium partout en Afrique de l'Ouest." 
          />
        </div>

        {/* Stats - Clean & Elegant */}
        <div className="py-32 border-t border-b border-neutral-100 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 text-center">
            <div className="space-y-4">
              <p className="text-6xl font-serif italic">1500+</p>
              <p className="label-caps !text-[9px] text-neutral-400 tracking-[0.4em]">Clientes Heureuses</p>
            </div>
            <div className="space-y-4">
              <p className="text-6xl font-serif italic">24h</p>
              <p className="label-caps !text-[9px] text-neutral-400 tracking-[0.4em]">Délai de Livraison</p>
            </div>
            <div className="space-y-4">
              <p className="text-6xl font-serif italic">100%</p>
              <p className="label-caps !text-[9px] text-neutral-400 tracking-[0.4em]">Service Client</p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-serif italic max-w-4xl mx-auto leading-tight">
            L'élégance commence ici, <br /> avec vous.
          </h2>
          <motion.div whileHover={{ y: -5 }} className="inline-block">
            <Link 
              to="/shop"
              className="inline-block bg-editorial-text text-white px-12 py-5 label-caps !text-[10px] tracking-[0.5em] shadow-xl hover:bg-editorial-gold transition-all"
            >
              Explorer la boutique
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function ValueBlock({ icon, title, text }: any) {
  return (
    <div className="bg-white p-12 space-y-6 hover:bg-neutral-50 transition-colors duration-500">
      <div className="text-editorial-gold">{icon}</div>
      <h3 className="text-2xl font-serif italic">{title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed font-light">{text}</p>
    </div>
  );
}
