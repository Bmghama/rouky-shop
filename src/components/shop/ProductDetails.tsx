
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product } from "../../types.ts";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageCircle, ShoppingBag, ArrowLeft, 
  ChevronRight, ChevronLeft, Heart, Share2, Star,
  ShieldCheck, Truck, RefreshCw
} from "lucide-react";
import { formatPrice, getWhatsAppUrl, cn } from "../../lib/utils.ts";
import { useCart } from "../../context/CartContext.tsx";
import ReviewSection from "./Reviews.tsx";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [gallery, setGallery] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
    // Track view
    if (id) {
      fetch(`/api/products/${id}/view`, { method: "POST" });
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?id=${id}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const prod = data[0];
        setProduct(prod);
        setSelectedImage(prod.image_url);
        
        const g = JSON.parse(prod.gallery_urls || "[]");
        setGallery([prod.image_url, ...g]);
        
        const colors = JSON.parse(prod.colors || "[]");
        if (colors.length > 0) setSelectedColor(colors[0]);
        
        const sizes = JSON.parse(prod.sizes || "[]");
        if (sizes.length > 0) setSelectedSize(sizes[0]);

        // Fetch related
        const relRes = await fetch(`/api/products?category=${encodeURIComponent(prod.category_name)}&limit=4`);
        const relData = await relRes.json();
        setRelatedProducts(relData.filter((p: Product) => p.id !== prod.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: selectedImage,
      quantity,
      color: selectedColor,
      size: selectedSize
    });
  };

  const handleDirectWhatsApp = async () => {
    if (!product) return;
    try {
      await fetch(`/api/products/${product.id}/whatsapp`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    const message = `Bonjour Rouky Shop ! Je souhaite commander :\n\n*${product.name}*\n- Quantité: ${quantity}\n- Taille: ${selectedSize || 'Standard'}\n- Couleur: ${selectedColor || 'N/A'}\n- Prix: ${formatPrice(product.price * quantity)}\n\nMerci de confirmer la disponibilité !`;
    const url = `https://wa.me/22393932382?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-editorial-bg">
      <div className="w-12 h-12 border-4 border-editorial-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-editorial-bg">
      <h2 className="text-3xl font-serif mb-6">Produit non trouvé</h2>
      <button onClick={() => navigate('/')} className="label-caps border-b border-editorial-text pb-1">Retour à la boutique</button>
    </div>
  );

  const colors = JSON.parse(product.colors || "[]");
  const sizes = JSON.parse(product.sizes || "[]");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-editorial-bg pt-32 pb-24"
    >
        {/* Floating Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-[80] px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 label-caps !text-[10px] text-editorial-text font-black tracking-widest"
          >
            <ChevronLeft size={20} />
            Retour
          </button>
          <div className="text-[9px] label-caps text-editorial-gold font-bold tracking-widest">Aperçu Produit</div>
          <button 
            onClick={() => setIsZoomOpen(true)}
            className="p-1 px-3 border border-neutral-100 text-neutral-300 rounded-full text-[8px] label-caps"
          >
            Zoom
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Breadcrumb / Navigation */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3 text-[9px] label-caps opacity-50 tracking-[0.2em]">
              <button onClick={() => navigate('/')} className="hover:text-editorial-gold transition-colors flex items-center gap-2 group">
                Accueil
              </button>
              <span className="text-neutral-300">/</span>
              <button onClick={() => navigate('/shop')} className="hover:text-editorial-gold transition-colors">{product.category_name}</button>
              <span className="text-neutral-300">/</span>
              <span className="text-editorial-text opacity-100 font-bold">{product.name}</span>
            </div>
            
            <button 
              onClick={() => navigate(-1)} 
              className="group flex items-center gap-3 label-caps !text-[10px] text-editorial-text hover:text-editorial-gold transition-all"
            >
              <span className="w-10 h-[1px] bg-editorial-text group-hover:bg-editorial-gold group-hover:w-14 transition-all"></span>
              Retour à la Boutique
            </button>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 xl:gap-32">
          {/* Gallery Section */}
          <div className="space-y-8">
            <div className="aspect-[4/5] bg-white editorial-border overflow-hidden relative group shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  src={selectedImage} 
                  onClick={() => setIsZoomOpen(true)}
                  className="w-full h-full object-cover cursor-zoom-in group-hover:scale-110 transition-transform duration-1000" 
                  alt={product.name} 
                />
              </AnimatePresence>
              
              {/* Navigation Arrows */}
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = gallery.indexOf(selectedImage);
                    const prev = idx === 0 ? gallery.length - 1 : idx - 1;
                    setSelectedImage(gallery[prev]);
                  }}
                  className="w-14 h-14 bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center rounded-full pointer-events-auto hover:bg-neutral-900 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                >
                  <ArrowLeft size={20} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = gallery.indexOf(selectedImage);
                    const next = (idx + 1) % gallery.length;
                    setSelectedImage(gallery[next]);
                  }}
                  className="w-14 h-14 bg-white/95 backdrop-blur-md shadow-2xl flex items-center justify-center rounded-full pointer-events-auto hover:bg-neutral-900 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                >
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Image Counter */}
              <div 
                className="absolute bottom-8 right-8 bg-editorial-text/90 backdrop-blur-md text-white px-5 py-2 text-[10px] label-caps tracking-[0.3em] md:block hidden shadow-2xl border border-white/10"
              >
                {gallery.indexOf(selectedImage) + 1} <span className="opacity-40 italic mx-1">sur</span> {gallery.length}
              </div>

              {/* Mobile Arrows - More Persistent */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between md:hidden pointer-events-none">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = gallery.indexOf(selectedImage);
                    const prev = idx === 0 ? gallery.length - 1 : idx - 1;
                    setSelectedImage(gallery[prev]);
                  }}
                  className="w-12 h-12 bg-white/95 backdrop-blur-md shadow-xl flex items-center justify-center rounded-full pointer-events-auto active:scale-90"
                >
                  <ArrowLeft size={18} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const idx = gallery.indexOf(selectedImage);
                    const next = (idx + 1) % gallery.length;
                    setSelectedImage(gallery[next]);
                  }}
                  className="w-12 h-12 bg-white/95 backdrop-blur-md shadow-xl flex items-center justify-center rounded-full pointer-events-auto active:scale-90"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {product.badge && (
                <div className="absolute top-8 left-8 bg-editorial-gold text-white px-5 py-2 label-caps !text-[10px] shadow-2xl z-10 tracking-[0.2em] font-bold">
                  {product.badge}
                </div>
              )}
            </div>
            
            <div className="flex overflow-x-auto gap-6 pb-4 md:grid md:grid-cols-5 md:overflow-visible scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
              {gallery.map((url, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedImage(url)}
                  className={cn(
                    "w-20 h-24 md:w-full md:h-full aspect-[4/5] shrink-0 bg-white editorial-border overflow-hidden transition-all duration-500",
                    selectedImage === url ? "ring-2 ring-editorial-gold ring-offset-4 ring-offset-editorial-bg p-1 grayscale-0" : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                  )}
                >
                  <img src={url} className="w-full h-full object-cover" alt={`${product.name} thumbnail ${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
          <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-[1px] bg-editorial-gold opacity-50"></div>
                   <p className="label-caps text-editorial-gold tracking-[0.4em] !text-[11px]">{product.category_name}</p>
                </div>
                {product.avg_rating && product.avg_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex text-editorial-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < Math.round(product.avg_rating || 0) ? "currentColor" : "none"} stroke="currentColor" className="mr-0.5" />
                      ))}
                    </div>
                    <span className="text-[10px] label-caps text-neutral-400">({product.review_count} avis)</span>
                  </div>
                )}
              </div>
              <h1 className="text-5xl md:text-7xl font-serif text-neutral-900 mb-8 leading-[1.1] tracking-tighter">{product.name}</h1>
              <div className="flex items-center gap-10">
                <p className="text-4xl font-mono text-editorial-text font-bold tracking-tight">{formatPrice(product.price)}</p>
                {product.old_price && (
                  <p className="text-2xl font-mono text-neutral-300 line-through decoration-editorial-gold opacity-60">{formatPrice(product.old_price)}</p>
                )}
              </div>
            </div>

            <div className="space-y-12 pb-16 border-b border-neutral-100">
              <div className="space-y-6">
                <p className="text-neutral-500 text-lg leading-relaxed italic font-light opacity-80">{product.description}</p>
                {product.long_description && (
                  <div className="text-neutral-400 leading-loose text-sm font-light space-y-4 max-w-xl">
                    {product.long_description.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Variations */}
              {colors.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="label-caps !text-[11px] tracking-widest">Choix de la Couleur <span className="text-editorial-gold mx-2">/</span> <span className="text-editorial-text font-bold uppercase">{selectedColor}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-5">
                    {colors.map((c: string) => {
                      const colorMap: {[key: string]: string} = {
                        'Noir': '#1A1A1A', 'Blanc': '#FDFDFD', 'Rose': '#FFC0CB', 'Beige': '#F5F5DC',
                        'Bleu': '#2B4A9E', 'Vert': '#2D5A27', 'Rouge': '#A12D2D', 'Or': '#C5A059',
                        'Champagne': '#EADABB', 'Vert émeraude': '#046307', 'Bleu ciel': '#72A0C1', 'Marron': '#5D4037'
                      };
                      return (
                        <button 
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={cn(
                            "w-12 h-12 rounded-full border transition-all p-1 flex items-center justify-center transform hover:scale-110",
                            selectedColor === c ? "border-editorial-gold scale-110 shadow-lg" : "border-neutral-100 hover:border-editorial-gold/30"
                          )}
                          title={c}
                        >
                          <div 
                            className="w-full h-full rounded-full border border-black/5 shadow-inner" 
                            style={{ backgroundColor: colorMap[c] || '#CBD5E1' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <p className="label-caps !text-[11px] tracking-widest">Choisir une Taille <span className="text-editorial-gold mx-2">/</span> <span className="text-editorial-text font-bold uppercase">{selectedSize}</span></p>
                      {/* Guide des tailles caché car non implémenté */}
                   </div>
                   <div className="flex flex-wrap gap-4">
                    {sizes.map((s: string) => (
                      <button 
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={cn(
                          "min-w-[60px] h-14 px-4 flex items-center justify-center text-xs font-mono border transition-all duration-500",
                          selectedSize === s ? "bg-editorial-text text-white border-editorial-text shadow-2xl scale-105" : "bg-white border-neutral-100 hover:border-editorial-gold text-neutral-400"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 bg-editorial-bg editorial-border p-4 w-fit">
                {product.stock > 0 ? (
                  <>
                    <div className={cn("w-2 h-2 rounded-full", product.stock <= 5 ? "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-emerald-500")} />
                    <span className={cn("text-[10px] label-caps tracking-[0.2em]", product.stock <= 5 ? "text-red-500 font-bold" : "text-emerald-600/70") }>
                      {product.stock <= 5 ? `Édition Limitée - Plus que ${product.stock} articles` : `Disponibilité Immédiate (${product.stock} articles)`}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] label-caps tracking-widest text-neutral-400 font-bold italic">Indisponible momentanément</span>
                )}
              </div>
            </div>

            {/* Product Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-12">
              {(() => {
                const h = JSON.parse(product.highlights || "[]");
                if (h.length > 0) {
                  return h.map((item: any, i: number) => (
                    <div key={i} className="bg-white p-6 editorial-border text-center shadow-sm hover:shadow-lg transition-all group">
                      <p className="text-[9px] label-caps text-neutral-400 mb-2 group-hover:text-editorial-gold transition-colors tracking-[0.2em]">{item.label}</p>
                      <p className="text-[11px] font-bold text-editorial-text uppercase">{item.value}</p>
                    </div>
                  ));
                }
                return (
                  <>
                    <div className="bg-white p-6 editorial-border text-center shadow-sm group">
                      <p className="text-[9px] label-caps text-neutral-400 mb-2 tracking-[0.2em] group-hover:text-editorial-gold">Matière</p>
                      <p className="text-[11px] font-bold text-editorial-text uppercase">Premium Silk</p>
                    </div>
                    <div className="bg-white p-6 editorial-border text-center shadow-sm group">
                      <p className="text-[9px] label-caps text-neutral-400 mb-2 tracking-[0.2em] group-hover:text-editorial-gold">Finition</p>
                      <p className="text-[11px] font-bold text-editorial-text uppercase">Artisanale</p>
                    </div>
                    <div className="bg-white p-6 editorial-border text-center shadow-sm group">
                      <p className="text-[9px] label-caps text-neutral-400 mb-2 tracking-[0.2em] group-hover:text-editorial-gold">Luxe</p>
                      <p className="text-[11px] font-bold text-editorial-text uppercase">Sélectionné</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="pb-12 space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center border border-neutral-100 bg-white h-20 md:h-auto shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-20 md:w-24 h-full flex items-center justify-center hover:bg-neutral-50 transition-colors text-xl font-light"
                  >
                    —
                  </button>
                  <span className="w-16 text-center font-mono text-lg font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-20 md:w-24 h-full flex items-center justify-center hover:bg-neutral-50 transition-colors text-xl font-light"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 px-10 py-6 md:py-6 flex items-center justify-center gap-6 label-caps !text-[11px] shadow-2xl transition-all h-20 tracking-[0.2em] font-bold",
                    product.stock > 0 ? "bg-editorial-text text-white hover:bg-neutral-800 hover:-translate-y-1 active:translate-y-0" : "bg-neutral-100 text-neutral-300 cursor-not-allowed shadow-none"
                  )}
                >
                  <ShoppingBag size={24} strokeWidth={1.5} />
                  Ajouter au Panier
                </button>
              </div>

              {/* Mobile Sticky CTA Bar */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-neutral-100 z-[90] flex gap-4 shadow-[0_-20px_40px_rgba(0,0,0,0.08)]">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 py-5 flex items-center justify-center gap-3 label-caps !text-[11px] shadow-2xl active:scale-95 transition-all font-bold tracking-[0.2em]",
                    product.stock > 0 ? "bg-editorial-text text-white" : "bg-neutral-100 text-neutral-300 shadow-none"
                  )}
                >
                  <ShoppingBag size={20} />
                  Panier
                </button>
                <button 
                  onClick={handleDirectWhatsApp}
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 py-5 flex items-center justify-center gap-3 label-caps !text-[11px] shadow-2xl active:scale-95 transition-all font-bold tracking-[0.2em]",
                    product.stock > 0 ? "bg-[#25D366] text-white" : "bg-neutral-100 text-neutral-300 shadow-none"
                  )}
                >
                  <MessageCircle size={20} />
                  WhatsApp
                </button>
              </div>

              {/* Accordions */}
              <div className="space-y-6 pt-12 border-t border-neutral-100">
                <Accordion title="L'Esprit de la Pièce">
                  <p className="text-sm leading-loose text-neutral-500 font-light italic opacity-80 text-left">
                    Cette pièce exclusive de la collection Rouky Shop incarne l'élégance moderne. 
                    Confectionnée avec des tissus de haute qualité, elle offre un confort exceptionnel 
                    et un tombé parfait pour sublimer votre silhouette en toute circonstance.
                  </p>
                </Accordion>
                <Accordion title="Dimensions & Mesures">
                  <div className="text-sm leading-loose text-neutral-500 font-light space-y-4">
                    <p>Nos articles taillent normalement. Nous vous recommandons de prendre votre taille habituelle pour un porté ajusté.</p>
                    <p className="p-4 bg-neutral-50 border-l-2 border-editorial-gold italic">
                      "Une hésitation ? Préférez la taille supérieure pour un confort optimal et une fluidité accrue."
                    </p>
                  </div>
                </Accordion>
                <Accordion title="Entretien d'Excellence">
                  <p className="text-sm leading-loose text-neutral-500 font-light">
                    Lavage à la main à l'eau tempérée ou nettoyage à sec recommandé pour préserver l'éclat des couleurs 
                    et la qualité des fibres nobles. Séchage naturel à l'ombre. Repassage très doux sur l'envers.
                  </p>
                </Accordion>
              </div>

              <div className="grid grid-cols-2 gap-10 py-16 border-t border-neutral-100">
                <div className="flex items-start gap-5 group">
                   <div className="p-3 bg-neutral-50 rounded-full group-hover:bg-editorial-gold/10 transition-colors">
                    <Truck size={22} strokeWidth={1} className="text-editorial-gold shrink-0" />
                   </div>
                   <div>
                      <p className="label-caps !text-[10px] mb-2 font-bold tracking-widest transition-colors group-hover:text-editorial-gold">Bamako Express</p>
                      <p className="text-[11px] text-neutral-400 font-light leading-relaxed">Livraison sous 24h ouvrées. Suivi en temps réel via WhatsApp.</p>
                   </div>
                </div>
                <div className="flex items-start gap-5 group">
                   <div className="p-3 bg-neutral-50 rounded-full group-hover:bg-editorial-gold/10 transition-colors">
                    <ShieldCheck size={22} strokeWidth={1} className="text-editorial-gold shrink-0" />
                   </div>
                   <div>
                      <p className="label-caps !text-[10px] mb-2 font-bold tracking-widest transition-colors group-hover:text-editorial-gold">Paiement Sécurisé</p>
                      <p className="text-[11px] text-neutral-400 font-light leading-relaxed">Paiement mobile (Orange Money) ou Espèces à la réception.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-48 border-t border-neutral-100 pt-32">
          <ReviewSection 
            productId={Number(id)} 
            avgRating={product.avg_rating} 
            reviewCount={product.review_count} 
          />
        </div>

        {/* Similar Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-48 text-center bg-editorial-text/5 -mx-6 md:-mx-12 px-6 md:px-12 py-32 md:py-48 relative overflow-hidden">
             {/* Decor Background Text */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[30rem] font-serif text-editorial-text/[0.02] pointer-events-none select-none uppercase tracking-tighter whitespace-nowrap">
                Rouky Shop
             </div>
             
             <div className="relative z-10">
                <div className="flex flex-col items-center mb-24 max-w-2xl mx-auto">
                  <span className="label-caps text-editorial-gold tracking-[0.5em] mb-4 text-[11px]">Inspirations</span>
                  <h2 className="text-5xl md:text-8xl font-serif text-editorial-text tracking-tighter mb-8 italic">Vous pourriez aussi aimer...</h2>
                  <div className="w-20 h-[1px] bg-editorial-gold/30"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
                  {relatedProducts.map(p => (
                    <ProductCardSmall key={p.id} product={p} />
                  ))}
                </div>
                
                <button 
                  onClick={() => navigate('/shop')} 
                  className="mt-32 label-caps bg-editorial-text text-white px-16 py-6 text-[11px] shadow-2xl hover:bg-neutral-800 transition-all tracking-[0.4em] font-bold"
                >
                  Découvrir toute la collection
                </button>
             </div>
          </div>
        )}

        {/* Zoom Modal */}
        <AnimatePresence>
          {isZoomOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsZoomOpen(false)}
              className="fixed inset-0 bg-neutral-900/95 z-[100] flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            >
               <motion.div
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.9, opacity: 0 }}
                 className="relative max-w-5xl w-full h-full flex items-center justify-center"
                 onClick={(e) => e.stopPropagation()}
               >
                 <img src={selectedImage} className="max-w-full max-h-full object-contain shadow-2xl" alt="Zoom" />
                 <button 
                  onClick={() => setIsZoomOpen(false)}
                  className="absolute top-0 right-0 p-4 text-white hover:text-editorial-gold transition-colors"
                 >
                   <ArrowLeft size={32} className="rotate-45" />
                 </button>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProductCardSmall({ product }: { product: Product }) {
  const navigate = useNavigate();
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group cursor-pointer"
    >
      <div className="aspect-[3/4] bg-white editorial-border overflow-hidden mb-6 relative">
        <img src={product.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
        <div className="absolute inset-0 bg-editorial-text/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {product.stock <= 5 && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 label-caps !text-[7px] text-red-500 border border-red-100">Dernières pièces</div>
        )}
      </div>
      <p className="label-caps !text-[8px] text-editorial-gold mb-1">{product.category_name}</p>
      <h3 className="font-serif text-lg text-neutral-900 group-hover:text-editorial-gold transition-colors">{product.name}</h3>
      <p className="font-mono text-sm text-neutral-400 mt-2">{formatPrice(product.price)}</p>
    </motion.div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-neutral-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-neutral-900 text-[10px] label-caps tracking-[0.2em] group"
      >
        <span>{title}</span>
        <ChevronRight size={14} className={cn("transition-transform duration-300", isOpen ? "rotate-90" : "text-neutral-300 group-hover:text-editorial-gold")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pb-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
