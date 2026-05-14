
import { motion } from "motion/react";
import { ShoppingCart, Eye, Heart, MessageCircle, ShoppingBag, Plus, Star } from "lucide-react";
import { Product } from "../../types.ts";
import { formatPrice, getWhatsAppUrl } from "../../lib/utils.ts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.tsx";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1
    });
  };

  const handleOrder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Log as a click
      await fetch(`/api/products/${product.id}/whatsapp`, { method: 'POST' });
      
      // Also log as an order attempt
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.id, 
          customerName: 'Client WhatsApp', 
          customerPhone: 'N/A' 
        })
      });
    } catch (err) {
      console.error("Tracking error", err);
    }

    // Open WhatsApp
    window.open(getWhatsAppUrl(product.name, product.price), '_blank');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -10,
        rotateX: 2,
        rotateY: -2,
        scale: 1.02,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="group relative bg-white editorial-border overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-editorial-gold/10 transition-all duration-700 perspective-1000 preserve-3d cursor-pointer"
    >
      {/* Editorial Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 preserve-3d">
        <motion.img
          animate={{ 
            scale: isHovered ? 1.08 : 1,
            z: isHovered ? 20 : 0
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Category Label - Floating with translateZ */}
        <motion.div 
          animate={{ z: isHovered ? 40 : 0 }}
          className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1 label-caps z-10 editorial-border shadow-sm !text-[7px] md:!text-xs"
        >
          {product.category_name}
        </motion.div>

        {product.badge && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
             <div className="bg-editorial-gold text-white px-2 py-1 md:px-3 md:py-1 label-caps !text-[7px] md:!text-[8px] tracking-widest shadow-xl">
                {product.badge}
             </div>
          </div>
        )}

        {/* Low Stock Indicator */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-20 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1 label-caps !text-[6px] md:!text-[7px] text-red-500 shadow-sm border border-red-100">
            Dernières pièces
          </div>
        )}

        {/* Floating Side Action (Add) - Larger for mobile touch */}
        <motion.div 
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex flex-col gap-2 z-20"
        >
          <button 
            onClick={handleQuickAdd}
            className="w-12 h-12 md:w-10 md:h-10 bg-editorial-text text-white flex items-center justify-center hover:bg-editorial-gold shadow-2xl active:scale-95 transition-all"
          >
            <Plus size={20} className="md:w-5 md:h-5" />
          </button>
        </motion.div>
      </div>

      {/* Info Section - Balanced for mobile */}
      <div className="p-4 md:p-6 flex flex-col bg-white">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-4 h-[1px] bg-editorial-gold opacity-50"></span>
              <p className="label-caps text-editorial-gold !text-[7px] md:!text-[8px] tracking-[0.4em] font-bold">{product.category_name}</p>
            </div>
            {product.avg_rating && product.avg_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={10} className="fill-editorial-gold text-editorial-gold" />
                <span className="text-[10px] font-mono font-bold text-editorial-text">{product.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h3 className="font-serif text-base md:text-xl text-editorial-text leading-tight group-hover:text-editorial-gold transition-colors min-h-[3rem] flex items-start">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between border-t border-neutral-50 pt-4 mt-auto">
          <div className="flex items-center gap-3">
             <p className="font-mono text-sm md:text-lg font-bold text-editorial-text tracking-tight">{formatPrice(product.price)}</p>
             {product.old_price && (
               <p className="font-mono text-[9px] md:text-[11px] text-neutral-300 line-through tracking-tighter opacity-60">{formatPrice(product.old_price)}</p>
             )}
          </div>
          <motion.div 
            animate={{ x: isHovered ? -5 : 0 }}
            className="text-editorial-gold"
          >
             <Eye size={16} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>
      </div>

      {/* Dynamic Shine/Glare Effect */}
      <motion.div 
        animate={{ 
          opacity: isHovered ? 0.4 : 0,
          background: isHovered 
            ? "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)"
            : "none",
          x: isHovered ? ["-100%", "200%"] : "-100%"
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        className="absolute inset-0 pointer-events-none z-30 skew-x-[-20deg]"
      />
    </motion.div>
  );
}
