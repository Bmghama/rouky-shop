import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, MessageCircle, MapPin, User, Phone, ArrowLeft, ChevronLeft, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice, cn } from '../../lib/utils';

type Step = 'cart' | 'checkout';

export const CartDrawer: React.FC = () => {
  const { 
    items, removeFromCart, updateQuantity, totalPrice, 
    isCartOpen, setIsCartOpen, totalItems, 
    checkoutInfo, updateCheckoutInfo 
  } = useCart();
  
  const [step, setStep] = useState<Step>('cart');

  const handleWhatsAppCheckout = async () => {
    if (!checkoutInfo.neighborhood) {
      return;
    }

    // Save order to database first
    try {
      // Track WhatsApp click for each product
      await Promise.all(items.map(item => 
        fetch(`/api/products/${item.id}/whatsapp`, { method: "POST" })
      ));

      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkoutInfo.customerName || 'Client WhatsApp',
          customerPhone: checkoutInfo.phoneNumber || 'N/A',
          neighborhood: checkoutInfo.neighborhood,
          totalPrice,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size
          }))
        })
      });
    } catch (err) {
      console.error("Failed to persist order or track clicks:", err);
      // We still open WhatsApp even if DB save fails to not block the sale
    }

    const itemDetails = items.map(item => {
      return `Produit : ${item.name}\nQuantité : ${item.quantity}\nPrix unitaire : ${formatPrice(item.price)}\nTotal : ${formatPrice(item.price * item.quantity)}\n${item.color ? `Couleur : ${item.color}\n` : ''}${item.size ? `Taille : ${item.size}\n` : ''}---`;
    }).join('\n');

    const message = `Bonjour Rouky Shop, je souhaite commander :\n\n${itemDetails}\n\n*TOTAL COMMANDE : ${formatPrice(totalPrice)}*\n\n*COORDONNÉES :*\nNom : ${checkoutInfo.customerName || 'Non précisé'}\nQuartier : ${checkoutInfo.neighborhood}\n${checkoutInfo.phoneNumber ? `Téléphone : ${checkoutInfo.phoneNumber}\n` : ''}\nMerci de confirmer ma commande.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/22393932382?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBack = () => {
    if (step === 'checkout') {
      setStep('cart');
    } else {
      setIsCartOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-editorial-text/40 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleBack}
                  className="p-2 -ml-2 hover:bg-neutral-50 rounded-full transition-all group flex items-center gap-2"
                >
                  <ChevronLeft size={24} className="text-editorial-text group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline label-caps !text-[10px] text-neutral-400">Retour</span>
                </button>
                <div className="h-8 w-[1px] bg-neutral-100 mx-2" />
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-editorial-gold" />
                  <h2 className="text-xl font-serif italic">
                    {step === 'cart' ? 'Mon Panier' : 'Commande'}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-neutral-50 rounded-full transition-colors order-last"
              >
                <X size={24} className="text-neutral-400" />
              </button>
            </div>

            {/* Navigation Progress Bar */}
            <div className="h-1 bg-neutral-50 w-full relative overflow-hidden">
               <motion.div 
                 initial={false}
                 animate={{ width: step === 'cart' ? '50%' : '100%' }}
                 className="absolute top-0 left-0 h-full bg-editorial-gold transition-all duration-500"
               />
            </div>

            {/* Items List Step */}
            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
              <AnimatePresence mode="wait">
                {step === 'cart' ? (
                  <motion.div 
                    key="step-cart"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 p-8 space-y-8"
                  >
                    {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20">
                        <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center">
                          <ShoppingBag size={40} className="text-neutral-200" />
                        </div>
                        <div className="space-y-3">
                          <p className="font-serif text-2xl italic text-neutral-400">Votre panier est vide</p>
                          <p className="text-sm text-neutral-300 max-w-[200px] mx-auto italic">Explorez notre collection et trouvez la pièce qui vous sublimera.</p>
                        </div>
                        <button 
                          onClick={() => setIsCartOpen(false)}
                          className="bg-editorial-text text-white px-10 py-5 label-caps !text-[10px] tracking-[0.2em] shadow-xl hover:bg-editorial-gold transition-all"
                        >
                          Continuer le shopping
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-6">
                          {items.map((item, idx) => (
                            <motion.div 
                              key={`${item.id}-${item.color}-${item.size}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-6 group"
                            >
                              <div className="w-24 h-32 bg-neutral-50 editorial-border overflow-hidden shrink-0">
                                <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-serif text-xl leading-tight text-editorial-text">{item.name}</h3>
                                    <button 
                                      onClick={() => removeFromCart(item.id, item.color, item.size)}
                                      className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                     {item.color && (
                                       <span className="text-[9px] label-caps bg-neutral-50 px-2 py-1 border border-neutral-100">{item.color}</span>
                                     )}
                                     {item.size && (
                                       <span className="text-[9px] label-caps bg-neutral-50 px-2 py-1 border border-neutral-100">{item.size}</span>
                                     )}
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-end mt-4">
                                  <div className="flex items-center space-x-4 border border-neutral-100 p-1 bg-white">
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.color, item.size)}
                                      className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 text-neutral-400 transition-all font-light"
                                    >
                                      —
                                    </button>
                                    <span className="text-sm font-mono w-4 text-center font-bold">{item.quantity}</span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.color, item.size)}
                                      className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 text-neutral-400 transition-all font-light"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <p className="font-mono font-bold text-lg text-editorial-text">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="pt-8 border-t border-neutral-100">
                          <button 
                            onClick={() => setIsCartOpen(false)}
                            className="flex items-center gap-3 text-editorial-gold hover:translate-x-2 transition-all duration-500"
                          >
                            <ArrowLeft size={16} />
                            <span className="label-caps !text-[9px] font-bold tracking-[0.3em]">Continuer mes achats</span>
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="step-checkout"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 p-8 space-y-10"
                  >
                    <div className="space-y-2">
                       <h3 className="font-serif text-2xl italic">Vos informations</h3>
                       <p className="text-xs text-neutral-400 italic font-serif">Vous pouvez revenir à tout moment pour modifier votre panier.</p>
                    </div>

                    <div className="space-y-8">
                      <div className="relative group">
                        <label className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] label-caps text-neutral-400 group-focus-within:text-editorial-gold transition-colors font-bold z-10">Votre Nom Complet</label>
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-editorial-gold/40" size={18} />
                        <input 
                          type="text"
                          placeholder="Ex: Madame Traoré"
                          value={checkoutInfo.customerName}
                          onChange={(e) => updateCheckoutInfo({ customerName: e.target.value })}
                          className="w-full pl-14 pr-6 py-6 bg-white editorial-border text-[12px] font-bold uppercase tracking-widest focus:border-editorial-gold outline-none transition-all shadow-sm group-focus-within:shadow-md"
                        />
                      </div>

                      <div className="relative group">
                        <label className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] label-caps text-editorial-gold font-black z-10">Votre Quartier (Obligatoire)*</label>
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-editorial-gold/60" size={18} />
                        <input 
                          type="text"
                          placeholder="Ex: Bamako Coura, ACI 2000..."
                          value={checkoutInfo.neighborhood}
                          onChange={(e) => updateCheckoutInfo({ neighborhood: e.target.value })}
                          className={cn(
                            "w-full pl-14 pr-6 py-6 bg-white editorial-border text-[12px] font-bold uppercase tracking-widest outline-none transition-all shadow-sm group-focus-within:shadow-md",
                            !checkoutInfo.neighborhood && "border-editorial-gold/20"
                          )}
                        />
                      </div>

                      <div className="relative group">
                        <label className="absolute -top-2.5 left-4 bg-white px-2 text-[9px] label-caps text-neutral-400 group-focus-within:text-editorial-gold transition-colors font-bold z-10">Votre Téléphone (Optionnel)</label>
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-editorial-gold/40" size={18} />
                        <input 
                          type="tel"
                          placeholder="Ex: 93 93 23 82"
                          value={checkoutInfo.phoneNumber}
                          onChange={(e) => updateCheckoutInfo({ phoneNumber: e.target.value })}
                          className="w-full pl-14 pr-6 py-6 bg-white editorial-border text-[12px] font-bold uppercase tracking-widest focus:border-editorial-gold outline-none transition-all shadow-sm group-focus-within:shadow-md"
                        />
                      </div>
                    </div>

                    <div className="bg-editorial-gold/5 p-6 editorial-border border-editorial-gold/10 space-y-4">
                       <div className="flex items-start gap-4">
                          <Info size={16} className="text-editorial-gold shrink-0 mt-0.5" />
                          <p className="text-[11px] text-neutral-600 leading-relaxed font-serif italic">
                            Après avoir cliqué sur le bouton ci-dessous, vous serez redirigée vers WhatsApp pour finaliser le paiement et la livraison avec notre équipe.
                          </p>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Summary Container */}
            {items.length > 0 && (
              <div className="bg-neutral-50 p-6 md:p-10 border-t border-neutral-100 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-neutral-400">
                    <span className="label-caps !text-[10px] font-bold">Total Items ({totalItems})</span>
                    <span className="font-mono">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-editorial-text">
                    <span className="label-caps !text-[15px] font-black tracking-[0.1em]">Total Final</span>
                    <span className="text-3xl font-mono font-black text-editorial-gold">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {step === 'cart' ? (
                    <button 
                      onClick={() => setStep('checkout')}
                      className="w-full bg-editorial-text text-white py-6 flex items-center justify-center gap-4 shadow-2xl hover:bg-neutral-800 transition-all transform hover:-translate-y-1 active:translate-y-0 group"
                    >
                      <span className="label-caps !text-[12px] font-bold tracking-[0.3em]">Passer à la livraison</span>
                      <ArrowLeft size={18} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleWhatsAppCheckout}
                      disabled={!checkoutInfo.neighborhood}
                      className={cn(
                        "w-full py-6 flex items-center justify-center gap-4 shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 group",
                        checkoutInfo.neighborhood ? "bg-[#25D366] text-white hover:bg-[#1fb355]" : "bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-60 shadow-none"
                      )}
                    >
                      <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="label-caps !text-[12px] font-bold tracking-[0.3em]">Confirmer sur WhatsApp</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={handleBack}
                    className="w-full py-3 text-[9px] label-caps text-neutral-400 hover:text-editorial-gold transition-colors tracking-[0.4em] font-bold"
                  >
                    {step === 'cart' ? 'Continuer mes achats' : 'Retour au panier'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
