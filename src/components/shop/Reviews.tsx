
import { useState, useEffect } from "react";
import { Star, MessageSquare, Send, Camera, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Review } from "../../types.ts";
import { cn } from "../../lib/utils.ts";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}

export function StarRating({ rating, max = 5, size = 16, onRatingChange, interactive = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const isActive = (hovered || rating) >= starValue;
        
        return (
          <motion.div
            key={i}
            whileHover={interactive ? { scale: 1.2 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onRatingChange?.(starValue)}
            className={cn(
              "transition-colors duration-200",
              interactive ? "cursor-pointer" : ""
            )}
          >
            <Star 
              size={size} 
              className={cn(
                isActive ? "fill-editorial-gold text-editorial-gold" : "text-neutral-200 fill-transparent"
              )} 
            />
          </motion.div>
        );
      })}
    </div>
  );
}

interface ReviewSectionProps {
  productId: number;
  avgRating?: number;
  reviewCount?: number;
}

export default function ReviewSection({ productId, avgRating = 0, reviewCount = 0 }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    rating: 5,
    comment: "",
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.comment) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setShowForm(false);
          setFormData({ customer_name: "", rating: 5, comment: "", image_url: "" });
          fetchReviews();
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting review", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-100 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-12 h-[1px] bg-editorial-gold"></span>
            <h2 className="label-caps !text-xs tracking-[0.4em] font-bold text-editorial-gold">Avis Clientes ({reviewCount})</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-6xl font-serif italic text-editorial-text">{avgRating ? avgRating.toFixed(1) : "0.0"}</div>
            <div className="space-y-1">
              <StarRating rating={Math.round(avgRating)} size={20} />
              <p className="text-[10px] label-caps text-neutral-400 tracking-widest">Sur {reviewCount} avis vérifiés</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="bg-editorial-text text-white px-8 py-4 label-caps !text-[10px] tracking-[0.2em] font-bold hover:bg-editorial-gold transition-all shadow-xl active:scale-95"
        >
          Laisser un avis
        </button>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-editorial-text/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg editorial-border shadow-2xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-editorial-gold transition-colors"
              >
                <X size={20} />
              </button>

              {success ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                  >
                    <CheckCircle2 size={64} className="text-editorial-gold" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl italic">Merci pour votre avis !</h3>
                    <p className="text-neutral-500 text-sm">Votre témoignage nous est précieux.</p>
                  </div>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="bg-editorial-text text-white px-10 py-4 label-caps !text-[10px] tracking-widest font-bold hover:bg-editorial-gold transition-all"
                  >
                    Retour à la boutique
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="font-serif text-3xl italic">Partagez votre expérience</h3>
                    <p className="label-caps !text-[10px] text-neutral-400 tracking-widest italic">Votre avis compte pour nous</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 py-6 border-y border-neutral-50">
                      <p className="label-caps !text-[10px] text-editorial-text tracking-widest font-bold">Votre Note</p>
                      <StarRating 
                        rating={formData.rating} 
                        size={32} 
                        interactive 
                        onRatingChange={(r) => setFormData({...formData, rating: r})} 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="group">
                        <label className="label-caps !text-[9px] text-neutral-400 group-focus-within:text-editorial-gold transition-colors ml-1">Nom complet</label>
                        <input 
                          required
                          type="text" 
                          value={formData.customer_name}
                          onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                          placeholder="Ex: Adja Fatou"
                          className="w-full border-b border-neutral-100 py-3 text-sm focus:border-editorial-gold focus:outline-none transition-all placeholder:text-neutral-200"
                        />
                      </div>

                      <div className="group">
                        <label className="label-caps !text-[9px] text-neutral-400 group-focus-within:text-editorial-gold transition-colors ml-1">Commentaire</label>
                        <textarea 
                          required
                          rows={4}
                          value={formData.comment}
                          onChange={(e) => setFormData({...formData, comment: e.target.value})}
                          placeholder="Dites-nous ce que vous avez pensé du produit..."
                          className="w-full border border-neutral-100 p-4 text-sm focus:border-editorial-gold focus:outline-none transition-all placeholder:text-neutral-200 resize-none bg-neutral-50/30"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="label-caps !text-[9px] text-neutral-400 block ml-1">Photo de l'article (optionnel)</label>
                        <div className="flex items-center gap-4">
                          {formData.image_url ? (
                            <div className="relative w-20 h-20 editorial-border group">
                              <img src={formData.image_url} className="w-full h-full object-cover" alt="Review preview" />
                              <button 
                                type="button"
                                onClick={() => setFormData({...formData, image_url: ""})}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <label className="w-20 h-20 border border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-300 hover:border-editorial-gold hover:text-editorial-gold transition-all cursor-pointer">
                              {uploading ? (
                                <div className="w-5 h-5 border-2 border-editorial-gold border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <Camera size={20} />
                                  <span className="text-[8px] label-caps mt-1">Ajouter</span>
                                </>
                              )}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setUploading(true);
                                  const fd = new FormData();
                                  fd.append("image", file);
                                  try {
                                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                                    const data = await res.json();
                                    if (data.success) setFormData({...formData, image_url: data.imageUrl});
                                  } catch (err) { console.error(err); }
                                  finally { setUploading(false); }
                                }}
                              />
                            </label>
                          )}
                          <div className="flex-1">
                            <p className="text-[10px] text-neutral-400 italic">Partagez une photo de votre article porté pour aider les autres clientes !</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full bg-editorial-text text-white py-5 label-caps !text-[11px] tracking-[0.3em] font-bold hover:bg-editorial-gold transition-all shadow-xl active:scale-95 disabled:opacity-50 mb-4"
                  >
                    {isSubmitting ? "Envoi en cours..." : "Publier mon avis"}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full border border-neutral-100 py-4 label-caps !text-[10px] tracking-widest text-neutral-400 hover:text-editorial-text hover:bg-neutral-50 transition-all"
                  >
                    Retour
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.length > 0 ? (
          reviews.map((review, idx) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 editorial-border relative group hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h4 className="font-serif italic text-lg">{review.customer_name}</h4>
                    {review.is_featured === 1 && (
                      <span className="bg-editorial-gold/10 text-editorial-gold text-[8px] px-2 py-0.5 label-caps rounded-full font-bold">Mis en avant</span>
                    )}
                  </div>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <div className="text-[9px] label-caps text-neutral-300 font-mono italic">
                  {new Date(review.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
              
              <div className="relative">
                <MessageSquare size={40} className="absolute -top-4 -left-4 text-neutral-50 opacity-40 -z-10 group-hover:text-editorial-gold/20 transition-colors" />
                <p className="text-neutral-600 text-sm leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              {review.image_url && (
                <div className="mt-6 aspect-square w-24 overflow-hidden editorial-border">
                  <img src={review.image_url} alt="Avis photo" className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-100 space-y-4">
            <MessageSquare size={48} className="mx-auto text-neutral-200" />
            <div className="space-y-1">
              <p className="font-serif italic text-xl text-neutral-400">Aucun avis pour le moment</p>
              <p className="text-xs label-caps text-neutral-300">Soyez la première à partager votre expérience !</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
